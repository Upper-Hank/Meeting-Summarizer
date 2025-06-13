from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
import threading
import tempfile
import time
from werkzeug.utils import secure_filename
from audio_transcriber import AudioTranscriber
from realtime_transcriber import RealTimeTranscriber
from llm_processor import LLMProcessor
from file_manager import FileManager
from voice_player import play_text_as_audio
from zoom_auto_joiner import ZoomAutoJoiner
import pyaudio

app = Flask(__name__)
CORS(app)

# 全局变量
transcript = ""
metadata = {}
is_recording = False
transcriber = None
realtime_transcriber = None  # 实时转录器实例
summary = ""

# 新增处理状态管理
processing_status = "idle"  # 'idle' | 'uploading' | 'processing' | 'completed' | 'cancelled'
processing_mode = None  # 'file' | 'zoom' | 'recording'
processing_data = {}  # 存储处理相关数据
uploaded_files = {}  # 存储已上传的文件信息

# 配置上传文件夹
UPLOAD_FOLDER = '/tmp/audio_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# 允许的文件扩展名
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'mp4', 'avi', 'mov', 'flv', 'm4a', 'aac'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def transcription_callback(transcript_text, info):
    global transcript, metadata
    transcript += transcript_text
    metadata = {
        "language": info.language,
        "language_probability": info.language_probability,
        "duration": info.duration
    }

@app.route('/api/status', methods=['GET'])
def get_status():
    """获取当前状态"""
    return jsonify({
        'success': True,
        'data': {
            'is_recording': is_recording,
            'has_transcript': bool(transcript),
            'has_summary': bool(summary),
            'metadata': metadata
        }
    })

@app.route('/api/upload-only', methods=['POST'])
def upload_file_only():
    """仅上传文件，不进行转录处理"""
    global processing_status, processing_mode, processing_data, uploaded_files
    
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # 计算文件哈希
        import hashlib
        with open(file_path, 'rb') as f:
            file_hash = hashlib.md5(f.read()).hexdigest()
        
        # 生成文件ID
        file_id = f"file_{int(time.time())}_{filename}"
        
        # 存储文件信息
        uploaded_files[file_id] = {
            'filename': filename,
            'file_path': file_path,
            'size': os.path.getsize(file_path),
            'hash': file_hash,
            'upload_time': time.time(),
            'processed': False
        }
        
        # 更新处理状态
        processing_status = "idle"
        processing_mode = "file"
        processing_data = {'file_id': file_id}
        
        return jsonify({
            'success': True,
            'data': {
                'message': 'File uploaded successfully',
                'filename': filename,
                'file_id': file_id
            }
        })
    return jsonify({'success': False, 'error': 'Invalid file type'}), 400

@app.route('/api/process-file', methods=['POST'])
def process_uploaded_file():
    """开始处理已上传的文件"""
    global processing_status, transcript, metadata, transcriber
    
    data = request.get_json()
    file_id = data.get('file_id') if data else processing_data.get('file_id')
    
    if not file_id or file_id not in uploaded_files:
        return jsonify({'success': False, 'error': 'Invalid file ID'}), 400
    
    if processing_status == 'processing':
        return jsonify({'success': False, 'error': 'Another process is already running'}), 400
    
    try:
        processing_status = "processing"
        file_info = uploaded_files[file_id]
        
        # 启动转录过程（在后台线程中）
        def transcribe_file():
            global transcript, metadata, processing_status, uploaded_files
            try:
                model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model")
                transcriber = AudioTranscriber(model_path=model_path)
                transcript, metadata = transcriber.transcribe(file_info['file_path'])
                
                # 更新文件处理状态
                uploaded_files[file_id]['processed'] = True
                uploaded_files[file_id]['process_time'] = time.time()
                
                processing_status = "completed"
            except Exception as e:
                print(f"Transcription error: {e}")
                processing_status = "idle"
        
        threading.Thread(target=transcribe_file, daemon=True).start()
        
        return jsonify({
            'success': True,
            'data': {
                'message': 'File processing started',
                'file_id': file_id
            }
        })
    except Exception as e:
        processing_status = "idle"
        return jsonify({'success': False, 'error': f'Failed to start processing: {str(e)}'}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """兼容旧版本的文件上传接口（上传并立即转录）"""
    # 先上传文件
    upload_result = upload_file_only()
    if not upload_result.get_json().get('success'):
        return upload_result
    
    # 立即开始处理
    return process_uploaded_file()

@app.route('/api/prepare-zoom', methods=['POST'])
def prepare_zoom_meeting():
    """验证Zoom链接并准备参会"""
    global processing_status, processing_mode, processing_data
    
    data = request.get_json()
    meeting_link = data.get('meeting_link')
    recording_mode = data.get('recording_mode', 'auto')
    
    if not meeting_link:
        return jsonify({'success': False, 'error': 'Meeting link is required'}), 400
    
    try:
        # 简单的链接验证（可以扩展为更复杂的验证逻辑）
        if 'zoom.us' not in meeting_link and 'zoom.com' not in meeting_link:
            return jsonify({'success': False, 'error': 'Invalid Zoom meeting link'}), 400
        
        # 更新处理状态
        processing_status = "idle"
        processing_mode = "zoom"
        processing_data = {
            'meeting_link': meeting_link,
            'recording_mode': recording_mode
        }
        
        return jsonify({
            'success': True,
            'data': {
                'message': 'Zoom meeting link validated successfully',
                'meeting_link': meeting_link,
                'recording_mode': recording_mode
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to validate meeting link: {str(e)}'}), 500

@app.route('/api/join_meeting', methods=['POST'])
def join_meeting():
    """实际加入Zoom会议并开始转录"""
    global processing_status, transcript, metadata
    
    data = request.get_json()
    meeting_link = data.get('meeting_link')
    
    # 如果没有提供链接，使用处理数据中的链接
    if not meeting_link:
        meeting_link = processing_data.get('meeting_link')
    
    if not meeting_link:
        return jsonify({'success': False, 'error': 'Meeting link is required'}), 400
    
    if processing_status == 'processing':
        return jsonify({'success': False, 'error': 'Another process is already running'}), 400
    
    try:
        processing_status = "processing"
        
        # 启动会议加入过程（在后台线程中）
        def join_zoom_meeting():
            global transcript, metadata, processing_status, processing_data
            try:
                joiner = ZoomAutoJoiner()
                transcript, metadata = joiner.join_meeting(meeting_link)
                
                # 更新处理数据状态
                if processing_data:
                    processing_data['processed'] = True
                    processing_data['process_time'] = time.time()
                
                processing_status = "completed"
            except Exception as e:
                print(f"Zoom meeting join error: {e}")
                processing_status = "idle"
        
        threading.Thread(target=join_zoom_meeting, daemon=True).start()
        
        return jsonify({
            'success': True,
            'data': {
                'message': 'Zoom meeting join started',
                'meeting_link': meeting_link
            }
        })
    except Exception as e:
        processing_status = "idle"
        return jsonify({'success': False, 'error': f'Failed to join meeting: {str(e)}'}), 500


@app.route('/api/start-recording', methods=['POST'])
def start_recording():
    """开始实时录音和转录"""
    global is_recording, processing_status, processing_mode, processing_data, realtime_transcriber, transcript, metadata

    if is_recording:
        return jsonify({'success': False, 'error': '录音已在进行中'}), 400

    try:
        # 初始化实时转录器
        if realtime_transcriber is None:
            model_path = "v3.0-main/model"  # 使用本地模型路径
            realtime_transcriber = RealTimeTranscriber(model_path)
            realtime_transcriber.set_transcription_callback(transcription_callback)
        
        # 获取默认音频设备
        pya = pyaudio.PyAudio()
        try:
            device_info = RealTimeTranscriber.get_default_loopback_device(pya)
        finally:
            pya.terminate()
        
        # 开始录制
        realtime_transcriber.start_recording(device_info)
        is_recording = True
        
        # 清空之前的转录内容
        transcript = ""
        metadata = {}
        
        # 更新处理状态
        processing_mode = "recording"
        processing_status = "processing"
        processing_data = {
            'start_time': time.time(),
            'device_info': device_info
        }
        
        return jsonify({
            'success': True,
            'data': {
                'message': f'实时录音已开始，使用设备: {device_info["name"]}',
                'is_recording': True,
                'device_name': device_info["name"]
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'开始录音失败: {str(e)}'}), 500


@app.route('/api/stop-recording', methods=['POST'])
def stop_recording():
    """停止实时录音和转录"""
    global is_recording, processing_data, realtime_transcriber, processing_status

    if not is_recording:
        return jsonify({'success': False, 'error': '没有正在进行的录音'}), 400

    try:
        # 停止录制
        if realtime_transcriber:
            realtime_transcriber.stop_recording()
        
        is_recording = False
        processing_status = "completed"
        
        # 更新录制数据
        if 'start_time' in processing_data:
            processing_data['end_time'] = time.time()
            processing_data['duration'] = processing_data['end_time'] - processing_data['start_time']

        return jsonify({
            'success': True,
            'data': {
                'message': '实时录音已停止，转录完成',
                'is_recording': False,
                'duration': processing_data.get('duration', 0),
                'transcript_length': len(transcript) if transcript else 0
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'停止录音失败: {str(e)}'}), 500

@app.route('/api/process-recording', methods=['POST'])
def process_recording():
    """处理录制的音频内容（实时转录已完成，直接返回结果）"""
    global processing_status, transcript, metadata, processing_mode
    
    if processing_mode != "recording":
        return jsonify({'success': False, 'error': 'No recording data available'}), 400
    
    if is_recording:
        return jsonify({'success': False, 'error': 'Recording is still in progress'}), 400
    
    try:
        # 实时转录已经完成，直接返回结果
        if not transcript:
            return jsonify({'success': False, 'error': '没有录制到音频内容或转录失败'}), 400
        
        processing_status = "completed"
        
        return jsonify({
            'success': True,
            'data': {
                'message': '录制内容处理完成',
                'transcript': transcript,
                'metadata': metadata,
                'duration': processing_data.get('duration', 0)
            }
        })
    except Exception as e:
        processing_status = "idle"
        return jsonify({'success': False, 'error': f'处理录制内容失败: {str(e)}'}), 500

@app.route('/api/generate_summary', methods=['POST'])
def generate_summary():
    """生成会议总结"""
    data = request.get_json()
    transcript_text = data.get('transcript')
    global transcript
    
    # 如果没有提供转录文本，则使用全局变量中的转录文本
    if not transcript_text and transcript:
        transcript_text = transcript
    elif not transcript_text:
        return jsonify({'success': False, 'error': 'Transcript is required'}), 400
        
    try:
        processor = LLMProcessor(api_key="sk-ee7327a12a3146b781127490e6706bd2")
        global summary
        summary = processor.generate_summary(transcript_text)
        return jsonify({
            'success': True,
            'data': {
                'message': '会议总结生成成功',
                'summary': summary
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'生成总结失败: {str(e)}'}), 500

@app.route('/api/processing/status', methods=['GET'])
def get_processing_status():
    """获取统一的处理状态"""
    global processing_status, processing_mode, transcript, metadata
    
    # 计算进度
    progress = 0
    if processing_status == "idle":
        progress = 0
    elif processing_status == "processing":
        progress = 50
    elif processing_status == "completed":
        progress = 100
    elif processing_status == "cancelled":
        progress = 0
    
    return jsonify({
        'success': True,
        'data': {
            'status': processing_status,
            'mode': processing_mode,
            'completed': processing_status == "completed",
            'has_transcript': bool(transcript),
            'message': {
                'idle': '等待处理',
                'processing': '正在处理中...',
                'completed': '处理已完成',
                'cancelled': '处理已取消'
            }.get(processing_status, '未知状态'),
            'progress': progress,
            'metadata': metadata if transcript else {}
        }
    })

@app.route('/api/can-proceed', methods=['GET'])
def can_proceed_to_next():
    """检查是否可以进入下一步"""
    global processing_status, processing_mode, transcript
    
    can_proceed = False
    reason = ""
    
    if processing_status == "completed" and transcript:
        can_proceed = True
        reason = "处理已完成，可以继续"
    elif processing_status == "processing":
        can_proceed = False
        reason = "正在处理中，请等待"
    elif processing_status == "idle":
        can_proceed = False
        reason = "尚未开始处理"
    elif processing_status == "cancelled":
        can_proceed = False
        reason = "处理已取消"
    
    return jsonify({
        'success': True,
        'data': {
            'can_proceed': can_proceed,
            'reason': reason,
            'status': processing_status,
            'mode': processing_mode
        }
    })

@app.route('/api/check-file-status', methods=['POST'])
def check_file_status():
    """检查文件状态，判断是否需要重新处理"""
    global uploaded_files, processing_data
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': '请求数据为空'}), 400
        
        file_hash = data.get('file_hash')
        file_name = data.get('file_name')
        file_size = data.get('file_size')
        
        if not file_hash or not file_name:
            return jsonify({'success': False, 'error': '缺少文件哈希或文件名'}), 400
        
        # 检查文件是否已经上传过
        file_exists = False
        needs_reprocess = True
        
        for uploaded_file in uploaded_files:
            if (uploaded_file.get('hash') == file_hash and 
                uploaded_file.get('name') == file_name and
                uploaded_file.get('size') == file_size):
                file_exists = True
                # 如果文件已处理完成，则不需要重新处理
                if uploaded_file.get('processed', False):
                    needs_reprocess = False
                break
        
        return jsonify({
            'success': True,
            'data': {
                'file_exists': file_exists,
                'needs_reprocess': needs_reprocess,
                'message': {
                    True: '文件已存在且已处理' if not needs_reprocess else '文件已存在但需要重新处理',
                    False: '新文件，需要上传和处理'
                }[file_exists]
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'检查文件状态失败: {str(e)}'}), 500

@app.route('/api/cancel-processing', methods=['POST'])
def cancel_processing():
    """取消当前正在进行的处理任务"""
    global processing_status, transcript, is_recording, transcriber
    
    if processing_status != "processing":
        return jsonify({'success': False, 'error': '没有正在进行的处理任务'}), 400
    
    try:
        # 停止转录进程
        if transcriber:
            # 这里可以添加停止转录的逻辑
            pass
        
        # 如果是录制模式，停止录制
        if is_recording:
            is_recording = False
        
        # 重置状态
        processing_status = "cancelled"
        
        return jsonify({
            'success': True,
            'data': {
                'message': '处理已取消',
                'status': processing_status
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'取消处理失败: {str(e)}'}), 500

@app.route('/api/transcription/status', methods=['GET'])
def get_transcription_status():
    """获取转录状态（兼容旧版本）"""
    # 重定向到新的处理状态接口
    return get_processing_status()

@app.route('/api/transcription/text', methods=['GET'])
def get_transcription_text():
    """获取转录文本"""
    global transcript, metadata
    
    if not transcript:
        return jsonify({'success': False, 'error': 'No transcription available yet'}), 404
    
    return jsonify({
        'success': True,
        'data': {
            'transcript': transcript,
            'metadata': metadata
        }
    })

@app.route('/api/summary/text', methods=['GET'])
def get_summary_text():
    """获取总结文本"""
    global summary
    
    if not summary:
        return jsonify({'success': False, 'error': 'No summary available yet'}), 404
    
    return jsonify({
        'success': True,
        'data': {
            'summary': summary
        }
    })

@app.route('/api/play_transcript', methods=['POST'])
def play_transcript():
    """播放转录文件的语音"""
    global transcript
    if not transcript:
        return jsonify({'success': False, 'error': 'No transcription available. Please upload a file or join a meeting first.'}), 400
    try:
        play_text_as_audio(transcript)
        return jsonify({
            'success': True,
            'data': {
                'message': 'Voice playback of transcript has finished.'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'Voice playback failed: {str(e)}'}), 500

@app.route('/api/download_transcript', methods=['POST'])
def download_transcript():
    """下载转录文件"""
    global transcript, metadata
    if not transcript:
        return jsonify({'success': False, 'error': 'No transcription available. Please upload a file or join a meeting first.'}), 400
    try:
        content_with_metadata = FileManager.add_metadata(transcript, metadata)
        filename = FileManager.save_to_txt(content_with_metadata, prefix="Transcription")
        return send_file(filename, as_attachment=True)
    except Exception as e:
        return jsonify({'success': False, 'error': f'Download failed: {str(e)}'}), 500

@app.route('/api/play_summary', methods=['POST'])
def play_summary():
    """播放纪要文件的语音"""
    global summary
    if not summary:
        return jsonify({'success': False, 'error': 'No meeting summary available. Please generate a summary first.'}), 400
    try:
        play_text_as_audio(summary)
        return jsonify({
            'success': True,
            'data': {
                'message': 'Voice playback of summary has finished.'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'Voice playback failed: {str(e)}'}), 500

@app.route('/api/download_summary', methods=['POST'])
def download_summary():
    """下载纪要文件"""
    global summary, metadata
    if not summary:
        return jsonify({'success': False, 'error': 'No meeting summary available. Please generate a summary first.'}), 400
    try:
        content_with_metadata = FileManager.add_metadata(summary, metadata)
        filename = FileManager.save_to_txt(content_with_metadata, prefix="Meeting_Summary")
        return send_file(filename, as_attachment=True)
    except Exception as e:
        return jsonify({'success': False, 'error': f'Download failed: {str(e)}'}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=9000)
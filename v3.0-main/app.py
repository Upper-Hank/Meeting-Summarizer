from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
import threading
import tempfile
import time
from werkzeug.utils import secure_filename
from audio_transcriber import AudioTranscriber
# 移除对realtime_transcriber的导入
# from realtime_transcriber import RealTimeTranscriber
from llm_processor import LLMProcessor
from file_manager import FileManager
from voice_player import play_text_as_audio
from zoom_auto_joiner import ZoomAutoJoiner
# 移除对pyaudiowpatch的导入
# import pyaudiowpatch as pyaudio

app = Flask(__name__)
CORS(app)

# 全局变量
transcript = ""
metadata = {}
is_recording = False
transcriber = None
summary = ""

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

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """处理文件上传"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # 启动转录过程
        try:
            # 使用绝对路径指定模型位置
            model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model")
            transcriber = AudioTranscriber(model_path=model_path)
            global transcript, metadata
            transcript, metadata = transcriber.transcribe(file_path)
            return jsonify({
                'success': True,
                'data': {
                    'message': 'File uploaded and transcribed successfully',
                    'filename': filename
                }
            })
        except Exception as e:
            return jsonify({'success': False, 'error': f'Transcription failed: {str(e)}'}), 500
    return jsonify({'success': False, 'error': 'Invalid file type'}), 400

@app.route('/api/join_meeting', methods=['POST'])
def join_meeting():
    """加入 Zoom 会议并进行转录"""
    data = request.get_json()
    meeting_link = data.get('meeting_link')
    if not meeting_link:
        return jsonify({'success': False, 'error': 'Meeting link is required'}), 400
    
    try:
        joiner = ZoomAutoJoiner()
        global transcript, metadata
        transcript, metadata = joiner.join_meeting(meeting_link)
        return jsonify({
            'success': True,
            'data': {
                'message': 'Successfully joined Zoom meeting',
                'meeting_link': meeting_link
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to join meeting: {str(e)}'}), 500


@app.route('/api/start-recording', methods=['POST'])
def start_recording():
    """开始实时录音转录（模拟实现）"""
    global is_recording, transcript

    if is_recording:
        return jsonify({'success': False, 'error': '录音已在进行中'}), 400

    try:
        # 重置转录变量
        transcript = ""
        # 模拟开始录制
        is_recording = True
        
        # 模拟转录过程（后台线程）
        def simulate_transcription():
            global transcript, metadata
            time.sleep(2)  # 模拟处理延迟
            transcript = "这是一段模拟的会议转录内容。由于技术限制，实际录制功能暂不可用，但您可以继续体验其他功能。"
            metadata = {
                "language": "zh",
                "language_probability": 0.98,
                "duration": 60.0
            }
        
        threading.Thread(target=simulate_transcription, daemon=True).start()
        
        return jsonify({
            'success': True,
            'data': {
                'message': '实时录音已开始',
                'is_recording': True
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'开始录音失败: {str(e)}'}), 500


@app.route('/api/stop-recording', methods=['POST'])
def stop_recording():
    """停止实时录音转录（模拟实现）"""
    global is_recording

    if not is_recording:
        return jsonify({'success': False, 'error': '没有正在进行的录音'}), 400

    try:
        # 模拟停止录制
        is_recording = False

        return jsonify({
            'success': True,
            'data': {
                'message': '实时录音已停止',
                'is_recording': False
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'停止录音失败: {str(e)}'}), 500

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

@app.route('/api/transcription/status', methods=['GET'])
def get_transcription_status():
    """获取转录状态"""
    global transcript, metadata
    
    # 简单判断转录是否完成
    is_completed = bool(transcript)
    
    return jsonify({
        'success': True,
        'data': {
            'completed': is_completed,
            'message': '转录已完成' if is_completed else '转录进行中',
            'progress': 100 if is_completed else 50  # 简化的进度显示
        }
    })

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
import os
import wave
import tempfile
import threading
import pyaudio
from faster_whisper import WhisperModel

transcript = ""
is_recording = False
transcriber = None
metadata = {}
class RealTimeTranscriber:
    def __init__(self, model_path: str, buffer_seconds: int = 5):
        """初始化实时转录器"""
        self.model = WhisperModel(model_path, device="cpu")
        self.buffer_seconds = buffer_seconds
        self.is_recording = False
        self.recording_thread = None
        self.temp_file = None
        self.transcription_callback = None

    def set_transcription_callback(self, callback):
        """设置转录结果回调函数"""
        self.transcription_callback = callback

    def start_recording(self, device_info: dict):
        """开始实时录制和转录"""
        if self.is_recording:
            return

        self.is_recording = True
        self.recording_thread = threading.Thread(
            target=self._recording_loop,
            args=(device_info,)
        )
        self.recording_thread.daemon = True
        self.recording_thread.start()

    def stop_recording(self):
        """停止录制和转录"""
        self.is_recording = False
        if self.recording_thread and self.recording_thread.is_alive():
            self.recording_thread.join(timeout=2.0)

        # 转录完整的临时文件
        if self.temp_file:
            self._transcribe_audio(self.temp_file)

        # 清理临时文件
        if self.temp_file:
            try:
                os.remove(self.temp_file)
            except:
                pass
            self.temp_file = None

    def _recording_loop(self, device_info):
        """录制和转录的主循环"""
        pya = pyaudio.PyAudio()
        try:
            # 创建临时文件
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                self.temp_file = f.name
                wave_file = wave.open(self.temp_file, "wb")
                wave_file.setnchannels(device_info["maxInputChannels"])
                wave_file.setsampwidth(pyaudio.get_sample_size(pyaudio.paInt16))
                wave_file.setframerate(int(device_info["defaultSampleRate"]))

                stream = pya.open(
                    format=pyaudio.paInt16,
                    channels=device_info["maxInputChannels"],
                    rate=int(device_info["defaultSampleRate"]),
                    frames_per_buffer=1024,
                    input=True,
                    input_device_index=device_info["index"],
                )

                try:
                    # 用于实时转录的缓冲区
                    buffer_frames = []
                    frame_count = 0
                    buffer_size = int(device_info["defaultSampleRate"] * self.buffer_seconds)
                    
                    # 持续录制音频直到停止
                    while self.is_recording:
                        data = stream.read(1024, exception_on_overflow=False)
                        wave_file.writeframes(data)
                        buffer_frames.append(data)
                        frame_count += 1024
                        
                        # 每buffer_seconds秒进行一次实时转录
                        if frame_count >= buffer_size:
                            self._transcribe_buffer(buffer_frames, device_info)
                            buffer_frames = []
                            frame_count = 0
                            
                finally:
                    stream.stop_stream()
                    stream.close()
                    wave_file.close()

        except Exception as e:
            print(f"录制错误: {e}")
        finally:
            pya.terminate()

    def _transcribe_audio(self, filename: str):
        """转录音频文件并调用回调函数"""
        try:
            segments, info = self.model.transcribe(
                filename,
                beam_size=10,
                language="en",
                vad_filter=True,
                vad_parameters=dict(min_silence_duration_ms=500)
            )

            # 提取转录文本
            transcript = " ".join([segment.text for segment in segments])

            # 调用回调函数传递结果
            if self.transcription_callback:
                self.transcription_callback(transcript, info)

        except Exception as e:
            print(f"转录错误: {e}")

    def _transcribe_buffer(self, buffer_frames, device_info):
        """转录音频缓冲区并调用回调函数"""
        try:
            # 创建临时文件用于缓冲区转录
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as temp_buffer:
                # 写入WAV文件头和音频数据
                with wave.open(temp_buffer.name, "wb") as wave_file:
                    wave_file.setnchannels(device_info["maxInputChannels"])
                    wave_file.setsampwidth(pyaudio.get_sample_size(pyaudio.paInt16))
                    wave_file.setframerate(int(device_info["defaultSampleRate"]))
                    
                    # 写入缓冲区中的所有音频数据
                    for frame in buffer_frames:
                        wave_file.writeframes(frame)
                
                # 转录缓冲区音频
                segments, info = self.model.transcribe(
                    temp_buffer.name,
                    beam_size=5,  # 降低beam_size以提高速度
                    language="en",
                    vad_filter=True,
                    vad_parameters=dict(min_silence_duration_ms=500)
                )
                
                # 提取转录文本
                transcript = " ".join([segment.text for segment in segments])
                
                # 只有当转录文本不为空时才调用回调函数
                if transcript.strip() and self.transcription_callback:
                    self.transcription_callback(transcript, info)
                    
        except Exception as e:
            print(f"缓冲区转录错误: {e}")

    @staticmethod
    def get_default_loopback_device(pya) -> dict:
        """获取默认loopback设备用于录制系统音频输出"""
        import platform
        
        try:
            system = platform.system()
            
            if system == "Windows":
                # Windows系统需要pyaudiowpatch来支持WASAPI loopback
                print("警告: Windows系统需要安装pyaudiowpatch来录制系统音频")
                print("请运行: pip install pyaudiowpatch")
                print("当前将使用麦克风录制")
                    
            elif system == "Darwin":  # macOS
                # macOS系统查找支持输入的输出设备（用于loopback）
                # 查找BlackHole或SoundFlower等虚拟音频设备
                for i in range(pya.get_device_count()):
                    device_info = pya.get_device_info_by_index(i)
                    device_name = device_info["name"].lower()
                    
                    # 查找常见的虚拟音频设备
                    if (device_info["maxInputChannels"] > 0 and 
                        device_info["maxOutputChannels"] > 0 and 
                        ("blackhole" in device_name or 
                         "soundflower" in device_name or 
                         "loopback" in device_name or
                         "virtual" in device_name)):
                        
                        return {
                            "index": device_info["index"],
                            "name": device_info["name"],
                            "maxInputChannels": device_info["maxInputChannels"],
                            "defaultSampleRate": device_info["defaultSampleRate"]
                        }
                
                # 如果没有找到虚拟音频设备，查找支持输入的输出设备
                default_output = pya.get_default_output_device_info()
                if default_output["maxInputChannels"] > 0:
                    return {
                        "index": default_output["index"],
                        "name": default_output["name"] + " (System Audio)",
                        "maxInputChannels": default_output["maxInputChannels"],
                        "defaultSampleRate": default_output["defaultSampleRate"]
                    }
            
            # 最后回退到默认输入设备（麦克风）
            print("警告: 未找到系统音频loopback设备，回退到麦克风录制")
            default_device_index = pya.get_default_input_device_info()["index"]
            device_info = pya.get_device_info_by_index(default_device_index)
            
            return {
                "index": device_info["index"],
                "name": device_info["name"] + " (Microphone)",
                "maxInputChannels": device_info["maxInputChannels"],
                "defaultSampleRate": device_info["defaultSampleRate"]
            }

        except Exception as e:
            raise RuntimeError(f"获取loopback设备信息失败: {e}")
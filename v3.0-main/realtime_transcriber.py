import os
import wave
import tempfile
import threading
import pyaudiowpatch as pyaudio
from faster_whisper import WhisperModel


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
        with pyaudio.PyAudio() as pya:
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
                        # 持续录制音频直到停止
                        while self.is_recording:
                            data = stream.read(1024, exception_on_overflow=False)
                            wave_file.writeframes(data)
                    finally:
                        stream.stop_stream()
                        stream.close()
                        wave_file.close()

            except Exception as e:
                print(f"录制错误: {e}")

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

    @staticmethod
    def get_default_loopback_device(pya) -> dict:
        """获取默认环回设备用于录制系统音频"""
        try:
            wasapi_info = pya.get_host_api_info_by_type(pyaudio.paWASAPI)
            default_output = pya.get_device_info_by_index(wasapi_info["defaultOutputDevice"])

            # 查找匹配的环回设备
            for device in pya.get_loopback_device_info_generator():
                if default_output["name"] in device["name"]:
                    return device

            raise ValueError("未找到环回设备，请确保系统支持WASAPI")

        except Exception as e:
            raise RuntimeError(f"获取设备信息失败: {e}")
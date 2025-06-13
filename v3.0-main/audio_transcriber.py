# audio_transcriber.py
from faster_whisper import WhisperModel


class AudioTranscriber:
    def __init__(self, model_path: str, device: str = "cpu", compute_type: str = "int8"):
        self.model = WhisperModel(
            model_size_or_path=model_path,
            device=device,
            compute_type=compute_type
        )

    def transcribe(self, audio_path: str, language: str = None) -> tuple[str, dict]:
        """
        转录音频文件并返回文本和元信息
        :return: 转录文本, 元信息字典
        """
        segments, info = self.model.transcribe(audio_path, beam_size=5, language=language)
        transcript = " ".join([segment.text for segment in segments])

        metadata = {
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration
        }

        return transcript, metadata
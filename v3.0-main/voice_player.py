# voice_player.py
from dotenv import load_dotenv
# 修改导入方式，适应当前版本的elevenlabs库
import elevenlabs
from playsound import playsound
import os
import tempfile

# 加载环境变量
load_dotenv()

# 设置API密钥
elevenlabs.set_api_key(os.getenv("ELEVENLABS_API_KEY"))

def play_text_as_audio(text: str, voice_id: str = "JBFqnCBsd6RMkjVDRZzb", model_id: str = "eleven_multilingual_v2", output_format: str = "mp3_44100_128"):
    """
    将文本转换为语音并播放
    :param text: 要转换为语音的文本
    :param voice_id: 语音的 ID
    :param model_id: 语音模型的 ID
    :param output_format: 输出音频的格式
    """
    try:
        # 创建临时文件
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as f:
            temp_file_path = f.name
        
        # 使用新版API生成语音并保存到文件
        audio = elevenlabs.generate(
            text=text,
            voice=voice_id,
            model=model_id
        )
        
        elevenlabs.save(audio, temp_file_path)
        
        # 播放临时文件
        playsound(temp_file_path)
    except Exception as e:
        print(f"语音播放错误: {e}")
    finally:
        # 无论播放是否成功，都尝试删除临时文件
        try:
            if 'temp_file_path' in locals():
                os.unlink(temp_file_path)
        except:
            pass
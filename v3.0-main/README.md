# AI音频转录与会议纪要生成系统 v3.0

一个基于Whisper模型的智能音频转录系统，支持离线文件转录、实时音频转录、AI会议纪要生成、语音播放和Zoom会议自动加入等功能。



语音播放

自动参会

转录

总结

## 🌟 主要功能

### 🎵 音频转录
- **离线文件转录**：支持多种音频格式（WAV、MP3、MP4、AVI、MOV、FLV、M4A、AAC）
- **实时音频转录**：实时捕获系统音频并进行转录
- **多语言支持**：基于Whisper模型，支持多种语言识别
- **高精度转录**：使用faster-whisper优化，提供快速准确的转录结果

### 📝 AI会议纪要生成
- **智能摘要**：基于DeepSeek API生成结构化会议纪要
- **多语言输出**：支持中英文会议纪要生成
- **完整格式**：包含会议主题、讨论要点、决策事项、行动计划等

### 🔊 语音播放
- **文本转语音**：集成ElevenLabs API，将文本转换为自然语音
- **多语言语音**：支持多语言语音合成
- **高质量音频**：提供清晰自然的语音输出

### 🎥 Zoom会议集成
- **自动加入会议**：通过Selenium自动化加入Zoom会议
- **实时转录**：会议期间实时转录音频内容
- **智能识别**：使用计算机视觉识别会议界面元素

### 💾 文件管理
- **自动保存**：转录结果和会议纪要自动保存为TXT文件
- **元数据记录**：保存转录语言、时长、时间戳等信息
- **文件命名**：使用时间戳自动命名文件

## 🏗️ 系统架构

### 核心模块

```
├── app.py                    # Flask Web API服务
├── main.py                   # Tkinter桌面应用主程序
├── audio_transcriber.py      # 离线音频转录模块
├── realtime_transcriber.py   # 实时音频转录模块
├── llm_processor.py          # AI会议纪要生成模块
├── voice_player.py           # 语音播放模块
├── file_manager.py           # 文件管理模块
├── zoom_auto_joiner.py       # Zoom会议自动加入模块
└── model/                    # Whisper模型文件
```

### 技术栈

- **AI模型**：Whisper (faster-whisper优化版本)
- **后端框架**：Flask + Flask-CORS
- **桌面应用**：Tkinter
- **音频处理**：pyaudiowpatch
- **语音合成**：ElevenLabs API
- **AI文本生成**：DeepSeek API
- **自动化**：Selenium + OpenCV
- **图像处理**：OpenCV + PyAutoGUI

## 🚀 快速开始

### 环境要求

- Python 3.8+
- macOS/Windows/Linux
- 至少4GB RAM
- 网络连接（用于AI API调用）

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd v3.0-main

# 安装Python依赖
pip install -r requirements.txt

# 安装系统依赖（macOS）
brew install portaudio
```

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，添加API密钥：
```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 运行应用

#### 桌面应用模式
```bash
python main.py
```

#### Web API模式
```bash
python app.py
```

访问 `http://localhost:5000` 使用Web界面

## 📖 使用指南

### 桌面应用使用

1. **离线文件转录**
   - 点击"选择文件并转录"
   - 选择音频/视频文件
   - 等待转录完成

2. **实时转录**
   - 点击"开始实时转录"
   - 系统将捕获音频并实时显示转录结果
   - 点击"停止实时转录"结束

3. **生成会议纪要**
   - 完成转录后点击"生成会议纪要"
   - AI将自动生成结构化会议纪要

4. **语音播放**
   - 点击"播放会议纪要"听取语音版本

5. **保存文件**
   - 点击"保存转录"或"保存会议纪要"
   - 文件将自动保存到当前目录

### Web API使用

#### 主要端点

- `GET /api/status` - 获取系统状态
- `POST /api/upload` - 上传音频文件进行转录
- `POST /api/start-recording` - 开始实时转录
- `POST /api/stop-recording` - 停止实时转录
- `POST /api/generate-summary` - 生成会议纪要
- `POST /api/play-audio` - 播放文本语音
- `GET /api/download-transcript` - 下载转录文件
- `GET /api/download-summary` - 下载会议纪要文件

#### 示例请求

```bash
# 上传文件转录
curl -X POST -F "file=@audio.mp3" http://localhost:5000/api/upload

# 生成会议纪要
curl -X POST -H "Content-Type: application/json" \
     -d '{"language":"zh"}' \
     http://localhost:5000/api/generate-summary
```

### Zoom会议自动加入

1. 配置Chrome浏览器路径
2. 运行Zoom自动加入功能
3. 系统将自动打开会议链接并加入
4. 开始实时转录会议内容

## ⚙️ 配置说明

### 模型配置

- 默认使用Whisper base.en模型
- 模型文件位于 `model/` 目录
- 支持CPU推理，推荐使用GPU加速

### API配置

- **ElevenLabs API**：用于文本转语音功能
- **DeepSeek API**：用于AI会议纪要生成
- 请确保API密钥有效且有足够配额

### 音频配置

- 支持的音频格式：WAV, MP3, MP4, AVI, MOV, FLV, M4A, AAC
- 最大文件大小：100MB
- 实时转录缓冲时间：3秒（可调整）

## 🔧 开发指南

### 项目结构

```
v3.0-main/
├── app.py                 # Flask Web应用
├── main.py               # Tkinter桌面应用
├── audio_transcriber.py  # 音频转录核心类
├── realtime_transcriber.py # 实时转录类
├── llm_processor.py      # LLM处理类
├── voice_player.py       # 语音播放类
├── file_manager.py       # 文件管理类
├── zoom_auto_joiner.py   # Zoom自动加入类
├── model/               # Whisper模型文件
├── .env                 # 环境变量配置
└── README.md           # 项目文档
```

### 核心类说明

#### AudioTranscriber
```python
class AudioTranscriber:
    def __init__(self, model_path: str, device: str = "cpu")
    def transcribe(self, audio_path: str, language: str = None) -> tuple[str, dict]
```

#### RealTimeTranscriber
```python
class RealTimeTranscriber:
    def __init__(self, model_path: str, buffer_seconds: int = 5)
    def start_recording(self, device_info: dict)
    def stop_recording()
```

#### LLMProcessor
```python
class LLMProcessor:
    def __init__(self, api_key: str, api_url: str)
    def generate_summary(self, transcript: str, language: str = "en") -> str
```

### 扩展开发

1. **添加新的转录模型**：修改 `AudioTranscriber` 类
2. **集成新的AI服务**：扩展 `LLMProcessor` 类
3. **支持新的音频格式**：更新 `ALLOWED_EXTENSIONS`
4. **添加新的API端点**：在 `app.py` 中添加路由

## 🐛 故障排除

### 常见问题

1. **音频设备无法识别**
   - 检查音频设备权限
   - 确认pyaudiowpatch正确安装

2. **模型加载失败**
   - 检查model目录是否完整
   - 确认模型文件未损坏

3. **API调用失败**
   - 检查网络连接
   - 验证API密钥是否正确
   - 确认API配额是否充足

4. **Zoom自动加入失败**
   - 检查Chrome浏览器是否正确安装
   - 确认Selenium WebDriver版本兼容

### 日志调试

启用详细日志：
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📞 支持

如有问题或建议，请通过以下方式联系：

- 提交GitHub Issue
- 发送邮件至项目维护者

---

**注意**：本项目需要有效的API密钥才能使用完整功能。请确保在使用前正确配置环境变量。
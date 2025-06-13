# deepseek_api.py
import requests
import json

class LLMProcessor:
    def __init__(self, api_key: str, api_url: str = "https://api.deepseek.com/v1/chat/completions"):
        self.api_key = "sk-ee7327a12a3146b781127490e6706bd2"
        self.api_url = api_url
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

    def generate_summary(self, transcript: str, language: str = "en") -> str:
        """
        生成会议纪要的核心方法
        :param transcript: 音频转录文本
        :param language: 输入语言（默认英文）
        :return: 生成的会议纪要内容
        """
        # 构建提示词（支持中英文自动切换）
        if language.lower() == "en":
            system_prompt = "You are a professional meeting minutes generation assistant, output in plain text format."
            user_prompt = f"""
Generate a detailed meeting minutes based on the following audio transcription:
{transcript}

Meeting minutes should include:
1. Meeting Topic
2. Main Discussion Points
3. Consensus or Decisions Reached
4. Next Action Plans
5. Deadline
6.Assigned Tasks
7. Other Important Information
一定要把Markdown标记去掉，包括**和-和#
Use the original text from the audio and leave empty if no content.
"""
        else:
            system_prompt = "你是专业的会议纪要生成助手，以纯文本格式输出内容。"
            user_prompt = f"""
根据以下音频转录内容生成详细的会议纪要：
{transcript}

会议纪要应包括：
1. 会议主题
2. 主要讨论点
3. 达成的共识或决定
4. 下一步行动计划
5.截止日期
6.分配的任务
7. 其他重要信息
一定要把Markdown标记去掉，包括**和-和#
使用音频中的原文，无相关内容则留空。
"""

        # 构建请求体
        payload = {
            "model": "deepseek-chat",  # 可根据实际模型调整
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 1000
        }

        try:
            response = requests.post(self.api_url, headers=self.headers, data=json.dumps(payload))
            response.raise_for_status()  # 抛出HTTP错误
            result = response.json()
            return result["choices"][0]["message"]["content"].strip()
        except Exception as e:
            raise RuntimeError(f"DeepSeek API调用失败: {str(e)}") from e
# file_manager.py
from datetime import datetime


class FileManager:
    @staticmethod
    def save_to_txt(content: str, prefix: str = "Meeting_Minutes") -> str:
        """保存内容到TXT文件"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{prefix}_{timestamp}.txt"

        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)

        return filename

    @staticmethod
    def add_metadata(content: str, metadata: dict) -> str:
        """添加元信息到内容开头"""
        meta_header = "\n".join([
            f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Original File: {metadata.get('filename', 'unknown')}",
            f"Language: {metadata.get('language', 'unknown')}",
            f"Duration: {metadata.get('duration', 'unknown'):.2f}s",
            "-" * 50
        ])

        return f"{meta_header}\n\n{content}"
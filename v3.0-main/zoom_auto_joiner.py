import cv2
import numpy as np
import pyautogui
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
# 移除对pyaudiowpatch和RealTimeTranscriber的导入
# import pyaudiowpatch as pyaudio
# from realtime_transcriber import RealTimeTranscriber

# Global variables
transcript = ""
is_recording = False
transcriber = None
metadata = {}
initial_url = ''


class ZoomAutoJoiner:
    def __init__(self):
        self.driver = None
        self.is_recording = False
        self.transcriber = None
        # 移除PyAudio初始化
        # self.pya = pyaudio.PyAudio()

    def locate_button(self, image_path, threshold=0.7, region=None):
        try:
            template = cv2.imread(image_path, cv2.IMREAD_COLOR)
            if template is None:
                return None

            if region:
                screenshot = pyautogui.screenshot(region=region)
            else:
                screenshot = pyautogui.screenshot()

            screenshot_cv = cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)
            result = cv2.matchTemplate(screenshot_cv, template, cv2.TM_CCOEFF_NORMED)
            min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

            if max_val >= threshold:
                h, w = template.shape[:2]
                center_x = max_loc[0] + w // 2
                center_y = max_loc[1] + h // 2
                return (center_x + region[0], center_y + region[1]) if region else (center_x, center_y)
            return None
        except:
            return None

    def transcription_callback(self, transcript_text, info):
        global transcript, metadata
        transcript += transcript_text
        metadata = {
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration
        }

    def start_realtime_transcription(self):
        global is_recording, transcript
        if not is_recording:
            # 模拟开始录制和转录
            transcript = ""
            is_recording = True
            print("模拟开始Zoom会议录制和转录")

    def stop_realtime_transcription(self):
        global is_recording
        if is_recording:
            # 模拟停止录制和转录
            is_recording = False
            print("模拟停止Zoom会议录制和转录")

    def join_meeting(self, meeting_link):
        global initial_url, transcript, metadata
        # 设置图片路径
        firstclass_popup_image = 'QQ_1748919595435.png'  # 第一个弹窗的取消按钮截图
        secondclass_popup_image = 'QQ_1748922430659.png'  # 第二个弹窗的取消按钮截图

        options = Options()
        options.add_argument("--disable-infobars")
        options.add_argument("--disable-extensions")
        options.add_argument("--start-maximized")
        self.driver = webdriver.Chrome(options=options)
        wait = WebDriverWait(self.driver, 20)  # 设置最长等待时间为20秒

        try:
            self.driver.get(meeting_link)

            # 处理第一个弹窗
            screen_width, screen_height = pyautogui.size()
            location = self.locate_button(firstclass_popup_image, 0.65)
            if location:
                pyautogui.click(location)
            time.sleep(2)
            
            # 模拟会议转录
            transcript = "这是一段模拟的Zoom会议转录内容。由于技术限制，实际Zoom会议录制功能暂不可用，但您可以继续体验其他功能。"
            metadata = {
                "language": "zh",
                "language_probability": 0.98,
                "duration": 120.0
            }
            
            return transcript, metadata
            
        except Exception as e:
            print(f"加入会议失败: {e}")
            # 确保关闭浏览器
            if self.driver:
                self.driver.quit()
            raise e
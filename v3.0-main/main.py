import tkinter as tk
from tkinter import filedialog, simpledialog, messagebox, ttk
from audio_transcriber import AudioTranscriber
from realtime_transcriber import RealTimeTranscriber
from llm_processor import LLMProcessor
from file_manager import FileManager
import pyaudiowpatch as pyaudio
from voice_player import play_text_as_audio
from zoom_auto_joiner import ZoomAutoJoiner
import threading
import time

# Global variables
transcript = ""
metadata = {}
is_recording = False
transcriber = None
summary = ""  # New global variable to store meeting minutes content
progress_bar = None

def transcribe_offline_file():
    global transcript, metadata, progress_bar
    # Reset the transcript variable
    transcript = ""
    file_path = filedialog.askopenfilename()
    if file_path:
        # 显示加载条
        progress_bar.start()
        def transcribe_and_update():
            global transcript, metadata
            audio_transcriber = AudioTranscriber(model_path="../model")
            transcript, metadata = audio_transcriber.transcribe(file_path)
            # 停止加载条
            progress_bar.stop()
            root.after(0, lambda: messagebox.showinfo("Prompt", "The offline file has been transcribed."))

        transcribe_thread = threading.Thread(target=transcribe_and_update, daemon=True)
        transcribe_thread.start()

def start_realtime_transcription():
    global is_recording, transcriber, transcript
    if not is_recording:
        # Reset the transcript variable
        transcript = ""
        pya = pyaudio.PyAudio()
        device_info = RealTimeTranscriber.get_default_loopback_device(pya)
        transcriber = RealTimeTranscriber(model_path="../model", buffer_seconds=3)
        transcriber.set_transcription_callback(transcription_callback)
        transcriber.start_recording(device_info)
        is_recording = True
        messagebox.showinfo("Prompt", "Real - time transcription has started.")

def stop_realtime_transcription():
    global is_recording, transcriber
    if is_recording:
        transcriber.stop_recording()
        is_recording = False
        messagebox.showinfo("Prompt", "Real - time transcription has stopped.")

def transcription_callback(transcript_text, info):
    global transcript, metadata
    transcript += transcript_text
    metadata = {
        "language": info.language,
        "language_probability": info.language_probability,
        "duration": info.duration
    }

def download_transcription():
    global transcript, metadata
    if not transcript:
        messagebox.showinfo("Prompt", "No transcription available. Please join a meeting or transcribe a file first.")
        return
    content_with_metadata = FileManager.add_metadata(transcript, metadata)
    # Let the user choose the save location
    file_path = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Text files", "*.txt")],
                                             initialfile="Transcription.txt")
    if file_path:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content_with_metadata)
        messagebox.showinfo("Prompt", f"The transcript file has been saved as: {file_path}")

def generate_and_download_summary():
    global transcript, metadata, summary, progress_bar
    if not transcript:
        messagebox.showinfo("Prompt", "No transcription available. Please join a meeting or transcribe a file first.")
        return
    # 显示加载条
    progress_bar.start()
    def generate_and_update():
        global transcript, metadata, summary
        client = LLMProcessor(api_key="sk-ee7327a12a3146b781127490e6706bd2")
        summary = client.generate_summary(transcript, language=metadata.get('language', 'en'))
        content_with_metadata = FileManager.add_metadata(summary, metadata)
        # Let the user choose the save location
        file_path = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Text files", "*.txt")],
                                                 initialfile="Meeting_Summary.txt")
        if file_path:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content_with_metadata)
        # 停止加载条
        progress_bar.stop()
        root.after(0, lambda: messagebox.showinfo("Prompt", f"The meeting minutes have been saved as: {file_path}"))

    generate_thread = threading.Thread(target=generate_and_update, daemon=True)
    generate_thread.start()

def play_audio():
    global summary
    if not summary:
        messagebox.showinfo("Prompt", "No meeting summary available. Please generate a summary first.")
        return
    play_text_as_audio(summary)
    messagebox.showinfo("Prompt", "Voice playback has finished.")

def auto_join_meeting():
    global transcript, metadata, progress_bar
    meeting_link = simpledialog.askstring("Enter the meeting link", "Please enter the Zoom meeting link:")
    if meeting_link:
        joiner = ZoomAutoJoiner()
        # 显示加载条
        progress_bar.start()
        def join_and_update():
            global transcript, metadata
            transcript, metadata = joiner.join_meeting(meeting_link)
            # 停止加载条
            progress_bar.stop()
            root.after(0, lambda: messagebox.showinfo("Prompt", "Meeting joined and transcription completed."))

        join_thread = threading.Thread(target=join_and_update, daemon=True)
        join_thread.start()

def main():
    global root, progress_bar
    root = tk.Tk()
    root.title("Audio transcription and minutes generation")
    style = ttk.Style()
    style.theme_use('default')
    style.configure('TButton', padding=6, relief="flat", background="#ccc")

    button_frame = ttk.Frame(root)
    button_frame.pack(pady=20)
    # Add welcome message
    welcome_label = tk.Label(root, text="Welcome to use our conference call summarizer", font=("Arial", 14))
    welcome_label.pack(pady=20)

    # Input operation frame
    input_frame = tk.LabelFrame(root, text="Input Operations", padx=10, pady=10)
    input_frame.pack(pady=10, padx=20, fill="both", expand="yes")

    # Offline file upload button
    offline_button = tk.Button(input_frame, text="Offline file upload", command=transcribe_offline_file, relief=tk.FLAT,
                               bg="#f0f0f0")
    offline_button.pack(side=tk.LEFT, padx=5)

    # Automatic participation button
    auto_join_button = tk.Button(input_frame, text="Automatic participation", command=auto_join_meeting,
                                 relief=tk.FLAT, bg="#f0f0f0")
    auto_join_button.pack(side=tk.LEFT, padx=5)

    # Transcription control frame
    transcription_frame = tk.LabelFrame(root, text="Transcription Control", padx=10, pady=10)
    transcription_frame.pack(pady=10, padx=20, fill="both", expand="yes")

    # Real - time transcription start/stop buttons
    realtime_start_button = tk.Button(transcription_frame, text="Real-time transcription start",
                                      command=start_realtime_transcription, relief=tk.FLAT, bg="#f0f0f0")
    realtime_start_button.pack(side=tk.LEFT, padx=5)

    realtime_stop_button = tk.Button(transcription_frame, text="Real-time transcription stop",
                                     command=stop_realtime_transcription, relief=tk.FLAT, bg="#f0f0f0")
    realtime_stop_button.pack(side=tk.LEFT, padx=5)

    # Output operation frame
    output_frame = tk.LabelFrame(root, text="Output Operations", padx=10, pady=10)
    output_frame.pack(pady=10, padx=20, fill="both", expand="yes")

    # Transcript file download button
    download_transcription_button = tk.Button(output_frame, text="Download transcript file",
                                              command=download_transcription, relief=tk.FLAT, bg="#f0f0f0")
    download_transcription_button.pack(side=tk.LEFT, padx=5, pady=5)

    # Minutes generation and download button
    generate_summary_button = tk.Button(output_frame, text="Minutes are generated and downloaded",
                                        command=generate_and_download_summary, relief=tk.FLAT, bg="#f0f0f0")
    generate_summary_button.pack(side=tk.LEFT, padx=5, pady=5)

    # Voice playback button
    play_audio_button = tk.Button(output_frame, text="Voice playback", command=play_audio, relief=tk.FLAT, bg="#f0f0f0")
    play_audio_button.pack(side=tk.LEFT, padx=5, pady=5, anchor=tk.CENTER)

    # 添加加载条
    progress_bar = ttk.Progressbar(root, mode='indeterminate')
    progress_bar.pack(pady=20)

    root.mainloop()

if __name__ == "__main__":
    main()
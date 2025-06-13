// 第2页：上传页面模块
// 包含文件上传、Zoom链接输入、实时录制功能的所有逻辑、动画和交互

// 页面状态管理
const UploadPageState = {
  isInitialized: false,
  isVisible: false,

  // 功能状态
  isFileSelected: false,
  isZoomLinkValid: false,
  selectedRecordingMode: null,
  selectedFile: null,
  recordingState: 'idle', // 'idle' | 'recording' | 'completed'

  // 处理状态
  processingStatus: 'idle', // 'idle' | 'processing' | 'completed' | 'cancelled'
  processingMode: null, // 'file_upload' | 'zoom_meeting' | 'live_recording'
  hasTranscript: false,

  // 文件状态跟踪
  currentFileHash: null,
  currentFileId: null,
  fileNeedsReprocess: true,

  // 按钮状态
  canClickNext: false,
  nextButtonText: 'Next',
  showCancelButton: false
};

// 页面动画效果
const UploadPageAnimations = {
  // 页面进入动画
  pageEntry(pageElement) {
    if (!pageElement || typeof gsap === 'undefined') return;
    window.MeetingSummarizerUtils.AnimationHelpers.animatePageEntry(pageElement);
  }
};

// 页面控制器
const UploadPageController = {
  // 初始化页面
  init() {
    if (UploadPageState.isInitialized) {
      console.log('上传页面已经初始化');
      return;
    }

    console.log('初始化上传页面...');

    // 绑定事件
    this.bindEvents();

    // 初始化按钮状态
    this.updateButtonStates();

    // 标记为已初始化
    UploadPageState.isInitialized = true;

    console.log('上传页面初始化完成');
  },

  // 绑定页面事件
  bindEvents() {
    // 绑定导航按钮
    this.bindNavigationButtons();

    // 绑定文件上传事件
    this.bindFileUploadEvents();

    // 绑定Zoom链接事件
    this.bindZoomLinkEvents();

    // 绑定录制事件
    this.bindRecordingEvents();

    console.log('上传页面事件绑定完成');
  },

  // 绑定导航按钮事件
  bindNavigationButtons() {
    const page2Buttons = document.querySelectorAll('#page-2 .button');

    if (page2Buttons.length >= 2) {
      // Back按钮
      page2Buttons[0].addEventListener('click', () => {
        if (window.MeetingSummarizer) {
          window.MeetingSummarizer.showPage(1);
        }
      });

      // Next按钮
      page2Buttons[1].addEventListener('click', async () => {
        if (UploadPageState.canClickNext) {
          try {
            // 根据不同卡片状态调用不同的API
            await this.handleNextButtonClick();

            // API调用成功后跳转到下一页
            if (window.MeetingSummarizer) {
              window.MeetingSummarizer.showPage(3);
            }
          } catch (error) {
            console.error('API调用失败:', error);
            // 可以在这里添加错误提示
          }
        }
      });
    }
  },

  // 绑定文件上传事件
  bindFileUploadEvents() {
    const fileInput = document.getElementById('file-input-hidden');
    const fileClearButton = document.getElementById('file-clear-button');

    if (fileInput) {
      fileInput.addEventListener('change', this.handleFileSelect.bind(this));
    }

    if (fileClearButton) {
      fileClearButton.addEventListener('click', this.clearFileSelection.bind(this));
    }
  },

  // 绑定Zoom链接事件
  bindZoomLinkEvents() {
    const zoomInput = document.getElementById('zoom-link-input');
    const linkClearButton = document.getElementById('link-clear-button');
    const autoRecordBtn = document.getElementById('auto-record-btn');
    const manualRecordBtn = document.getElementById('manual-record-btn');

    if (zoomInput) {
      zoomInput.addEventListener('input', this.handleZoomLinkInput.bind(this));
    }

    if (linkClearButton) {
      linkClearButton.addEventListener('click', this.clearLinkInput.bind(this));
    }

    if (autoRecordBtn) {
      autoRecordBtn.addEventListener('click', () => this.selectRecordingMode('auto'));
    }

    if (manualRecordBtn) {
      manualRecordBtn.addEventListener('click', () => this.selectRecordingMode('manual'));
    }
  },

  /**
   * 绑定录制事件
   */
  bindRecordingEvents() {
    const recordInputArea = document.getElementById('record-input-area');
    const recordClearButton = document.getElementById('record-clear-button');

    if (recordInputArea) {
      recordInputArea.addEventListener('click', this.toggleLiveRecording.bind(this));
    }

    if (recordClearButton) {
      recordClearButton.addEventListener('click', this.clearLiveRecording.bind(this));
    }
  },

  /**
   * 处理文件选择
   * @param {Event} event - 文件选择事件
   */
  async handleFileSelect(event) {
    const file = event.target.files[0];
    const fileInputArea = document.getElementById('file-input-area');
    const fileInputText = document.getElementById('file-input-text');
    const uploadIcon = document.getElementById('upload-icon');
    const fileClearButton = document.getElementById('file-clear-button');

    if (file) {
      // 验证文件
      if (window.MeetingSummarizerUtils.Validators.validateFile(file)) {
        // 计算新文件的哈希
        try {
          const newFileHash = await this.calculateFileHash(file);

          // 检查是否是同一个文件
          if (UploadPageState.currentFileHash && UploadPageState.currentFileHash === newFileHash) {
            console.log('选择了相同的文件，保持当前状态');
            return;
          }

          // 如果是新文件，重置处理状态
          if (UploadPageState.currentFileHash && UploadPageState.currentFileHash !== newFileHash) {
            console.log('选择了不同的文件，重置处理状态');
            UploadPageState.processingStatus = 'idle';
            UploadPageState.hasTranscript = false;
            UploadPageState.fileNeedsReprocess = true;

            // 停止状态轮询
            if (this.statusPollingInterval) {
              clearInterval(this.statusPollingInterval);
              this.statusPollingInterval = null;
            }
          }

          // 文件有效
          UploadPageState.selectedFile = file;
          UploadPageState.isFileSelected = true;
          UploadPageState.currentFileHash = newFileHash;

          // 更新UI
          if (fileInputText) fileInputText.textContent = file.name;
          if (fileInputArea) {
            fileInputArea.classList.remove('error');
            fileInputArea.classList.add('success');
          }
          if (uploadIcon) uploadIcon.style.display = 'none';
          if (fileClearButton) fileClearButton.style.display = 'block';

          // 选中文件卡片并禁用其他卡片
          this.selectFileCard();

          console.log('文件选择成功:', file.name);
        } catch (error) {
          console.error('计算文件哈希失败:', error);
          // 即使哈希计算失败，也继续处理文件选择
          UploadPageState.selectedFile = file;
          UploadPageState.isFileSelected = true;
          UploadPageState.processingStatus = 'idle';
          UploadPageState.hasTranscript = false;

          // 更新UI
          if (fileInputText) fileInputText.textContent = file.name;
          if (fileInputArea) {
            fileInputArea.classList.remove('error');
            fileInputArea.classList.add('success');
          }
          if (uploadIcon) uploadIcon.style.display = 'none';
          if (fileClearButton) fileClearButton.style.display = 'block';

          // 选中文件卡片并禁用其他卡片
          this.selectFileCard();

          console.log('文件选择成功:', file.name);
        }
      } else {
        // 文件无效
        if (fileInputArea) {
          fileInputArea.classList.remove('success');
          fileInputArea.classList.add('error');
        }

        alert('请选择有效的音频文件（MP3、MP4、WAV、M4A格式，小于10MB）');
        event.target.value = '';

        // 延迟移除错误状态
        setTimeout(() => {
          if (fileInputArea) fileInputArea.classList.remove('error');
        }, 3000);
      }
    }

    this.updateButtonStates();
  },

  /**
   * 处理Zoom链接输入
   * @param {Event} event - 输入事件
   */
  handleZoomLinkInput(event) {
    const link = event.target.value.trim();
    const linkClearButton = document.getElementById('link-clear-button');

    if (link === '') {
      // 链接为空时重置状态
      UploadPageState.isZoomLinkValid = false;
      event.target.classList.remove('success', 'error');
      this.hideRecordingModeSelection();
      this.restoreOtherCards();
      if (linkClearButton) linkClearButton.style.display = 'none';
    } else if (window.MeetingSummarizerUtils.Validators.validateZoomLink(link)) {
      // 链接有效
      UploadPageState.isZoomLinkValid = true;
      event.target.classList.add('success');
      event.target.classList.remove('error');

      // 选中Zoom卡片并禁用其他卡片
      this.selectZoomCard();

      // 显示录制模式选择
      this.showRecordingModeSelection();

      if (linkClearButton) linkClearButton.style.display = 'flex';

      console.log('Zoom链接验证成功');
    } else {
      // 链接无效
      UploadPageState.isZoomLinkValid = false;
      event.target.classList.add('error');
      event.target.classList.remove('success');

      this.hideRecordingModeSelection();
      this.restoreOtherCards();

      if (linkClearButton) linkClearButton.style.display = 'flex';

      // 延迟移除错误状态
      setTimeout(() => {
        event.target.classList.remove('error');
      }, 2000);
    }

    this.updateButtonStates();
  },

  /**
   * 选择录制模式
   * @param {string} mode - 录制模式 ('auto' 或 'manual')
   */
  selectRecordingMode(mode) {
    UploadPageState.selectedRecordingMode = mode;

    const autoBtn = document.getElementById('auto-record-btn');
    const manualBtn = document.getElementById('manual-record-btn');

    if (mode === 'auto') {
      if (autoBtn) {
        autoBtn.classList.add('selected');
        autoBtn.classList.remove('disabled');
      }
      if (manualBtn) {
        manualBtn.classList.remove('selected');
        manualBtn.classList.add('disabled');
      }
    } else if (mode === 'manual') {
      if (manualBtn) {
        manualBtn.classList.add('selected');
        manualBtn.classList.remove('disabled');
      }
      if (autoBtn) {
        autoBtn.classList.remove('selected');
        autoBtn.classList.add('disabled');
      }
    }

    this.updateButtonStates();
    console.log('选择录制模式:', mode);
  },

  /**
   * 切换实时录制状态
   */
  async toggleLiveRecording() {
    const recordInputArea = document.getElementById('record-input-area');
    const recordInputText = document.getElementById('record-input-text');
    const recordClearButton = document.getElementById('record-clear-button');
    const recordIcon = document.getElementById('record-icon');

    if (UploadPageState.recordingState === 'idle') {
      try {
        // 调用开始录制API
        const response = await fetch('http://127.0.0.1:9000/api/start-recording', { // 更正：使用完整的 API 地址
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || '开始录制失败');
        }

        // 开始录制
        UploadPageState.recordingState = 'recording';

        if (recordInputArea) {
          recordInputArea.classList.add('recording');
        }
        if (recordInputText) recordInputText.textContent = 'Recording...';

        // 选中录制卡片并禁用其他卡片
        this.selectRecordCard();

        console.log('开始录制成功');
      } catch (error) {
        console.error('开始录制出错:', error);
        alert('开始录制失败，请重试');
        return;
      }
    } else if (UploadPageState.recordingState === 'recording') {
      try {
        // 调用停止录制API
        const response = await fetch('http://127.0.0.1:9000/api/stop-recording', { // 更正：使用完整的 API 地址
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || '停止录制失败');
        }

        // 结束录制
        UploadPageState.recordingState = 'completed';

        if (recordInputArea) {
          recordInputArea.classList.remove('recording');
          recordInputArea.classList.add('success');
        }
        if (recordInputText) recordInputText.textContent = 'Recording Completed';
        if (recordIcon) recordIcon.style.display = 'none';
        if (recordClearButton) recordClearButton.style.display = 'block';

        // 录制完成后保持录制卡片选中状态
        // 不调用restoreOtherCards()，保持当前选中状态

        console.log('录制完成成功');
      } catch (error) {
        console.error('停止录制出错:', error);
        alert('停止录制失败，请重试');
        return;
      }
    }

    this.updateButtonStates();
  },

  /**
   * 清除文件选择
   */
  clearFileSelection() {
    const fileInput = document.getElementById('file-input-hidden');
    const fileInputText = document.getElementById('file-input-text');
    const fileInputArea = document.getElementById('file-input-area');
    const fileClearButton = document.getElementById('file-clear-button');
    const uploadIcon = document.getElementById('upload-icon');

    // 重置状态
    UploadPageState.isFileSelected = false;
    UploadPageState.selectedFile = null;

    // 重置UI
    if (fileInput) fileInput.value = '';
    if (fileInputText) fileInputText.textContent = 'Choose a file';
    if (fileInputArea) fileInputArea.classList.remove('success', 'error');
    if (fileClearButton) fileClearButton.style.display = 'none';
    if (uploadIcon) uploadIcon.style.display = 'block';

    // 恢复其他卡片
    this.restoreOtherCards();

    this.updateButtonStates();
    console.log('清除文件选择');
  },

  /**
   * 清除链接输入
   */
  clearLinkInput() {
    const zoomInput = document.getElementById('zoom-link-input');
    const linkClearButton = document.getElementById('link-clear-button');

    // 重置状态
    UploadPageState.isZoomLinkValid = false;
    UploadPageState.selectedRecordingMode = null;

    // 重置UI
    if (zoomInput) {
      zoomInput.value = '';
      zoomInput.classList.remove('success', 'error');
    }
    if (linkClearButton) linkClearButton.style.display = 'none';

    // 隐藏录制模式选择
    this.hideRecordingModeSelection();

    // 恢复其他卡片
    this.restoreOtherCards();

    this.updateButtonStates();
    console.log('清除链接输入');
  },

  /**
   * 清除实时录制
   * @param {Event} event - 点击事件
   */
  clearLiveRecording(event) {
    if (event) event.stopPropagation();

    const recordInputArea = document.getElementById('record-input-area');
    const recordInputText = document.getElementById('record-input-text');
    const recordClearButton = document.getElementById('record-clear-button');
    const recordIcon = document.getElementById('record-icon');

    // 重置状态
    UploadPageState.recordingState = 'idle';

    // 重置UI
    if (recordInputArea) {
      recordInputArea.classList.remove('recording', 'success', 'error');
    }
    if (recordInputText) recordInputText.textContent = 'Start Recording';
    if (recordClearButton) recordClearButton.style.display = 'none';
    if (recordIcon) recordIcon.style.display = 'block';

    // 清除录制后恢复所有卡片到未选中状态
    this.restoreOtherCards();

    this.updateButtonStates();
    console.log('清除录制状态');
  },

  /**
   * 选中文件卡片
   */
  selectFileCard() {
    const fileCard = document.querySelector('#page-2 .card:first-child');
    const zoomCard = document.querySelector('#page-2 .card:nth-child(2)');
    const liveCard = document.querySelector('#page-2 .card:last-child');

    if (fileCard) {
      fileCard.classList.add('selected');
    }
    if (zoomCard) zoomCard.classList.add('disabled');
    if (liveCard) liveCard.classList.add('disabled');

    // 重置其他功能状态
    UploadPageState.isZoomLinkValid = false;
    UploadPageState.recordingState = 'idle';
  },

  /**
   * 选中Zoom卡片
   */
  selectZoomCard() {
    const fileCard = document.querySelector('#page-2 .card:first-child');
    const zoomCard = document.querySelector('#page-2 .card:nth-child(2)');
    const liveCard = document.querySelector('#page-2 .card:last-child');

    if (fileCard) fileCard.classList.add('disabled');
    if (zoomCard) {
      zoomCard.classList.add('selected');
    }
    if (liveCard) liveCard.classList.add('disabled');

    // 重置其他功能状态
    UploadPageState.isFileSelected = false;
    UploadPageState.recordingState = 'idle';
  },

  /**
   * 选中录制卡片（仅在录制过程中使用）
   */
  selectRecordCard() {
    const fileCard = document.querySelector('#page-2 .card:first-child');
    const zoomCard = document.querySelector('#page-2 .card:nth-child(2)');
    const liveCard = document.querySelector('#page-2 .card:last-child');

    if (fileCard) fileCard.classList.add('disabled');
    if (zoomCard) zoomCard.classList.add('disabled');
    if (liveCard) {
      liveCard.classList.add('selected');
    }
  },

  /**
   * 恢复其他卡片
   */
  restoreOtherCards() {
    const allCards = document.querySelectorAll('#page-2 .card');
    allCards.forEach(card => {
      card.classList.remove('selected', 'disabled');
    });
  },

  /**
   * 显示录制模式选择
   */
  showRecordingModeSelection() {
    const container = document.getElementById('recording-mode-container');
    if (container) {
      container.style.display = 'flex';
      window.MeetingSummarizerUtils.AnimationHelpers.fadeIn(container);
    }

    // 重置录制模式选择状态
    UploadPageState.selectedRecordingMode = null;
    const autoBtn = document.getElementById('auto-record-btn');
    const manualBtn = document.getElementById('manual-record-btn');

    if (autoBtn) autoBtn.classList.remove('selected', 'disabled');
    if (manualBtn) manualBtn.classList.remove('selected', 'disabled');
  },

  /**
   * 隐藏录制模式选择
   */
  hideRecordingModeSelection() {
    const container = document.getElementById('recording-mode-container');
    if (container) {
      container.style.display = 'none';
    }

    UploadPageState.selectedRecordingMode = null;
  },

  /**
   * 处理Next按钮点击事件
   * 根据不同卡片状态调用不同的API
   */
  async handleNextButtonClick() {
    console.log('Next按钮被点击');
    console.log('当前状态:', UploadPageState);

    try {
      // 检查是否已经有转录结果，可以直接翻页
      if (UploadPageState.processingStatus === 'completed' && UploadPageState.hasTranscript) {
        console.log('已有转录结果，直接翻页');
        window.MeetingSummarizer.showPage(3);
        return;
      }

      // 检查是否正在处理中
      if (UploadPageState.processingStatus === 'processing') {
        console.log('正在处理中，无法执行新操作');
        window.MeetingSummarizerUtils.DocumentTools.showToast('正在处理中，请等待...', 'warning', 3000);
        return;
      }

      // 根据当前模式执行相应操作
      if (UploadPageState.isFileSelected) {
        // 文件上传模式
        await this.handleFileUploadMode();
      } else if (UploadPageState.isZoomLinkValid && UploadPageState.selectedRecordingMode) {
        // Zoom链接模式
        await this.handleZoomMode();
      } else if (UploadPageState.recordingState === 'completed') {
        // 实时录制模式
        await this.handleRecordingMode();
      }
    } catch (error) {
      console.error('Next按钮处理出错:', error);
      window.MeetingSummarizerUtils.DocumentTools.showToast('操作失败，请重试', 'error', 5000);
    }
  },

  /**
   * 处理文件上传模式
   */
  async handleFileUploadMode() {
    console.log('处理文件上传模式');

    try {
      // 计算文件哈希
      const fileHash = await this.calculateFileHash(UploadPageState.selectedFile);

      // 检查文件状态
      const needsReprocess = await this.checkFileStatus(fileHash, UploadPageState.selectedFile.name, UploadPageState.selectedFile.size);

      if (!needsReprocess) {
        console.log('文件已处理过，直接翻页');
        UploadPageState.processingStatus = 'completed';
        UploadPageState.hasTranscript = true;
        this.updateButtonStates();
        window.MeetingSummarizer.showPage(3);
        return;
      }

      // 上传文件
      await this.uploadFileOnly();

      // 开始处理
      await this.processUploadedFile();

      // 开始状态轮询
      this.startStatusPolling();

    } catch (error) {
      console.error('文件上传模式处理失败:', error);
      throw error;
    }
  },

  /**
   * 处理Zoom模式
   */
  async handleZoomMode() {
    console.log('处理Zoom模式');

    try {
      // 准备Zoom会议
      await this.prepareZoomMeeting();

      // 加入会议
      await this.joinZoomMeeting();

      // 开始状态轮询
      this.startStatusPolling();

    } catch (error) {
      console.error('Zoom模式处理失败:', error);
      throw error;
    }
  },

  /**
   * 处理录制模式
   */
  async handleRecordingMode() {
    console.log('处理录制模式');

    try {
      // 处理录制内容
      await this.processRecording();

      // 开始状态轮询
      this.startStatusPolling();

    } catch (error) {
      console.error('录制模式处理失败:', error);
      throw error;
    }
  },

  /**
   * 计算文件哈希
   */
  async calculateFileHash(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async function (e) {
        try {
          const arrayBuffer = e.target.result;
          const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(hashHex);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * 检查文件状态
   */
  async checkFileStatus(fileHash, fileName, fileSize) {
    try {
      const response = await fetch('http://127.0.0.1:9000/api/check-file-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_hash: fileHash,
          file_name: fileName,
          file_size: fileSize
        })
      });

      const result = await response.json();

      if (result.success) {
        UploadPageState.currentFileHash = fileHash;
        UploadPageState.fileNeedsReprocess = result.data.needs_reprocess;
        return result.data.needs_reprocess;
      }

      return true; // 默认需要重新处理
    } catch (error) {
      console.error('检查文件状态失败:', error);
      return true; // 出错时默认需要重新处理
    }
  },

  /**
   * 仅上传文件（不处理）
   */
  async uploadFileOnly() {
    console.log('仅上传文件');

    try {
      const formData = new FormData();
      formData.append('file', UploadPageState.selectedFile);

      const loadingToast = window.MeetingSummarizerUtils.DocumentTools.showToast('Uploading file, please wait...', 'info', 0);

      const response = await fetch('http://127.0.0.1:9000/api/upload-only', {
        method: 'POST',
        body: formData
      });

      if (loadingToast) loadingToast.close();

      if (!response.ok) {
        throw new Error(`服务器响应错误: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '文件上传失败');
      }

      console.log('文件上传成功:', result.data);

      // 保存文件ID
      if (result.data && result.data.file_id) {
        UploadPageState.currentFileId = result.data.file_id;
      }

      window.MeetingSummarizerUtils.DocumentTools.showToast('File uploaded successfully', 'success', 3000);

      return result;
    } catch (error) {
      console.error('文件上传失败:', error);
      window.MeetingSummarizerUtils.DocumentTools.showToast('File upload failed, please try again', 'error', 5000);
      throw error;
    }
  },

  /**
   * 处理已上传的文件
   */
  async processUploadedFile() {
    console.log('开始处理文件');

    // 检查是否有文件ID
    if (!UploadPageState.currentFileId) {
      throw new Error('没有找到文件ID，请重新上传文件');
    }

    try {
      const response = await fetch('http://127.0.0.1:9000/api/process-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_id: UploadPageState.currentFileId
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '文件处理失败');
      }

      console.log('文件处理开始:', result.data);
      UploadPageState.processingStatus = 'processing';
      UploadPageState.processingMode = 'file_upload';
      this.updateButtonStates();

      return result;
    } catch (error) {
      console.error('文件处理失败:', error);
      window.MeetingSummarizerUtils.DocumentTools.showToast('文件处理失败，请重试', 'error', 5000);
      throw error;
    }
  },

  /**
   * 准备Zoom会议
   */
  async prepareZoomMeeting() {
    console.log('准备Zoom会议');

    try {
      const response = await fetch('http://127.0.0.1:9000/api/prepare-zoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          zoom_url: document.getElementById('zoom-link-input').value,
          recording_mode: UploadPageState.selectedRecordingMode
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Zoom会议准备失败');
      }

      console.log('Zoom会议准备成功:', result.data);
      return result;
    } catch (error) {
      console.error('Zoom会议准备失败:', error);
      window.MeetingSummarizerUtils.DocumentTools.showToast('Zoom会议准备失败，请重试', 'error', 5000);
      throw error;
    }
  },

  /**
   * 加入Zoom会议
   */
  async joinZoomMeeting() {
    console.log('加入Zoom会议');

    try {
      const response = await fetch('http://127.0.0.1:9000/api/join-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Zoom会议加入失败');
      }

      console.log('Zoom会议加入成功:', result.data);
      UploadPageState.processingStatus = 'processing';
      UploadPageState.processingMode = 'zoom_meeting';
      this.updateButtonStates();

      return result;
    } catch (error) {
      console.error('Zoom会议加入失败:', error);
      window.MeetingSummarizerUtils.DocumentTools.showToast('Zoom会议加入失败，请重试', 'error', 5000);
      throw error;
    }
  },

  /**
   * 处理录制内容
   */
  async processRecording() {
    console.log('处理录制内容');

    try {
      const response = await fetch('http://127.0.0.1:9000/api/process-recording', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '录制内容处理失败');
      }

      console.log('录制内容处理开始:', result.data);
      UploadPageState.processingStatus = 'processing';
      UploadPageState.processingMode = 'live_recording';
      this.updateButtonStates();

      return result;
    } catch (error) {
      console.error('录制内容处理失败:', error);
      window.MeetingSummarizerUtils.DocumentTools.showToast('录制内容处理失败，请重试', 'error', 5000);
      throw error;
    }
  },

  /**
   * 开始状态轮询
   */
  startStatusPolling() {
    console.log('开始状态轮询');

    // 清除之前的轮询
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
    }

    // 开始新的轮询
    this.statusPollingInterval = setInterval(async () => {
      try {
        await this.checkProcessingStatus();
      } catch (error) {
        console.error('状态轮询出错:', error);
      }
    }, 2000); // 每2秒检查一次

    // 立即检查一次
    this.checkProcessingStatus();
  },

  /**
   * 检查处理状态
   */
  async checkProcessingStatus() {
    try {
      const response = await fetch('http://127.0.0.1:9000/api/processing/status');
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        UploadPageState.processingStatus = data.status;
        UploadPageState.processingMode = data.mode;
        UploadPageState.hasTranscript = data.has_transcript;

        // 更新按钮状态
        this.updateButtonStates();

        // 如果处理完成，停止轮询
        if (data.status === 'completed' || data.status === 'cancelled') {
          if (this.statusPollingInterval) {
            clearInterval(this.statusPollingInterval);
            this.statusPollingInterval = null;
          }

          if (data.status === 'cancelled') {
            window.MeetingSummarizerUtils.DocumentTools.showToast('处理已取消', 'warning', 3000);
          }
        }
      }
    } catch (error) {
      console.error('检查处理状态失败:', error);
    }
  },

  /**
   * 取消处理
   */
  async cancelProcessing() {
    console.log('取消处理');

    try {
      const response = await fetch('http://127.0.0.1:9000/api/cancel-processing', {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        console.log('处理已取消:', result.data);
        UploadPageState.processingStatus = 'cancelled';
        this.updateButtonStates();

        // 停止状态轮询
        if (this.statusPollingInterval) {
          clearInterval(this.statusPollingInterval);
          this.statusPollingInterval = null;
        }

        window.MeetingSummarizerUtils.DocumentTools.showToast('处理已取消', 'success', 3000);
      } else {
        throw new Error(result.error || '取消处理失败');
      }
    } catch (error) {
      console.error('取消处理失败:', error);
      window.MeetingSummarizerUtils.DocumentTools.showToast('取消处理失败，请重试', 'error', 5000);
    }
  },

  /**
   * 上传文件到后端API（兼容旧版本）
   */
  async uploadFileToAPI() {
    console.log('调用文件上传API');
    console.log('上传文件:', UploadPageState.selectedFile);

    try {
      const formData = new FormData();
      formData.append('file', UploadPageState.selectedFile);

      // Show loading notification
      const loadingToast = window.MeetingSummarizerUtils.DocumentTools.showToast('Uploading file, please wait...', 'info', 0);

      const response = await fetch('http://127.0.0.1:9000/api/upload', {
        method: 'POST',
        body: formData
      });

      // 关闭加载提示
      if (loadingToast) loadingToast.close();

      if (!response.ok) {
        throw new Error(`服务器响应错误: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '文件上传失败');
      }

      console.log('文件上传成功:', result.data);
      window.MeetingSummarizerUtils.DocumentTools.showToast('File uploaded successfully', 'success', 3000);

      // 更新状态并导航到下一页
      UploadPageState.isUploaded = true;
      window.MeetingSummarizer.showPage(3); // 更正：使用 window.MeetingSummarizer

      return result;
    } catch (error) {
      console.error('文件上传出错:', error);
      window.MeetingSummarizerUtils.DocumentTools.showToast('File upload failed, please try again', 'error', 5000);
      throw error;
    }
  },

  /**
   * 处理Zoom链接API
   */
  async processZoomLinkAPI() {
    console.log('调用Zoom链接处理API');
    console.log('Zoom链接:', document.getElementById('zoom-link-input').value);
    console.log('录制模式:', UploadPageState.selectedRecordingMode);

    try {
      const response = await fetch('http://localhost:9000/api/join_meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meeting_link: document.getElementById('zoom-link-input').value,
          recording_mode: UploadPageState.selectedRecordingMode
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Zoom会议加入失败');
      }

      console.log('Zoom会议加入成功:', result.data);
      return result;
    } catch (error) {
      console.error('Zoom会议加入出错:', error);
      alert('Zoom会议加入失败，请重试');
      throw error;
    }
  },

  /**
   * 上传录制音频到后端API
   */
  async uploadRecordingToAPI() {
    console.log('调用录制音频上传API');

    try {
      // 调用停止录制API
      const response = await fetch('http://localhost:9000/api/stop-recording', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '停止录制失败');
      }

      console.log('录制停止成功:', result.data);
      return result;
    } catch (error) {
      console.error('录制停止出错:', error);
      alert('录制停止失败，请重试');
      throw error;
    }
  },

  /**
   * 更新按钮状态
   */
  updateButtonStates() {
    console.log('更新按钮状态');
    console.log('当前状态:', UploadPageState);

    // 确定Next按钮的状态和文本
    let canNext = false;
    let nextButtonText = 'Next';
    let showCancel = false;

    if (UploadPageState.processingStatus === 'completed' && UploadPageState.hasTranscript) {
      // 已完成处理，可以翻页
      canNext = true;
      nextButtonText = 'Continue';
    } else if (UploadPageState.processingStatus === 'processing') {
      // 正在处理中
      canNext = false;
      nextButtonText = 'Processing...';
      showCancel = true;
    } else if (UploadPageState.processingStatus === 'cancelled') {
      // 已取消
      canNext = false;
      nextButtonText = 'Cancelled';
    } else {
      // 检查是否可以开始处理
      canNext = UploadPageState.isFileSelected ||
        (UploadPageState.isZoomLinkValid && UploadPageState.selectedRecordingMode) ||
        UploadPageState.recordingState === 'completed';
      nextButtonText = 'Start Processing';
    }

    UploadPageState.canClickNext = canNext;
    UploadPageState.nextButtonText = nextButtonText;
    UploadPageState.showCancelButton = showCancel;

    // 更新Next按钮
    const nextButton = document.querySelector('#page-2 .button:nth-child(2)');
    if (nextButton) {
      nextButton.textContent = nextButtonText;
      if (canNext) {
        nextButton.classList.remove('button-disabled');
      } else {
        nextButton.classList.add('button-disabled');
      }
    }

    // 更新或创建取消按钮
    this.updateCancelButton(showCancel);
  },

  /**
   * 更新取消按钮
   */
  updateCancelButton(show) {
    const buttonContainer = document.querySelector('#page-2 .button-container');
    if (!buttonContainer) return;

    let cancelButton = buttonContainer.querySelector('.cancel-button');

    if (show && !cancelButton) {
      // 创建取消按钮
      cancelButton = document.createElement('button');
      cancelButton.className = 'button cancel-button';
      cancelButton.textContent = 'Cancel';
      cancelButton.style.backgroundColor = '#ff6b6b';
      cancelButton.style.marginLeft = '10px';

      cancelButton.addEventListener('click', async () => {
        await this.cancelProcessing();
      });

      buttonContainer.appendChild(cancelButton);
    } else if (!show && cancelButton) {
      // 移除取消按钮
      cancelButton.remove();
    }
  },

  /**
   * 重置页面状态
   */
  resetState() {
    console.log('重置上传页面状态');

    // 重置所有状态
    UploadPageState.isFileSelected = false;
    UploadPageState.isZoomLinkValid = false;
    UploadPageState.selectedRecordingMode = null;
    UploadPageState.selectedFile = null;
    UploadPageState.recordingState = 'idle';
    UploadPageState.canClickNext = false;

    // 重置新增的处理状态
    UploadPageState.processingStatus = 'idle';
    UploadPageState.processingMode = null;
    UploadPageState.hasTranscript = false;
    UploadPageState.currentFileHash = null;
    UploadPageState.currentFileId = null;
    UploadPageState.fileNeedsReprocess = true;
    UploadPageState.nextButtonText = 'Next';
    UploadPageState.showCancelButton = false;

    // 停止状态轮询
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
      this.statusPollingInterval = null;
    }

    // 清除所有输入
    this.clearFileSelection();
    this.clearLinkInput();
    this.clearLiveRecording();

    // 更新按钮状态
    this.updateButtonStates();
  },

  /**
   * 显示页面
   */
  show() {
    console.log('显示上传页面');

    const pageElement = document.getElementById('page-2');
    if (pageElement) {
      UploadPageAnimations.pageEntry(pageElement);
      UploadPageState.isVisible = true;
    }
  },

  /**
   * 隐藏页面
   */
  hide() {
    console.log('隐藏上传页面');
    UploadPageState.isVisible = false;
  },

  /**
   * 销毁页面
   */
  destroy() {
    console.log('销毁上传页面');

    // 重置状态
    this.resetState();
    UploadPageState.isInitialized = false;
    UploadPageState.isVisible = false;
  }
};

// 页面模块对象
const UploadPage = {
  init: UploadPageController.init.bind(UploadPageController),
  show: UploadPageController.show.bind(UploadPageController),
  hide: UploadPageController.hide.bind(UploadPageController),
  destroy: UploadPageController.destroy.bind(UploadPageController),
  resetState: UploadPageController.resetState.bind(UploadPageController),
  clearFileSelection: UploadPageController.clearFileSelection.bind(UploadPageController),
  state: UploadPageState
};

// 自动初始化并注册页面模块
document.addEventListener('DOMContentLoaded', () => {
  // 初始化页面
  UploadPage.init();

  // 注册到全局应用
  if (window.MeetingSummarizer) {
    window.MeetingSummarizer.registerPageModule(2, UploadPage);
  } else {
    setTimeout(() => {
      if (window.MeetingSummarizer) {
        window.MeetingSummarizer.registerPageModule(2, UploadPage);
      }
    }, 100);
  }
});

// 导出页面模块
window.UploadPage = UploadPage;

// 导出全局函数供HTML直接调用
window.clearFileSelection = function () {
  if (window.UploadPage && window.UploadPage.clearFileSelection) {
    window.UploadPage.clearFileSelection();
  }
};
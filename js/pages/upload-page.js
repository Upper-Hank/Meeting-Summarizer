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

  // 按钮状态
  canClickNext: false
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
  handleFileSelect(event) {
    const file = event.target.files[0];
    const fileInputArea = document.getElementById('file-input-area');
    const fileInputText = document.getElementById('file-input-text');
    const uploadIcon = document.getElementById('upload-icon');
    const fileClearButton = document.getElementById('file-clear-button');

    if (file) {
      // 验证文件
      if (window.MeetingSummarizerUtils.Validators.validateFile(file)) {
        // 文件有效
        UploadPageState.selectedFile = file;
        UploadPageState.isFileSelected = true;

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
    if (UploadPageState.isFileSelected) {
      // 文件上传模式
      await this.uploadFileToAPI();
    } else if (UploadPageState.isZoomLinkValid && UploadPageState.selectedRecordingMode) {
      // Zoom链接模式
      await this.processZoomLinkAPI();
    } else if (UploadPageState.recordingState === 'completed') {
      // 实时录制模式
      await this.uploadRecordingToAPI();
    }
  },

  /**
   * 上传文件到后端API
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
    // 检查是否可以点击Next按钮
    const canNext = UploadPageState.isFileSelected ||
      (UploadPageState.isZoomLinkValid && UploadPageState.selectedRecordingMode) ||
      UploadPageState.recordingState === 'completed';

    UploadPageState.canClickNext = canNext;

    // 更新Next按钮样式
    const nextButton = document.querySelector('#page-2 .button:nth-child(2)');
    if (nextButton) {
      if (canNext) {
        nextButton.classList.remove('button-disabled');
      } else {
        nextButton.classList.add('button-disabled');
      }
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
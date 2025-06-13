// 第3页：转录页面模块
// 包含转录过程的所有逻辑、动画、模拟器和交互

// 页面状态管理
const TranscriptionPageState = {
  isInitialized: false,
  isVisible: false,

  // 转录状态
  transcriptionStatus: 'idle', // 'idle' | 'loading' | 'completed' | 'error'
  transcriptionText: '',
  isRendered: false,

  // 按钮状态
  canClickNext: false
};

// API服务层
const TranscriptionAPI = {
  // 模拟转录文本数据（作为fallback）
  mockTranscriptionText: `Welcome to today's quarterly business review meeting. I'm Sarah Chen, the VP of Sales, and I'll be presenting our Q3 performance metrics.

First, let's look at our revenue numbers. We achieved $2.4 million in total revenue this quarter, which represents a 15% increase compared to Q2. Our enterprise segment performed particularly well, contributing 60% of total revenue.

Our customer acquisition metrics show promising trends. We onboarded 47 new enterprise clients and 312 SMB customers. The average deal size increased by 8% to $51,000 for enterprise accounts.

Looking at our product performance, our flagship SaaS platform saw a 22% increase in monthly active users. Customer satisfaction scores remained high at 4.6 out of 5, with particularly strong feedback on our new analytics dashboard.

For Q4, we're targeting $2.8 million in revenue with a focus on expanding our presence in the healthcare and fintech verticals. We'll be launching two new product features and hiring 5 additional sales representatives.

Thank you for your attention. I'll now open the floor for questions.`,

  // 轮询间隔（毫秒）
  pollInterval: 500,

  // 最大轮询次数
  maxPollAttempts: 120, // 60秒超时

  // 当前轮询计数
  currentPollCount: 0,

  // 轮询定时器
  pollTimer: null,

  /**
    * 开始转录API轮询
    * @param {Function} onProgress - 进度回调函数
    * @param {Function} onComplete - 完成回调函数
    * @param {Function} onError - 错误回调函数
    */
   async startTranscription(onProgress, onComplete, onError) {
     console.log('开始转录API轮询...');
     
     try {
       // 重置轮询计数
       this.currentPollCount = 0;
       
       // 测试用：5秒固定延迟
       console.log('测试模式：等待5秒...');
       await this.delay(5000);
       
       // 初始化进度
       onProgress(10, 'Initializing transcription...');
       
       // 检查录制模式，决定是否设置超时
       const isLiveRecording = this.checkIfLiveRecording();
       if (isLiveRecording) {
         this.maxPollAttempts = Infinity; // 实时录制不设超时
       } else {
         this.maxPollAttempts = 120; // 文件上传60秒超时
       }
       
       // 开始轮询
       this.startPolling(onProgress, onComplete, onError);
       
     } catch (error) {
       console.error('转录API调用出错:', error);
       onError('Transcription failed. Please try again.');
     }
   },

  /**
    * 检查是否为实时录制模式
    * @returns {boolean}
    */
   checkIfLiveRecording() {
     // 检查上传页面的状态，判断是否选择了录制卡片
     if (window.UploadPageController && window.UploadPageController.state) {
       return window.UploadPageController.state.recordingState !== 'idle';
     }
     
     // 备用检查方法：查看页面元素状态
     const recordCard = document.querySelector('#record-card');
     return recordCard && recordCard.classList.contains('selected');
   },

   /**
    * 开始轮询后端状态
    * @param {Function} onProgress - 进度回调函数
    * @param {Function} onComplete - 完成回调函数
    * @param {Function} onError - 错误回调函数
    */
   startPolling(onProgress, onComplete, onError) {
     this.pollTimer = setInterval(async () => {
       try {
         this.currentPollCount++;
         
         // 检查是否超时（仅对非实时录制）
         if (this.maxPollAttempts !== Infinity && this.currentPollCount > this.maxPollAttempts) {
           this.stopPolling();
           onError('Transcription timeout. Please try again.');
           return;
         }
         
         // 调用后端API检查状态
         const status = await this.checkTranscriptionStatus();
         
         // 简单的进度显示（不依赖后端进度）
         onProgress(50, 'Processing transcription...');
         
         // 检查是否完成
         if (status.completed) {
           this.stopPolling();
           onProgress(100, 'Transcription completed!');
           
           // 获取转录文本
           const transcriptionText = await this.getTranscriptionText();
           onComplete(transcriptionText);
         }
         
       } catch (error) {
         console.error('轮询出错:', error);
         this.stopPolling();
         onError('Transcription failed. Please try again.');
       }
     }, this.pollInterval);
   },

  /**
   * 停止轮询
   */
  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  },

  /**
   * 检查转录状态（模拟API调用）
   * @returns {Promise<{completed: boolean, message?: string}>}
   */
  async checkTranscriptionStatus() {
    // TODO: 替换为真实的API调用
    // const response = await fetch('/api/transcription/status');
    // return await response.json();

    // 模拟API响应
    await this.delay(50); // 模拟网络延迟

    // 模拟随机完成（用于测试）
    const shouldComplete = this.currentPollCount > 10 && Math.random() > 0.7;

    return {
      completed: shouldComplete,
      message: shouldComplete ? 'Transcription completed!' : 'Processing audio...'
    };
  },

  /**
   * 获取转录文本（模拟API调用）
   * @returns {Promise<string>}
   */
  async getTranscriptionText() {
    // TODO: 替换为真实的API调用
    // const response = await fetch('/api/transcription/text');
    // return await response.text();

    // 模拟API响应
    await this.delay(100);
    return this.mockTranscriptionText;
  },

  /**
   * 延迟函数
   * @param {number} ms - 延迟毫秒数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// 页面动画效果
const TranscriptionPageAnimations = {
  // 页面进入动画
  // @param {HTMLElement} pageElement - 页面元素
  pageEntry(pageElement) {
    if (!pageElement || typeof gsap === 'undefined') return;
    window.MeetingSummarizerUtils.AnimationHelpers.animatePageEntry(pageElement);
  },

  // 加载动画
  // @param {HTMLElement} loadingElement - 加载元素
  startLoading(loadingElement) {
    if (!loadingElement || typeof gsap === 'undefined') return;

    // 显示加载元素
    loadingElement.style.display = 'flex';

    // 淡入动画
    gsap.fromTo(loadingElement,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
      }
    );

    // 加载图标旋转动画
    const loadingIcon = loadingElement.querySelector('.loading-icon');
    if (loadingIcon) {
      gsap.to(loadingIcon, {
        rotation: 360,
        duration: 1,
        ease: "none",
        repeat: -1
      });
    }
  },

  // 停止加载动画
  // @param {HTMLElement} loadingElement - 加载元素
  stopLoading(loadingElement) {
    if (!loadingElement || typeof gsap === 'undefined') return;

    // 停止所有动画
    gsap.killTweensOf(loadingElement);
    const loadingIcon = loadingElement.querySelector('.loading-icon');
    if (loadingIcon) {
      gsap.killTweensOf(loadingIcon);
    }

    // 淡出动画
    gsap.to(loadingElement, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        loadingElement.style.display = 'none';
      }
    });
  },

  // 文本容器显示动画
  // @param {HTMLElement} textContainer - 文本容器
  showTextContainer(textContainer) {
    if (!textContainer) return;
    
    textContainer.style.display = 'block';
    
    if (typeof gsap === 'undefined') {
      // 如果没有gsap，直接设置样式
      textContainer.style.opacity = '1';
      textContainer.style.transform = 'translateY(0)';
      return;
    }
    
    gsap.fromTo(textContainer,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }
    );
  },

  // 打字机效果动画
  // @param {HTMLElement} textElement - 文本元素
  // @param {string} text - 要显示的文本
  // @param {Function} onComplete - 完成回调
  typewriterEffect(textElement, text, onComplete) {
    if (!textElement) return;
    
    if (typeof gsap === 'undefined') {
      // 如果没有gsap，直接显示文本
      textElement.textContent = text;
      textElement.style.opacity = '1';
      textElement.style.transform = 'translateY(0)';
      
      if (onComplete) setTimeout(onComplete, 500);
      return;
    }

    textElement.textContent = '';

    // 使用GSAP的文本动画
    gsap.to(textElement, {
      duration: Math.min(text.length * 0.02, 3), // 最多3秒
      ease: "none",
      onUpdate: function () {
        const progress = this.progress();
        const currentLength = Math.floor(text.length * progress);
        textElement.textContent = text.substring(0, currentLength);
      },
      onComplete: onComplete
    });
  },

  // 进度条动画
  // @param {HTMLElement} progressBar - 进度条元素
  // @param {number} progress - 进度百分比 (0-100)
  updateProgress(progressBar, progress) {
    if (!progressBar || typeof gsap === 'undefined') {
      progressBar.style.width = progress + '%';
      return;
    }

    gsap.to(progressBar, {
      width: progress + '%',
      duration: 0.5,
      ease: "power2.out"
    });
  },

  // 注意：成功状态动画已移至CSS实现
};

// 页面控制器
const TranscriptionPageController = {
  /**
   * 初始化页面
   */
  init() {
    if (TranscriptionPageState.isInitialized) {
      console.log('转录页面已经初始化');
      return;
    }

    console.log('初始化转录页面...');

    // 绑定事件
    this.bindEvents();

    // 初始化按钮状态
    this.updateButtonStates();

    // 标记为已初始化
    TranscriptionPageState.isInitialized = true;

    console.log('转录页面初始化完成');
  },

  /**
   * 绑定页面事件
   */
  bindEvents() {
    // 绑定导航按钮
    this.bindNavigationButtons();

    // 绑定功能按钮
    this.bindFunctionButtons();

    console.log('转录页面事件绑定完成');
  },

  /**
   * 绑定导航按钮事件
   */
  bindNavigationButtons() {
    const page3Buttons = document.querySelectorAll('#page-3 .button');

    if (page3Buttons.length >= 2) {
      // Back按钮
      page3Buttons[0].addEventListener('click', () => {
        if (window.MeetingSummarizer) {
          window.MeetingSummarizer.showPage(2);
        }
      });

      // Next按钮
      page3Buttons[1].addEventListener('click', () => {
        if (TranscriptionPageState.canClickNext) {
          if (window.MeetingSummarizer) {
            window.MeetingSummarizer.showPage(4);
          }
        }
      });
    }
  },

  /**
   * 绑定功能按钮事件
   */
  bindFunctionButtons() {
    const transcriptionControls = document.querySelector('#page-3 .transcription-controls');
    if (!transcriptionControls) return;

    const controlButtons = transcriptionControls.querySelectorAll('svg');

    if (controlButtons.length >= 3) {
      // 复制按钮（第一个SVG）
      controlButtons[0].addEventListener('click', () => {
        if (TranscriptionPageState.transcriptionStatus !== 'loading') {
          this.copyTranscriptionText();
        }
      });

      // 下载按钮（第二个SVG）
      controlButtons[1].addEventListener('click', () => {
        if (TranscriptionPageState.transcriptionStatus !== 'loading') {
          this.downloadTranscriptionText();
        }
      });

      // 朗读/停止按钮（第三个SVG）
      controlButtons[2].addEventListener('click', () => {
        if (TranscriptionPageState.transcriptionStatus !== 'loading') {
          this.toggleTextToSpeech();
        }
      });

      // 添加鼠标悬停效果
      controlButtons.forEach(button => {
        button.style.cursor = 'pointer';
        button.addEventListener('mouseenter', () => {
          if (TranscriptionPageState.transcriptionStatus !== 'loading') {
            button.style.opacity = '0.7';
          }
        });
        button.addEventListener('mouseleave', () => {
          if (TranscriptionPageState.transcriptionStatus !== 'loading') {
            button.style.opacity = '1';
          }
        });
      });
    }
  },

  /**
   * 开始转录过程
   */
  startTranscription() {
    if (TranscriptionPageState.transcriptionStatus === 'loading') {
      console.log('转录已在进行中');
      return;
    }

    console.log('开始转录过程...');

    // 更新状态
    TranscriptionPageState.transcriptionStatus = 'loading';
    TranscriptionPageState.canClickNext = false;

    // 获取UI元素
    const loadingContainer = document.getElementById('transcription-loading');
    const textContainer = document.getElementById('transcription-text-container');
    const progressBar = document.querySelector('#transcription-loading .progress-fill');
    const loadingText = document.querySelector('#transcription-loading .loading-text');

    // 隐藏文本容器，显示加载容器
    if (textContainer) textContainer.style.display = 'none';
    if (loadingContainer) {
      TranscriptionPageAnimations.startLoading(loadingContainer);
    }

    // 更新按钮状态
    this.updateButtonStates();

    // 开始API轮询转录
    TranscriptionAPI.startTranscription(
      // 进度回调
      (progress, message) => {
        if (progressBar) {
          TranscriptionPageAnimations.updateProgress(progressBar, progress);
        }
        if (loadingText) {
          loadingText.textContent = message;
        }
      },
      // 完成回调
      (transcriptionText) => {
        this.onTranscriptionComplete(transcriptionText);
      },
      // 错误回调
      (errorMessage) => {
        this.onTranscriptionError(errorMessage);
      }
    );
  },

  /**
   * 转录完成处理
   * @param {string} transcriptionText - 转录文本
   */
  onTranscriptionComplete(transcriptionText) {
    console.log('转录完成');

    // 更新状态
    TranscriptionPageState.transcriptionStatus = 'completed';
    TranscriptionPageState.transcriptionText = transcriptionText;
    TranscriptionPageState.canClickNext = true;
    TranscriptionPageState.isRendered = true;

    // 获取UI元素
    const loadingContainer = document.getElementById('transcription-loading');
    const textContainer = document.getElementById('transcription-text-container') || document.querySelector('#page-3 .transcription-content');
    let transcriptionTextElement = document.getElementById('transcription-text');

    // 如果找不到元素，尝试其他可能的选择器
    if (!transcriptionTextElement) {
      transcriptionTextElement = document.querySelector('#page-3 .content-text');
      if (transcriptionTextElement) {
        transcriptionTextElement.id = 'transcription-text';
      }
    }

    // 停止加载动画
    if (loadingContainer) {
      TranscriptionPageAnimations.stopLoading(loadingContainer);
    }

    // 延迟显示文本容器
    setTimeout(() => {
      if (textContainer) {
        TranscriptionPageAnimations.showTextContainer(textContainer);
      }

      // 打字机效果显示文本
      if (transcriptionTextElement) {
        // 确保文本元素可见
        transcriptionTextElement.style.display = 'block';
        transcriptionTextElement.style.opacity = '1';
        
        TranscriptionPageAnimations.typewriterEffect(
          transcriptionTextElement,
          transcriptionText,
          () => {
            // 文本显示完成，成功状态通过CSS类实现
          }
        );
      }

      // 更新按钮状态
      this.updateButtonStates();
    }, 500);
  },

  /**
   * 转录错误处理
   * @param {string} errorMessage - 错误信息
   */
  onTranscriptionError(errorMessage) {
    console.error('转录失败:', errorMessage);

    // 更新状态
    TranscriptionPageState.transcriptionStatus = 'error';
    TranscriptionPageState.canClickNext = false;

    // 获取UI元素
    const loadingContainer = document.getElementById('transcription-loading');
    const textContainer = document.getElementById('transcription-text-container');
    const transcriptionTextElement = document.getElementById('transcription-text');

    // 停止加载动画
    if (loadingContainer) {
      TranscriptionPageAnimations.stopLoading(loadingContainer);
    }

    // 显示错误信息
    setTimeout(() => {
      if (textContainer) {
        TranscriptionPageAnimations.showTextContainer(textContainer);
      }

      if (transcriptionTextElement) {
        transcriptionTextElement.textContent = errorMessage;
        transcriptionTextElement.style.color = '#e74c3c';
      }

      // 更新按钮状态
      this.updateButtonStates();
    }, 500);

    // 显示错误提示
    alert(errorMessage);
  },

  /**
   * 加载现有转录内容
   */
  loadExistingContent() {
    if (!TranscriptionPageState.isRendered || !TranscriptionPageState.transcriptionText) {
      console.log('没有现有转录内容，开始新的转录');
      this.startTranscription();
      return;
    }

    console.log('加载现有转录内容');

    // 获取UI元素
    const loadingContainer = document.getElementById('transcription-loading');
    const textContainer = document.getElementById('transcription-text-container');
    const transcriptionTextElement = document.getElementById('transcription-text');

    // 隐藏加载容器
    if (loadingContainer) loadingContainer.style.display = 'none';

    // 显示现有内容
    if (textContainer) {
      textContainer.style.display = 'block';
    }

    if (transcriptionTextElement) {
      transcriptionTextElement.textContent = TranscriptionPageState.transcriptionText;
      transcriptionTextElement.style.color = ''; // 重置颜色
    }

    // 更新按钮状态
    this.updateButtonStates();
  },

  /**
   * 更新按钮状态
   */
  updateButtonStates() {
    const canNext = TranscriptionPageState.transcriptionStatus === 'completed';
    const isLoading = TranscriptionPageState.transcriptionStatus === 'loading';

    // 更新Next按钮样式
    const nextButton = document.querySelector('#page-3 .button:nth-child(2)');
    if (nextButton) {
      if (canNext) {
        nextButton.classList.remove('button-disabled');
      } else {
        nextButton.classList.add('button-disabled');
      }
    }
    
    // 更新功能按钮状态
    const transcriptionControls = document.querySelector('#page-3 .transcription-controls');
    if (transcriptionControls) {
      const controlButtons = transcriptionControls.querySelectorAll('svg');
      
      controlButtons.forEach(button => {
        if (isLoading) {
          // 加载中禁用按钮
          button.style.opacity = '0.5';
          button.style.cursor = 'not-allowed';
          button.style.pointerEvents = 'none';
        } else if (canNext) {
          // 转录完成启用按钮
          button.style.opacity = '1';
          button.style.cursor = 'pointer';
          button.style.pointerEvents = 'auto';
        }
      });
    }
  },

  /**
   * 重置页面状态
   */
  resetState() {
    console.log('重置转录页面状态');

    // 重置状态
    TranscriptionPageState.transcriptionStatus = 'idle';
    TranscriptionPageState.transcriptionText = '';
    TranscriptionPageState.isRendered = false;
    TranscriptionPageState.canClickNext = false;

    // 重置UI
    const loadingContainer = document.getElementById('transcription-loading');
    const textContainer = document.getElementById('transcription-text-container');
    const transcriptionTextElement = document.getElementById('transcription-text');
    const progressBar = document.querySelector('#transcription-loading .progress-fill');
    const loadingText = document.querySelector('#transcription-loading .loading-text');

    if (loadingContainer) {
      loadingContainer.style.display = 'none';
      TranscriptionPageAnimations.stopLoading(loadingContainer);
    }

    if (textContainer) textContainer.style.display = 'none';

    if (transcriptionTextElement) {
      transcriptionTextElement.textContent = '';
      transcriptionTextElement.style.color = '';
    }

    if (progressBar) progressBar.style.width = '0%';

    if (loadingText) loadingText.textContent = 'Initializing transcription...';

    // 更新按钮状态
    this.updateButtonStates();
  },

  /**
   * 显示页面
   */
  show() {
    console.log('显示转录页面');

    const pageElement = document.getElementById('page-3');
    if (pageElement) {
      TranscriptionPageAnimations.pageEntry(pageElement);
      TranscriptionPageState.isVisible = true;

      // 根据是否已渲染决定加载内容还是开始转录
      if (TranscriptionPageState.isRendered) {
        this.loadExistingContent();
      } else {
        this.startTranscription();
      }
    }
  },

  /**
   * 隐藏页面
   */
  hide() {
    console.log('隐藏转录页面');
    TranscriptionPageState.isVisible = false;
  },

  /**
   * 复制转录文本到剪贴板
   */
  async copyTranscriptionText() {
    if (!TranscriptionPageState.transcriptionText) {
      alert('No text to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(TranscriptionPageState.transcriptionText);

      // 显示成功提示
      this.showToast('Text copied to clipboard', 'success');

    } catch (error) {
      console.error('复制失败:', error);

      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea');
      textArea.value = TranscriptionPageState.transcriptionText;
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        this.showToast('Text copied to clipboard', 'success');
      } catch (fallbackError) {
        this.showToast('Copy failed, please select text manually', 'error');
      }

      document.body.removeChild(textArea);
    }
  },

  /**
   * 下载转录文本为文件
   */
  downloadTranscriptionText() {
    if (!TranscriptionPageState.transcriptionText) {
      alert('No text to download');
      return;
    }

    try {
      // 创建文件内容
      const content = TranscriptionPageState.transcriptionText;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // 生成文件名（包含时间戳）
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `meeting-transcription-${timestamp}.txt`;

      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 清理URL对象
      URL.revokeObjectURL(url);

      this.showToast('File download started', 'success');

    } catch (error) {
      console.error('下载失败:', error);
      this.showToast('Download failed, please try again', 'error');
    }
  },

  /**
   * 切换文本朗读功能
   */
  toggleTextToSpeech() {
    if (!TranscriptionPageState.transcriptionText) {
      alert('No text to read');
      return;
    }

    // 检查浏览器支持
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support text-to-speech');
      return;
    }

    const synth = window.speechSynthesis;

    // 如果正在朗读，则停止
    if (synth.speaking) {
      synth.cancel();
      this.showToast('Speech stopped', 'info');
      this.updateSpeechButton(false);
      return;
    }

    try {
      // 创建语音合成实例
      const utterance = new SpeechSynthesisUtterance(TranscriptionPageState.transcriptionText);

      // 设置语音参数
      utterance.rate = 0.9; // 语速
      utterance.pitch = 1; // 音调
      utterance.volume = 0.8; // 音量

      // 尝试设置中文语音（如果可用）
      const voices = synth.getVoices();
      const chineseVoice = voices.find(voice =>
        voice.lang.includes('zh') || voice.lang.includes('cmn')
      );
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }

      // 设置事件监听器
      utterance.onstart = () => {
        this.showToast('Speech started', 'info');
        this.updateSpeechButton(true);
      };

      utterance.onend = () => {
        this.showToast('Speech completed', 'success');
        this.updateSpeechButton(false);
      };

      utterance.onerror = (event) => {
        console.error('朗读出错:', event.error);
        this.showToast('Speech failed, please try again', 'error');
        this.updateSpeechButton(false);
      };

      // 开始朗读
      synth.speak(utterance);

    } catch (error) {
      console.error('朗读功能出错:', error);
      this.showToast('Speech function error, please try again', 'error');
    }
  },

  /**
   * 更新朗读按钮状态
   * @param {boolean} isPlaying - 是否正在播放
   */
  updateSpeechButton(isPlaying) {
    const speechButton = document.querySelector('#page-3 .transcription-controls svg:nth-child(3)');
    if (speechButton) {
      speechButton.style.color = isPlaying ? '#007bff' : 'black';
    }
  },

  /**
   * 显示提示消息
   * @param {string} message - 提示消息
   * @param {string} type - 消息类型 ('success', 'error', 'info')
   */
  showToast(message, type = 'info') {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `;

    // 设置颜色主题
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#17a2b8'
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    // 添加到页面
    document.body.appendChild(toast);

    // 显示动画
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);

    // 自动移除
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  },

  /**
   * 销毁页面
   */
  destroy() {
    console.log('销毁转录页面');

    // 停止API轮询
    TranscriptionAPI.stopPolling();

    // 停止语音合成
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // 重置状态
    this.resetState();
    TranscriptionPageState.isInitialized = false;
    TranscriptionPageState.isVisible = false;
  }
};

// 页面模块对象
const TranscriptionPage = {
  init: TranscriptionPageController.init.bind(TranscriptionPageController),
  show: TranscriptionPageController.show.bind(TranscriptionPageController),
  hide: TranscriptionPageController.hide.bind(TranscriptionPageController),
  destroy: TranscriptionPageController.destroy.bind(TranscriptionPageController),
  resetState: TranscriptionPageController.resetState.bind(TranscriptionPageController),
  startTranscription: TranscriptionPageController.startTranscription.bind(TranscriptionPageController),
  state: TranscriptionPageState
};

// 自动初始化并注册页面模块
document.addEventListener('DOMContentLoaded', () => {
  // 初始化页面
  TranscriptionPage.init();

  // 注册到全局应用
  if (window.MeetingSummarizer) {
    window.MeetingSummarizer.registerPageModule(3, TranscriptionPage);
  } else {
    setTimeout(() => {
      if (window.MeetingSummarizer) {
        window.MeetingSummarizer.registerPageModule(3, TranscriptionPage);
      }
    }, 100);
  }
});

// 导出页面模块
window.TranscriptionPage = TranscriptionPage;
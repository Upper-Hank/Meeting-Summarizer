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

// 转录模拟器
const TranscriptionSimulator = {
  // 模拟转录文本数据
  mockTranscriptionText: `Welcome to today's quarterly business review meeting. I'm Sarah Chen, the VP of Sales, and I'll be presenting our Q3 performance metrics.

First, let's look at our revenue numbers. We achieved $2.4 million in total revenue this quarter, which represents a 15% increase compared to Q2. Our enterprise segment performed particularly well, contributing 60% of total revenue.

Our customer acquisition metrics show promising trends. We onboarded 47 new enterprise clients and 312 SMB customers. The average deal size increased by 8% to $51,000 for enterprise accounts.

Looking at our product performance, our flagship SaaS platform saw a 22% increase in monthly active users. Customer satisfaction scores remained high at 4.6 out of 5, with particularly strong feedback on our new analytics dashboard.

For Q4, we're targeting $2.8 million in revenue with a focus on expanding our presence in the healthcare and fintech verticals. We'll be launching two new product features and hiring 5 additional sales representatives.

Thank you for your attention. I'll now open the floor for questions.`,

  // 模拟转录API调用
// @param {Function} onProgress - 进度回调函数
// @param {Function} onComplete - 完成回调函数
// @param {Function} onError - 错误回调函数
  async simulateTranscription(onProgress, onComplete, onError) {
    console.log('开始模拟转录...');
    
    try {
      // 模拟加载过程
      const steps = [
        { progress: 10, message: 'Initializing transcription...' },
        { progress: 25, message: 'Processing audio file...' },
        { progress: 45, message: 'Analyzing speech patterns...' },
        { progress: 65, message: 'Converting speech to text...' },
        { progress: 85, message: 'Optimizing transcription...' },
        { progress: 100, message: 'Transcription completed!' }
      ];
      
      for (const step of steps) {
        await this.delay(800 + Math.random() * 400); // 随机延迟800-1200ms
        onProgress(step.progress, step.message);
      }
      
      // 完成转录
      await this.delay(500);
      onComplete(this.mockTranscriptionText);
      
    } catch (error) {
      console.error('转录模拟出错:', error);
      onError('转录过程中发生错误，请重试。');
    }
  },

  // 延迟函数
// @param {number} ms - 延迟毫秒数
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
    if (!textContainer || typeof gsap === 'undefined') return;
    
    textContainer.style.display = 'block';
    
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
    if (!textElement || typeof gsap === 'undefined') {
      textElement.textContent = text;
      if (onComplete) onComplete();
      return;
    }
    
    textElement.textContent = '';
    
    // 使用GSAP的文本动画
    gsap.to(textElement, {
      duration: Math.min(text.length * 0.02, 3), // 最多3秒
      ease: "none",
      onUpdate: function() {
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

  /**
   * 成功状态动画
   * @param {HTMLElement} element - 目标元素
   */
  successState(element) {
    if (!element || typeof gsap === 'undefined') return;
    
    gsap.fromTo(element,
      { scale: 1 },
      {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      }
    );
  }
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
    
    // 开始模拟转录
    TranscriptionSimulator.simulateTranscription(
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
    const textContainer = document.getElementById('transcription-text-container');
    const transcriptionTextElement = document.getElementById('transcription-text');
    
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
        TranscriptionPageAnimations.typewriterEffect(
          transcriptionTextElement,
          transcriptionText,
          () => {
            // 文本显示完成后的回调
            TranscriptionPageAnimations.successState(textContainer);
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
    
    // 更新Next按钮样式
    const nextButton = document.querySelector('#page-3 .button:nth-child(2)');
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
   * 销毁页面
   */
  destroy() {
    console.log('销毁转录页面');
    
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
// 第4页：总结页面模块
// 包含总结生成过程的所有逻辑、动画、模拟器和交互

// 页面状态管理
const SummaryPageState = {
  isInitialized: false,
  isVisible: false,

  // 总结状态
  summaryStatus: 'idle', // 'idle' | 'loading' | 'completed' | 'error'
  summaryText: '',
  isRendered: false,

  // 按钮状态
  canClickFinish: false
};

// 总结模拟器
const SummarySimulator = {
  // 模拟总结文本数据
  mockSummaryText: `# Meeting Summary - Q3 Business Review

## 📊 Key Metrics & Performance

**Revenue Achievement:**
- Total Q3 Revenue: $2.4M (↑15% vs Q2)
- Enterprise Segment: 60% of total revenue
- Average Deal Size: $51,000 (↑8%)

**Customer Growth:**
- New Enterprise Clients: 47
- New SMB Customers: 312
- Monthly Active Users: ↑22%
- Customer Satisfaction: 4.6/5

## 🎯 Product Highlights

- **SaaS Platform Performance:** 22% increase in monthly active users
- **Customer Feedback:** Strong positive response to new analytics dashboard
- **Satisfaction Scores:** Maintained high rating of 4.6 out of 5

## 🚀 Q4 Objectives

**Revenue Target:** $2.8M

**Strategic Focus Areas:**
- Healthcare vertical expansion
- Fintech market penetration
- Product development: 2 new features
- Team expansion: 5 additional sales representatives

## 👥 Meeting Participants

**Presenter:** Sarah Chen, VP of Sales

## 📝 Action Items

1. **Sales Team Expansion**
   - Hire 5 additional sales representatives
   - Focus on healthcare and fintech verticals

2. **Product Development**
   - Launch 2 new product features in Q4
   - Continue improving analytics dashboard based on user feedback

3. **Market Expansion**
   - Develop go-to-market strategy for healthcare sector
   - Create fintech-specific product positioning

---

*Meeting Duration: Approximately 15 minutes*
*Generated on: ${new Date().toLocaleDateString()}*`,

  // 生成总结API调用
  // @param {Function} onProgress - 进度回调函数
  // @param {Function} onComplete - 完成回调函数
  // @param {Function} onError - 错误回调函数
  async simulateSummary(onProgress, onComplete, onError) {
    console.log('开始生成总结...');

    try {
      // 显示初始进度
      onProgress(15, '分析转录内容...');

      // 调用后端API生成总结
      const response = await fetch('http://localhost:9000/api/generate_summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '生成总结失败');
      }

      // 显示进度
      onProgress(70, '格式化总结...');

      // 获取总结文本
      const summaryResponse = await fetch('http://localhost:9000/api/summary/text');
      const summaryResult = await summaryResponse.json();

      if (!summaryResult.success) {
        throw new Error(summaryResult.error || '获取总结文本失败');
      }

      // 完成
      onProgress(100, '总结完成!');
      onComplete(summaryResult.data.summary || this.mockSummaryText);

    } catch (error) {
      console.error('总结生成出错:', error);
      onError('总结生成过程中发生错误，请重试。');
    }
  },

  // 延迟函数
  // @param {number} ms - 延迟毫秒数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// 页面动画效果
const SummaryPageAnimations = {
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
        duration: 1.2,
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

    if (typeof gsap === 'undefined') {
      // 如果没有gsap，直接设置样式
      textContainer.style.opacity = '1';
      return;
    }

    gsap.fromTo(textContainer,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      }
    );
  },



  /**
   * 进度条动画
   * @param {HTMLElement} progressBar - 进度条元素
   * @param {number} progress - 进度百分比 (0-100)
   */
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
const SummaryPageController = {
  boundToggleClickHandler: null, // 用于存储绑定了this的toggleTextToSpeech处理函数
  boundCopyClickHandler: null, // 用于存储绑定了this的复制处理函数
  boundDownloadClickHandler: null, // 用于存储绑定了this的下载处理函数
  /**
   * 初始化页面
   */
  init() {
    if (SummaryPageState.isInitialized) {
      console.log('总结页面已经初始化');
      // 如果页面已经初始化但不可见，可能需要重新触发总结（如果逻辑允许）
      // 但通常init只执行一次
      return;
    }

    console.log('初始化总结页面...');

    // 绑定事件
    this.bindEvents();

    // 初始化按钮状态
    this.updateButtonStates();

    // 标记为已初始化
    SummaryPageState.isInitialized = true;

    // 首次进入页面时自动开始总结流程
    // 注意：这里假设init在页面变为活动页面时被调用，或者有其他机制触发startSummary
    // 如果init只在应用加载时调用一次，那么startSummary需要在一个更合适的时机被调用，
    // 例如，当用户导航到此页面时。
    // 为确保演示效果，我们暂时在这里调用，但实际应用中可能需要调整。
    // this.startSummary(); // 暂时注释掉，因为startSummary应该在页面显示时调用

    console.log('总结页面初始化完成');
  },

  /**
   * 当页面显示时调用
   */
  onPageShow() {
    console.log('总结页面显示');
    SummaryPageState.isVisible = true;
    // 确保每次显示页面时，如果总结尚未开始或失败，则尝试开始总结
    if (SummaryPageState.summaryStatus === 'idle' || SummaryPageState.summaryStatus === 'error') {
      this.startSummary();
    }
    this.updateButtonStates(); // 确保按钮状态在页面显示时更新
  },

  /**
   * 当页面隐藏时调用
   */
  onPageHide() {
    console.log('总结页面隐藏');
    SummaryPageState.isVisible = false;
    // 如果有正在进行的朗读，在这里停止
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      this.updateSpeechButton(false); // 更新朗读按钮状态
    }
  },

  /**
   * 绑定页面事件
   */
  bindEvents() {
    // 绑定导航按钮
    this.bindNavigationButtons();

    // 绑定功能按钮
    this.bindFunctionButtons();

    console.log('总结页面事件绑定完成');
  },

  /**
   * 绑定功能按钮事件
   */
  bindFunctionButtons() {
    const copyButton = document.querySelector('#page-4 .function-buttons .copy-button');
    const downloadButton = document.querySelector('#page-4 .function-buttons .download-button');
    const readButton = document.querySelector('#page-4 .function-buttons .read-button');

    if (copyButton) {
      if (!this.boundCopyClickHandler) {
        this.boundCopyClickHandler = () => {
          if (SummaryPageState.summaryStatus === 'completed' && SummaryPageState.summaryText) {
            window.MeetingSummarizerUtils.DocumentTools.copyText(
              SummaryPageState.summaryText,
              (message) => window.MeetingSummarizerUtils.DocumentTools.showToast(message, 'success'),
              (message) => window.MeetingSummarizerUtils.DocumentTools.showToast(message, 'error')
            );
          } else if (SummaryPageState.summaryStatus === 'loading') {
            window.MeetingSummarizerUtils.DocumentTools.showToast('Summary generation in progress, please wait...', 'info');
          } else {
            window.MeetingSummarizerUtils.DocumentTools.showToast('No text to copy', 'error');
          }
        };
      }
      copyButton.removeEventListener('click', this.boundCopyClickHandler);
      copyButton.addEventListener('click', this.boundCopyClickHandler);
      // 添加鼠标悬停效果
      copyButton.style.cursor = 'pointer';
    }

    if (downloadButton) {
      if (!this.boundDownloadClickHandler) {
        this.boundDownloadClickHandler = () => {
          if (SummaryPageState.summaryStatus === 'completed' && SummaryPageState.summaryText) {
            window.MeetingSummarizerUtils.DocumentTools.downloadText(
              SummaryPageState.summaryText,
              'meeting-summary.txt',
              (message) => window.MeetingSummarizerUtils.DocumentTools.showToast(message, 'success'),
              (message) => window.MeetingSummarizerUtils.DocumentTools.showToast(message, 'error')
            );
          } else if (SummaryPageState.summaryStatus === 'loading') {
            window.MeetingSummarizerUtils.DocumentTools.showToast('Summary generation in progress, please wait...', 'info');
          } else {
            window.MeetingSummarizerUtils.DocumentTools.showToast('No text to download', 'error');
          }
        };
      }
      downloadButton.removeEventListener('click', this.boundDownloadClickHandler);
      downloadButton.addEventListener('click', this.boundDownloadClickHandler);
      // 添加鼠标悬停效果
      downloadButton.style.cursor = 'pointer';
    }

    if (readButton) {
      // 确保 this.boundToggleClickHandler 总是引用同一个绑定了 this 的函数
      if (!this.boundToggleClickHandler) {
        this.boundToggleClickHandler = this.toggleTextToSpeech.bind(this);
      }

      // 移除旧的事件监听器，使用之前存储的稳定引用
      readButton.removeEventListener('click', this.boundToggleClickHandler);

      // 添加新的事件监听器，使用稳定引用
      readButton.addEventListener('click', this.boundToggleClickHandler);

      // 添加鼠标悬停效果
      readButton.style.cursor = 'pointer';
    }
  },

  /**
   * 绑定导航按钮事件
   */
  bindNavigationButtons() {
    const page4Buttons = document.querySelectorAll('#page-4 .button');

    if (page4Buttons.length >= 2) {
      // Back按钮
      page4Buttons[0].addEventListener('click', () => {
        if (window.MeetingSummarizer) {
          window.MeetingSummarizer.showPage(3);
        }
      });

      // Finish按钮
      page4Buttons[1].addEventListener('click', () => {
        if (SummaryPageState.canClickFinish) {
          this.handleFinish();
        }
      });
    }
  },

  /**
   * 开始总结生成过程
   */
  startSummary() {
    if (SummaryPageState.summaryStatus === 'loading') {
      console.log('总结生成已在进行中');
      return;
    }

    console.log('开始总结生成过程...');

    // 更新状态
    SummaryPageState.summaryStatus = 'loading';
    SummaryPageState.canClickFinish = false;

    // 获取UI元素
    const loadingContainer = document.getElementById('summary-loading');
    const textContainer = document.getElementById('summary-text-container');
    const progressBar = document.querySelector('#summary-loading .progress-fill');
    const loadingText = document.querySelector('#summary-loading .loading-text');

    // 隐藏文本容器，显示加载容器
    if (textContainer) textContainer.style.display = 'none';
    if (loadingContainer) {
      SummaryPageAnimations.startLoading(loadingContainer);
    }

    // 更新按钮状态
    this.updateButtonStates();

    // 开始模拟总结生成
    SummarySimulator.simulateSummary(
      // 进度回调
      (progress, message) => {
        if (progressBar) {
          SummaryPageAnimations.updateProgress(progressBar, progress);
        }
        if (loadingText) {
          loadingText.textContent = message;
        }
      },
      // 完成回调
      (summaryText) => {
        this.onSummaryComplete(summaryText);
      },
      // 错误回调
      (errorMessage) => {
        this.onSummaryError(errorMessage);
      }
    );
  },

  /**
   * 总结完成处理
   * @param {string} summaryText - 总结文本
   */
  onSummaryComplete(summaryText) {
    console.log('总结生成完成. 文本:', summaryText);

    // 更新状态
    SummaryPageState.summaryStatus = 'completed';
    SummaryPageState.summaryText = summaryText;
    SummaryPageState.canClickFinish = true;
    SummaryPageState.isRendered = true;
    console.log('SummaryPageState 更新 (完成):', JSON.parse(JSON.stringify(SummaryPageState)));

    // 获取UI元素
    const loadingContainer = document.getElementById('summary-loading');
    const summaryContent = document.querySelector('#page-4 .summary-content');
    const summaryTextElement = document.getElementById('summary-text');

    // 停止加载动画
    if (loadingContainer) {
      SummaryPageAnimations.stopLoading(loadingContainer);
    }

    // 延迟显示文本容器
    setTimeout(() => {
      // 确保文本元素可见
      if (summaryTextElement) {
        summaryTextElement.style.display = 'block';
        summaryTextElement.style.opacity = '1';

        // 使用统一的文本动画函数
        window.MeetingSummarizerUtils.DocumentTools.animateTextReveal(
          summaryTextElement,
          summaryText,
          () => {
            console.log('总结文本显示完成');
          }
        );
      }

      // 更新按钮状态
      this.updateButtonStates();
      console.log('按钮状态已在 onSummaryComplete 中更新');
    }, 500);
  },

  /**
   * 总结错误处理
   * @param {string} errorMessage - 错误信息
   */
  onSummaryError(errorMessage) {
    console.error('总结生成失败:', errorMessage);

    // 更新状态
    SummaryPageState.summaryStatus = 'error';
    SummaryPageState.summaryText = ''; // 错误时清空文本
    SummaryPageState.canClickFinish = false;
    console.log('SummaryPageState 更新 (错误):', JSON.parse(JSON.stringify(SummaryPageState)));

    // 获取UI元素
    const loadingContainer = document.getElementById('summary-loading');
    const textContainer = document.getElementById('summary-text-container');
    const summaryTextElement = document.getElementById('summary-text');

    // 停止加载动画
    if (loadingContainer) {
      SummaryPageAnimations.stopLoading(loadingContainer);
    }

    // 显示错误信息
    setTimeout(() => {
      if (textContainer) {
        SummaryPageAnimations.showTextContainer(textContainer);
      }

      if (summaryTextElement) {
        summaryTextElement.innerHTML = `<p style="color: #e74c3c;">Error: ${errorMessage}</p>`;
      }
      this.updateButtonStates(); // 确保错误时也更新按钮状态
      console.log('按钮状态已在 onSummaryError 中更新');

      // 更新按钮状态
      this.updateButtonStates();
    }, 500);

    // 显示错误提示
    alert(errorMessage);
  },

  /**
   * 加载现有总结内容
   */
  loadExistingContent() {
    if (!SummaryPageState.isRendered || !SummaryPageState.summaryText) {
      console.log('没有现有总结内容，开始新的总结生成');
      this.startSummary();
      return;
    }

    console.log('加载现有总结内容');

    // 获取UI元素
    const loadingContainer = document.getElementById('summary-loading');
    const textContainer = document.getElementById('summary-text-container');
    const summaryTextElement = document.getElementById('summary-text');

    // 隐藏加载容器
    if (loadingContainer) loadingContainer.style.display = 'none';

    // 显示现有内容
    if (textContainer) {
      textContainer.style.display = 'block';
    }

    if (summaryTextElement) {
      summaryTextElement.textContent = SummaryPageState.summaryText;
    }

    // 更新按钮状态
    this.updateButtonStates();
  },

  /**
   * 处理完成按钮点击
   */
  handleFinish() {
    console.log('会议总结完成！');

    // 显示确认对话框
    if (confirm('Are you sure you want to complete the meeting summary and return to the home page? All data will be cleared.')) {
      // 重置应用并返回首页
      this.resetApplication();
      window.MeetingSummarizerUtils.DocumentTools.showToast('Application reset and returned to home page', 'success');
    }
  },

  /**
   * 重置整个应用
   */
  resetApplication() {
    console.log('重置整个应用');

    // 重置所有页面状态
    if (window.WelcomePage) window.WelcomePage.resetState();
    if (window.UploadPage) window.UploadPage.resetState();
    if (window.TranscriptionPage) window.TranscriptionPage.resetState();
    this.resetState(); // 重置当前页面状态

    // 返回第一页
    if (window.MeetingSummarizer) {
      window.MeetingSummarizer.showPage(1);
    }
  },

  /**
   * 切换文本朗读功能
   */
  toggleTextToSpeech() {
    // 首先检查总结状态和文本
    if (SummaryPageState.summaryStatus === 'loading') {
      window.MeetingSummarizerUtils.DocumentTools.showToast('Summary generation in progress, please wait...', 'info');
      return;
    }
    if (SummaryPageState.summaryStatus !== 'completed' || !SummaryPageState.summaryText) {
      window.MeetingSummarizerUtils.DocumentTools.showToast('No text to read', 'error');
      return;
    }

    // 原有的朗读逻辑
    const synth = window.speechSynthesis;

    // 防止多次回调导致重复toast
    if (!this._speechStopped) this._speechStopped = false;
    if (synth.speaking) {
      if (!this._speechStopped) {
        this._speechStopped = true;
        window.MeetingSummarizerUtils.DocumentTools.stopSpeaking(
          (message) => {
            window.MeetingSummarizerUtils.DocumentTools.showToast(message, 'info');
            this.updateSpeechButton(false);
            setTimeout(() => { this._speechStopped = false; }, 500);
          }
        );
      }
      return;
    }

    // 使用DocumentTools朗读文本
    this._speechStopped = false;
    const isPlaying = window.MeetingSummarizerUtils.DocumentTools.speakText(
      SummaryPageState.summaryText,
      (message) => {
        window.MeetingSummarizerUtils.DocumentTools.showToast(message, 'info');
        this.updateSpeechButton(true);
      },
      (message) => {
        if (!this._speechStopped) {
          this._speechStopped = true;
          window.MeetingSummarizerUtils.DocumentTools.showToast(message, 'success');
          this.updateSpeechButton(false);
          setTimeout(() => { this._speechStopped = false; }, 500);
        }
      },
      (message) => {
        if (!this._speechStopped) {
          this._speechStopped = true;
          // 统一朗读停止时的提示内容和类型为 'Speech stopped'，类型为 'info'
          if (message === 'Speech failed, please try again') {
            window.MeetingSummarizerUtils.DocumentTools.showToast('Speech stopped', 'info');
          } else {
            window.MeetingSummarizerUtils.DocumentTools.showToast(message, 'info');
          }
          this.updateSpeechButton(false);
          setTimeout(() => { this._speechStopped = false; }, 500);
        }
      }
    );

    if (!isPlaying) {
      this.updateSpeechButton(false);
    }
  },

  /**
   * 更新朗读按钮状态
   * @param {boolean} isPlaying - 是否正在播放
   */
  updateSpeechButton(isPlaying) {
    const speechButton = document.querySelector('#page-4 .function-buttons .read-button');
    if (speechButton) {
      speechButton.style.color = isPlaying ? '#007bff' : 'black';
    }
  },

  /**
   * 更新按钮状态
   */
  updateButtonStates() {
    const canFinish = SummaryPageState.summaryStatus === 'completed';
    const isLoading = SummaryPageState.summaryStatus === 'loading';

    // 更新Finish按钮样式
    const finishButton = document.querySelector('#page-4 .button:nth-child(2)');
    if (finishButton) {
      if (canFinish) {
        finishButton.classList.remove('button-disabled');
      } else {
        finishButton.classList.add('button-disabled');
      }
    }

    // 更新功能按钮状态
    const summaryControls = document.querySelector('#page-4 .summary-controls');
    if (summaryControls) {
      const controlButtons = summaryControls.querySelectorAll('svg');

      controlButtons.forEach(button => {
        if (isLoading) {
          // 加载中禁用按钮
          button.style.opacity = '0.5';
          button.style.cursor = 'not-allowed';
          button.style.pointerEvents = 'none';
        } else {
          // 加载完成启用按钮
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
    console.log('重置总结页面状态');

    // 重置状态
    SummaryPageState.summaryStatus = 'idle';
    SummaryPageState.summaryText = '';
    SummaryPageState.isRendered = false;
    SummaryPageState.canClickFinish = false;

    // 重置UI
    const loadingContainer = document.getElementById('summary-loading');
    const textContainer = document.getElementById('summary-text-container');
    const summaryTextElement = document.getElementById('summary-text');
    const progressBar = document.querySelector('#summary-loading .progress-fill');
    const loadingText = document.querySelector('#summary-loading .loading-text');

    if (loadingContainer) {
      loadingContainer.style.display = 'none';
      SummaryPageAnimations.stopLoading(loadingContainer);
    }

    if (textContainer) textContainer.style.display = 'none';

    if (summaryTextElement) summaryTextElement.innerHTML = '';

    if (progressBar) progressBar.style.width = '0%';

    if (loadingText) loadingText.textContent = 'Analyzing transcription content...';

    // 更新按钮状态
    this.updateButtonStates();
  },

  /**
   * 显示页面
   */
  show() {
    console.log('显示总结页面');

    const pageElement = document.getElementById('page-4');
    if (pageElement) {
      SummaryPageAnimations.pageEntry(pageElement);
      SummaryPageState.isVisible = true;

      // 根据是否已渲染决定加载内容还是开始总结生成
      if (SummaryPageState.isRendered) {
        this.loadExistingContent();
      } else {
        this.startSummary();
      }
    }
  },

  /**
   * 隐藏页面
   */
  hide() {
    console.log('隐藏总结页面');
    SummaryPageState.isVisible = false;
  },

  /**
   * 销毁页面
   */
  destroy() {
    console.log('销毁总结页面');

    // 重置状态
    this.resetState();
    SummaryPageState.isInitialized = false;
    SummaryPageState.isVisible = false;
  }
};

// 页面模块对象
const SummaryPage = {
  init: SummaryPageController.init.bind(SummaryPageController),
  show: function () {
    SummaryPageController.show.call(SummaryPageController);
    SummaryPageController.onPageShow.call(SummaryPageController);
  },
  hide: function () {
    SummaryPageController.hide.call(SummaryPageController);
    SummaryPageController.onPageHide.call(SummaryPageController);
  },
  destroy: SummaryPageController.destroy.bind(SummaryPageController),
  resetState: SummaryPageController.resetState.bind(SummaryPageController),
  startSummary: SummaryPageController.startSummary.bind(SummaryPageController),
  state: SummaryPageState
};

// 自动初始化并注册页面模块
document.addEventListener('DOMContentLoaded', () => {
  // 初始化页面
  SummaryPage.init();

  // 注册到全局应用
  if (window.MeetingSummarizer) {
    window.MeetingSummarizer.registerPageModule(4, SummaryPage);
  } else {
    setTimeout(() => {
      if (window.MeetingSummarizer) {
        window.MeetingSummarizer.registerPageModule(4, SummaryPage);
      }
    }, 100);
  }
});

// 自动初始化并注册页面模块
document.addEventListener('DOMContentLoaded', () => {
  // 初始化页面
  SummaryPage.init();

  // 注册到全局应用
  if (window.MeetingSummarizer) {
    window.MeetingSummarizer.registerPageModule(4, SummaryPage);
  } else {
    setTimeout(() => {
      if (window.MeetingSummarizer) {
        window.MeetingSummarizer.registerPageModule(4, SummaryPage);
      }
    }, 100);
  }
});

// 导出页面模块
window.SummaryPage = SummaryPage;
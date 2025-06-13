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

  // 模拟总结API调用
// @param {Function} onProgress - 进度回调函数
// @param {Function} onComplete - 完成回调函数
// @param {Function} onError - 错误回调函数
  async simulateSummary(onProgress, onComplete, onError) {
    console.log('开始模拟总结生成...');
    
    try {
      // 模拟加载过程
      const steps = [
        { progress: 15, message: 'Analyzing transcription content...' },
        { progress: 30, message: 'Identifying key topics...' },
        { progress: 50, message: 'Extracting important metrics...' },
        { progress: 70, message: 'Generating summary structure...' },
        { progress: 90, message: 'Formatting final summary...' },
        { progress: 100, message: 'Summary completed!' }
      ];
      
      for (const step of steps) {
        await this.delay(900 + Math.random() * 600); // 随机延迟900-1500ms
        onProgress(step.progress, step.message);
      }
      
      // 完成总结
      await this.delay(500);
      onComplete(this.mockSummaryText);
      
    } catch (error) {
      console.error('总结模拟出错:', error);
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

  /**
   * 渐进式文本显示动画
   * @param {HTMLElement} textElement - 文本元素
   * @param {string} text - 要显示的文本
   * @param {Function} onComplete - 完成回调
   */
  progressiveTextReveal(textElement, text, onComplete) {
    if (!textElement) return;
    
    // 将Markdown文本转换为HTML
    const formattedText = this.formatSummaryText(text);
    textElement.innerHTML = formattedText;
    
    if (typeof gsap === 'undefined') {
      // 如果没有gsap，直接显示所有元素
      const elements = textElement.querySelectorAll('h1, h2, h3, p, li, strong, em');
      elements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
      
      if (onComplete) setTimeout(onComplete, 500);
      return;
    }
    
    // 获取所有文本节点和元素
    const elements = textElement.querySelectorAll('h1, h2, h3, p, li, strong, em');
    
    // 初始隐藏所有元素
    gsap.set(elements, { opacity: 0, y: 20 });
    
    // 逐个显示元素
    gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: "power2.out",
      onComplete: onComplete
    });
  },

  /**
   * 格式化总结文本（简单的Markdown到HTML转换）
   * @param {string} text - Markdown文本
   * @returns {string} HTML文本
   */
  formatSummaryText(text) {
    return text
      // 标题转换
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // 粗体转换
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 斜体转换
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 列表转换
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      // 段落转换
      .replace(/\n\n/g, '</p><p>')
      // 换行转换
      .replace(/\n/g, '<br>')
      // 包装段落
      .replace(/^(?!<[h|l])/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>')
      // 清理多余的段落标签
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>)/g, '$1')
      .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<li>)/g, '<ul>$1')
      .replace(/(<\/li>)<\/p>/g, '$1</ul>');
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

  /**
   * 完成庆祝动画
   * @param {HTMLElement} element - 目标元素
   */
  celebrationAnimation(element) {
    if (!element || typeof gsap === 'undefined') return;
    
    // 创建彩带效果
    const confetti = [];
    for (let i = 0; i < 20; i++) {
      const piece = document.createElement('div');
      piece.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: hsl(${Math.random() * 360}, 70%, 60%);
        pointer-events: none;
        z-index: 1000;
      `;
      element.appendChild(piece);
      confetti.push(piece);
    }
    
    // 动画彩带
    confetti.forEach((piece, index) => {
      gsap.set(piece, {
        x: Math.random() * element.offsetWidth,
        y: -20
      });
      
      gsap.to(piece, {
        y: element.offsetHeight + 20,
        x: `+=${(Math.random() - 0.5) * 200}`,
        rotation: Math.random() * 360,
        duration: 2 + Math.random(),
        ease: "power2.out",
        delay: index * 0.1,
        onComplete: () => {
          piece.remove();
        }
      });
    });
  }
};

// 页面控制器
const SummaryPageController = {
  /**
   * 初始化页面
   */
  init() {
    if (SummaryPageState.isInitialized) {
      console.log('总结页面已经初始化');
      return;
    }

    console.log('初始化总结页面...');
    
    // 绑定事件
    this.bindEvents();
    
    // 初始化按钮状态
    this.updateButtonStates();
    
    // 标记为已初始化
    SummaryPageState.isInitialized = true;
    
    console.log('总结页面初始化完成');
  },

  /**
   * 绑定页面事件
   */
  bindEvents() {
    // 绑定导航按钮
    this.bindNavigationButtons();
    
    console.log('总结页面事件绑定完成');
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
    console.log('总结生成完成');
    
    // 更新状态
    SummaryPageState.summaryStatus = 'completed';
    SummaryPageState.summaryText = summaryText;
    SummaryPageState.canClickFinish = true;
    SummaryPageState.isRendered = true;
    
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
        
        // 渐进式显示总结文本
        SummaryPageAnimations.progressiveTextReveal(
          summaryTextElement,
          summaryText,
          () => {
            // 文本显示完成，成功状态通过CSS类实现
            if (summaryContent) {
              SummaryPageAnimations.celebrationAnimation(summaryContent);
            }
          }
        );
      }
      
      // 更新按钮状态
      this.updateButtonStates();
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
    SummaryPageState.canClickFinish = false;
    
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
        summaryTextElement.innerHTML = `<p style="color: #e74c3c;">${errorMessage}</p>`;
      }
      
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
      summaryTextElement.innerHTML = SummaryPageAnimations.formatSummaryText(SummaryPageState.summaryText);
    }
    
    // 更新按钮状态
    this.updateButtonStates();
  },

  /**
   * 处理完成按钮点击
   */
  handleFinish() {
    console.log('会议总结完成！');
    
    // 显示完成提示
    const message = '🎉 会议总结已完成！\n\n您可以：\n• 复制总结内容\n• 保存为文件\n• 分享给团队成员\n\n感谢使用 Meeting Summarizer！';
    alert(message);
    
    // 可以在这里添加更多完成后的操作
    // 例如：重置应用状态、显示分享选项等
    
    // 重置到第一页（可选）
    setTimeout(() => {
      if (confirm('是否要开始新的会议总结？')) {
        this.resetApplication();
      }
    }, 1000);
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
    if (window.SummaryPage) window.SummaryPage.resetState();
    
    // 返回第一页
    if (window.MeetingSummarizer) {
      window.MeetingSummarizer.showPage(1);
    }
  },

  /**
   * 更新按钮状态
   */
  updateButtonStates() {
    const canFinish = SummaryPageState.summaryStatus === 'completed';
    
    // 更新Finish按钮样式
    const finishButton = document.querySelector('#page-4 .button:nth-child(2)');
    if (finishButton) {
      if (canFinish) {
        finishButton.classList.remove('button-disabled');
      } else {
        finishButton.classList.add('button-disabled');
      }
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
  show: SummaryPageController.show.bind(SummaryPageController),
  hide: SummaryPageController.hide.bind(SummaryPageController),
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

// 导出页面模块
window.SummaryPage = SummaryPage;
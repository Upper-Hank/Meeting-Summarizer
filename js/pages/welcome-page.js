/**
 * 第1页：欢迎页面模块
 * 包含欢迎页面的所有逻辑、动画和交互
 */

// 页面状态管理
const WelcomePageState = {
  isInitialized: false,
  isVisible: false
};

// 页面动画效果
const WelcomePageAnimations = {
  /**
   * 页面进入动画
   * @param {HTMLElement} pageElement - 页面元素
   */
  pageEntry(pageElement) {
    if (!pageElement || typeof gsap === 'undefined') return;

    // 使用通用的页面进入动画
    window.MeetingSummarizerUtils.AnimationHelpers.animatePageEntry(pageElement);
  },
};

// 页面控制器
const WelcomePageController = {
  /**
   * 初始化页面
   */
  init() {
    if (WelcomePageState.isInitialized) {
      console.log('欢迎页面已经初始化');
      return;
    }

    console.log('初始化欢迎页面...');

    // 绑定事件
    this.bindEvents();

    // 标记为已初始化
    WelcomePageState.isInitialized = true;

    console.log('欢迎页面初始化完成');
  },

  /**
   * 绑定页面事件
   */
  bindEvents() {
    const startButton = document.querySelector('#page-1 .button');

    if (startButton) {
      // 点击事件
      startButton.addEventListener('click', this.handleStartClick.bind(this));
      console.log('欢迎页面事件绑定完成');
    } else {
      console.warn('未找到开始按钮');
    }
  },

  /**
   * 处理开始按钮点击
   */
  handleStartClick() {
    console.log('点击开始按钮');

    const startButton = document.querySelector('#page-1 .button');

    // 跳转到第二页（上传页面）
    if (window.MeetingSummarizer && window.MeetingSummarizer.showPage) {
      window.MeetingSummarizer.showPage(2);
    } else {
      console.error('MeetingSummarizer 应用未找到或 showPage 方法不可用');
    }
  },

  /**
   * 显示页面
   */
  show() {
    console.log('显示欢迎页面');

    const pageElement = document.getElementById('page-1');
    if (pageElement) {
      // 播放页面进入动画
      WelcomePageAnimations.pageEntry(pageElement);

      // 更新状态
      WelcomePageState.isVisible = true;
    }
  },

  /**
   * 隐藏页面
   */
  hide() {
    console.log('隐藏欢迎页面');

    // 更新状态
    WelcomePageState.isVisible = false;
  },

  /**
   * 销毁页面
   */
  destroy() {
    console.log('销毁欢迎页面');

    // 移除事件监听器
    const startButton = document.querySelector('#page-1 .button');
    if (startButton) {
      startButton.removeEventListener('click', this.handleStartClick);
    }

    // 重置状态
    WelcomePageState.isInitialized = false;
    WelcomePageState.isVisible = false;
  }
};

// 页面模块对象
const WelcomePage = {
  init: WelcomePageController.init.bind(WelcomePageController),
  show: WelcomePageController.show.bind(WelcomePageController),
  hide: WelcomePageController.hide.bind(WelcomePageController),
  destroy: WelcomePageController.destroy.bind(WelcomePageController),
  /**
   * 重置页面状态
   */
  resetState() {
    console.log('重置欢迎页面状态');

    // 重置状态
    WelcomePageState.isInitialized = true; // 保持初始化状态，因为页面已经加载
    WelcomePageState.isVisible = false;
  },
  state: WelcomePageState
};

// 自动初始化并注册页面模块
document.addEventListener('DOMContentLoaded', () => {
  // 初始化页面
  WelcomePage.init();

  // 注册到全局应用
  if (window.MeetingSummarizer) {
    window.MeetingSummarizer.registerPageModule(1, WelcomePage);
    // 注册后主动触发首页显示，确保动画
    if (window.MeetingSummarizer.getCurrentPage && window.MeetingSummarizer.getCurrentPage() === 1) {
      window.MeetingSummarizer.showPage(1);
    }
  } else {
    // 如果应用还未加载，延迟注册
    setTimeout(() => {
      if (window.MeetingSummarizer) {
        window.MeetingSummarizer.registerPageModule(1, WelcomePage);
        if (window.MeetingSummarizer.getCurrentPage && window.MeetingSummarizer.getCurrentPage() === 1) {
          window.MeetingSummarizer.showPage(1);
        }
      }
    }, 100);
  }
});

// 导出页面模块（供其他模块使用）
window.WelcomePage = WelcomePage;
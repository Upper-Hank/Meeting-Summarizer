// Meeting Summarizer 应用主控制器
// 负责应用初始化、页面路由和全局状态管理

// 全局应用状态
const AppState = {
  currentPage: 1,
  totalPages: 4,
  isInitialized: false
};

// 页面模块引用
let pageModules = {};

// 应用初始化
function initApp() {
  if (AppState.isInitialized) {
    console.warn('应用已经初始化');
    return;
  }

  console.log('初始化 Meeting Summarizer 应用...');

  // 显示第一页
  showPage(1);

  // 标记为已初始化
  AppState.isInitialized = true;

  console.log('应用初始化完成');
}

// 注册页面模块
// @param {number} pageNumber - 页面编号
// @param {Object} pageModule - 页面模块对象
function registerPageModule(pageNumber, pageModule) {
  pageModules[pageNumber] = pageModule;
  console.log(`页面 ${pageNumber} 模块已注册`);
}

// 显示指定页面
// @param {number} pageNumber - 页面编号 (1-4)
function showPage(pageNumber) {
  if (pageNumber < 1 || pageNumber > AppState.totalPages) {
    console.error(`无效的页面编号: ${pageNumber}`);
    return;
  }

  // 隐藏当前页面
  if (AppState.currentPage && pageModules[AppState.currentPage]) {
    pageModules[AppState.currentPage].hide();
  }

  // 隐藏所有页面元素
  const allPages = document.querySelectorAll('.page');
  allPages.forEach(page => {
    page.classList.remove('active');
  });

  // 显示目标页面
  const targetPage = document.getElementById(`page-${pageNumber}`);
  if (targetPage) {
    targetPage.classList.add('active');
    AppState.currentPage = pageNumber;

    // 调用页面模块的显示方法
    if (pageModules[pageNumber]) {
      pageModules[pageNumber].show();
    }

    console.log(`切换到页面 ${pageNumber}`);
  } else {
    console.error(`找不到页面元素: page-${pageNumber}`);
  }
}

// 获取当前页面编号
// @returns {number} 当前页面编号
function getCurrentPage() {
  return AppState.currentPage;
}

// 页面导航方法
const Navigation = {
  // 前往下一页
  next() {
    if (AppState.currentPage < AppState.totalPages) {
      showPage(AppState.currentPage + 1);
    }
  },

  // 返回上一页
  back() {
    if (AppState.currentPage > 1) {
      showPage(AppState.currentPage - 1);
    }
  },

  // 前往首页
  home() {
    showPage(1);
  }
};

// 导出全局接口
window.MeetingSummarizer = {
  init: initApp,
  showPage,
  getCurrentPage,
  registerPageModule,
  Navigation,
  AppState
};

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
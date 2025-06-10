// 页面控制逻辑模块
// 包含页面切换、按钮事件绑定等核心逻辑

// 当前页面索引
let currentPage = 1;

// 控制按钮点击状态的布尔值变量
// 控制page2的next按钮是否可点击
let canClickPage2Next = false;
// 控制page3的next按钮是否可点击
let canClickPage3Next = false;
// 控制page4的finish按钮是否可点击
let canClickPage4Finish = false;

// Page2 状态管理变量
let isFileSelected = false;
let isZoomLinkValid = false;
let selectedRecordingMode = null;
let selectedFile = null;
let isLiveRecording = false;

// Page3 状态管理变量
let isTranscriptionLoading = false;
let transcriptionText = '';
let hasTranscriptionRendered = false; // 控制是否已经渲染过转录内容

// Page4 状态管理变量
let isSummaryLoading = false;
let summaryText = '';
let hasSummaryRendered = false; // 控制是否已经渲染过总结内容

// 默认静态文本内容
const defaultTranscriptionText = `<p>So we have to make sure that you store it, you handle it, safely. That means you are responsible with any data you store. OK, so today I try to cover some topics that relate to the principle of ethical data handling. Some approach is very necessary. And some principle maybe is as a shock that to you how to handle it with the best effort to try to protect the ID of the end user. So please keep in mind after you have this lecture, you keep in mind that how the product handle with the data that relate to the human. We really want to look at that at the presentation when you're talking about the product. And we really want to hear about what is the risk, the product exposed to the human identity, and what is the solution. So there is a simple checklist here for you to do as a group to go over it, to check yourself before you introduce a product. And we really welcome to see an ethical analysis in the report. That means that the team care a lot about these rules already and the cover to have a look at, go deeper. Whatever this lecture does not cover, but the references can help you a lot. So why we care about the ethics?</p>
<p>The main purpose of that, anything we're doing, is that we have to pursue that. It's the right in the right way, and it's for good. It's not something like for the bad purpose. So in the way when we handle the data, we store the data, we try to avoid any harm to the human, to the end user. And for the good purpose, usually we expect that the product is exposed, something like the honest principle that you provide the true information, not some kind of the spread, the misleading information, and it's about the fair, and it's not introduced any kind of the discrimination action to the society. And we really respect privacy of each person. Whatever it is, maybe the start, maybe the end user, maybe the government policy, we all have to care about these items. This is the success and the item we take from the associate and for the computing machinery, code of ethics. So that is kind of the rule for you when you write any coding. So you have to keep in mind that is any risk you expose, the private information, it can cause a constant</p>`;

const defaultSummaryText = `<h3>Key Points</h3>
<ul>
<li>Ethical data handling is crucial when storing and managing user data</li>
<li>Protecting user identity and privacy should be a priority in product development</li>
<li>Products should provide honest information and avoid discrimination</li>
<li>Teams should conduct ethical analysis before introducing new products</li>
<li>Privacy of each person must be respected regardless of their role</li>
</ul>
<h3>Action Items</h3>
<ul>
<li>Create a checklist for ethical data handling practices</li>
<li>Review product for potential privacy risks</li>
<li>Implement safeguards to protect user identity</li>
<li>Document ethical considerations in the product report</li>
</ul>`;

/**
 * 验证文件格式和大小
 * @param {File} file - 选择的文件
 * @returns {boolean} - 验证是否通过
 */
function validateFile(file) {
  const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a'];
  const allowedExtensions = ['.mp3', '.mp4', '.wav', '.m4a'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  // 检查文件扩展名
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

  // 检查文件大小
  const isValidSize = file.size <= maxSize;

  return hasValidExtension && isValidSize;
}

/**
 * 验证Zoom链接格式
 * @param {string} url - 输入的链接
 * @returns {boolean} - 验证是否通过
 */
function validateZoomLink(url) {
  if (!url || url.trim() === '') return false;

  // 检查是否包含zoom.us和/j/
  const hasZoomDomain = url.includes('zoom.us');
  const hasJoinPath = url.includes('/j/');

  return hasZoomDomain && hasJoinPath;
}

/**
 * 更新Page2的Next按钮状态
 */
function updatePage2NextButton() {
  const isValid = isFileSelected || isZoomLinkValid || (recordingState === 'completed');
  canClickPage2Next = isValid;
  updateButtonStates();
}

/**
 * 开始转录处理
 */
function startTranscription() {
  isTranscriptionLoading = true;
  canClickPage3Next = false;
  updateTranscriptionUI();
  updateButtonStates();
  
  // 模拟API调用
  simulateTranscriptionAPI();
}

/**
 * 模拟转录API调用
 * 现在委托给测试模拟器处理
 */
function simulateTranscriptionAPI() {
  // 检查测试模拟器是否可用
  if (typeof window.TestSimulator !== 'undefined' && typeof window.TestSimulator.simulateTranscriptionAPI === 'function') {
    window.TestSimulator.simulateTranscriptionAPI();
  } else {
    console.warn('测试模拟器不可用，使用默认逻辑');
    // 备用逻辑
    setTimeout(() => {
      transcriptionText = defaultTranscriptionText;
      isTranscriptionLoading = false;
      canClickPage3Next = true;
      updateTranscriptionUI();
      updateButtonStates();
    }, 3000);
  }
}

/**
 * 直接加载已有的转录内容
 */
function loadExistingTranscription() {
  const loadingContainer = document.getElementById('transcription-loading');
  const textContainer = document.getElementById('transcription-text');
  
  // 直接显示已有内容，不显示加载状态
  if (loadingContainer) loadingContainer.style.display = 'none';
  if (textContainer && transcriptionText) {
    textContainer.style.display = 'block';
    textContainer.innerHTML = transcriptionText;
    textContainer.classList.add('loaded');
  }
  
  // 确保按钮状态正确
  canClickPage3Next = true;
  updateButtonStates();
}

/**
 * 更新转录页面UI
 */
function updateTranscriptionUI() {
  const loadingContainer = document.getElementById('transcription-loading');
  const textContainer = document.getElementById('transcription-text');
  
  if (isTranscriptionLoading) {
    if (loadingContainer) loadingContainer.style.display = 'flex';
    if (textContainer) {
      textContainer.style.display = 'none';
      textContainer.classList.remove('loaded');
    }
  } else {
    if (loadingContainer) loadingContainer.style.display = 'none';
    if (textContainer) {
      textContainer.style.display = 'block';
      // 直接使用HTML格式的文本
      textContainer.innerHTML = transcriptionText;
      // 添加loaded类以触发透明度动画
      textContainer.classList.add('loaded');
    }
  }
}

/**
 * 开始生成总结
 */
function startSummaryGeneration() {
  isSummaryLoading = true;
  canClickPage4Finish = false;
  updateSummaryUI();
  updateButtonStates();
  
  // 模拟API调用
  simulateSummaryAPI();
}

/**
 * 模拟总结API调用
 * 现在委托给测试模拟器处理
 */
function simulateSummaryAPI() {
  // 检查测试模拟器是否可用
  if (typeof window.TestSimulator !== 'undefined' && typeof window.TestSimulator.simulateSummaryAPI === 'function') {
    window.TestSimulator.simulateSummaryAPI();
  } else {
    console.warn('测试模拟器不可用，使用默认逻辑');
    // 备用逻辑
    setTimeout(() => {
      summaryText = defaultSummaryText;
      isSummaryLoading = false;
      canClickPage4Finish = true;
      updateSummaryUI();
      updateButtonStates();
    }, 2500);
  }
}

/**
 * 直接加载已有的总结内容
 */
function loadExistingSummary() {
  const loadingContainer = document.getElementById('summary-loading');
  const textContainer = document.getElementById('summary-text');
  
  // 直接显示已有内容，不显示加载状态
  if (loadingContainer) loadingContainer.style.display = 'none';
  if (textContainer && summaryText) {
    textContainer.style.display = 'block';
    textContainer.innerHTML = summaryText;
    textContainer.classList.add('loaded');
  }
  
  // 确保按钮状态正确
  canClickPage4Finish = true;
  updateButtonStates();
}

/**
 * 更新总结页面UI
 */
function updateSummaryUI() {
  const loadingContainer = document.getElementById('summary-loading');
  const textContainer = document.getElementById('summary-text');
  
  if (isSummaryLoading) {
    if (loadingContainer) loadingContainer.style.display = 'flex';
    if (textContainer) {
      textContainer.style.display = 'none';
      textContainer.classList.remove('loaded');
    }
  } else {
    if (loadingContainer) loadingContainer.style.display = 'none';
    if (textContainer) {
      textContainer.style.display = 'block';
      // 直接使用HTML格式的文本
      textContainer.innerHTML = summaryText;
      // 添加loaded类以触发透明度动画
      textContainer.classList.add('loaded');
    }
  }
}

/**
 * 选择录制模式
 * @param {string} mode - 录制模式 ('auto' 或 'manual')
 */
function selectRecordingMode(mode) {
  selectedRecordingMode = mode;

  // 更新按钮样式
  const autoBtn = document.getElementById('auto-record-btn');
  const manualBtn = document.getElementById('manual-record-btn');

  if (mode === 'auto') {
    autoBtn.classList.add('selected');
    autoBtn.classList.remove('disabled');
    manualBtn.classList.remove('selected');
    manualBtn.classList.add('disabled');
  } else if (mode === 'manual') {
    manualBtn.classList.add('selected');
    manualBtn.classList.remove('disabled');
    autoBtn.classList.remove('selected');
    autoBtn.classList.add('disabled');
  }

  updatePage2NextButton();
}

/**
 * 显示录制模式选择区域
 */
function showRecordingModeSelection() {
  const container = document.getElementById('recording-mode-container');
  if (container) {
    container.style.display = 'flex';
  }

  // 重置录制模式选择状态
  selectedRecordingMode = null;
  const autoBtn = document.getElementById('auto-record-btn');
  const manualBtn = document.getElementById('manual-record-btn');

  if (autoBtn && manualBtn) {
    autoBtn.classList.remove('selected', 'disabled');
    manualBtn.classList.remove('selected', 'disabled');
  }
}

/**
 * 隐藏录制模式选择区域
 */
function hideRecordingModeSelection() {
  const container = document.getElementById('recording-mode-container');
  if (container) {
    container.style.display = 'none';
  }

  // 重置录制模式选择
  selectedRecordingMode = null;
  const autoBtn = document.getElementById('auto-record-btn');
  const manualBtn = document.getElementById('manual-record-btn');

  if (autoBtn && manualBtn) {
    autoBtn.classList.remove('selected', 'disabled');
    manualBtn.classList.remove('selected', 'disabled');
  }
}

/**
 * 清除文件选择
 */
function clearFileSelection() {
  const fileInput = document.getElementById('file-input-hidden');
  const fileInputText = document.getElementById('file-input-text');
  const fileInputArea = document.getElementById('file-input-area');
  const fileClearButton = document.getElementById('file-clear-button');
  const uploadIcon = document.getElementById('upload-icon');
  const fileCard = document.querySelector('#page-2 .card:first-child');
  const zoomCard = document.querySelector('#page-2 .card:nth-child(2)');
  const liveCard = document.querySelector('#page-2 .card:last-child');
  const zoomInput = document.getElementById('zoom-link-input');
  const fileInputAreaElement = document.getElementById('file-input-area');

  // 重置文件相关状态
  isFileSelected = false;
  selectedFile = null;

  // 重置UI
  if (fileInput) fileInput.value = '';
  if (fileInputText) fileInputText.textContent = 'Choose a file';
  if (fileInputArea) fileInputArea.classList.remove('success', 'error');
  if (fileClearButton) fileClearButton.style.display = 'none';
  if (uploadIcon) uploadIcon.style.display = 'block';
  if (fileCard) fileCard.classList.remove('selected');
  if (fileInputAreaElement) fileInputAreaElement.style.pointerEvents = 'auto';

  // 恢复Zoom链接输入功能和Live Record功能
  if (zoomCard) zoomCard.classList.remove('disabled');
  if (liveCard) liveCard.classList.remove('disabled');
  if (zoomInput) zoomInput.disabled = false;

  updatePage2NextButton();
}

/**
 * 清除链接输入
 */
function clearLinkInput() {
  const zoomInput = document.getElementById('zoom-link-input');
  const statusIcon = document.getElementById('link-status-icon');
  const linkClearButton = document.getElementById('link-clear-button');
  const fileCard = document.querySelector('#page-2 .card:first-child');
  const zoomCard = document.querySelector('#page-2 .card:nth-child(2)');
  const liveCard = document.querySelector('#page-2 .card:last-child');
  const fileInput = document.getElementById('file-input-hidden');
  const fileInputArea = document.getElementById('file-input-area');

  // 重置链接相关状态
  isZoomLinkValid = false;
  selectedRecordingMode = null;

  // 重置UI
  if (zoomInput) {
    zoomInput.value = '';
    zoomInput.classList.remove('success', 'error');
  }
  if (linkClearButton) linkClearButton.style.display = 'none';
  if (zoomCard) zoomCard.classList.remove('selected');

  // 恢复文件上传功能和Live Record功能
  if (fileCard) fileCard.classList.remove('disabled');
  if (liveCard) liveCard.classList.remove('disabled');
  if (fileInput) fileInput.disabled = false;
  if (fileInputArea) fileInputArea.style.pointerEvents = 'auto';

  // 隐藏录制模式选择
  hideRecordingModeSelection();

  updatePage2NextButton();
}

/**
 * 重置Page2状态
 */
function resetPage2State() {
  // 重置所有状态变量
  isFileSelected = false;
  isZoomLinkValid = false;
  selectedFile = null;
  selectedRecordingMode = null;
  canClickPage2Next = false;
  recordingState = 'idle';
  
  // 重置Page3和Page4状态
  isTranscriptionLoading = false;
  transcriptionText = '';
  canClickPage3Next = false;
  hasTranscriptionRendered = false; // 重置转录渲染状态
  isSummaryLoading = false;
  summaryText = '';
  canClickPage4Finish = false;
  hasSummaryRendered = false; // 重置总结渲染状态

  // 清除实时录制状态
  clearLiveRecording();

  // 重置文件上传UI
  const fileInput = document.getElementById('file-input-hidden');
  const fileInputText = document.getElementById('file-input-text');
  const fileInputArea = document.getElementById('file-input-area');
  const fileClearButton = document.getElementById('file-clear-button');
  const uploadIcon = document.getElementById('upload-icon');

  if (fileInput) fileInput.value = '';
  if (fileInputText) fileInputText.textContent = 'Choose a file';
  if (fileInputArea) fileInputArea.classList.remove('success', 'error');
  if (fileClearButton) fileClearButton.style.display = 'none';
  if (uploadIcon) uploadIcon.style.display = 'block';

  // 重置Zoom链接UI
  const zoomInput = document.getElementById('zoom-link-input');
  const linkClearButton = document.getElementById('link-clear-button');

  if (zoomInput) {
    zoomInput.value = '';
    zoomInput.classList.remove('success', 'error');
    zoomInput.disabled = false;
  }
  if (linkClearButton) linkClearButton.style.display = 'none';

  // 重置录制UI
  const recordInputArea = document.getElementById('record-input-area');
  const recordInputText = document.getElementById('record-input-text');
  const recordClearButton = document.getElementById('record-clear-button');
  if (recordInputArea) recordInputArea.classList.remove('recording', 'success', 'error');
  if (recordInputText) recordInputText.textContent = 'Start Recording';
  if (recordClearButton) recordClearButton.style.display = 'none';

  // 重置所有card状态
  const allCards = document.querySelectorAll('#page-2 .card');
  allCards.forEach(card => {
    card.classList.remove('selected', 'disabled');
  });

  // 隐藏录制模式选择
  hideRecordingModeSelection();
  
  // 重置Page3和Page4的UI状态
  resetPage3UI();
  resetPage4UI();

  // 更新按钮状态
  updateButtonStates();
}

/**
 * 重置第三页UI状态
 */
function resetPage3UI() {
  const loadingContainer = document.getElementById('transcription-loading');
  const textContainer = document.getElementById('transcription-text');
  
  if (loadingContainer) loadingContainer.style.display = 'flex';
  if (textContainer) {
    textContainer.style.display = 'none';
    textContainer.innerHTML = '';
    textContainer.classList.remove('loaded');
  }
}

/**
 * 重置第四页UI状态
 */
function resetPage4UI() {
  const loadingContainer = document.getElementById('summary-loading');
  const textContainer = document.getElementById('summary-text');
  
  if (loadingContainer) loadingContainer.style.display = 'flex';
  if (textContainer) {
    textContainer.style.display = 'none';
    textContainer.innerHTML = '';
    textContainer.classList.remove('loaded');
  }
}

/**
 * 更新按钮的禁用状态
 * 根据布尔值变量动态添加或移除button-disabled类
 */
function updateButtonStates() {
  // 更新page2的next按钮状态
  const page2NextButton = document.querySelector('#page-2 .button:nth-child(2)');
  if (page2NextButton) {
    if (canClickPage2Next) {
      page2NextButton.classList.remove('button-disabled');
    } else {
      page2NextButton.classList.add('button-disabled');
    }
  }

  // 更新page3的next按钮状态
  const page3NextButton = document.querySelector('#page-3 .button:nth-child(2)');
  if (page3NextButton) {
    if (canClickPage3Next) {
      page3NextButton.classList.remove('button-disabled');
    } else {
      page3NextButton.classList.add('button-disabled');
    }
  }

  // 更新page4的finish按钮状态
  const page4FinishButton = document.querySelector('#page-4 .button:nth-child(2)');
  if (page4FinishButton) {
    if (canClickPage4Finish) {
      page4FinishButton.classList.remove('button-disabled');
    } else {
      page4FinishButton.classList.add('button-disabled');
    }
  }
}



// 初始化页面切换功能
function initPageSwitcher() {
  // 显示第一页
  showPage(1);

  // 绑定所有按钮事件
  bindButtonEvents();

  // 初始化按钮状态
  updateButtonStates();
}

// 显示指定页面
// @param {number} pageNumber - 页面编号 (1-4)
function showPage(pageNumber) {
  // 隐藏所有页面
  const allPages = document.querySelectorAll('.page');
  allPages.forEach(page => {
    page.classList.remove('active');
  });

  // 显示指定页面
  const targetPage = document.getElementById(`page-${pageNumber}`);
  if (targetPage) {
    targetPage.classList.add('active');
    currentPage = pageNumber;

    // 添加页面渲染动画
    animatePageEntry(targetPage);
    
    // 页面特定的处理逻辑
    if (pageNumber === 3) {
      // 根据布尔值控制是否渲染转录内容
      if (!hasTranscriptionRendered) {
        // 第一次进入，开始转录
        startTranscription();
        hasTranscriptionRendered = true;
      } else {
        // 已经渲染过，直接加载现有内容
        loadExistingTranscription();
      }
    } else if (pageNumber === 4) {
      // 根据布尔值控制是否渲染总结内容
      if (!hasSummaryRendered) {
        // 第一次进入，开始生成总结
        startSummaryGeneration();
        hasSummaryRendered = true;
      } else {
        // 已经渲染过，直接加载现有内容
        loadExistingSummary();
      }
    }
  }
}

// 绑定按钮点击事件
function bindButtonEvents() {
  // 直接使用更精确的按钮选择方式
  bindSpecificButtons();
}

// 绑定特定按钮事件（更精确的选择方式）
function bindSpecificButtons() {
  // Start按钮 (page-1)
  const startButton = document.querySelector('#page-1 .button');
  if (startButton) {
    startButton.addEventListener('click', () => showPage(2));
  }

  // Page-2 按钮
  const page2Buttons = document.querySelectorAll('#page-2 .button');
  if (page2Buttons.length >= 2) {
    // Back按钮
    page2Buttons[0].addEventListener('click', () => showPage(1));
    // Next按钮
    page2Buttons[1].addEventListener('click', () => {
      if (canClickPage2Next) {
        showPage(3);
      }
    });
  }

  // Page-3 按钮
  const page3Buttons = document.querySelectorAll('#page-3 .button');
  if (page3Buttons.length >= 2) {
    // Back按钮
    page3Buttons[0].addEventListener('click', () => showPage(2));
    // Next按钮
    page3Buttons[1].addEventListener('click', () => {
      if (canClickPage3Next) {
        showPage(4);
      }
    });
  }

  // Page-4 按钮
  const page4Buttons = document.querySelectorAll('#page-4 .button');
  if (page4Buttons.length >= 2) {
    // Back按钮
    page4Buttons[0].addEventListener('click', () => showPage(3));
    // Finish按钮
    page4Buttons[1].addEventListener('click', () => {
      if (canClickPage4Finish) {
        resetPage2State(); // 重置Page2状态
        showPage(1);
      }
    });
  }

  // Page-2 文件上传事件
  const fileInput = document.getElementById('file-input-hidden');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const fileInputArea = document.getElementById('file-input-area');

      if (file) {
        if (validateFile(file)) {
          selectedFile = file;
          isFileSelected = true;

          // 更新文件显示文本和样式
          const fileInputText = document.getElementById('file-input-text');
          if (fileInputText) {
            fileInputText.textContent = file.name;
          }
          if (fileInputArea) {
            fileInputArea.classList.remove('error');
            fileInputArea.classList.add('success');
          }

          // 隐藏上传图标，显示清除按钮
          const uploadIcon = document.getElementById('upload-icon');
          const fileClearButton = document.getElementById('file-clear-button');
          if (uploadIcon) {
            uploadIcon.style.display = 'none';
          }
          if (fileClearButton) {
            fileClearButton.style.display = 'block';
          }

          // 禁用Zoom链接输入和Live Record功能
          const fileCard = document.querySelector('#page-2 .card:first-child');
          const zoomCard = document.querySelector('#page-2 .card:nth-child(2)');
          const liveCard = document.querySelector('#page-2 .card:last-child');
          const zoomInput = document.getElementById('zoom-link-input');

          if (fileCard) fileCard.classList.add('selected');
          if (zoomCard) zoomCard.classList.add('disabled');
          if (liveCard) liveCard.classList.add('disabled');
          if (zoomInput) {
            zoomInput.disabled = true;
            zoomInput.value = '';
            zoomInput.classList.remove('valid');
          }

          // 隐藏录制模式选择和状态图标
          hideRecordingModeSelection();
          const statusIcon = document.getElementById('link-status-icon');
          if (statusIcon) statusIcon.style.display = 'none';

          isZoomLinkValid = false;
          updatePage2NextButton();
        } else {
          // 文件验证失败，显示错误状态
          if (fileInputArea) {
            fileInputArea.classList.remove('success');
            fileInputArea.classList.add('error');
          }
          alert('请选择有效的音频文件（MP3、MP4、WAV、M4A格式，小于10MB）');
          fileInput.value = '';

          // 延迟移除错误状态
          setTimeout(() => {
            if (fileInputArea) {
              fileInputArea.classList.remove('error');
            }
          }, 3000);
        }
      } else {
        // 没有选择文件时，移除所有状态类
        if (fileInputArea) {
          fileInputArea.classList.remove('success', 'error');
        }
      }
    });
  }

  // Page-2 Zoom链接输入事件
  const zoomInput = document.getElementById('zoom-link-input');
  if (zoomInput) {
    zoomInput.addEventListener('input', (e) => {
      const link = e.target.value.trim();

      if (link === '') {
        // 链接为空时重置状态
        isZoomLinkValid = false;
        e.target.classList.remove('success', 'error');
        hideRecordingModeSelection();

        // 恢复文件上传功能和Live Record功能
        const fileCard = document.querySelector('#page-2 .card:first-child');
        const zoomCard = document.querySelector('#page-2 .card:nth-child(2)');
        const liveCard = document.querySelector('#page-2 .card:last-child');
        const fileInput = document.getElementById('file-input-hidden');
        const fileInputArea = document.getElementById('file-input-area');

        if (fileCard) fileCard.classList.remove('disabled');
        if (zoomCard) zoomCard.classList.remove('selected');
        if (liveCard) liveCard.classList.remove('disabled');
        if (fileInput) fileInput.disabled = false;
        if (fileInputArea) fileInputArea.style.pointerEvents = 'auto';

        // 隐藏清除按钮
        const clearButton = document.getElementById('link-clear-button');
        if (clearButton) clearButton.style.display = 'none';

        updatePage2NextButton();
        return;
      }

      if (validateZoomLink(link)) {
        isZoomLinkValid = true;
        e.target.classList.add('success');
        e.target.classList.remove('error');

        // 禁用文件上传功能和Live Record功能
        const fileCard = document.querySelector('#page-2 .card:first-child');
        const zoomCard = document.querySelector('#page-2 .card:nth-child(2)');
        const liveCard = document.querySelector('#page-2 .card:last-child');
        const fileInput = document.getElementById('file-input-hidden');
        const fileInputArea = document.getElementById('file-input-area');
        const fileInputText = document.getElementById('file-input-text');

        if (fileCard) fileCard.classList.add('disabled');
        if (zoomCard) zoomCard.classList.add('selected');
        if (liveCard) liveCard.classList.add('disabled');
        if (fileInput) {
          fileInput.disabled = true;
          fileInput.value = '';
        }
        if (fileInputArea) fileInputArea.style.pointerEvents = 'none';
        if (fileInputText) fileInputText.textContent = 'Choose a file';

        // 显示清除按钮
        const clearButton = document.getElementById('link-clear-button');
        if (clearButton) {
          clearButton.style.display = 'flex';
        }

        // 显示录制模式选择
        showRecordingModeSelection();

        // 重置文件选择状态
        isFileSelected = false;
        selectedFile = null;

        updatePage2NextButton();
      } else {
        isZoomLinkValid = false;
        e.target.classList.add('error');
        e.target.classList.remove('success');

        // 显示清除按钮（即使错误也显示）
        const clearButton = document.getElementById('link-clear-button');
        if (clearButton) {
          clearButton.style.display = 'flex';
        }

        hideRecordingModeSelection();

        // 恢复文件上传功能和Live Record功能
        const fileCard = document.querySelector('#page-2 .card:first-child');
        const zoomCard = document.querySelector('#page-2 .card:nth-child(2)');
        const liveCard = document.querySelector('#page-2 .card:last-child');
        const fileInput = document.getElementById('file-input-hidden');
        const fileInputArea = document.getElementById('file-input-area');

        if (fileCard) fileCard.classList.remove('disabled');
        if (zoomCard) zoomCard.classList.remove('selected');
        if (liveCard) liveCard.classList.remove('disabled');
        if (fileInput) fileInput.disabled = false;
        if (fileInputArea) fileInputArea.style.pointerEvents = 'auto';

        // 延迟移除错误状态
        setTimeout(() => {
          e.target.classList.remove('error');
        }, 2000);

        updatePage2NextButton();
      }
    });
  }

  // Page-2 录制模式按钮事件
  const autoRecordBtn = document.getElementById('auto-record-btn');
  const manualRecordBtn = document.getElementById('manual-record-btn');

  if (autoRecordBtn) {
    autoRecordBtn.addEventListener('click', () => {
      if (!autoRecordBtn.classList.contains('disabled')) {
        selectRecordingMode('auto');
      }
    });
  }

  if (manualRecordBtn) {
    manualRecordBtn.addEventListener('click', () => {
      if (!manualRecordBtn.classList.contains('disabled')) {
        selectRecordingMode('manual');
      }
    });
  }
}

// 录制状态：'idle' | 'recording' | 'completed'
let recordingState = 'idle';

/**
 * 切换实时录制状态
 */
function toggleLiveRecording() {
  const recordInputArea = document.getElementById('record-input-area');
  const recordInputText = document.getElementById('record-input-text');
  const recordClearButton = document.getElementById('record-clear-button');
  const uploadCard = document.querySelector('#page-2 .card:first-child');
  const zoomCard = document.querySelector('#page-2 .card:nth-child(2)');
  const liveRecordCard = document.querySelector('#page-2 .card:last-child');

  if (recordingState === 'idle') {
    // 开始录制
    recordingState = 'recording';
    recordInputArea.classList.add('recording');
    recordInputText.textContent = 'Recording...';

    // 禁用其他card
    if (uploadCard) uploadCard.classList.add('disabled');
    if (zoomCard) zoomCard.classList.add('disabled');

  } else if (recordingState === 'recording') {
    // 结束录制
    recordingState = 'completed';
    recordInputArea.classList.remove('recording');
    recordInputArea.classList.add('success');
    recordInputText.textContent = 'Recording Completed';

    // 隐藏原图标，显示清除按钮
    const recordIcon = document.getElementById('record-icon');
    if (recordIcon) {
      recordIcon.style.display = 'none';
    }

    // 显示清除按钮
    if (recordClearButton) recordClearButton.style.display = 'block';

    // 选中当前card
    if (liveRecordCard) liveRecordCard.classList.add('selected');

    // 恢复其他card
    if (uploadCard) uploadCard.classList.remove('disabled');
    if (zoomCard) zoomCard.classList.remove('disabled');
  }

  updatePage2NextButton();
}



/**
 * 清除实时录制状态
 */
function clearLiveRecording(event) {
  if (event) {
    event.stopPropagation(); // 防止触发父元素的点击事件
  }

  const recordInputArea = document.getElementById('record-input-area');
  const recordInputText = document.getElementById('record-input-text');
  const recordClearButton = document.getElementById('record-clear-button');
  const liveRecordCard = document.querySelector('#page-2 .card:last-child');

  // 重置录制状态
  recordingState = 'idle';

  // 重置UI
  if (recordInputArea) {
    recordInputArea.classList.remove('recording', 'success', 'error');
  }
  if (recordInputText) {
    recordInputText.textContent = 'Start Recording';
  }
  if (recordClearButton) {
    recordClearButton.style.display = 'none';
  }

  // 恢复原图标显示
  const recordIcon = document.getElementById('record-icon');
  if (recordIcon) {
    recordIcon.style.display = 'block';
  }

  // 取消选中card
  if (liveRecordCard) {
    liveRecordCard.classList.remove('selected');
  }

  updatePage2NextButton();
}

/**
 * 测试模拟器 - 用于模拟API调用和数据传输
 * 包含模拟的转录和总结API调用逻辑
 */

// 测试配置
const TEST_CONFIG = {
  transcriptionDelay: 3000, // 转录API模拟延迟时间（毫秒）
  summaryDelay: 2500,       // 总结API模拟延迟时间（毫秒）
  enableTestMode: true      // 是否启用测试模式
};

// 测试数据 - 默认静态文本内容
const TEST_DATA = {
  defaultTranscriptionText: `<p>So we have to make sure that you store it, you handle it, safely. That means you are responsible with any data you store. OK, so today I try to cover some topics that relate to the principle of ethical data handling. Some approach is very necessary. And some principle maybe is as a shock that to you how to handle it with the best effort to try to protect the ID of the end user. So please keep in mind after you have this lecture, you keep in mind that how the product handle with the data that relate to the human. We really want to look at that at the presentation when you're talking about the product. And we really want to hear about what is the risk, the product exposed to the human identity, and what is the solution. So there is a simple checklist here for you to do as a group to go over it, to check yourself before you introduce a product. And we really welcome to see an ethical analysis in the report. That means that the team care a lot about these rules already and the cover to have a look at, go deeper. Whatever this lecture does not cover, but the references can help you a lot. So why we care about the ethics?</p>
<p>The main purpose of that, anything we're doing, is that we have to pursue that. It's the right in the right way, and it's for good. It's not something like for the bad purpose. So in the way when we handle the data, we store the data, we try to avoid any harm to the human, to the end user. And for the good purpose, usually we expect that the product is exposed, something like the honest principle that you provide the true information, not some kind of the spread, the misleading information, and it's about the fair, and it's not introduced any kind of the discrimination action to the society. And we really respect privacy of each person. Whatever it is, maybe the start, maybe the end user, maybe the government policy, we all have to care about these items. This is the success and the item we take from the associate and for the computing machinery, code of ethics. So that is kind of the rule for you when you write any coding. So you have to keep in mind that is any risk you expose, the private information, it can cause a constant</p>`,
  
  defaultSummaryText: `<h3>Key Points</h3>
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
</ul>`
};

/**
 * 模拟转录API调用
 * 使用setTimeout模拟网络延迟和处理时间
 */
function simulateTranscriptionAPI() {
  if (!TEST_CONFIG.enableTestMode) {
    console.warn('测试模式已禁用');
    return;
  }
  
  console.log('开始模拟转录API调用...');
  
  // 模拟处理时间
  setTimeout(() => {
    console.log('转录API调用完成');
    
    // 更新全局变量（从page-controller.js）
    if (typeof transcriptionText !== 'undefined') {
      transcriptionText = TEST_DATA.defaultTranscriptionText;
    }
    
    if (typeof isTranscriptionLoading !== 'undefined') {
      isTranscriptionLoading = false;
    }
    
    if (typeof canClickPage3Next !== 'undefined') {
      canClickPage3Next = true;
    }
    
    // 调用UI更新函数（如果存在）
    if (typeof updateTranscriptionUI === 'function') {
      updateTranscriptionUI();
    }
    
    if (typeof updateButtonStates === 'function') {
      updateButtonStates();
    }
    
  }, TEST_CONFIG.transcriptionDelay);
}

/**
 * 模拟总结API调用
 * 使用setTimeout模拟网络延迟和处理时间
 */
function simulateSummaryAPI() {
  if (!TEST_CONFIG.enableTestMode) {
    console.warn('测试模式已禁用');
    return;
  }
  
  console.log('开始模拟总结API调用...');
  
  // 模拟处理时间
  setTimeout(() => {
    console.log('总结API调用完成');
    
    // 更新全局变量（从page-controller.js）
    if (typeof summaryText !== 'undefined') {
      summaryText = TEST_DATA.defaultSummaryText;
    }
    
    if (typeof isSummaryLoading !== 'undefined') {
      isSummaryLoading = false;
    }
    
    if (typeof canClickPage4Finish !== 'undefined') {
      canClickPage4Finish = true;
    }
    
    // 调用UI更新函数（如果存在）
    if (typeof updateSummaryUI === 'function') {
      updateSummaryUI();
    }
    
    if (typeof updateButtonStates === 'function') {
      updateButtonStates();
    }
    
  }, TEST_CONFIG.summaryDelay);
}



// 导出函数供其他模块使用
if (typeof window !== 'undefined') {
  // 浏览器环境
  window.TestSimulator = {
    simulateTranscriptionAPI,
    simulateSummaryAPI,
    TEST_CONFIG,
    TEST_DATA
  };
}
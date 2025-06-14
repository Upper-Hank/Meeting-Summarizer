// Meeting Summarizer 通用工具函数
// 包含验证、UI辅助和其他通用功能

// 验证工具
const Validators = {
  // 验证文件格式和大小
  // @param {File} file - 选择的文件
  // @returns {boolean} - 验证是否通过
  validateFile(file) {
    const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a'];
    const allowedExtensions = ['.mp3', '.mp4', '.wav', '.m4a', '.avi', '.mov', '.flv', '.aac'];
        const maxSize = 100 * 1024 * 1024; // 100MB

    // 检查文件扩展名
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    // 检查文件大小
    const isValidSize = file.size <= maxSize;

    return hasValidExtension && isValidSize;
  },

  // 验证Zoom链接格式
  // @param {string} url - 输入的链接
  // @returns {boolean} - 验证是否通过
  validateZoomLink(url) {
    if (!url || url.trim() === '') return false;

    // 检查是否包含zoom.us和/j/
    const hasZoomDomain = url.includes('zoom.us');
    const hasJoinPath = url.includes('/j/');

    return hasZoomDomain && hasJoinPath;
  }
};

// UI辅助工具
const UIHelpers = {
  // 显示元素
  // @param {string|HTMLElement} element - 元素选择器或元素对象
  show(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
      el.style.display = 'block';
    }
  },

  // 隐藏元素
  // @param {string|HTMLElement} element - 元素选择器或元素对象
  hide(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
      el.style.display = 'none';
    }
  },

  // 切换元素显示状态
  // @param {string|HTMLElement} element - 元素选择器或元素对象
  toggle(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
  },

  // 添加CSS类
  // @param {string|HTMLElement} element - 元素选择器或元素对象
  // @param {string} className - CSS类名
  addClass(element, className) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
      el.classList.add(className);
    }
  },

  // 移除CSS类
  // @param {string|HTMLElement} element - 元素选择器或元素对象
  // @param {string} className - CSS类名
  removeClass(element, className) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
      el.classList.remove(className);
    }
  },

  // 切换CSS类
  // @param {string|HTMLElement} element - 元素选择器或元素对象
  // @param {string} className - CSS类名
  toggleClass(element, className) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
      el.classList.toggle(className);
    }
  },

  // 设置元素文本内容
  // @param {string|HTMLElement} element - 元素选择器或元素对象
  // @param {string} text - 文本内容
  setText(element, text) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
      el.textContent = text;
    }
  },

  // 设置元素HTML内容
  // @param {string|HTMLElement} element - 元素选择器或元素对象
  // @param {string} html - HTML内容
  setHTML(element, html) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
      el.innerHTML = html;
    }
  }
};

// 动画工具
const AnimationHelpers = {
  // 页面进入动画效果
  // @param {HTMLElement} page - 目标页面元素
  animatePageEntry(page) {
    if (!page || typeof gsap === 'undefined') return;

    // 执行动画
    gsap.fromTo(page,
      {
        opacity: 0,
        y: 30,
        scale: 0.95
      }
      , {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out"
      });

    // 为页面内的元素添加交错动画
    const elements = page.querySelectorAll('.left-part > *, .right-part > *, .top-part > *, .bottom-part > *');
    if (elements.length > 0) {
      gsap.fromTo(elements,
        {
          opacity: 0,
          y: 20
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  },

  // 淡入动画
  // @param {HTMLElement} element - 目标元素
  // @param {number} duration - 动画时长（秒）
  fadeIn(element, duration = 0.3) {
    if (!element || typeof gsap === 'undefined') return;

    gsap.fromTo(element,
      { opacity: 0 },
      { opacity: 1, duration }
    );
  },

  /**
   * 淡出动画
   * @param {HTMLElement} element - 目标元素
   * @param {number} duration - 动画时长（秒）
   */
  fadeOut(element, duration = 0.3) {
    if (!element || typeof gsap === 'undefined') return;

    gsap.to(element, { opacity: 0, duration });
  },

  /**
   * 滑入动画
   * @param {HTMLElement} element - 目标元素
   * @param {string} direction - 滑入方向 ('up', 'down', 'left', 'right')
   * @param {number} duration - 动画时长（秒）
   */
  slideIn(element, direction = 'up', duration = 0.4) {
    if (!element || typeof gsap === 'undefined') return;

    const directions = {
      up: { y: 20 },
      down: { y: -20 },
      left: { x: 20 },
      right: { x: -20 }
    };

    const fromProps = { opacity: 0, ...directions[direction] };
    const toProps = { opacity: 1, x: 0, y: 0, duration, ease: "power2.out" };

    gsap.fromTo(element, fromProps, toProps);
  }
};

// 工具函数
const Utils = {
  /**
   * 延迟执行函数
   * @param {Function} fn - 要执行的函数
   * @param {number} delay - 延迟时间（毫秒）
   */
  delay(fn, delay) {
    return setTimeout(fn, delay);
  },

  /**
   * 防抖函数
   * @param {Function} fn - 要防抖的函数
   * @param {number} delay - 防抖延迟时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * 节流函数
   * @param {Function} fn - 要节流的函数
   * @param {number} delay - 节流延迟时间（毫秒）
   * @returns {Function} 节流后的函数
   */
  throttle(fn, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  },

  /**
   * 生成随机ID
   * @param {number} length - ID长度
   * @returns {string} 随机ID
   */
  generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// 文档操作工具
const DocumentTools = {
  /**
   * 复制文本到剪贴板
   * @param {string} text - 要复制的文本
   * @param {Function} onSuccess - 成功回调
   * @param {Function} onError - 错误回调
   */
  async copyText(text, onSuccess, onError) {
    if (!text) {
      if (onError) onError('No text to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      if (onSuccess) onSuccess('Text copied to clipboard');
    } catch (error) {
      console.error('Copy failed:', error);

      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        if (onSuccess) onSuccess('Text copied to clipboard');
      } catch (fallbackError) {
        if (onError) onError('Copy failed, please select text manually');
      }

      document.body.removeChild(textArea);
    }
  },

  /**
   * 下载文本为文件
   * @param {string} text - 要下载的文本
   * @param {string} filename - 文件名（不含扩展名）
   * @param {Function} onSuccess - 成功回调
   * @param {Function} onError - 错误回调
   */
  downloadText(text, filename, onSuccess, onError) {
    if (!text) {
      if (onError) onError('No text to download');
      return;
    }

    try {
      // 创建文件内容
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // 生成文件名（包含时间戳）
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `${filename}-${timestamp}.txt`;

      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 清理URL对象
      URL.revokeObjectURL(url);

      if (onSuccess) onSuccess('File download started');
    } catch (error) {
      console.error('Download failed:', error);
      if (onError) onError('Download failed, please try again');
    }
  },

  /**
   * 文本朗读功能
   * @param {string} text - 要朗读的文本
   * @param {Function} onStart - 开始朗读回调
   * @param {Function} onEnd - 结束朗读回调
   * @param {Function} onError - 错误回调
   * @returns {boolean} 是否开始朗读
   */
  speakText(text, onStart, onEnd, onError) {
    if (!text) {
      if (onError) onError('No text to read');
      return false;
    }

    // 检查浏览器支持
    if (!('speechSynthesis' in window)) {
      if (onError) onError('Your browser does not support speech synthesis');
      return false;
    }

    const synth = window.speechSynthesis;

    // 如果正在朗读或有待处理的朗读任务，则完全停止
    if (synth.speaking || synth.pending) {
      synth.cancel();
      // 直接返回，不再手动触发onEnd，避免多次回调
      return false;
    }

    try {
      // 创建语音合成实例
      const utterance = new SpeechSynthesisUtterance(text);

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
        if (onStart) onStart('Speech started');
      };

      utterance.onend = () => {
        if (onEnd) onEnd('Speech completed');
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
        if (onError) onError('Speech failed, please try again');
      };

      // 开始朗读
      synth.speak(utterance);
      return true;
    } catch (error) {
      console.error('Speech function error:', error);
      if (onError) onError('Speech function error, please try again');
      return false;
    }
  },

  /**
   * 停止文本朗读
   * @param {Function} onStop - 停止回调
   */
  stopSpeaking(onStop) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (onStop) onStop('Speech stopped');
    }
  },

  /**
   * Toast管理器 - 管理多个提示消息的显示位置
   */
  _toastManager: {
    toasts: [],

    add(toast) {
      this.toasts.push(toast);
      this.updatePositions();
    },

    remove(toast) {
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
        this.updatePositions();
      }
    },

    updatePositions() {
      this.toasts.forEach((toast, index) => {
        const topPosition = 20 + (index * 70); // 每个toast间隔70px
        toast.style.top = `${topPosition}px`;
      });
    }
  },

  /**
   * Display notification message
   * @param {string} message - Notification message
   * @param {string} type - Message type ('success', 'error', 'info')
   */
  showToast(message, type = 'info', key = null) {
    // 如果传入 key，则先移除已有相同 key 的 toast
    if (key) {
      const existing = document.querySelectorAll('.toast-key-' + key);
      existing.forEach(t => {
        if (document.body.contains(t)) {
          document.body.removeChild(t);
          if (this._toastManager) this._toastManager.remove(t);
        }
      });
    }
    // Create toast element
    const toast = document.createElement('div');
    toast.textContent = message;
    if (key) toast.classList.add('toast-key-' + key);
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
      transform: translateX(100%);
      transition: all 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    // Set color theme
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#17a2b8'
    };
    toast.style.backgroundColor = colors[type] || colors.info;
    // Add to page and manager
    document.body.appendChild(toast);
    this._toastManager.add(toast);
    // Show animation
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 10);
    // Auto remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
          this._toastManager.remove(toast);
        }
      }, 300);
    }, 3000);
  },

  /**
   * 统一的文本呈现动画（在加载动画结束后调用）
   * @param {HTMLElement} textElement - 文本容器元素
   * @param {string} text - 要显示的文本内容
   * @param {Function} onComplete - 动画完成回调
   * @param {Object} options - 配置选项
   */
  animateTextReveal(textElement, text, onComplete = null, options = {}) {
    if (!textElement || !text) {
      console.warn('文本元素或文本内容为空');
      if (onComplete) onComplete();
      return;
    }

    // 默认配置
    const config = {
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out",
      initialY: 20,
      initialRotationX: -90,
      delay: 200, // 加载动画结束后的延迟
      ...options
    };

    // 先清空内容，避免先显示全部文本
    textElement.textContent = '';
    textElement.style.display = 'block';
    textElement.style.opacity = '1';

    // 检查GSAP是否可用
    if (typeof gsap === 'undefined') {
      console.warn('GSAP不可用，使用降级方案');
      textElement.textContent = text;
      if (onComplete) setTimeout(onComplete, config.delay + 500);
      return;
    }

    // 注册SplitText插件
    if (typeof SplitText !== 'undefined') {
      gsap.registerPlugin(SplitText);
    } else {
      console.warn('SplitText插件不可用，使用降级方案');
      textElement.textContent = text;
      if (onComplete) setTimeout(onComplete, config.delay + 500);
      return;
    }

    // 延迟执行动画，确保加载动画完全结束
    setTimeout(() => {
      try {
        // 先插入文本内容
        textElement.textContent = text;
        // 使用SplitText按行分割文本
        const splitText = new SplitText(textElement, {
          type: "lines",
          linesClass: "text-reveal-line"
        });

        const lines = splitText.lines;

        if (lines.length === 0) {
          console.warn('未能分割出文本行，使用降级方案');
          textElement.textContent = text;
          if (onComplete) onComplete();
          return;
        }

        // 初始隐藏所有行
        gsap.set(lines, {
          opacity: 0,
          y: config.initialY,
          rotationX: config.initialRotationX
        });

        // 按行逐个显示文本
        gsap.to(lines, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: config.duration,
          stagger: config.stagger,
          ease: config.ease,
          onComplete: () => {
            splitText.revert();
            console.log('文本动画完成');
            if (onComplete) onComplete();
          }
        });

      } catch (error) {
        console.warn('SplitText动画失败，使用降级方案:', error);
        // 降级方案：简单的淡入动画
        gsap.fromTo(textElement,
          { opacity: 0, y: config.initialY },
          {
            opacity: 1,
            y: 0,
            duration: config.duration,
            ease: config.ease,
            onComplete: onComplete
          }
        );
      }
    }, config.delay);
  },

  /**
   * 渐进式文本显示动画（保持向后兼容）
   * @deprecated 请使用 animateTextReveal 替代
   */
  progressiveTextReveal(textElement, text, onComplete, isMarkdown = false) {
    console.warn('progressiveTextReveal已废弃，请使用animateTextReveal');
    this.animateTextReveal(textElement, text, onComplete);
  },

  /**
   * 格式化Markdown文本（简单的Markdown到HTML转换）
   * @param {string} text - Markdown文本
   * @returns {string} HTML文本
   */
  formatMarkdownText(text) {
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
  }
};

// 导出工具对象
window.MeetingSummarizerUtils = {
  Validators,
  UIHelpers,
  AnimationHelpers,
  Utils,
  DocumentTools
};
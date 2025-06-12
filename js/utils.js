// Meeting Summarizer 通用工具函数
// 包含验证、UI辅助和其他通用功能

// 验证工具
const Validators = {
  // 验证文件格式和大小
  // @param {File} file - 选择的文件
  // @returns {boolean} - 验证是否通过
  validateFile(file) {
    const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a'];
    const allowedExtensions = ['.mp3', '.mp4', '.wav', '.m4a'];
    const maxSize = 10 * 1024 * 1024; // 10MB

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

// 导出工具对象
window.MeetingSummarizerUtils = {
  Validators,
  UIHelpers,
  AnimationHelpers,
  Utils
};
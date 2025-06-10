// 动画相关功能模块
// 包含页面切换动画和元素动画效果

// 页面进入动画效果
// @param {HTMLElement} page - 目标页面元素
function animatePageEntry(page) {
  // 设置初始状态
  gsap.set(page, {
    opacity: 0,
    y: 30,
    scale: 0.95
  });

  // 执行进入动画
  gsap.to(page, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.6,
    ease: "power2.out"
  });

  // 为页面内的元素添加交错动画
  const elements = page.querySelectorAll('.left-part > * , .right-part > *,.top-part > *, .bottom-part > *');
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
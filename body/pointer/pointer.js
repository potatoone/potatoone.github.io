// 创建自定义指针元素
const pointer = document.createElement('div');
pointer.className = 'custom-pointer';
document.body.appendChild(pointer);

// 存储最新鼠标位置（避免事件回调中的闭包延迟）
let lastX = 0;
let lastY = 0;

// 鼠标移动事件（无任何冗余逻辑）
document.addEventListener('mousemove', (e) => {
  // 直接更新最新位置（避免变量声明开销）
  lastX = e.clientX;
  lastY = e.clientY;
});

// 用独立的动画帧循环更新位置（关键优化）
function updatePointer() {
  // 直接修改transform，避免读取布局属性
  pointer.style.transform = `translate(-50%, -50%) translate(${lastX}px, ${lastY}px)`;
  // 立即请求下一帧，确保最高刷新率
  requestAnimationFrame(updatePointer);
}

// 启动更新循环（页面加载后立即运行）
updatePointer();

// 鼠标进入/离开页面处理
document.addEventListener('mouseenter', () => {
  pointer.style.opacity = '1';
});
document.addEventListener('mouseleave', () => {
  pointer.style.opacity = '0';
});

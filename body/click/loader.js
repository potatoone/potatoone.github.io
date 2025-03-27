document.body.addEventListener('click', function(event) {
  // 检查点击的目标是否是排除的元素或其子元素
  // 排除的元素包括 .avatar, .parentBox .switch, .item-topbar .navbar-toggler
  var isExcluded = event.target.closest('.avatar, .popbar, .item-topbar, .checkbox-container') !== null;

  // 检查点击的目标是否是可点击的元素或其子元素
  // 常见的可点击元素有: <a>, <button>, <input>, <textarea>, 以及设置了tabindex的元素
  var isClickable = event.target.closest('a[href], button, input, textarea, [tabindex]:not([tabindex="-1"])') !== null;

  // 如果点击的是排除的元素或可点击的元素，则不执行任何操作
  if (isExcluded || isClickable) {
    return;
  }

  // 如果点击的不是排除的元素也不是可点击的元素，执行点击特效逻辑
  // 创建特效元素
  const effect = document.createElement('div');
  effect.className = 'loader'; // 特效元素的类名，假设在CSS中已定义样式

  // 设置特效元素的样式，使其绝对定位并位于点击位置
  effect.style.position = 'absolute';
  effect.style.left = `${event.pageX - 9}px`; // 根据特效元素的大小调整偏移量
  effect.style.top = `${event.pageY - 9}px`; // 根据特效元素的大小调整偏移量

  // 设置特效元素的pointer-events属性为none，使其可以穿透点击事件
  effect.style.pointerEvents = 'none';

  // 将特效元素添加到文档体中，从而让它出现在页面上
  document.body.appendChild(effect);

  // 设置特效元素的opacity属性为0，开始淡出特效
  setTimeout(() => {
    effect.style.opacity = '0';

    // 当特效元素的透明度完全变为0后，移除该元素
    setTimeout(() => {
      document.body.removeChild(effect);
    }, 700); // 假设淡出动画持续700毫秒
  }, 700); // 特效显示1秒后开始淡出
});
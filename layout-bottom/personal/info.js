document.addEventListener('DOMContentLoaded', function() {
  const avatar = document.getElementById('avatar');
  const infoContainer = document.getElementById('infoContainer');
  
  // 检查是否为移动设备
  function isMobile() {
    return window.innerWidth <= 768;
  }
  
  // 初始化
  function initialize() {
    if (isMobile()) {
      // 移动端初始状态：头像已缩小，内容隐藏
      infoContainer.classList.remove('expanded');
    } else {
      // 桌面模式清除所有可能的移动端状态
      infoContainer.classList.remove('expanded');
    }
  }
  
  // 头像点击事件
  avatar.addEventListener('click', function(e) {
    if (isMobile()) {
      infoContainer.classList.toggle('expanded');
    }
  });
  
  // 点击标签或按钮时阻止事件冒泡
  document.querySelectorAll('.tag, .bottom-button').forEach(element => {
    element.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });
  
  // 点击页面其他区域关闭展开的菜单
  document.addEventListener('click', function(e) {
    if (isMobile() && 
        infoContainer.classList.contains('expanded') && 
        !infoContainer.contains(e.target)) {
      infoContainer.classList.remove('expanded');
    }
  });
  
  // 窗口大小改变时重新初始化
  window.addEventListener('resize', function() {
    initialize();
  });
  
  // 初始化
  initialize();
});


document.addEventListener('DOMContentLoaded', function() {
  const avatar = document.getElementById('avatar');
  const bottomContainer = document.getElementById('bottomContainer');
  const overlay = document.getElementById('overlay');
  
  // 检查是否为移动设备
  function isMobile() {
    return window.innerWidth <= 768;
  }
  
  // 点击头像切换展开/折叠状态
  avatar.addEventListener('click', function() {
    if (isMobile()) {
      if (bottomContainer.classList.contains('collapsed')) {
        // 展开
        bottomContainer.classList.remove('collapsed');
        bottomContainer.classList.add('expanded');
        overlay.classList.add('active');
      } else {
        // 折叠
        bottomContainer.classList.remove('expanded');
        bottomContainer.classList.add('collapsed');
        overlay.classList.remove('active');
      }
    }
  });
  
  // 点击遮罩层关闭展开的内容
  overlay.addEventListener('click', function() {
    bottomContainer.classList.remove('expanded');
    bottomContainer.classList.add('collapsed');
    overlay.classList.remove('active');
  });
  
  // 窗口大小改变时检查
  window.addEventListener('resize', function() {
    if (!isMobile()) {
      bottomContainer.classList.remove('collapsed', 'expanded');
      overlay.classList.remove('active');
    } else {
      if (!bottomContainer.classList.contains('expanded')) {
        bottomContainer.classList.add('collapsed');
      }
    }
  });
  
  // 初始化
  if (isMobile()) {
    bottomContainer.classList.add('collapsed');
  }
});



document.addEventListener('DOMContentLoaded', function() {
  const avatar = document.getElementById('avatar');
  const infoContainer = document.getElementById('infoContainer');
  const overlay = document.getElementById('overlay');
  
  // 检查是否为移动设备
  function isMobile() {
    return window.innerWidth <= 768;
  }
  
  // 点击头像切换展开/折叠状态
  avatar.addEventListener('click', function() {
    if (isMobile()) {
      if (infoContainer.classList.contains('collapsed')) {
        // 展开
        infoContainer.classList.remove('collapsed');
        infoContainer.classList.add('expanded');
        overlay.classList.add('active');
      } else {
        // 折叠
        infoContainer.classList.remove('expanded');
        infoContainer.classList.add('collapsed');
        overlay.classList.remove('active');
      }
    }
  });
  
  // 点击遮罩层关闭展开的内容
  overlay.addEventListener('click', function() {
    infoContainer.classList.remove('expanded');
    infoContainer.classList.add('collapsed');
    overlay.classList.remove('active');
  });
  
  // 窗口大小改变时检查
  window.addEventListener('resize', function() {
    if (!isMobile()) {
      infoContainer.classList.remove('collapsed', 'expanded');
      overlay.classList.remove('active');
    } else {
      if (!infoContainer.classList.contains('expanded')) {
        infoContainer.classList.add('collapsed');
      }
    }
  });
  
  // 初始化
  if (isMobile()) {
    infoContainer.classList.add('collapsed');
  }
});

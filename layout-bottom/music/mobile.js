/**
 * 移动端音乐播放器控制脚本
 */
document.addEventListener('DOMContentLoaded', function() {
  let mobileToggle, player, audioPlayer;
  
  // 初始化
  (function() {
    // 创建移动端切换按钮
    mobileToggle = document.createElement('div');
    mobileToggle.className = 'mobile-toggle';
    mobileToggle.innerHTML = '<i class="fas fa-music"></i>';
    document.body.appendChild(mobileToggle);
    
    // 获取必要元素
    player = document.querySelector('.player');
    audioPlayer = document.getElementById('audio-player');
    
    if (!player || !audioPlayer) return;
    
    // 设置事件监听
    mobileToggle.addEventListener('click', togglePlayer);
    document.addEventListener('click', e => {
      if (!player.contains(e.target) && !mobileToggle.contains(e.target) && 
          window.innerWidth <= 768 && player.classList.contains('active'))
        togglePlayer(false);
    });
    
    // 播放状态更新
    audioPlayer.addEventListener('play', () => window.innerWidth <= 768 && mobileToggle.classList.add('playing-animation'));
    audioPlayer.addEventListener('pause', () => mobileToggle.classList.remove('playing-animation'));
    
    // 窗口大小变化
    window.addEventListener('resize', updateLayout);
    updateLayout();
  })();
  
  // 更新布局
  function updateLayout() {
    if (window.innerWidth <= 768) {
      player.classList.add('mobile-view');
      togglePlayer(player.classList.contains('active'));
    } else {
      player.classList.remove('mobile-view', 'active');
      player.style.cssText = '';
      mobileToggle.style.display = 'none';
    }
  }
  
  // 切换播放器
  function togglePlayer(show) {
    if (window.innerWidth > 768) return;
    
    if (show === undefined) show = !player.classList.contains('active');
    
    if (show) {
      player.classList.add('active');
      player.style.cssText = 'transform: translateX(0); opacity: 1; pointer-events: auto;';
      mobileToggle.style.opacity = '0';
      setTimeout(() => player.classList.contains('active') && (mobileToggle.style.display = 'none'), 300);
    } else {
      player.classList.remove('active');
      player.style.cssText = 'transform: translateX(100%); opacity: 0; pointer-events: none;';
      mobileToggle.style.display = 'flex';
      setTimeout(() => mobileToggle.style.opacity = '1', 10);
    }
  }
});
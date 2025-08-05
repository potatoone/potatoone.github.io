/**
 * 移动端音乐播放器控制脚本（精简版）
 */
document.addEventListener('DOMContentLoaded', () => {
  let mobileToggle, player, audioPlayer;
  
  // 检查是否为移动设备
  const isMobile = () => window.innerWidth <= 768;
  
  // 切换播放器显示状态
  const togglePlayer = (show) => {
    if (!isMobile() || !player) return;
    
    show = show ?? !player.classList.contains('active');
    
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
  };
  
  // 更新布局
  const updateLayout = () => {
    if (!player) return;
    
    if (isMobile()) {
      player.classList.add('mobile-view');
      togglePlayer(player.classList.contains('active'));
    } else {
      player.classList.remove('mobile-view', 'active');
      player.style.cssText = '';
      mobileToggle.style.display = 'none';
    }
  };
  
  // 初始化
  (() => {
    // 创建移动端切换按钮
    mobileToggle = document.createElement('div');
    mobileToggle.className = 'mobile-toggle';
    mobileToggle.innerHTML = '<i class="fas fa-music"></i>';
    document.body.appendChild(mobileToggle);
    
    // 获取必要元素
    player = document.querySelector('.player');
    audioPlayer = document.getElementById('audio-player');
    
    if (!player || !audioPlayer) return;
    
    // 事件监听
    mobileToggle.addEventListener('click', togglePlayer);
    
    // 点击页面其他区域关闭播放器
    document.addEventListener('click', (e) => {
      if (isMobile() && player.classList.contains('active') && 
          !player.contains(e.target) && !mobileToggle.contains(e.target)) {
        togglePlayer(false);
      }
    });
    
    // 播放状态更新
    audioPlayer.addEventListener('play', () => isMobile() && mobileToggle.classList.add('playing-animation'));
    audioPlayer.addEventListener('pause', () => isMobile() && mobileToggle.classList.remove('playing-animation'));
    
    // 窗口大小变化监听
    window.addEventListener('resize', updateLayout);
    updateLayout();
  })();
});

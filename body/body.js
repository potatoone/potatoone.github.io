// 检测移动设备
function isMobileDevice() {
    // 检查屏幕宽度
    const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (screenWidth < 200) return true;
  }
  
  // 条件加载窗口管理器资源
  if (!isMobileDevice()) {
    // 只在非移动设备上加载
    document.write('<link rel="stylesheet" href="./res/windows/window.css">');
    document.write('<script src="./res/windows/window.js" defer><\/script>');
    
    // 添加烟花效果脚本
    document.write('<script src="./res/fireworks.js" defer><\/script>');
  }
  
  // 添加音乐播放监听器
  document.addEventListener('DOMContentLoaded', function() {
    // 添加音乐播放状态变化监听
    window.addEventListener('musicPlayerStateChange', function(e) {
      checkAndToggleFireworks();
    });
    
    // 添加轮询检查，确保在歌曲切换时也能正确显示或隐藏烟花
    setInterval(checkAndToggleFireworks, 2000);
  });
  
  // 检查并切换烟花显示
  function checkAndToggleFireworks() {
    // 确保MusicPlayer和PlaylistManager已经初始化
    if (!window.MusicPlayer || !window.PlaylistManager) return;
    
    // 获取当前播放的曲目索引
    const currentIndex = window.PlaylistManager.getCurrentTrackIndex();
    
    // 获取音频元素，检查是否正在播放
    const audio = window.MusicPlayer.getAudioElement();
    const isPlaying = audio && !audio.paused;
    
    // 检查当前播放的曲目
    if (isPlaying) {
      // 获取当前曲目元素
      const trackElement = window.PlaylistManager.getTrackElement(currentIndex);
      
      // 如果找到曲目元素，检查其ID
      if (trackElement) {
        const trackId = trackElement.getAttribute('data-id');
        
        // 检查是否是"花焰照亮的旅途" (ID: 2676045527)
        if (trackId === '2676045527' && window.toggleFireworks) {
          // 显示烟花效果
          console.log('正在播放"花焰照亮的旅途"，显示烟花效果');
          window.toggleFireworks(true);
        } else if (window.toggleFireworks) {
          // 其他歌曲，隐藏烟花
          window.toggleFireworks(false);
        }
      }
    } else {
      // 如果不在播放，隐藏烟花
      if (window.toggleFireworks) {
        window.toggleFireworks(false);
      }
    }
  }
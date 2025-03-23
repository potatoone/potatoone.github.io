// 播放模式管理模块

// 播放模式设置
const PlayModeManager = (() => {
  // 私有变量
  let currentMode = 'order'; // 默认为顺序播放模式
  const modes = ['order', 'shuffle', 'repeat']; // 可用的播放模式
  const modeIcons = {
    order: 'fa-bars',     // 顺序播放图标
    shuffle: 'fa-shuffle',    // 随机播放图标
    repeat: 'fa-repeat'    // 单曲循环图标
  };
  const modeNames = {
    order: '顺序播放',
    shuffle: '随机播放',
    repeat: '单曲循环'
  };
  
  // DOM 元素引用
  let audioPlayer, modeButton, playlist;
  
  // 初始化函数
  function init() {
    // 获取必要的DOM元素
    audioPlayer = document.getElementById('audio-player');
    modeButton = document.getElementById('mode');
    playlist = document.getElementById('playlist');
    
    if (!audioPlayer || !modeButton || !playlist) {
      console.error('初始化播放模式管理器失败：缺少必要的DOM元素');
      return false;
    }
    
    // 设置初始图标
    updateModeIcon();
    
    // 添加模式切换按钮点击事件
    modeButton.addEventListener('click', toggleMode);
    
    // 返回true表示初始化成功
    return true;
  }
  
  // 切换播放模式
  function toggleMode() {
    // 找出当前模式在数组中的位置
    const currentIndex = modes.indexOf(currentMode);
    
    // 切换到下一个模式，如果到达数组末尾则回到第一个
    currentMode = modes[(currentIndex + 1) % modes.length];
    
    // 更新模式图标
    updateModeIcon();
    
    // 显示提示
    showToast(`已切换为${modeNames[currentMode]}模式`);
    
    console.log(`播放模式切换为: ${currentMode}`);
  }
  
  // 更新模式按钮图标
  function updateModeIcon() {
    const modeIcon = modeButton.querySelector('i');
    
    // 清除所有可能的图标类
    modeIcon.classList.remove('fa-repeat', 'fa-bars', 'fa-shuffle');
    
    // 添加当前模式的图标类
    modeIcon.classList.add(modeIcons[currentMode]);
  }
  
  // 处理下一首歌曲选择逻辑
  function getNextTrackIndex(currentTrack, totalTracks) {
    if (totalTracks <= 0) return -1;
    
    switch(currentMode) {
      case 'repeat':
        // 单曲循环模式，返回当前索引
        return currentTrack;
        
      case 'order':
        // 顺序播放模式，返回下一首索引
        return (currentTrack + 1) % totalTracks;
        
      case 'shuffle':
        // 随机播放模式，随机返回一个不同的索引
        if (totalTracks === 1) return 0;
        
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * totalTracks);
        } while (randomIndex === currentTrack);
        
        return randomIndex;
        
      default:
        return (currentTrack + 1) % totalTracks;
    }
  }
  
  // 处理上一首歌曲选择逻辑
  function getPrevTrackIndex(currentTrack, totalTracks) {
    if (totalTracks <= 0) return -1;
    
    switch(currentMode) {
      case 'repeat':
        // 单曲循环模式，返回当前索引
        return currentTrack;
        
      case 'order':
        // 顺序播放模式，返回上一首索引
        return (currentTrack - 1 + totalTracks) % totalTracks;
        
      case 'shuffle':
        // 随机播放模式，随机返回一个不同的索引
        if (totalTracks === 1) return 0;
        
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * totalTracks);
        } while (randomIndex === currentTrack);
        
        return randomIndex;
        
      default:
        return (currentTrack - 1 + totalTracks) % totalTracks;
    }
  }
  
  // 简单的消息提示函数
  function showToast(message, duration = 2000) {
    // 检查是否已存在toast元素，如果有则移除
    const existingToast = document.querySelector('.music-toast');
    if (existingToast) {
      document.body.removeChild(existingToast);
    }
    
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = 'music-toast';
    toast.textContent = message;
    
    // 设置样式
    const style = toast.style;
    style.position = 'fixed';
    style.top = '120px';
    style.right = '30px';
    style.fontSize = '12px';
    style.backgroundColor = 'rgba(0, 0, 0, 0.24)';
    style.color = 'white';
    style.padding = '10px 10px';
    style.borderRadius = '6px';
    style.zIndex = '1000';
    style.transition = 'opacity 0.5s';
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 显示后延迟消失
    setTimeout(() => {
      toast.style.opacity = '0';
      // 动画结束后移除元素
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 500);
    }, duration);
  }
  
  // 获取当前模式
  function getCurrentMode() {
    return currentMode;
  }
  
  // 设置当前模式
  function setMode(mode) {
    if (modes.includes(mode)) {
      currentMode = mode;
      updateModeIcon();
      return true;
    }
    return false;
  }
  
  // 公开API
  return {
    init,
    getNextTrackIndex,
    getPrevTrackIndex,
    getCurrentMode,
    setMode,
    toggleMode
  };
})();

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化播放模式管理器
  const initialized = PlayModeManager.init();
  if (initialized) {
    console.log('播放模式管理器初始化成功');
  }
});

// 添加到window对象，供其他脚本使用
window.PlayModeManager = PlayModeManager;
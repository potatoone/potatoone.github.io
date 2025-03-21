// 进度条相关功能
let progressInitialized = false;

// 确保不会重复初始化
function initializeProgress() {
  if (progressInitialized) return;
  progressInitialized = true;
  
  console.log('初始化进度条...');
  
  // 获取所有必要元素
  const progressContainer = document.querySelector('.progress-container');
  const progressBar = document.querySelector('.progress-bar');
  const progressHandle = document.querySelector('.progress-handle');
  const currentTimeEl = document.querySelector('.current-time');
  const totalTimeEl = document.querySelector('.total-time');
  const audioPlayer = document.getElementById('audio-player');
  
  // 验证元素是否存在
  if (!progressContainer || !progressBar || !progressHandle) {
    console.error('进度条元素未找到!');
    return;
  }
  
  if (!currentTimeEl || !totalTimeEl) {
    console.error('时间显示元素未找到!');
    return;
  }
  
  if (!audioPlayer) {
    console.error('音频播放器元素未找到!');
    return;
  }
  
  console.log('所有进度条元素已找到');
  
  // 拖拽状态变量
  let isDragging = false;
  
  // 格式化时间函数
  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  }
  
  // 更新进度条UI
  function updateProgressUI() {
    const duration = audioPlayer.duration || 0;
    const currentTime = audioPlayer.currentTime || 0;
    
    if (duration > 0) {
      const percent = (currentTime / duration) * 100;
      progressBar.style.width = percent + '%';
      progressHandle.style.left = percent + '%';
      
      currentTimeEl.textContent = formatTime(currentTime);
      totalTimeEl.textContent = formatTime(duration);
    }
  }
  
  // 点击或拖动进度条
  function handleProgressInteraction(e) {
    const bounds = progressContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - bounds.left, bounds.width));
    const percent = x / bounds.width;
    
    if (audioPlayer.readyState > 0) {
      audioPlayer.currentTime = percent * audioPlayer.duration;
      updateProgressUI();
    }
  }
  
  // 事件监听器
  progressContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleProgressInteraction(e);
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      handleProgressInteraction(e);
    }
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  // 禁止选择文本（防止拖动时选择文本）
  progressContainer.addEventListener('selectstart', (e) => e.preventDefault());
  
  // 监听音频播放进度更新
  audioPlayer.addEventListener('timeupdate', updateProgressUI);
  
  // 音频元数据加载完成后更新总时长
  audioPlayer.addEventListener('loadedmetadata', updateProgressUI);
  
  // 提供给外部的重置方法
  window.resetProgress = function() {
    progressBar.style.width = '0%';
    progressHandle.style.left = '0%';
    currentTimeEl.textContent = '0:00';
    totalTimeEl.textContent = '0:00';
    console.log('进度条已重置');
  };
  
  console.log('进度条初始化完成');
}

// 在DOMContentLoaded之后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProgress);
} else {
  // 如果DOM已加载，立即初始化
  initializeProgress();
}
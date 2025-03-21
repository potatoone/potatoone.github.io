// 音乐播放器核心模块 - 处理音频播放、控制按钮交互和播放状态管理
const MusicPlayer = (() => {
  // 私有变量 - 存储DOM元素引用
  let player,     // 音频元素
      playBtn,    // 播放/暂停按钮
      nextBtn,    // 下一曲按钮
      prevBtn,    // 上一曲按钮
      modeBtn,    // 播放模式按钮
      title;      // 曲目标题元素
  
  /**
   * 初始化播放器
   * 获取DOM元素引用并设置事件监听器
   * @returns {boolean} 初始化是否成功
   */
  function init() {
    // 获取所有必要的DOM元素
    player = document.getElementById('audio-player');
    playBtn = document.getElementById('play');
    nextBtn = document.getElementById('next');
    prevBtn = document.getElementById('prev');
    modeBtn = document.getElementById('mode');
    title = document.querySelector('.control-title');
    
    // 验证所有元素是否存在
    if (!player || !playBtn || !nextBtn || !prevBtn || !modeBtn || !title) return false;
    
    // 设置按钮事件监听
    playBtn.addEventListener('click', togglePlay);          // 播放/暂停切换
    nextBtn.addEventListener('click', () => advanceTrack(true));  // 下一曲
    prevBtn.addEventListener('click', () => advanceTrack(false)); // 上一曲
    modeBtn.addEventListener('click', () => PlayModeManager.toggleMode()); // 切换播放模式
    
    // 设置音频事件监听
    player.addEventListener('ended', () => advanceTrack(true)); // 曲目结束时自动播放下一曲
    player.addEventListener('play', () => updateWave(true));    // 播放时激活波形动画
    player.addEventListener('pause', () => updateWave(false));  // 暂停时停止波形动画
    
    return true;
  }
  
  /**
   * 播放指定曲目
   * @param {HTMLElement} track - 播放列表中的曲目元素
   * @param {number} index - 曲目在播放列表中的索引
   * @param {number} startTime - 开始播放的时间位置(秒)，默认从头开始
   */
  function playTrack(track, index, startTime = 0) {
    // 通知播放列表管理器更新当前播放状态
    if (index !== undefined && window.PlaylistManager) {
      window.PlaylistManager.updatePlayingStatus(index);
    }
    
    // 更新播放器标题显示
    title.textContent = track.querySelector('.track-name').textContent;
    
    // 设置加载中状态
    playBtn.querySelector('i').className = 'fas fa-spinner fa-spin';
    
    // 设置音频源
    player.src = track.getAttribute('data-src');
    
    // 设置加载超时处理 (10秒)
    let timeout = setTimeout(() => {
      playBtn.querySelector('i').className = 'fas fa-play';
      alert('音乐链接加载超时');
    }, 10000);
    
    // 音频加载完成后自动播放
    player.oncanplaythrough = () => {
      clearTimeout(timeout);
      player.play()
        .then(() => {
          // 播放成功 - 更新为暂停图标，激活波形
          playBtn.querySelector('i').className = 'fas fa-pause';
          updateWave(true);
          notifyStateChange(true); // 通知播放状态变化
        })
        .catch(() => {
          // 播放失败 - 恢复播放图标，关闭波形
          playBtn.querySelector('i').className = 'fas fa-play';
          updateWave(false);
          notifyStateChange(false); // 通知播放状态变化
        });
    };
    
    // 音频加载出错处理
    player.onerror = () => {
      clearTimeout(timeout);
      playBtn.querySelector('i').className = 'fas fa-play';
      alert('播放失败，可能是版权限制');
      updateWave(false);
    };
    
    // 设置播放起始位置
    player.currentTime = startTime;
  }
  
  /**
   * 只加载曲目但不播放
   * @param {HTMLElement} track - 播放列表中的曲目元素
   * @param {number} index - 曲目在播放列表中的索引
   * @param {number} startTime - 开始播放的时间位置(秒)，默认从头开始
   */
  function loadTrack(track, index, startTime = 0) {
    // 通知播放列表管理器更新当前播放状态
    if (index !== undefined && window.PlaylistManager) {
      window.PlaylistManager.updatePlayingStatus(index);
    }
    
    // 更新播放器标题显示
    title.textContent = track.querySelector('.track-name').textContent;
    
    // 设置播放按钮状态
    playBtn.querySelector('i').className = 'fas fa-play';
    
    // 设置音频源
    player.src = track.getAttribute('data-src');
    
    // 设置播放位置但不播放
    player.currentTime = startTime;
    
    // 更新波形动画状态
    updateWave(false);
    
    // 通知状态变化
    notifyStateChange(false);
  }
  
  /**
   * 切换播放/暂停状态
   * 如果当前暂停则开始播放，如果正在播放则暂停
   */
  function togglePlay() {
    if (player.paused) {
      // 当前暂停状态 - 开始播放
      player.play()
        .then(() => {
          // 播放成功
          playBtn.querySelector('i').className = 'fas fa-pause';
          updateWave(true);
          notifyStateChange(true); // 通知播放状态变化
        })
        .catch(() => {
          // 播放失败
          playBtn.querySelector('i').className = 'fas fa-play';
          notifyStateChange(false);
        });
    } else {
      // 当前播放状态 - 暂停播放
      player.pause();
      playBtn.querySelector('i').className = 'fas fa-play';
      updateWave(false);
      notifyStateChange(false); // 通知播放状态变化
    }
  }
  
  /**
   * 更新波形动画状态
   * @param {boolean} isPlaying - 当前是否处于播放状态
   */
  function updateWave(isPlaying) {
    // 获取当前播放的曲目索引
    const idx = window.PlaylistManager?.getCurrentTrackIndex() ?? -1;
    if (idx >= 0) {
      // 找到当前播放的列表项
      const el = document.querySelectorAll('#playlist li')[idx];
      const wave = el?.querySelector('.audio-wave');
      if (wave) {
        // 根据播放状态添加或移除active类
        wave.classList[isPlaying ? 'add' : 'remove']('active');
      }
    }
  }
  
  /**
   * 切换到下一首或上一首曲目
   * @param {boolean} next - true表示下一曲，false表示上一曲
   */
  function advanceTrack(next = true) {
    // 检查播放列表管理器是否可用
    if (!window.PlaylistManager) return;
    
    // 获取播放列表总曲目数
    const total = window.PlaylistManager.getTotalTracks();
    if (total === 0) return;
    
    // 获取当前曲目索引
    const current = window.PlaylistManager.getCurrentTrackIndex();
    
    // 根据播放模式决定下一曲目的索引
    const newIdx = next ? 
      PlayModeManager.getNextTrackIndex(current, total) : // 下一曲
      PlayModeManager.getPrevTrackIndex(current, total);  // 上一曲
    
    // 获取并播放新的曲目
    const track = window.PlaylistManager.getTrackElement(newIdx);
    if (track) playTrack(track, newIdx);
  }
  
  /**
   * 获取音频元素的引用
   * @returns {HTMLAudioElement} 音频元素
   */
  function getAudioElement() {
    return player;
  }
  
  /**
   * 通知播放状态变化
   * @param {boolean} isPlaying - 当前是否处于播放状态
   */
  function notifyStateChange(isPlaying) {
    // 通过事件通知播放列表管理器
    window.dispatchEvent(new CustomEvent('musicPlayerStateChange', {
      detail: { isPlaying }
    }));
    
    // 直接调用PlaylistManager的方法
    if (window.PlaylistManager && window.PlaylistManager.setPlayingState) {
      window.PlaylistManager.setPlayingState(isPlaying);
    }
  }
  
  // 公开API - 只暴露必要的方法
  return {
    init,            // 初始化播放器
    playTrack,       // 播放指定曲目
    loadTrack,       // 只加载曲目但不播放
    togglePlay,      // 切换播放/暂停状态
    advanceTrack,    // 切换到下一首/上一首
    getAudioElement  // 获取音频元素引用
  };
})();

// 将播放器添加到全局对象
window.MusicPlayer = MusicPlayer;

// 页面加载完成后初始化播放器
document.addEventListener('DOMContentLoaded', MusicPlayer.init);
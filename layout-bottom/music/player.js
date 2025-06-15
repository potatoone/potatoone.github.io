// 音乐播放器核心模块
const MusicPlayer = (() => {
  // 私有变量
  let player, playBtn, nextBtn, prevBtn, modeBtn, title;
  
  // 初始化
  function init() {
    // 获取DOM元素
    player = document.getElementById('audio-player');
    playBtn = document.getElementById('play');
    nextBtn = document.getElementById('next');
    prevBtn = document.getElementById('prev');
    modeBtn = document.getElementById('mode');
    title = document.querySelector('.control-title');
    
    if (!player || !playBtn || !nextBtn || !prevBtn || !modeBtn || !title) return false;
    
    // 设置事件监听
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', () => advanceTrack(true));
    prevBtn.addEventListener('click', () => advanceTrack(false));
    modeBtn.addEventListener('click', () => PlayModeManager.toggleMode());
    
    // 音频事件
    player.addEventListener('ended', () => advanceTrack(true));
    player.addEventListener('play', () => updateWave(true));
    player.addEventListener('pause', () => updateWave(false));
    player.addEventListener('waiting', () => {
      // 长时间等待才显示加载提示
      let waitTimeout = setTimeout(() => {
        showNotification('加载中，请稍候...');
      }, 5000);
      
      player.addEventListener('playing', () => clearTimeout(waitTimeout), { once: true });
    });
    
    return true;
  }
  
  // 播放曲目
  function playTrack(track, index, startTime = 0) {
    if (!track) return;
    
    // 更新UI
    window.PlaylistManager?.updatePlayingStatus(index);
    title.textContent = track.querySelector('.track-name').textContent;
    playBtn.querySelector('i').className = 'fas fa-spinner fa-spin';
    
    // 设置音频源
    player.src = track.getAttribute('data-src');
    
    // 超时处理
    let timeout = setTimeout(() => {
      handleLoadError('加载超时，切换下一首...');
    }, 20000);

    // 加载完成后播放
    player.oncanplaythrough = () => {
      clearTimeout(timeout);
      player.play()
        .then(() => {
          playBtn.querySelector('i').className = 'fas fa-pause';
          updateWave(true);
          notifyStateChange(true);
        })
        .catch(() => {
          handleLoadError('播放失败，切换下一首...');
        });
    };

    // 错误处理
    player.onerror = () => {
      handleLoadError('播放失败，切换下一首...');
    };

    // 加载失败处理函数
    function handleLoadError(message) {
      clearTimeout(timeout);
      playBtn.querySelector('i').className = 'fas fa-exclamation-circle';
      showNotification(message);
      updateWave(false);
      notifyStateChange(false); // 确保状态同步
      setTimeout(() => advanceTrack(true), 5000);
    }
    
    // 设置起始位置
    player.currentTime = startTime;
  }
    
  // 只加载曲目但不播放
  function loadTrack(track, index, startTime = 0) {
    if (!track) return;
    
    window.PlaylistManager?.updatePlayingStatus(index);
    title.textContent = track.querySelector('.track-name').textContent;
    playBtn.querySelector('i').className = 'fas fa-play';
    player.src = track.getAttribute('data-src');
    player.currentTime = startTime;
    updateWave(false);
    notifyStateChange(false);
  }
  
  // 切换播放/暂停
  function togglePlay() {
    if (player.paused) {
      player.play()
        .then(() => {
          playBtn.querySelector('i').className = 'fas fa-pause';
          updateWave(true);
          notifyStateChange(true);
        })
        .catch(() => {
          playBtn.querySelector('i').className = 'fas fa-play';
          notifyStateChange(false);
        });
    } else {
      player.pause();
      playBtn.querySelector('i').className = 'fas fa-play';
      updateWave(false);
      notifyStateChange(false);
    }
  }
  
  // 更新波形动画
  function updateWave(isPlaying) {
    const idx = window.PlaylistManager?.getCurrentTrackIndex() ?? -1;
    if (idx >= 0) {
      const wave = document.querySelectorAll('#playlist li')[idx]?.querySelector('.audio-wave');
      wave?.classList[isPlaying ? 'add' : 'remove']('active');
    }
  }
  
  // 切换到下一首或上一首
  function advanceTrack(next = true) {
    if (!window.PlaylistManager) return;
    
    const total = window.PlaylistManager.getTotalTracks();
    if (total === 0) return;
    
    const current = window.PlaylistManager.getCurrentTrackIndex();
    const newIdx = next ? 
      PlayModeManager.getNextTrackIndex(current, total) :
      PlayModeManager.getPrevTrackIndex(current, total);
    
    const track = window.PlaylistManager.getTrackElement(newIdx);
    track && playTrack(track, newIdx);
  }
  
  // 通知播放状态变化
  function notifyStateChange(isPlaying) {
    window.dispatchEvent(new CustomEvent('musicPlayerStateChange', {
      detail: { isPlaying }
    }));
    window.PlaylistManager?.setPlayingState?.(isPlaying);
  }
  
  // 显示通知
  function showNotification(message) {
    const existingNotification = document.querySelector('.music-notification');
    existingNotification?.remove();
    
    const notification = document.createElement('div');
    notification.className = 'music-notification';
    notification.innerHTML = `<i class="fas fa-info-circle"></i><span>${message}</span>`;
    
    const control = document.querySelector('.control');
    if (control) {
      control.appendChild(notification);
      setTimeout(() => notification.classList.add('show'), 10);
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
      }, 4000);
    }
  }
  
  // 公开API
  return {
    init,
    playTrack,
    loadTrack,
    togglePlay,
    advanceTrack,
    getAudioElement: () => player
  };
})();

// 初始化
window.MusicPlayer = MusicPlayer;
document.addEventListener('DOMContentLoaded', MusicPlayer.init);
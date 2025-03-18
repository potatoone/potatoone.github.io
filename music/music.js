// 音乐播放器核心模块

// 创建一个MusicPlayer模块
const MusicPlayer = (() => {
  // 私有变量
  let audioPlayer;
  let playButton;
  let nextButton;
  let prevButton;
  
  // 初始化函数
  function init() {
    // 获取DOM元素
    audioPlayer = document.getElementById('audio-player');
    playButton = document.getElementById('play');
    nextButton = document.getElementById('next');
    prevButton = document.getElementById('prev');
    
    if (!audioPlayer || !playButton || !nextButton || !prevButton) {
      console.error('初始化音乐播放器失败：缺少必要的DOM元素');
      return false;
    }
    
    // 设置事件监听器
    setupEventListeners();
    
    return true;
  }
  
  // 设置事件监听器
  function setupEventListeners() {
    // 播放/暂停按钮点击事件
    playButton.addEventListener('click', togglePlay);
    
    // 下一首按钮点击事件
    nextButton.addEventListener('click', function() {
      advanceTrack(true);
    });
    
    // 上一首按钮点击事件
    prevButton.addEventListener('click', function() {
      advanceTrack(false);
    });
    
    // 音频播放结束事件
    audioPlayer.addEventListener('ended', function() {
      if (window.PlayModeManager && window.PlayModeManager.getCurrentMode() === 'repeat') {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
      } else {
        advanceTrack(true);
      }
    });
  }
  
  // 播放指定曲目
  function playTrack(track, index) {
    // 如果传入了索引，更新播放列表中的播放状态
    if (typeof index !== 'undefined' && window.PlaylistManager) {
      window.PlaylistManager.updatePlayingStatus(index);
    }
    
    // 获取音频文件路径
    const audioSrc = track.getAttribute('data-src');
    console.log('正在播放:', audioSrc); // 调试信息
    
    // 重置进度条（如果重置函数存在）
    if (window.resetProgress) {
      window.resetProgress();
    }
    
    // 设置音频源并添加错误处理
    try {
      audioPlayer.src = audioSrc;
      
      // 确保音频加载完毕后再播放
      audioPlayer.oncanplaythrough = function() {
        audioPlayer.play()
          .then(() => {
            console.log('播放成功');
            playButton.querySelector('i').classList.replace('fa-play', 'fa-pause');
          })
          .catch(err => {
            console.error('播放失败:', err);
          });
      };
      
      // 添加错误处理
      audioPlayer.onerror = function() {
        console.error('音频加载失败:', audioPlayer.error);
        alert('无法播放此音频文件，请检查文件路径是否正确');
      };
    } catch (e) {
      console.error('设置音频源时出错:', e);
    }
  }
  
  // 切换播放/暂停状态
  function togglePlay() {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playButton.querySelector('i').classList.replace('fa-play', 'fa-pause');
    } else {
      audioPlayer.pause();
      playButton.querySelector('i').classList.replace('fa-pause', 'fa-play');
    }
  }
  
  // 切换到下一首/上一首
  function advanceTrack(forward = true) {
    if (!window.PlaylistManager) {
      console.error('无法切换曲目：播放列表管理器未初始化');
      return;
    }
    
    const totalTracks = window.PlaylistManager.getTotalTracks();
    if (totalTracks === 0) return;
    
    // 当前曲目索引
    const currentTrack = window.PlaylistManager.getCurrentTrackIndex();
    let nextTrackIndex;
    
    // 根据播放模式确定下一首歌
    if (window.PlayModeManager) {
      if (forward) {
        nextTrackIndex = window.PlayModeManager.getNextTrackIndex(currentTrack, totalTracks);
      } else {
        nextTrackIndex = window.PlayModeManager.getPrevTrackIndex(currentTrack, totalTracks);
      }
    } else {
      // 没有播放模式管理器，使用默认的顺序播放
      if (forward) {
        nextTrackIndex = (currentTrack + 1) % totalTracks;
      } else {
        nextTrackIndex = (currentTrack - 1 + totalTracks) % totalTracks;
      }
    }
    
    // 单曲循环模式且曲目没变，只需重置当前歌曲
    if (window.PlayModeManager && 
        window.PlayModeManager.getCurrentMode() === 'repeat' && 
        nextTrackIndex === currentTrack) {
      audioPlayer.currentTime = 0;
      audioPlayer.play();
      return;
    }
    
    // 获取并播放下一首歌
    const nextTrack = window.PlaylistManager.getTrackElement(nextTrackIndex);
    if (nextTrack) {
      playTrack(nextTrack, nextTrackIndex);
    }
  }
  
  // 公开API
  return {
    init,
    playTrack,
    togglePlay,
    advanceTrack
  };
})();

// 添加到window对象，供其他脚本使用
window.MusicPlayer = MusicPlayer;

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化音乐播放器
  const initialized = MusicPlayer.init();
  if (initialized) {
    console.log('音乐播放器初始化成功');
  }
});
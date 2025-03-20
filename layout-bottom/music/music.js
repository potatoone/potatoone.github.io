// 音乐播放器核心模块

const MusicPlayer = (() => {
  // 私有变量
  let audioPlayer;
  let playButton;
  let nextButton;
  let prevButton;
  let playerTitle;
  
  // 初始化函数
  function init() {
    // 获取DOM元素
    audioPlayer = document.getElementById('audio-player');
    playButton = document.getElementById('play');
    nextButton = document.getElementById('next');
    prevButton = document.getElementById('prev');
    playerTitle = document.querySelector('.player-title');
    
    if (!audioPlayer || !playButton || !nextButton || !prevButton || !playerTitle) {
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
      advanceTrack(true);
    });
  }
  
  // 播放指定曲目
  function playTrack(track, index) {
    // 如果传入了索引，更新播放列表中的播放状态
    if (typeof index !== 'undefined' && window.PlaylistManager) {
      window.PlaylistManager.updatePlayingStatus(index);
    }
    
    // 获取音频文件路径和ID
    const audioSrc = track.getAttribute('data-src');
    const trackId = track.getAttribute('data-id');
    const trackName = track.querySelector('.track-name').textContent;
    
    // 更新播放器标题
    playerTitle.textContent = trackName;
    
    // 设置音频源并添加错误处理
    try {
      // 将播放按钮改为加载状态
      playButton.querySelector('i').className = 'fas fa-spinner fa-spin';
      
      audioPlayer.src = audioSrc;
      
      // 添加加载超时检测
      let loadTimeout = setTimeout(() => {
        console.warn('音频加载超时');
        playButton.querySelector('i').className = 'fas fa-play';
        alert('网易云音乐链接加载超时，请稍后再试');
      }, 10000); // 10秒超时
      
      // 确保音频加载完毕后再播放
      audioPlayer.oncanplaythrough = function() {
        clearTimeout(loadTimeout);
        
        audioPlayer.play()
          .then(() => {
            playButton.querySelector('i').className = 'fas fa-pause';
          })
          .catch(err => {
            console.error('播放失败:', err);
            playButton.querySelector('i').className = 'fas fa-play';
          });
      };
      
      // 添加错误处理
      audioPlayer.onerror = function() {
        clearTimeout(loadTimeout);
        console.error('音频加载失败');
        playButton.querySelector('i').className = 'fas fa-play';
        alert('网易云音乐播放失败，可能是版权限制或链接已过期');
      };
    } catch (e) {
      console.error('设置音频源时出错');
      playButton.querySelector('i').className = 'fas fa-play';
    }
  }
  
  // 切换播放/暂停状态
  function togglePlay() {
    if (audioPlayer.paused) {
      audioPlayer.play()
        .then(() => {
          playButton.querySelector('i').className = 'fas fa-pause';
        })
        .catch(err => {
          console.error('播放失败:', err);
        });
    } else {
      audioPlayer.pause();
      playButton.querySelector('i').className = 'fas fa-play';
    }
  }
  
  // 切换到下一首/上一首
  function advanceTrack(forward = true) {
    if (!window.PlaylistManager) {
      return;
    }
    
    const totalTracks = window.PlaylistManager.getTotalTracks();
    if (totalTracks === 0) return;
    
    // 当前曲目索引
    const currentTrack = window.PlaylistManager.getCurrentTrackIndex();
    let nextTrackIndex;
    
    // 简化的播放模式，只使用顺序播放
    if (forward) {
      nextTrackIndex = (currentTrack + 1) % totalTracks;
    } else {
      nextTrackIndex = (currentTrack - 1 + totalTracks) % totalTracks;
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
  MusicPlayer.init();
});
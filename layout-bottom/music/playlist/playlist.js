// 播放列表管理模块
const PlaylistManager = (() => {
  // 核心变量
  let currentTrack = 0;
  let playlist, playlistToggle;
  let isPlaying = false; // 跟踪播放状态
  const STORAGE_KEY = 'musicPlayerState';
  
  // 网易云音乐源
  const SONGS = [
    { id: 2646148624, name: "Together Till Infinity" },
    { id: 2676045527, name: "花焰照亮的旅途" },
    { id: 2667995012, name: "Find MY Way" },
    { id: 2664858270, name: "流星季 Night" },
    { id: 2667994989, name: "天鹅的祝歌" },
    { id: 2667995042, name: "微风中的绿野" }
  ];
  
  // 初始化
  function init() {
    playlist = document.getElementById('playlist');
    playlistToggle = document.getElementById('playlist-toggle');
    if (!playlist || !playlistToggle) return false;
    
    // 生成列表
    playlist.querySelector('ul').innerHTML = SONGS.map(t => 
      `<li data-src="https://music.163.com/song/media/outer/url?id=${t.id}" data-id="${t.id}">
        <span class="track-name">${t.name}</span>
        <div class="audio-wave"><span></span><span></span><span></span></div>
      </li>`).join('');
    
    setupEvents();
    loadState();
    
    // 播放初始曲目
    setTimeout(() => {
      const tracks = playlist.querySelectorAll('li');
      if (tracks.length > 0 && window.MusicPlayer) {
        const state = getState();
        
        // 根据保存的播放状态决定是否播放
        if (state?.isPlaying) {
          // 如果之前是播放状态，则继续播放
          window.MusicPlayer.playTrack(tracks[currentTrack], currentTrack, state?.playbackTime || 0);
        } else {
          // 仅加载音乐但不自动播放
          window.MusicPlayer.loadTrack(tracks[currentTrack], currentTrack, state?.playbackTime || 0);
        }
      }
    }, 300);
    
    return true;
  }
  
  // 设置事件
  function setupEvents() {
    // 折叠按钮
    playlistToggle.addEventListener('click', () => {
      const expanded = playlist.classList.toggle('expanded');
      playlist.style.maxHeight = expanded ? 
        Math.min(playlist.scrollHeight, window.innerHeight * 0.6) + 'px' : '0';
      
      const icon = playlistToggle.querySelector('i');
      if (icon) icon.className = expanded ? 'fas fa-chevron-circle-up' : 'fas fa-chevron-circle-down';
      saveState();
    });
    
    // 列表点击
    playlist.addEventListener('click', e => {
      let target = e.target;
      while (target !== playlist && target.tagName !== 'LI') {
        target = target.parentNode;
        if (!target) return;
      }
      
      if (target.tagName === 'LI') {
        const index = [...playlist.querySelectorAll('li')].indexOf(target);
        
        if (index === currentTrack && window.MusicPlayer) {
          // 点击当前曲目，切换播放/暂停
          window.MusicPlayer.togglePlay();
          // togglePlay会更新isPlaying状态
        } else if (window.MusicPlayer) {
          // 选择新曲目
          currentTrack = index;
          
          // 根据当前播放状态决定是加载还是播放
          if (isPlaying) {
            // 如果当前是播放状态，则播放新选择的曲目
            window.MusicPlayer.playTrack(target, currentTrack);
          } else {
            // 如果当前是停止状态，则只加载但不播放
            window.MusicPlayer.loadTrack(target, currentTrack);
          }
        }
        
        saveState();
      }
    });
    
    // 监听播放状态变化
    if (window.MusicPlayer) {
      // 监听播放器状态变化
      window.addEventListener('musicPlayerStateChange', e => {
        isPlaying = e.detail.isPlaying;
        saveState();
      });
    }
    
    // 自动保存
    window.addEventListener('beforeunload', saveWithTime);
    setInterval(saveWithTime, 30000);
    
    // 时间更新
    const audio = window.MusicPlayer?.getAudioElement?.();
    if (audio) {
      let timer;
      audio.addEventListener('timeupdate', () => {
        clearTimeout(timer);
        timer = setTimeout(() => saveTime(audio.currentTime), 5000);
      });
      
      // 监听播放/暂停事件以更新状态
      audio.addEventListener('play', () => {
        isPlaying = true;
        saveState();
      });
      
      audio.addEventListener('pause', () => {
        isPlaying = false;
        saveState();
      });
    }
  }
  
  // 状态管理
  function getState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const state = JSON.parse(data);
        return Date.now() - state.timestamp < 86400000 ? state : null;
      }
    } catch (e) {}
    return null;
  }
  
  function saveState() {
    try {
      const state = getState() || {};
      state.currentTrack = currentTrack;
      state.isExpanded = playlist.classList.contains('expanded');
      state.isPlaying = isPlaying; // 保存播放/暂停状态
      state.timestamp = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }
  
  function saveTime(time) {
    try {
      const state = getState() || {};
      state.playbackTime = time;
      state.currentTrack = currentTrack;
      state.isPlaying = isPlaying; // 保存播放/暂停状态
      state.timestamp = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }
  
  function saveWithTime() {
    const audio = window.MusicPlayer?.getAudioElement?.();
    audio && !audio.paused ? saveTime(audio.currentTime) : saveState();
  }
  
  function loadState() {
    try {
      const state = getState();
      if (state) {
        // 恢复曲目和状态
        currentTrack = state.currentTrack || 0;
        isPlaying = state.isPlaying || false; // 恢复播放状态
        
        if (state.isExpanded) {
          playlist.classList.add('expanded');
          playlist.style.maxHeight = Math.min(playlist.scrollHeight, window.innerHeight * 0.6) + 'px';
          const icon = playlistToggle.querySelector('i');
          if (icon) icon.className = 'fas fa-chevron-circle-up';
        } else {
          playlist.classList.remove('expanded');
          playlist.style.maxHeight = '0';
          const icon = playlistToggle.querySelector('i');
          if (icon) icon.className = 'fas fa-chevron-circle-down';
        }
      }
    } catch (e) {
      currentTrack = 0;
      isPlaying = false;
      playlist.classList.remove('expanded');
      playlist.style.maxHeight = '0';
    }
  }
  
  // 更新播放状态
  function updatePlayingStatus(index) {
    playlist.querySelectorAll('li').forEach(t => t.classList.remove('playing'));
    playlist.querySelectorAll('li')[index]?.classList.add('playing');
    currentTrack = index;
    saveState();
  }
  
  // 公开API
  return {
    init,
    updatePlayingStatus,
    getCurrentTrackIndex: () => currentTrack,
    getTotalTracks: () => playlist.querySelectorAll('li').length,
    getTrackElement: (i) => playlist.querySelectorAll('li')[i] || null,
    togglePlaylist: () => playlistToggle.click(),
    savePlayTime: saveTime,
    setPlayingState: (playing) => { isPlaying = playing; saveState(); }
  };
})();

// 初始化
window.PlaylistManager = PlaylistManager;
document.addEventListener('DOMContentLoaded', PlaylistManager.init);
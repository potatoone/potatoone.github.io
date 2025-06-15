// 播放列表管理模块
const PlaylistManager = (() => {
  // 核心变量
  let currentTrack = 0, playlist, playlistToggle, isPlaying = false;
  let SONGS = [], CATEGORIES = [], currentCategory = -1; // -1 表示显示全部
  const STORAGE_KEY = 'musicPlayerState';
  
  // 辅助函数
  const getItems = () => playlist?.querySelectorAll('li') || [];
  const getItem = i => getItems()[i] || null;
  const updateUI = expanded => {
    const categoriesContainer = document.getElementById('playlist-categories');
    if (categoriesContainer) {
      categoriesContainer.style.display = expanded ? 'flex' : 'none';
      categoriesContainer.style.opacity = expanded ? '1' : '0';
      categoriesContainer.style.transform = expanded ? 'translateY(0)' : 'translateY(-10px)';
    }
    
    const icon = playlistToggle?.querySelector('i');
    if (icon) icon.className = expanded ? 'fas fa-angle-up' : 'fas fa-angle-down';
  };

  // 初始化
  function init() {
    playlist = document.getElementById('playlist');
    playlistToggle = document.getElementById('playlist-toggle');
    if (!playlist || !playlistToggle) return false;
    
    fetch('./layout-bottom/music/playlist/music.json')
      .then(response => response.ok ? response.json() : Promise.reject('加载失败'))
      .then(data => {
        if (data?.songs?.length) {
          SONGS = data.songs;
          CATEGORIES = data.categories || [];
          initializePlaylist();
          initCategories();
        } else {
          Promise.reject('格式错误');
        }
      })
      .catch(error => {
        console.error('加载失败:', error);
        playlist.innerHTML = '<div class="playlist-error">无法加载音乐列表</div>';
      });
    
    return true;
  }
  
  // 初始化播放列表
  function initializePlaylist() {
    const ulElement = playlist.querySelector('ul') || document.createElement('ul');
    ulElement.innerHTML = SONGS.map((t, index) => 
      `<li data-src="https://music.163.com/song/media/outer/url?id=${t.id}" data-id="${t.id}" data-index="${index}" data-category="${t.category}">
        <span class="track-name">${t.name}</span>
        <div class="audio-wave"><span></span><span></span><span></span></div>
      </li>`).join('');
    
    if (!playlist.contains(ulElement)) playlist.appendChild(ulElement);
    
    setupEvents();
    loadState();
    
    document.dispatchEvent(new CustomEvent('playlistInitialized'));
    
    setTimeout(() => {
      const state = getState();
      if (getItems().length && window.MusicPlayer) {
        window.MusicPlayer[state?.isPlaying ? 'playTrack' : 'loadTrack'](
          getItem(currentTrack), currentTrack, state?.playbackTime || 0
        );
      }
    }, 300);
  }

  // 初始化分类按钮
  function initCategories() {
    if (!CATEGORIES.length) return;
    
    const categoriesContainer = document.getElementById('playlist-categories');
    if (!categoriesContainer) return;
    
    // 创建全部按钮
    let buttonsHtml = `<button class="category-btn${currentCategory === -1 ? ' active' : ''}" data-category="-1">全部</button>`;

    // 创建分类按钮
    buttonsHtml += CATEGORIES.map((category, index) => 
      `<button class="category-btn${currentCategory === index ? ' active' : ''}" data-category="${index}">${category}</button>`
    ).join('');

    categoriesContainer.innerHTML = buttonsHtml;
    
    // 添加点击事件
    categoriesContainer.addEventListener('click', e => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;
      
      const category = parseInt(btn.dataset.category);
      currentCategory = category;
      
      categoriesContainer.querySelectorAll('.category-btn')
        .forEach(b => b.classList.toggle('active', b === btn));
      
      filterByCategory(category);
      saveState();
    });
  }
  
  // 按分类过滤歌曲
  function filterByCategory(category) {
    getItems().forEach(track => {
      const trackCategory = parseInt(track.dataset.category);
      track.style.display = (category === -1 || trackCategory === category) ? '' : 'none';
    });
    
    playlist.scrollTop = 0;
    handleScroll.call(playlist);
  }
  
  // 设置事件
  function setupEvents() {
    // 基本交互
    playlistToggle.addEventListener('click', togglePlaylist);
    playlist.addEventListener('scroll', handleScroll);
    playlist.addEventListener('click', e => {
      const target = e.target.closest('li');
      if (!target || !window.MusicPlayer) return;
      
      const index = [...getItems()].indexOf(target);
      if (index < 0) return;
      
      if (index === currentTrack) {
        window.MusicPlayer.togglePlay();
      } else {
        currentTrack = index;
        window.MusicPlayer[isPlaying ? 'playTrack' : 'loadTrack'](target, currentTrack);
      }
      
      saveState();
    });
    
    // 状态保存
    window.addEventListener('beforeunload', saveState);
    setInterval(saveWithTime, 30000);
    
    // 播放器状态监听
    if (window.MusicPlayer) {
      window.addEventListener('musicPlayerStateChange', e => {
        isPlaying = e.detail.isPlaying;
        saveState();
      });
      
      const audio = window.MusicPlayer.getAudioElement?.();
      if (audio) {
        let saveTimer;
        audio.addEventListener('timeupdate', () => {
          clearTimeout(saveTimer);
          saveTimer = setTimeout(() => saveTime(audio.currentTime), 5000);
        });
        
        audio.addEventListener('play', () => { isPlaying = true; saveState(); });
        audio.addEventListener('pause', () => { isPlaying = false; saveState(); });
      }
    }
  }
  
  // 切换播放列表显示状态
  function togglePlaylist() {
    const expanded = playlist.classList.toggle('expanded');
    updateUI(expanded);
    
    if (expanded) {
      setTimeout(() => {
        const playing = playlist.querySelector('li.playing');
        playing?.scrollIntoView({behavior: 'smooth', block: 'center'});
      }, 100);
    }
    
    saveState();
  }

  // 滚动处理
  function handleScroll() {
    this.classList.toggle('scrolled', this.scrollTop > 10);
    this.classList.toggle('overflow', 
      this.scrollHeight > this.clientHeight && 
      this.scrollTop + this.clientHeight < this.scrollHeight - 5
    );
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentTrack,
        isExpanded: playlist.classList.contains('expanded'),
        isPlaying,
        currentCategory,
        timestamp: Date.now()
      }));
    } catch (e) {}
  }
  
  function saveTime(time) {
    try {
      const state = getState() || {};
      state.playbackTime = time;
      state.currentTrack = currentTrack;
      state.isPlaying = isPlaying;
      state.timestamp = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }
  
  function saveWithTime() {
    const audio = window.MusicPlayer?.getAudioElement?.();
    audio && !audio.paused ? saveTime(audio.currentTime) : saveState();
  }
  
  // 加载保存的状态
  function loadState() {
    try {
      const state = getState();
      if (!state) return;
      
      currentTrack = state.currentTrack || 0;
      isPlaying = state.isPlaying || false;
      currentCategory = state.hasOwnProperty('currentCategory') ? state.currentCategory : -1;
      
      const expanded = state.isExpanded;
      playlist.classList.toggle('expanded', expanded);
      updateUI(expanded);
      
      expanded && setTimeout(handleScroll.bind(playlist), 300);
    } catch (e) {
      console.error('加载状态失败:', e);
    }
  }
  
  // 公开API
  return {
    init,
    updatePlayingStatus: index => {
      getItems().forEach(t => t.classList.remove('playing'));
      getItem(index)?.classList.add('playing');
      currentTrack = index;
      saveState();
    },
    getCurrentTrackIndex: () => currentTrack,
    getTotalTracks: () => getItems().length,
    getTrackElement: i => getItem(i),
    togglePlaylist,
    savePlayTime: saveTime,
    setPlayingState: playing => { isPlaying = playing; saveState(); },
    filterByCategory: category => {
      currentCategory = category;
      filterByCategory(category);
    },
    getCurrentCategory: () => currentCategory
  };
})();

// 初始化
window.PlaylistManager = PlaylistManager;
document.addEventListener('DOMContentLoaded', PlaylistManager.init);
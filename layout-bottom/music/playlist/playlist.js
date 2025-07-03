const PlaylistManager = (() => {
  let currentTrack = 0, playlist, playlistToggle, isPlaying = false, SONGS = [], CATEGORIES = [], currentCategory = -1;
  const STORAGE_KEY = 'musicPlayerState';

  const getItems = () => playlist?.querySelectorAll('li') || [];
  const getItem = i => getItems()[i] || null;

  function updateUI(expanded) {
    const c = document.getElementById('playlist-categories');
    if (c) {
      c.style.display = expanded ? 'flex' : 'none';
      c.style.opacity = expanded ? '1' : '0';
      c.style.transform = expanded ? 'translateY(0)' : 'translateY(-10px)';
    }
    const icon = playlistToggle?.querySelector('i');
    if (icon) icon.className = expanded ? 'fas fa-angle-up' : 'fas fa-angle-down';
  }

  function init() {
    playlist = document.getElementById('playlist');
    playlistToggle = document.getElementById('playlist-toggle');
    if (!playlist || !playlistToggle) return false;
    fetch('./layout-bottom/music/playlist/music.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data?.songs?.length) {
          SONGS = data.songs;
          CATEGORIES = data.categories || [];
          initializePlaylist();
          window.PlaylistCategories = new PlaylistCategories(CATEGORIES);
        } else {
          playlist.innerHTML = '<div class="playlist-error">无法加载音乐列表</div>';
        }
      })
      .catch(() => playlist.innerHTML = '<div class="playlist-error">无法加载音乐列表</div>');
    document.addEventListener('categoryChange', e => {
      const map = { all: -1, categorie1: 0, categorie2: 1, categorie3: 2 };
      filterByCategory(map[e.detail.category] ?? -1);
      currentCategory = map[e.detail.category] ?? -1;
      saveState();
    });
    setTimeout(() => updateUI(playlist?.classList?.contains('expanded')), 0);
    return true;
  }

  function initializePlaylist() {
    const ul = playlist.querySelector('ul') || document.createElement('ul');
    ul.innerHTML = SONGS.map((t, i) =>
      `<li data-src="https://music.163.com/song/media/outer/url?id=${t.id}" data-id="${t.id}" data-index="${i}" data-category="${t.category}">
         <span class="track-name">${t.name}</span>
         <div class="audio-wave"><span></span><span></span><span></span></div>
       </li>`).join('');
    if (!playlist.contains(ul)) playlist.appendChild(ul);
    setupEvents();
    loadState();
    setTimeout(() => {
      const state = getState();
      if (getItems().length && window.MusicPlayer) {
        window.MusicPlayer[state?.isPlaying ? 'playTrack' : 'loadTrack'](
          getItem(currentTrack), currentTrack, state?.playbackTime || 0
        );
      }
    }, 300);
    updateUI(playlist.classList.contains('expanded'));
  }

  function filterByCategory(category) {
    getItems().forEach(track => {
      track.style.display = (category === -1 || parseInt(track.dataset.category) === category) ? '' : 'none';
    });
    playlist.scrollTop = 0;
    handleScroll.call(playlist);
  }

  function setupEvents() {
    playlistToggle.onclick = togglePlaylist;
    playlist.onscroll = () => handleScroll.call(playlist);
    playlist.onclick = e => {
      const li = e.target.closest('li');
      if (!li || !window.MusicPlayer) return;
      const index = [...getItems()].indexOf(li);
      if (index < 0) return;
      if (index === currentTrack) window.MusicPlayer.togglePlay();
      else {
        currentTrack = index;
        window.MusicPlayer[isPlaying ? 'playTrack' : 'loadTrack'](li, currentTrack);
      }
      saveState();
    };
    window.addEventListener('beforeunload', saveState);
    setInterval(saveWithTime, 30000);
    if (window.MusicPlayer) {
      window.addEventListener('musicPlayerStateChange', e => {
        isPlaying = e.detail.isPlaying;
        saveState();
      });
      const audio = window.MusicPlayer.getAudioElement?.();
      if (audio) {
        let timer;
        audio.addEventListener('timeupdate', () => {
          clearTimeout(timer);
          timer = setTimeout(() => saveTime(audio.currentTime), 5000);
        });
        audio.addEventListener('play', () => { isPlaying = true; saveState(); });
        audio.addEventListener('pause', () => { isPlaying = false; saveState(); });
      }
    }
  }

  function togglePlaylist() {
    const expanded = playlist.classList.toggle('expanded');
    updateUI(expanded);
    if (expanded) setTimeout(() => playlist.querySelector('li.playing')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    saveState();
  }

  function handleScroll() {
    this.classList.toggle('scrolled', this.scrollTop > 10);
    this.classList.toggle('overflow',
      this.scrollHeight > this.clientHeight &&
      this.scrollTop + this.clientHeight < this.scrollHeight - 5
    );
  }

  function getState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const state = JSON.parse(data);
        return Date.now() - state.timestamp < 86400000 ? state : null;
      }
    } catch {}
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
    } catch {}
  }

  function saveTime(time) {
    try {
      const state = getState() || {};
      state.playbackTime = time;
      state.currentTrack = currentTrack;
      state.isPlaying = isPlaying;
      state.timestamp = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  function saveWithTime() {
    const audio = window.MusicPlayer?.getAudioElement?.();
    audio && !audio.paused ? saveTime(audio.currentTime) : saveState();
  }

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
    } catch {}
  }

  return {
    init,
    updatePlayingStatus: i => {
      getItems().forEach(t => t.classList.remove('playing'));
      getItem(i)?.classList.add('playing');
      currentTrack = i;
      saveState();
    },
    getCurrentTrackIndex: () => currentTrack,
    getTotalTracks: () => getItems().length,
    getTrackElement: i => getItem(i),
    togglePlaylist,
    savePlayTime: saveTime,
    setPlayingState: p => { isPlaying = p; saveState(); },
    filterByCategory: index => {
      currentCategory = index;
      filterByCategory(index);
    },
    getCurrentCategory: () => currentCategory
  };
})();

window.PlaylistManager = PlaylistManager;
document.addEventListener('DOMContentLoaded', PlaylistManager.init);
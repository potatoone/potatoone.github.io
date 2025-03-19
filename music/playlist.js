// 播放列表管理模块

const PlaylistManager = (() => {
  // 私有变量
  let MP3_FILES = [];
  let currentTrack = 0;
  
  // DOM元素引用
  let playlist, playlistToggle, audioPlayer;
  
  // 初始化函数
  function init() {
    // 获取DOM元素
    playlist = document.getElementById('playlist');
    playlistToggle = document.getElementById('playlist-toggle');
    audioPlayer = document.getElementById('audio-player');
    
    if (!playlist || !playlistToggle || !audioPlayer) {
      console.error('初始化播放列表管理器失败：缺少必要的DOM元素');
      return false;
    }
    
    // 设置事件监听器
    setupEventListeners();
    
    // 加载音乐文件列表
    loadMusicFiles();
    
    // 初始化播放列表状态
    playlist.classList.remove('expanded');
    playlist.style.maxHeight = '0';
    
    // 确保初始图标正确（向下）
    const toggleIcon = playlistToggle.querySelector('i');
    if (toggleIcon && toggleIcon.classList.contains('fa-chevron-circle-up')) {
      toggleIcon.classList.replace('fa-chevron-circle-up', 'fa-chevron-circle-down');
    }
    
    return true;
  }
  
  // 设置事件监听器
  function setupEventListeners() {
    // 播放列表折叠/展开按钮点击事件
    playlistToggle.addEventListener('click', togglePlaylist);
    
    // 播放列表项点击事件
    playlist.addEventListener('click', function(e) {
      let target = e.target;
      
      // 如果点击的是音频波形或其中的span元素，需要向上查找到li元素
      while (target !== this && target.tagName !== 'LI') {
        target = target.parentNode;
      }
      
      if (target !== this && target.tagName === 'LI') {
        const tracks = playlist.querySelectorAll('li');
        currentTrack = Array.from(tracks).indexOf(target);
        
        // 通知播放器播放选中的曲目
        if (window.MusicPlayer) {
          window.MusicPlayer.playTrack(target, currentTrack);
        }
      }
    });
  }
  
  // 加载音乐文件列表
  function loadMusicFiles() {
    fetch('./music/music.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('无法加载音乐文件列表');
        }
        return response.json();
      })
      .then(data => {
        MP3_FILES = data.musicFiles;
        // 加载完成后生成播放列表
        generatePlaylist();
        
        // 初始化第一首歌
        const tracks = playlist.querySelectorAll('li');
        if (tracks.length > 0 && window.MusicPlayer) {
          window.MusicPlayer.playTrack(tracks[0], 0);
        }
      })
      .catch(error => {
        console.error('加载音乐文件列表失败:', error);
        // 提供一些默认的MP3文件列表
        MP3_FILES = [
          { name: "默认音乐1", src: "./music/file/default1.mp3" },
          { name: "默认音乐2", src: "./music/file/default2.mp3" }
        ];
        generatePlaylist();
      });
  }
  
  // 生成播放列表
  function generatePlaylist() {
    const playlistUl = playlist.querySelector('ul');
    if (!playlistUl) {
      console.error('未找到播放列表容器');
      return;
    }
    
    playlistUl.innerHTML = ''; // 清空现有列表
    
    MP3_FILES.forEach((track, index) => {
      const li = document.createElement('li');
      li.setAttribute('data-src', track.src);
      
      // 创建一个包含名称的span和波形的结构
      const nameSpan = document.createElement('span');
      nameSpan.className = 'track-name';
      nameSpan.textContent = track.name || getFileNameFromPath(track.src);
      
      const waveDiv = document.createElement('div');
      waveDiv.className = 'audio-wave';
      waveDiv.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
      `;
      
      // 将它们添加到li元素中
      li.appendChild(nameSpan);
      li.appendChild(waveDiv);
      
      // 添加到播放列表
      playlistUl.appendChild(li);
    });
  }
  
  // 从文件路径中提取文件名
  function getFileNameFromPath(path) {
    if (!path) return "未知歌曲";
    
    // 去除路径，只保留文件名
    const filename = path.split('/').pop().split('\\').pop();
    
    // 去除扩展名
    return filename.replace(/\.[^/.]+$/, "");
  }
  
  // 切换播放列表展开/折叠
  function togglePlaylist() {
    if (playlist.classList.contains('expanded')) {
      playlist.style.maxHeight = '0';
      playlistToggle.querySelector('i').classList.replace('fa-chevron-circle-up', 'fa-chevron-circle-down');
    } else {
      // 计算播放列表最大高度，限制为视口高度的60%
      const maxHeight = Math.min(playlist.scrollHeight, window.innerHeight * 0.6);
      playlist.style.maxHeight = maxHeight + 'px';
      playlistToggle.querySelector('i').classList.replace('fa-chevron-circle-down', 'fa-chevron-circle-up');
    }
    playlist.classList.toggle('expanded');
  }
  
  // 更新播放状态
  function updatePlayingStatus(index) {
    const tracks = playlist.querySelectorAll('li');
    
    // 移除所有tracks的playing类
    tracks.forEach(track => track.classList.remove('playing'));
    
    // 为当前播放的添加playing类
    if (tracks[index]) {
      tracks[index].classList.add('playing');
    }
    
    // 更新当前曲目索引
    currentTrack = index;
  }
  
  // 获取当前曲目索引
  function getCurrentTrackIndex() {
    return currentTrack;
  }
  
  // 设置当前曲目索引
  function setCurrentTrackIndex(index) {
    if (index >= 0 && playlist.querySelectorAll('li').length > index) {
      currentTrack = index;
      return true;
    }
    return false;
  }
  
  // 获取曲目总数
  function getTotalTracks() {
    return playlist.querySelectorAll('li').length;
  }
  
  // 获取指定索引的曲目元素
  function getTrackElement(index) {
    const tracks = playlist.querySelectorAll('li');
    return tracks[index] || null;
  }
  
  // 公开API
  return {
    init,
    updatePlayingStatus,
    getCurrentTrackIndex,
    setCurrentTrackIndex,
    getTotalTracks,
    getTrackElement,
    togglePlaylist
  };
})();

// 添加到window对象，供其他脚本使用
window.PlaylistManager = PlaylistManager;

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化播放列表管理器
  const initialized = PlaylistManager.init();
  if (initialized) {
    console.log('播放列表管理器初始化成功');
  }
});
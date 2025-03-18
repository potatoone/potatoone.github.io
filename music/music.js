let audioPlayer = document.getElementById('audio-player');
let playButton = document.getElementById('play');
let nextButton = document.getElementById('next');
let prevButton = document.getElementById('prev');
let modeButton = document.getElementById('mode');
let playlist = document.getElementById('playlist');
let playlistToggle = document.getElementById('playlist-toggle');

const playerControls = document.getElementById('player-controls');
const playerTitle = document.getElementById('player-title');

let currentTrack = 0;
let playMode = 'repeat'; // 'repeat', 'shuffle', 'order'
const modes = ['repeat', 'shuffle', 'order'];
const modeIcons = { repeat: 'sync-alt', shuffle: 'random', order: 'list-ol' };

// MP3文件列表从JSON文件加载
let MP3_FILES = [];

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
      if (tracks.length > 0) {
        playTrack(tracks[0]);
      }
    })
    .catch(error => {
      console.error('加载音乐文件列表失败:', error);
      generatePlaylist();
    });
}

// 修改生成播放列表函数
function generatePlaylist() {
  const playlistUl = playlist.querySelector('ul');
  playlistUl.innerHTML = ''; // 清空现有列表
  
  MP3_FILES.forEach((track, index) => {
    const li = document.createElement('li');
    li.setAttribute('data-src', track.src);
    
    // 创建一个包含名称的span和波形的结构
    const nameSpan = document.createElement('span');
    nameSpan.className = 'track-name';
    nameSpan.textContent = track.name;
    
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

// 修复的playTrack函数，添加错误处理和调试信息
function playTrack(track) {
  // 移除之前的高亮
  const allTracks = playlist.querySelectorAll('li');
  allTracks.forEach(t => t.classList.remove('playing'));
  
  // 添加当前播放高亮
  track.classList.add('playing');
  
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

function togglePlaylist() {
  if (playlist.classList.contains('expanded')) {
    playlist.style.maxHeight = '0';
    playlistToggle.querySelector('i').classList.replace('fa-chevron-circle-up', 'fa-chevron-circle-down');
  } else {
    // 计算60%视口高度
    const maxHeight = Math.min(playlist.scrollHeight, window.innerHeight * 0.7);
    playlist.style.maxHeight = maxHeight + 'px';
    playlistToggle.querySelector('i').classList.replace('fa-chevron-circle-down', 'fa-chevron-circle-up');
  }
  playlist.classList.toggle('expanded');
}

// 修复click事件，确保正确地处理点击事件
playlist.addEventListener('click', function(e) {
  let target = e.target;
  
  // 如果点击的是音频波形或其中的span元素，需要向上查找到li元素
  while (target !== this && target.tagName !== 'LI') {
    target = target.parentNode;
  }
  
  if (target !== this && target.tagName === 'LI') {
    playTrack(target);
    currentTrack = Array.from(playlist.querySelectorAll('li')).indexOf(target);
  }
});

playButton.addEventListener('click', togglePlay);

nextButton.addEventListener('click', function() {
  advanceTrack(true);
});

prevButton.addEventListener('click', function() {
  advanceTrack(false);
});

playlistToggle.addEventListener('click', togglePlaylist);

modeButton.addEventListener('click', cycleMode);

function cycleMode() {
  playMode = modes[(modes.indexOf(playMode) + 1) % modes.length];
  modeButton.querySelector('i').classList.replace(modeIcons[modes[modes.indexOf(playMode) - 1]], modeIcons[playMode]);
}

// 修改DOMContentLoaded事件处理函数
document.addEventListener('DOMContentLoaded', function() {
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
});

function advanceTrack(forward) {
  const tracks = Array.from(playlist.querySelectorAll('li'));
  
  if (playMode === 'shuffle') {
    // 随机播放
    currentTrack = Math.floor(Math.random() * tracks.length);
  } else {
    // 顺序播放
    currentTrack = forward ? (currentTrack + 1) % tracks.length : (currentTrack - 1 + tracks.length) % tracks.length;
  }
  
  playTrack(tracks[currentTrack]);
}

audioPlayer.addEventListener('ended', function() {
  if (playMode === 'repeat') {
    audioPlayer.currentTime = 0;
    audioPlayer.play();
  } else {
    advanceTrack(true);
  }
});

function togglePlay() {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playButton.querySelector('i').classList.replace('fa-play', 'fa-pause');
  } else {
    audioPlayer.pause();
    playButton.querySelector('i').classList.replace('fa-pause', 'fa-play');
  }
}

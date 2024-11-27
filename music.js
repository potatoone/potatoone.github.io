let audioPlayer = document.getElementById('audio-player');
let playButton = document.getElementById('play');
let nextButton = document.getElementById('next');
let prevButton = document.getElementById('prev');
let modeButton = document.getElementById('mode');

let progressBar = document.getElementById('progress-bar');

let playlist = document.getElementById('playlist');
let playlistToggle = document.getElementById('playlist-toggle');

let currentTrack = 0;
let playMode = 'repeat'; // 'repeat', 'shuffle', 'order'
const modes = ['repeat', 'shuffle', 'order'];
const modeIcons = { repeat: 'sync-alt', shuffle: 'random', order: 'list-ol' };

function playTrack(track) {
    audioPlayer.src = track.getAttribute('data-src');
    audioPlayer.play();
    updateProgressBar();
}

playButton.addEventListener('click', togglePlay);

nextButton.addEventListener('click', function() {
    advanceTrack(true);
});

prevButton.addEventListener('click', function() {
    advanceTrack(false);
});

function advanceTrack(forward) {
    let tracks = Array.from(playlist.children);
    currentTrack = forward ? (currentTrack + 1) % tracks.length : (currentTrack - 1 + tracks.length) % tracks.length;
    if (playMode === 'shuffle') {
        while (tracks[currentTrack] === playlist.children[currentTrack]) {
            currentTrack = forward ? (currentTrack + 1) % tracks.length : (currentTrack - 1 + tracks.length) % tracks.length;
        }
    }
    playTrack(tracks[currentTrack]);
}

playlistToggle.addEventListener('click', togglePlaylist);

function togglePlaylist() {
    playlist.style.maxHeight = playlist.classList.contains('expanded') ? '0' : playlist.scrollHeight + 'px';
    playlistToggle.querySelector('i').classList.toggle('fa-chevron-circle-down');
    playlistToggle.querySelector('i').classList.toggle('fa-chevron-circle-up');
    playlist.classList.toggle('expanded');
}

playlist.addEventListener('click', function(e) {
    if (e.target.tagName === 'LI') {
        playTrack(e.target);
        currentTrack = Array.from(playlist.children).indexOf(e.target);
    }
});

modeButton.addEventListener('click', cycleMode);

function cycleMode() {
    playMode = modes[(modes.indexOf(playMode) + 1) % modes.length];
    modeButton.querySelector('i').classList.replace(modeIcons[modes[modes.indexOf(playMode) - 1]], modeIcons[playMode]);
}

playTrack(playlist.children[0]);

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
        playButton.querySelector('i').classList.replace('fa-play').add('fa-pause');
    } else {
        audioPlayer.pause();
        playButton.querySelector('i').classList.replace('fa-pause').add('fa-play');
    }
}

function updateProgressBar() {
    progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
}

audioPlayer.addEventListener('timeupdate', updateProgressBar);
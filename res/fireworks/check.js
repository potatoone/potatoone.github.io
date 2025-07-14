
// 检查并切换烟花显示
function checkAndToggleFireworks() {
  if (!window.MusicPlayer || !window.PlaylistManager || !window.toggleFireworks) return;

  const currentIndex = window.PlaylistManager.getCurrentTrackIndex();
  const audio = window.MusicPlayer.getAudioElement();
  const isPlaying = audio && !audio.paused;

  if (!isPlaying) {
    window.toggleFireworks(false);
    return;
  }

  const trackElement = window.PlaylistManager.getTrackElement(currentIndex);
  if (!trackElement) {
    window.toggleFireworks(false);
    return;
  }

  const trackId = trackElement.getAttribute('data-id');
  if (trackId === '2676045527') {
    console.log('正在播放"花焰照亮的旅途"，显示烟花效果');
    window.toggleFireworks(true);
  } else {
    window.toggleFireworks(false);
  }
}

// 添加事件监听，确保监听只注册一次
document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('musicPlayerStateChange', checkAndToggleFireworks);
  setInterval(checkAndToggleFireworks, 2000);
});

const Loader = {
  container: document.querySelector('.loader-container'),
  loader: document.querySelector('.loader'),
  minShowTime: 1700, // 最小显示时间（毫秒），确保动画至少播放1.5秒
  startTime: 0, // 记录开始时间

  init() {
    if (!this.container || !this.loader) return;

    // 页面初始加载时：强制显示至少 minShowTime 时间
    this.startTime = Date.now(); // 记录开始时间
    window.addEventListener('load', () => {
      const elapsed = Date.now() - this.startTime;
      // 如果加载太快，补足剩余时间再隐藏
      const delay = elapsed < this.minShowTime ? this.minShowTime - elapsed : 0;
      setTimeout(() => this.hide(), delay);
    });
  },

  show() {
    if (this.container) {
      this.container.classList.remove('hidden');
      this.startTime = Date.now(); // 每次显示都重置开始时间
    }
  },

  hide() {
    if (this.container) {
      this.container.classList.add('hidden');
    }
  },

  // 刷新时强制显示足够时间
  refresh() {
    this.show();
    // 强制等待 minShowTime 后再隐藏（无论实际加载速度）
    setTimeout(() => this.hide(), this.minShowTime);
  }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  Loader.init();
});
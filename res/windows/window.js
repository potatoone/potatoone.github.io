// Windows 风格窗口管理器类，管理多窗口的创建、切换、拖动等功能
class WindowManager {
  constructor() {
    this.windows = [];     // 存放所有打开的窗口对象（包括元素和相关信息）
    this.zIndex = 9000;    // 初始化最高层级，用于控制窗口的叠放顺序

    // 创建窗口容器，用来承载所有窗口元素
    this.container = this.createEl('div', 'window-container', document.body);
    // 创建任务栏及其内部容器，用于显示打开窗口的图标
    this.taskbar = this.createEl('div', 'taskbar', document.body);
    this.taskbarItems = this.createEl('div', 'taskbar-items', this.taskbar);

    // 全局点击监听，处理链接点击打开新窗口逻辑
    document.addEventListener('click', this.handleLinkClick.bind(this));
    // 监听鼠标按下事件，判断点击是否在窗口内部，进行窗口激活（聚焦）
    document.addEventListener('mousedown', e => {
      const win = e.target.closest('.window');
      if (win) this.focusWindow(win.id);
    });
  }

  // 通用创建DOM元素并添加class，附加到指定父元素
  createEl(tag, className, parent) {
    const el = document.createElement(tag);
    el.className = className;
    if (parent) parent.appendChild(el);
    return el;
  }

  // 处理点击链接打开新窗口，排除一些特殊情况（如 target=_self 或带data-no-window）
  handleLinkClick(e) {
    const link = e.target.closest('a');
    if (!link
      || link.getAttribute('target') === '_self'
      || link.hasAttribute('data-no-window')
      || link.href.startsWith('javascript:')) return;

    e.preventDefault(); // 阻止默认跳转

    // 读取链接地址和标题，调用 createWindow 创建新窗口
    const url = link.href;
    const title = link.getAttribute('title') || link.textContent || url;
    this.createWindow(url, title, this.getFavicon(url));
  }

  // 根据url匹配，返回对应窗口标题图标的class（fontawesome图标类）
  getFavicon(url) {
    if (/wiki|book/.test(url)) return 'fas fa-book-open';
    if (/nav|guide|compass/.test(url)) return 'fas fa-compass';
    if (/music|song|audio/.test(url)) return 'fas fa-music';
    if (/photo|image|gallery|huaban/.test(url)) return 'fas fa-images';
    return 'fas fa-globe'; // 默认地球图标
  }

  // 创建窗口，传入url、标题、图标class及其他选项
  createWindow(url, title, iconClass = 'fas fa-globe', opts = {}) {
    // 生成唯一窗口id
    const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    // 创建窗口外层容器，添加样式及定位、大小，层级控制
    const win = this.createEl('div', 'window', this.container);

    // ========== 核心修改：窗口位置计算（横向堆叠） ==========
    // 检测是否为移动端（屏幕宽度小于768px）
    const isMobile = window.innerWidth < 768;
    let windowX = 0;
    let windowY = 0;

    if (isMobile) {
      // 移动端：始终居中显示
      const winWidth = opts.width || 850;
      const winHeight = opts.height || 550;
      windowX = (window.innerWidth - winWidth) / 2 + 'px';
      windowY = (window.innerHeight - winHeight) / 2 + 'px';
    } else {
      // 桌面端：从左到右纯横向堆叠
      // 基础位置（所有窗口的垂直位置固定）
      const baseY = 50; // 垂直方向固定在50px位置
      const baseX = 50; // 第一个窗口的水平起始位置
      // 每个新窗口的水平偏移增量（仅横向偏移）
      const horizontalStep = 30;
      // 当前已打开的窗口数量（决定横向偏移量）
      const windowCount = this.windows.length;

      // 计算横向堆叠位置（仅X轴偏移，Y轴固定）
      windowX = baseX + (windowCount * horizontalStep) + 'px';
      windowY = baseY + 'px'; // 垂直方向无偏移，保持固定

      // 边界检测：防止窗口超出屏幕范围（重点检测水平方向）
      const winWidth = opts.width || 800;
      const maxX = window.innerWidth - winWidth - 50; // 保留右侧50px边距
      if (parseInt(windowX) > maxX) {
        windowX = maxX + 'px'; // 超出则固定在最右侧
      }
    }

    // 合并样式（优先使用opts传入的位置，没有则使用计算出的横向堆叠/居中位置）
    Object.assign(win.style, {
      width: `${opts.width || 850}px`,
      height: `${opts.height || 550}px`,
      left: opts.x || windowX,  // 横向堆叠的X坐标
      top: opts.y || windowY,   // 固定的Y坐标
      zIndex: this.zIndex++,
    });
    // ========== 核心修改结束 ==========

    win.id = id;

    // 创建窗口头部：包含图标、标题、控制按钮（最小化/最大化/关闭）
    const header = this.createEl('div', 'window-header', win);
    const titleEl = this.createEl('div', 'window-title', header);
    titleEl.innerHTML = `<i class='${iconClass}' style='margin-right:8px'></i><span>${title}</span>`;

    // 创建窗口控制按钮区域
    const controls = this.createEl('div', 'window-controls', header);
    ['minimize', 'maximize', 'close'].forEach(type => {
      const btn = this.createEl('div', `window-button ${type}`, controls);
      btn.addEventListener('click', () => this[`${type}Window`](id));
    });

    // 创建窗口内容区域，先显示加载动画，后加载iframe内容
    const body = this.createEl('div', 'window-body', win);
    const loader = this.createEl('div', 'window-loading', body);
    loader.innerHTML = `<div class='spinner'></div><div>正在加载...</div>`;

    // iframe承载网页内容，初始透明，加载完成后显示
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.opacity = '0';
    iframe.onload = () => {
      loader.remove();
      iframe.style.opacity = '1';
      try {
        // 尝试同步iframe内网页title更新窗口标题和任务栏提示
        const newTitle = iframe.contentDocument?.title;
        if (newTitle) {
          titleEl.querySelector('span').textContent = newTitle;
          const taskItem = document.getElementById(`taskbar-${id}`);
          if (taskItem) taskItem.title = newTitle;
        }
      } catch { }
    };
    body.appendChild(iframe);

    // 添加对应的任务栏按钮
    this.addTaskbarItem(id, title, iconClass);

    // 记录窗口信息，便于管理
    this.windows.push({ id, el: win, iframe, header });

    // 根据当前窗口状态更新任务栏显示
    this.updateTaskbar();

    // 启用拖动功能
    this.setupDrag(id);

    // 激活新窗口（置顶高亮）
    this.focusWindow(id);

    // 异步添加显示动画类，触发CSS动画效果
    setTimeout(() => win.classList.add('visible'), 10);
  }

  // 添加任务栏按钮，点击切换窗口最小化/恢复
  addTaskbarItem(id, title, iconClass) {
    const item = this.createEl('div', 'taskbar-item', this.taskbarItems);
    item.id = `taskbar-${id}`;
    item.title = title;
    item.innerHTML = `<i class='${iconClass}'></i>`;
    item.addEventListener('click', () => {
      const win = this.windows.find(w => w.id === id)?.el;
      if (!win) return;
      win.classList.contains('minimized') ? this.restoreWindow(id) : this.minimizeWindow(id);
    });
  }

  // 给窗口头部绑定拖拽事件，实现拖动
  setupDrag(id) {
    const win = this.windows.find(w => w.id === id)?.el;
    const header = win.querySelector('.window-header');
    let offsetX = 0, offsetY = 0;

    header.onmousedown = e => {
      if (win.classList.contains('maximized')) return; // 最大化时不允许拖动
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;

      // 鼠标移动时更新窗口位置
      document.onmousemove = e => {
        win.style.left = `${e.clientX - offsetX}px`;
        win.style.top = `${e.clientY - offsetY}px`;
      };

      // 鼠标松开时停止拖动事件
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  }

  // 聚焦窗口，置顶并高亮任务栏对应按钮
  focusWindow(id) {
    this.windows.forEach(w => {
      w.el.classList.remove('active');
      document.getElementById(`taskbar-${w.id}`)?.classList.remove('active');
    });
    const win = this.windows.find(w => w.id === id);
    if (win) {
      win.el.classList.add('active');
      win.el.style.zIndex = this.zIndex++;
      document.getElementById(`taskbar-${id}`)?.classList.add('active');
    }
  }

  // 窗口最小化（隐藏窗口）
  minimizeWindow(id) {
    const win = this.windows.find(w => w.id === id)?.el;
    if (win) win.classList.add('minimized');
  }

  // 恢复窗口显示（取消最小化），并激活
  restoreWindow(id) {
    const win = this.windows.find(w => w.id === id)?.el;
    if (win) {
      win.classList.remove('minimized');
      this.focusWindow(id);
    }
  }

  // 最大化窗口（切换最大化状态）
  maximizeWindow(id) {
    const win = this.windows.find(w => w.id === id)?.el;
    if (win) win.classList.toggle('maximized');
  }

  // 关闭窗口，移除对应DOM和任务栏按钮，更新管理状态
  closeWindow(id) {
    const index = this.windows.findIndex(w => w.id === id);
    if (index >= 0) {
      const win = this.windows[index].el;
      win.classList.remove('visible'); // 触发关闭动画（CSS中控制）
      setTimeout(() => win.remove(), 200); // 延迟移除DOM，动画完成后
      document.getElementById(`taskbar-${id}`)?.remove();
      this.windows.splice(index, 1);
      this.updateTaskbar();
    }
  }

  // 更新任务栏状态，打开窗口时显示任务栏，全部关闭时隐藏
  updateTaskbar() {
    this.taskbar.classList.toggle('active', this.windows.length > 0);
  }
}

// 页面加载完成后实例化窗口管理器，支持URL参数打开窗口
window.addEventListener('DOMContentLoaded', () => {
  window.windowManager = new WindowManager();
  const p = new URLSearchParams(location.search);
  const openUrl = p.get('openWindow');
  if (openUrl) {
    window.windowManager.createWindow(decodeURIComponent(openUrl), p.get('title') || '新窗口');
  }
});

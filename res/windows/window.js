// Windows风格窗口管理器

class WindowManager {
    constructor() {
      this.windows = [];
      this.zIndex = 9000;
      this.init();
    }
    
    init() {
      // 创建窗口容器
      this.container = document.createElement('div');
      this.container.className = 'window-container';
      document.body.appendChild(this.container);
      
      // 创建任务栏 - 放在sentence旁边
      this.taskbar = document.createElement('div');
      this.taskbar.className = 'taskbar';
      
      this.taskbarItems = document.createElement('div');
      this.taskbarItems.className = 'taskbar-items';
      this.taskbar.appendChild(this.taskbarItems);
      
      document.body.appendChild(this.taskbar);
      
      // 拦截链接点击
      this.setupLinkInterception();
      
      // 添加全局事件处理
      document.addEventListener('mousedown', this.handleGlobalMouseDown.bind(this));
    }
    
    setupLinkInterception() {
      // 拦截所有链接点击
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        // 排除特定链接
        if (link.getAttribute('target') === '_self' || 
            link.hasAttribute('data-no-window') ||
            link.href.startsWith('javascript:')) {
          return;
        }
        
        // 获取链接URL和标题
        const url = link.href;
        const title = link.getAttribute('title') || link.textContent || url;
        const favicon = link.querySelector('img')?.src || this.getFavicon(url);
        
        // 创建窗口
        this.createWindow(url, title, favicon);
        
        // 阻止默认行为
        e.preventDefault();
      });
    }
    // 完成getFavicon方法，确保返回正确的图标类
    getFavicon(url) {
      // 使用页面上已有的四个Font Awesome图标
      let iconClass = 'fas fa-globe'; // 默认图标
      
      if (url.includes('wiki') || url.includes('book')) {
        iconClass = 'fas fa-book-open'; // Wiki图标
      } else if (url.includes('nav') || url.includes('guide') || url.includes('compass')) {
        iconClass = 'fas fa-compass'; // 导航图标
      } else if (url.includes('music') || url.includes('song') || url.includes('audio')) {
        iconClass = 'fas fa-music'; // 音乐图标
      } else if (url.includes('photo') || url.includes('image') || url.includes('gallery') || url.includes('huaban')) {
        iconClass = 'fas fa-images'; // 图片图标
      }
      
      return iconClass; // 返回图标类名
    }
    
    createWindow(url, title, favicon = '/windows/icons.svg', options = {}) {
      const defaultOptions = {
        width: 800,
        height: 600,
        x: Math.max(50, Math.random() * (window.innerWidth - 800 - 50)),
        y: Math.max(50, Math.random() * (window.innerHeight - 600 - 50))
      };
      
      const opts = { ...defaultOptions, ...options };
      
      // 创建窗口元素
      const windowEl = document.createElement('div');
      windowEl.className = 'window';
      windowEl.style.width = `${opts.width}px`;
      windowEl.style.height = `${opts.height}px`;
      windowEl.style.left = `${opts.x}px`;
      windowEl.style.top = `${opts.y}px`;
      windowEl.style.zIndex = this.zIndex++;
      
      // 窗口ID
      const windowId = `window-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      windowEl.id = windowId;
      
      // 窗口标题栏
      const header = document.createElement('div');
      header.className = 'window-header';
      
      const titleEl = document.createElement('div');
      titleEl.className = 'window-title';
      
      // 使用Font Awesome图标替代图片
      const iconClass = this.getFavicon(url);
      const faviconEl = document.createElement('i');
      faviconEl.className = iconClass;
      faviconEl.style.marginRight = '8px';
      titleEl.appendChild(faviconEl);
      
      const titleText = document.createElement('span');
      titleText.textContent = title;
      titleEl.appendChild(titleText);
      
      header.appendChild(titleEl);
      
      // 窗口控制按钮 - 使用FontAwesome图标
      const controls = document.createElement('div');
      controls.className = 'window-controls';
      
      const minimizeBtn = document.createElement('div');
      minimizeBtn.className = 'window-button minimize';
      minimizeBtn.addEventListener('click', () => this.minimizeWindow(windowId));
      
      const maximizeBtn = document.createElement('div');
      maximizeBtn.className = 'window-button maximize';
      maximizeBtn.addEventListener('click', () => this.toggleMaximize(windowId));
      
      const closeBtn = document.createElement('div');
      closeBtn.className = 'window-button close';
      closeBtn.addEventListener('click', () => this.closeWindow(windowId));
      
      controls.appendChild(minimizeBtn);
      controls.appendChild(maximizeBtn);
      controls.appendChild(closeBtn);
      header.appendChild(controls);
      
      windowEl.appendChild(header);
      
      // 窗口内容
      const body = document.createElement('div');
      body.className = 'window-body';
      
      // 加载指示器
      const loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'loading-indicator';
      body.appendChild(loadingIndicator);
      
      // 加载中状态
      const loadingEl = document.createElement('div');
      loadingEl.className = 'window-loading';
      
      const spinner = document.createElement('div');
      spinner.className = 'spinner';
      loadingEl.appendChild(spinner);
      
      const loadingText = document.createElement('div');
      loadingText.textContent = '正在加载...';
      loadingEl.appendChild(loadingText);
      
      body.appendChild(loadingEl);
      
      // iframe
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.opacity = '0';
      iframe.addEventListener('load', () => {
        loadingEl.style.display = 'none';
        loadingIndicator.style.display = 'none';
        iframe.style.opacity = '1';
        // 尝试获取iframe内页面标题
        try {
          if (iframe.contentDocument) {
            const pageTitle = iframe.contentDocument.title;
            if (pageTitle) {
              titleText.textContent = pageTitle;
              const taskbarItem = document.getElementById(`taskbar-${windowId}`);
              if (taskbarItem) {
                taskbarItem.querySelector('span').textContent = pageTitle;
              }
            }
          }
        } catch (e) {
          // 跨域问题，忽略
        }
      });
      body.appendChild(iframe);
      
      windowEl.appendChild(body);
      
      // 添加到DOM
      this.container.appendChild(windowEl);
      
      // 添加到任务栏
      this.addTaskbarItem(windowId, title, favicon);
      
      // 添加窗口对象到数组
      this.windows.push({
        id: windowId,
        el: windowEl,
        header: header,
        iframe: iframe,
        title: title,
        url: url,
        favicon: favicon
      });
      
      // 更新任务栏可见性
      this.updateTaskbarVisibility();
      
      // 设置窗口拖拽
      this.setupWindowDrag(windowId, header);
      
      // 聚焦新窗口
      this.focusWindow(windowId);
      
      // 延迟显示窗口以添加动画效果
      setTimeout(() => {
        windowEl.classList.add('visible');
      }, 10);
      
      return windowId;
    }
    
    // 在addTaskbarItem方法中使用Font Awesome图标
    addTaskbarItem(windowId, title, faviconUrl) {
      const taskbarItem = document.createElement('div');
      taskbarItem.className = 'taskbar-item';
      taskbarItem.id = `taskbar-${windowId}`;
      taskbarItem.setAttribute('data-title', title); // 添加标题作为悬停提示
      
      // 从URL或分析中提取图标类
      let iconClass = 'fas fa-globe'; // 默认图标
      
      if (title.toLowerCase().includes('wiki') || faviconUrl.includes('book')) {
        iconClass = 'fas fa-book-open';
      } else if (title.toLowerCase().includes('导航') || faviconUrl.includes('compass')) {
        iconClass = 'fas fa-compass';
      } else if (title.toLowerCase().includes('音乐') || faviconUrl.includes('music')) {
        iconClass = 'fas fa-music';
      } else if (title.toLowerCase().includes('图') || faviconUrl.includes('images')) {
        iconClass = 'fas fa-images';
      }
      
      // 创建图标元素
      const icon = document.createElement('i');
      icon.className = iconClass;
      taskbarItem.appendChild(icon);
      
      taskbarItem.addEventListener('click', () => {
        const windowObj = this.windows.find(w => w.id === windowId);
        if (windowObj?.el.classList.contains('minimized')) {
          this.restoreWindow(windowId);
        } else if (windowObj?.el.classList.contains('active')) {
          this.minimizeWindow(windowId);
        } else {
          this.focusWindow(windowId);
        }
      });
      
      this.taskbarItems.appendChild(taskbarItem);
    }
    
    setupWindowDrag(windowId, headerEl) {
      let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      
      headerEl.onmousedown = dragMouseDown;
      
      const windowObj = this.windows.find(w => w.id === windowId);
      const windowEl = windowObj.el;
      
      function dragMouseDown(e) {
        e.preventDefault();
        
        if (windowEl.classList.contains('maximized')) return;
        
        // 获取鼠标位置
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // 当鼠标移动或释放时调用函数
        document.onmousemove = elementDrag;
        document.onmouseup = closeDragElement;
      }
      
      function elementDrag(e) {
        e.preventDefault();
        
        // 计算新位置
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // 设置元素的新位置
        windowEl.style.top = `${windowEl.offsetTop - pos2}px`;
        windowEl.style.left = `${windowEl.offsetLeft - pos1}px`;
      }
      
      function closeDragElement() {
        // 停止移动时停止跟踪
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }
    
    handleGlobalMouseDown(e) {
      const windowEl = e.target.closest('.window');
      if (windowEl) {
        this.focusWindow(windowEl.id);
      }
    }
    
    focusWindow(windowId) {
      // 取消选中其他窗口
      this.windows.forEach(w => {
        w.el.classList.remove('active');
        document.getElementById(`taskbar-${w.id}`)?.classList.remove('active');
      });
      
      // 选中当前窗口
      const windowObj = this.windows.find(w => w.id === windowId);
      if (windowObj) {
        windowObj.el.classList.add('active');
        windowObj.el.style.zIndex = this.zIndex++;
        document.getElementById(`taskbar-${windowId}`)?.classList.add('active');
      }
    }
    
    minimizeWindow(windowId) {
      const windowObj = this.windows.find(w => w.id === windowId);
      if (windowObj) {
        windowObj.el.classList.add('minimized');
        document.getElementById(`taskbar-${windowId}`)?.classList.remove('active');
      }
    }
    
    restoreWindow(windowId) {
      const windowObj = this.windows.find(w => w.id === windowId);
      if (windowObj) {
        windowObj.el.classList.remove('minimized');
        this.focusWindow(windowId);
      }
    }
    
    toggleMaximize(windowId) {
      const windowObj = this.windows.find(w => w.id === windowId);
      if (windowObj) {
        windowObj.el.classList.toggle('maximized');
      }
    }
    
    closeWindow(windowId) {
      const index = this.windows.findIndex(w => w.id === windowId);
      if (index !== -1) {
        const windowObj = this.windows[index];
        
        // 从DOM中移除
        windowObj.el.classList.remove('visible');
        
        // 延迟移除以允许动画完成
        setTimeout(() => {
          windowObj.el.remove();
          document.getElementById(`taskbar-${windowId}`)?.remove();
        }, 200);
        
        // 从数组中移除
        this.windows.splice(index, 1);
        
        // 更新任务栏可见性
        this.updateTaskbarVisibility();
      }
    }

    // 更新任务栏显示状态
    updateTaskbarVisibility() {
      // 检查是否有任何可见窗口（非最小化）
      const hasVisibleWindows = this.windows.some(window => 
        !window.el.classList.contains('minimized')
      );
      
      // 检查是否有任何窗口（包括最小化的）
      const hasAnyWindows = this.windows.length > 0;
      
      // 只有当有窗口时才显示任务栏
      if (hasAnyWindows) {
        this.taskbar.classList.add('active');
      } else {
        this.taskbar.classList.remove('active');
      }
    }
  }
  
  // 页面加载后初始化窗口管理器
  document.addEventListener('DOMContentLoaded', () => {
    window.windowManager = new WindowManager();
    
    // 如果存在#openWindow的URL参数，自动打开窗口
    const urlParams = new URLSearchParams(window.location.search);
    const openUrl = urlParams.get('openWindow');
    if (openUrl) {
      try {
        const url = decodeURIComponent(openUrl);
        const title = urlParams.get('title') || '新窗口';
        window.windowManager.createWindow(url, title);
      } catch (e) {
        console.error('无法打开窗口:', e);
      }
    }
  });
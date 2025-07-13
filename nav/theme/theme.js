document.addEventListener('DOMContentLoaded', function() {
  // 基础主题配置
  const baseThemes = [
    { name: 'purple', color: '#8a4cd3', title: '紫色主题' },
    { name: 'rose', color: '#d34c96', title: '玫红主题' },
    { name: 'orange', color: '#e67e22', title: '橙色主题' },
    { name: 'blue', color: '#3498db', title: '蓝色主题' },
    { name: 'green', color: '#2ecc71', title: '绿色主题' },
    { name: 'gray', color: '#969696ff', title: '灰色主题' }
  ];

  // DOM元素
  const themeBtn = document.getElementById('themeBtn');
  const themePanel = document.querySelector('.theme-panel');
  const nightModeSwitch = document.getElementById('nightModeSwitch');
  const autoModeSwitch = document.getElementById('autoModeSwitch'); // 新增AUTO开关
  const colorPalette = document.getElementById('colorOptions');
  const html = document.documentElement;

  // 本地存储键
  const STORAGE_KEYS = {
    theme: 'user-theme-color',
    darkMode: 'user-dark-mode',
    autoMode: 'user-auto-mode' // 新增自动模式存储键
  };

  // 初始化主题状态
  let currentTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'purple';
  const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 自动模式：默认启用，跟随系统主题
  let isAutoMode = localStorage.getItem(STORAGE_KEYS.autoMode) !== null 
    ? localStorage.getItem(STORAGE_KEYS.autoMode) === 'true' 
    : true;
  
  // 夜间模式状态：自动模式下跟随系统，否则使用用户设置
  let isDarkMode = isAutoMode 
    ? systemDarkMode.matches 
    : localStorage.getItem(STORAGE_KEYS.darkMode) === 'true';

  // 应用当前主题
  function applyTheme() {
    const theme = isDarkMode ? `${currentTheme}-dark` : currentTheme;
    html.setAttribute('data-theme', theme);
    nightModeSwitch.checked = isDarkMode;
    autoModeSwitch.checked = isAutoMode;
    
    // 禁用/启用手动开关
    nightModeSwitch.disabled = isAutoMode;
    
    // 更新图标
    const icon = themeBtn.querySelector('i');
    if (icon) {
      icon.className = isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  // 生成颜色选择按钮
  function generateColorButtons() {
    baseThemes.forEach(theme => {
      const button = document.createElement('button');
      button.className = `color-item ${theme.name === currentTheme ? 'active' : ''}`;
      button.dataset.theme = theme.name;
      button.style.backgroundColor = theme.color;
      button.title = theme.title;
      
      button.addEventListener('click', () => {
        currentTheme = theme.name;
        localStorage.setItem(STORAGE_KEYS.theme, currentTheme);
        applyTheme();
        
        document.querySelectorAll('.color-item').forEach(btn => {
          btn.classList.remove('active');
        });
        button.classList.add('active');
      });
      
      colorPalette.appendChild(button);
    });
  }

  // 事件监听
  // 系统主题变化时：仅在自动模式下响应
  systemDarkMode.addEventListener('change', e => {
    if (isAutoMode) {
      isDarkMode = e.matches;
      applyTheme();
    }
  });

  // 用户切换自动模式
  autoModeSwitch.addEventListener('change', e => {
    isAutoMode = e.target.checked;
    localStorage.setItem(STORAGE_KEYS.autoMode, isAutoMode);
    
    if (isAutoMode) {
      // 开启自动模式时，使用系统主题
      isDarkMode = systemDarkMode.matches;
      localStorage.removeItem(STORAGE_KEYS.darkMode); // 清除手动设置
    } else {
      // 关闭自动模式时，保留当前状态
      localStorage.setItem(STORAGE_KEYS.darkMode, isDarkMode);
    }
    
    applyTheme();
  });

  // 用户主动切换夜间模式：仅在非自动模式下生效
  nightModeSwitch.addEventListener('change', e => {
    if (!isAutoMode) {
      isDarkMode = e.target.checked;
      localStorage.setItem(STORAGE_KEYS.darkMode, isDarkMode);
      applyTheme();
    }
  });

  // 主题面板显示/隐藏
  themeBtn.addEventListener('click', e => {
    e.stopPropagation();
    themePanel.classList.toggle('show');
  });

  document.addEventListener('click', e => {
    if (!themePanel.contains(e.target) && e.target !== themeBtn) {
      themePanel.classList.remove('show');
    }
  });

  // 初始化
  generateColorButtons();
  applyTheme();
});
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

  // DOM元素（对应修改后的类名）
  const themeBtn = document.getElementById('themeBtn');
  const themePanel = document.querySelector('.theme-panel'); // 原.theme-menu → .theme-panel
  const nightModeSwitch = document.getElementById('nightModeSwitch');
  const colorPalette = document.getElementById('colorOptions'); // 原#colorOptions → 对应.color-palette
  const html = document.documentElement;

  // 本地存储键
  const STORAGE_KEY = 'user-theme-color';

  // 初始化主题
  let currentTheme = localStorage.getItem(STORAGE_KEY) || 'purple';
  const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
  let isDarkMode = systemDarkMode.matches;

  // 应用当前主题
  function applyTheme() {
    const theme = isDarkMode ? `${currentTheme}-dark` : currentTheme;
    html.setAttribute('data-theme', theme);
    nightModeSwitch.checked = isDarkMode;
    
    // 更新图标
    const icon = themeBtn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-moon', !isDarkMode);
      icon.classList.toggle('fa-sun', isDarkMode);
    }
  }

  // 生成颜色选择按钮（对应修改后的类名）
  function generateColorButtons() {
    baseThemes.forEach(theme => {
      const button = document.createElement('button');
      button.className = `color-item ${theme.name === currentTheme ? 'active' : ''}`; // 原.color-btn → .color-item
      button.dataset.theme = theme.name;
      button.style.backgroundColor = theme.color;
      button.title = theme.title;
      
      button.addEventListener('click', () => {
        currentTheme = theme.name;
        localStorage.setItem(STORAGE_KEY, currentTheme);
        applyTheme();
        
        // 更新按钮状态
        document.querySelectorAll('.color-item').forEach(btn => { // 对应修改后的类名
          btn.classList.remove('active');
        });
        button.classList.add('active');
      });
      
      colorPalette.appendChild(button);
    });
  }

  // 事件监听（类名同步修改）
  systemDarkMode.addEventListener('change', e => {
    isDarkMode = e.matches;
    applyTheme();
  });

  nightModeSwitch.addEventListener('change', e => {
    isDarkMode = e.target.checked;
    applyTheme();
  });

  themeBtn.addEventListener('click', e => {
    e.stopPropagation();
    themePanel.classList.toggle('show'); // 原.active → .show
  });

  document.addEventListener('click', e => {
    if (!themePanel.contains(e.target) && e.target !== themeBtn) {
      themePanel.classList.remove('show'); // 对应修改后的显示类名
    }
  });

  // 初始化
  generateColorButtons();
  applyTheme();
});
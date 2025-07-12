document.addEventListener('DOMContentLoaded', () => {
  // 搜索引擎配置（第一个为Bing）
  const engines = [
    { name: 'Bing', url: 'https://cn.bing.com/search?q=', icon: 'fa-microsoft', type: 'brands' },
    { name: 'Baidu', url: 'https://www.baidu.com/s?wd=', icon: 'fa-paw', type: 'solid' },
    { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'fa-google', type: 'brands' },
    { name: 'Bilibili', url: 'https://search.bilibili.com/all?keyword=', icon: 'fa-bilibili', type: 'brands' },
    { name: 'GitHub', url: 'https://github.com/search?q=', icon: 'fa-github', type: 'brands' },
    { name: '有道翻译', url: 'https://fanyi.youdao.com/result?word=', icon: 'fa-language', type: 'solid' }
  ];

  // DOM元素（使用新的类名前缀）
  const [dropdown, trigger, triggerIcon, menu, searchInput, searchBtn] = 
    ['.search-dropdown', '.search-dropdown-trigger', '.trigger-icon', '.search-dropdown-menu', '#searchInput', '#searchBtn']
    .map(selector => document.querySelector(selector));

  // 存储键名
  const STORAGE_KEY = 'selected-search-engine';

  // 生成下拉选项
  const renderOptions = () => {
    // 从本地存储获取上次选择，无则默认第一个（Bing）
    const savedUrl = localStorage.getItem(STORAGE_KEY) || engines[0].url;
    
    menu.innerHTML = engines.map(engine => `
      <div class="search-dropdown-item ${engine.url === savedUrl ? 'selected' : ''}" 
           data-value="${engine.url}" 
           data-icon="${engine.icon}" 
           data-type="${engine.type}">
        <i class="fa-${engine.type} ${engine.icon}"></i>
        <span>${engine.name}</span>
      </div>
    `).join('');
    
    // 绑定选项点击事件
    document.querySelectorAll('.search-dropdown-item').forEach(item => {
      item.addEventListener('click', () => selectEngine(item));
    });
    
    // 设置默认图标
    setDefaultIcon();
  };

  // 设置默认图标
  const setDefaultIcon = () => {
    const defaultItem = document.querySelector('.search-dropdown-item.selected');
    if (defaultItem) {
      triggerIcon.className = `trigger-icon fa-${defaultItem.dataset.type} ${defaultItem.dataset.icon}`;
    } else {
      console.error('未找到选中的搜索引擎项');
    }
  };

  // 选择搜索引擎（并保存到本地存储）
  const selectEngine = (item) => {
    // 移除所有选中状态
    document.querySelectorAll('.search-dropdown-item').forEach(i => i.classList.remove('selected'));
    // 设置当前选中
    item.classList.add('selected');
    // 更新触发器图标
    triggerIcon.className = `trigger-icon fa-${item.dataset.type} ${item.dataset.icon}`;
    // 关闭下拉菜单
    dropdown.classList.remove('active');
    // 保存选择到localStorage
    localStorage.setItem(STORAGE_KEY, item.dataset.value);
  };

  // 执行搜索
  const performSearch = () => {
    const query = searchInput.value.trim();
    if (!query) {
      // 可添加空查询提示
      searchInput.classList.add('shake'); // 假设已有shake动画样式
      setTimeout(() => searchInput.classList.remove('shake'), 500);
      return;
    }
    
    const selectedItem = document.querySelector('.search-dropdown-item.selected');
    if (!selectedItem) {
      console.error('未找到选中的搜索引擎');
      return;
    }
    
    try {
      const url = selectedItem.dataset.value + encodeURIComponent(query);
      window.open(url, '_blank');
    } catch (error) {
      console.error('搜索URL生成失败:', error);
      // 可添加错误提示UI
    }
  };

  // 事件监听
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
  });
  
  document.addEventListener('click', () => dropdown.classList.remove('active'));
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') performSearch();
  });

  // 初始化
  renderOptions();
});
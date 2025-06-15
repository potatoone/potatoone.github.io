/**
 * 播放列表分类功能
 * 处理音乐播放列表的分类显示和切换
 */

class PlaylistCategories {
    constructor() {
      this.categories = {
        all: {  text: '全部' },
        categorie1: { text: '' },
        categorie2: { text: '' },
        categorie3: { text: '' }
      };
      
      this.currentCategory = 'all'; // 默认分类
      this.init();
    }
    
    /**
     * 初始化分类组件
     */
    init() {
      // 等待DOM加载完成
      document.addEventListener('DOMContentLoaded', () => {
        this.renderCategoriesUI();
        this.bindEvents();
        
        // 同步初始显示状态
        const playlist = document.getElementById('playlist');
        const categoriesContainer = document.getElementById('playlist-categories');
        
        if (playlist && !playlist.classList.contains('expanded') && categoriesContainer) {
          categoriesContainer.style.display = 'none';
          categoriesContainer.style.opacity = '0';
          categoriesContainer.style.transform = 'translateY(-10px)';
        }
      });
    }
    
    /**
     * 渲染分类UI
     */
    renderCategoriesUI() {
      const container = document.getElementById('playlist-categories');
      if (!container) return;
      
      // 创建分类切换按钮容器
      const categoriesWrapper = document.createElement('div');
      categoriesWrapper.className = 'playlist-categories';
      
      // 创建各个分类按钮
      Object.entries(this.categories).forEach(([key, data]) => {
        const button = document.createElement('button');
        button.className = `category-btn ${key === this.currentCategory ? 'active' : ''}`;
        button.setAttribute('data-category', key);
        
        const icon = document.createElement('i');
        icon.className = `fas ${data.icon}`;
        button.appendChild(icon);
        
        const span = document.createElement('span');
        span.textContent = data.text;
        button.appendChild(span);
        
        categoriesWrapper.appendChild(button);
      });
      
      container.appendChild(categoriesWrapper);
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
      const buttons = document.querySelectorAll('.category-btn');
      
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const category = button.getAttribute('data-category');
          this.switchCategory(category);
        });
      });
    }
    
    /**
     * 切换分类
     * @param {string} category - 目标分类名称
     */
    switchCategory(category) {
      if (!this.categories[category] || category === this.currentCategory) return;
      
      // 更新当前分类
      this.currentCategory = category;
      
      // 更新UI状态
      const buttons = document.querySelectorAll('.category-btn');
      buttons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === category);
      });
      
      // 触发事件，通知播放列表管理器切换分类
      const event = new CustomEvent('categoryChange', {
        detail: { category: category }
      });
      document.dispatchEvent(event);
    }
    
    /**
     * 获取当前分类
     * @returns {string} 当前分类名称
     */
    getCurrentCategory() {
      return this.currentCategory;
    }
  }
  
  // 创建全局实例
  window.PlaylistCategories = new PlaylistCategories();
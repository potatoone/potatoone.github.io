/**
 * 分类标签组件
 */
class PlaylistCategories {
  constructor(categoryNames = []) {
    this.categories = {
      all: { text: '全部' },
      categorie1: { text: categoryNames[0] || '分类1' },
      categorie2: { text: categoryNames[1] || '分类2' },
      categorie3: { text: categoryNames[2] || '分类3' }
    };
    this.currentCategory = 'all';

    // 直接调用初始化方法
    this.renderCategoriesUI();
    this.bindEvents();

    // 根据播放列表状态更新UI
    const playlist = document.getElementById('playlist');
    const categoriesContainer = document.getElementById('playlist-categories');
    if (playlist && !playlist.classList.contains('expanded') && categoriesContainer) {
      categoriesContainer.style.display = 'none';
      categoriesContainer.style.opacity = '0';
      categoriesContainer.style.transform = 'translateY(-10px)';
    }
  }

  renderCategoriesUI() {
    const labelMap = {
      all: 'tab-all',
      categorie1: 'tab-1',
      categorie2: 'tab-2',
      categorie3: 'tab-3'
    };
    for (const key in this.categories) {
      const label = document.querySelector(`label[for="${labelMap[key]}"]`);
      if (label) {
        label.textContent = this.categories[key].text;
      }
    }
  }

  bindEvents() {
    const radios = document.querySelectorAll('input[name="tab"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        const idMap = {
          'tab-all': 'all',
          'tab-1': 'categorie1',
          'tab-2': 'categorie2',
          'tab-3': 'categorie3'
        };
        const category = idMap[radio.id];
        this.switchCategory(category);
      });
    });
  }

  switchCategory(category) {
    if (!this.categories[category] || category === this.currentCategory) return;
    this.currentCategory = category;
    const event = new CustomEvent('categoryChange', { detail: { category } });
    document.dispatchEvent(event);
  }
}

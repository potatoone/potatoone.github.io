// 标签页模块（负责标签页与指示器逻辑）
const TabModule = {
  // 初始化标签页
  init() {
    this.render();

    // 在窗口尺寸变化时更新指示器（防抖处理）
    let _resizeTimer = null;
    const onResize = () => {
      clearTimeout(_resizeTimer);
      _resizeTimer = setTimeout(() => this.updateIndicator(), 100);
    };
    window.addEventListener("resize", onResize);

    // 当标签容器发生滚动时也更新指示器位置（容器上有横向滚动）
    const tabsContainer = state.dom.tabsWrapper && state.dom.tabsWrapper.parentElement;
    if (tabsContainer) tabsContainer.addEventListener("scroll", () => this.updateIndicator());
  },

  // 设置默认标签页（取第一个标签）
  setDefaultTab() {
    const { tabs } = state.data[state.currentNav] || {};
    state.currentTab = tabs ? Object.keys(tabs)[0] || "" : "";
  },

  // 渲染标签页
  render() {
    const { tabs } = state.data[state.currentNav] || {};
    state.dom.tabsWrapper.innerHTML = "";

    if (!tabs) {
      state.dom.tabsWrapper.innerHTML = "<div class='no-tab'>无数据</div>";
      return;
    }

    Object.keys(tabs).forEach(tabName => {
      const tab = document.createElement("div");
      tab.className = `tab-item ${tabName === state.currentTab ? "active" : ""}`;
      tab.textContent = tabName;
      tab.addEventListener("click", () => {
        state.currentTab = tabName;
        this.render(); // 重新渲染标签（更新激活状态）
        this.updateIndicator(); // 更新指示器
        CardModule.render(); // 触发卡片重新渲染
      });
      state.dom.tabsWrapper.appendChild(tab);
    });

    this.updateIndicator();
  },

  // 更新标签页指示器位置
  updateIndicator() {
    const activeTab = state.dom.tabsWrapper.querySelector(".tab-item.active");
    if (!activeTab) return;

    // 使用边界盒（getBoundingClientRect）相对于外层容器计算位置，能正确处理 resize 与 scroll
    const tabsContainer = state.dom.tabsWrapper.parentElement; // .tabs-container
    if (!tabsContainer) return;

    const tabRect = activeTab.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();

    // 通过加上容器的 scrollLeft 来获取相对于容器内容的精确位置，
    const left = tabRect.left - containerRect.left + tabsContainer.scrollLeft + 5;
    const width = Math.max(activeTab.offsetWidth - 10, 0);

    // 使用 left/width 进行位置更新
    requestAnimationFrame(() => {
      state.dom.indicator.style.left = `${left}px`;
      state.dom.indicator.style.width = `${width}px`;
    });
  }
};

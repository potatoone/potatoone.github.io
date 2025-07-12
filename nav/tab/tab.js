// 标签页模块（负责标签页与指示器逻辑）
const TabModule = {
  // 初始化标签页
  init() {
    this.render();
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

    // 计算指示器位置（基于父元素偏移）
    const left = activeTab.offsetLeft + 5;
    const width = activeTab.offsetWidth - 10;

    state.dom.indicator.style.left = `${left}px`;
    state.dom.indicator.style.width = `${width}px`;
  }
};

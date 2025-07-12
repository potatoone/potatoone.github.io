// 全局状态管理（共享数据与当前状态）
const state = {
  data: {},
  currentNav: "1",
  currentTab: "",
  // DOM缓存（模块共享的核心DOM）
  dom: {
    cardsContainer: null,
    tabsWrapper: null,
    indicator: null,
    navItems: []
  }
};

// 导航模块（负责底部导航相关逻辑）
const NavModule = {
  // 初始化导航
  init() {
    this.bindEvents();
    this.updateActiveState();
  },

  // 更新导航激活状态
  updateActiveState() {
    state.dom.navItems.forEach(item => {
      item.classList.toggle("active", item.dataset.nav === state.currentNav);
    });
  },

  // 绑定导航点击事件
  bindEvents() {
    state.dom.navItems.forEach(item => {
      item.addEventListener("click", () => {
        const newNav = item.dataset.nav;
        if (newNav !== state.currentNav) {
          state.currentNav = newNav;
          this.updateActiveState();
          // 导航切换后触发标签页和卡片更新
          TabModule.setDefaultTab();
          TabModule.render();
          CardModule.render();
        }
      });
    });
  }
};

// 主流程初始化
async function initApp() {
  // 1. 获取并校验DOM
  state.dom = {
    tabsWrapper: document.getElementById("tabsWrapper"),
    indicator: document.querySelector(".tab-indicator"),
    cardsContainer: document.getElementById("cardsContainer"),
    navItems: [...document.querySelectorAll(".nav-item")]
  };

  const { tabsWrapper, indicator, cardsContainer, navItems } = state.dom;
  if (!tabsWrapper || !indicator || !cardsContainer || !navItems.length) {
    console.error("缺少必要DOM元素");
    return;
  }

  // 2. 加载数据
  try {
    const res = await fetch("./website.json");
    if (!res.ok) throw new Error(`加载失败（${res.status}）`);
    state.data = await res.json();
    if (typeof state.data !== "object") throw new Error("JSON格式错误");
  } catch (err) {
    CardModule.showError(cardsContainer, err.message);
    return;
  }

  // 3. 初始化各模块
  TabModule.setDefaultTab();
  NavModule.init();
  TabModule.init();
  CardModule.init();
  CardModule.render(); // 初始渲染卡片
}

// 页面加载完成后启动应用
window.addEventListener("DOMContentLoaded", initApp);
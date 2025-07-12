// 卡片模块（负责卡片渲染与数据展示）
const CardModule = {
  // 初始化卡片容器
  init() {
    // 预留初始化逻辑（如样式设置等）
  },

  // 渲染卡片
  render() {
    const cards = state.data[state.currentNav]?.tabs?.[state.currentTab] || [];
    state.dom.cardsContainer.innerHTML = "";

    if (!cards.length) {
      this.showError("无卡片数据");
      return;
    }

    cards.forEach(card => {
      const cardEl = document.createElement("div");
      cardEl.className = "card";
      
      // 处理URL显示（提取主机名并截断）
      let displayUrl = "未知链接";
      if (card.url) {
        try {
          displayUrl = new URL(card.url).hostname;
          if (displayUrl.length > 20) displayUrl = displayUrl.slice(0, 20) + "...";
        } catch {
          displayUrl = card.url.length > 25 ? card.url.slice(0, 25) + "..." : card.url;
        }
      }

      cardEl.innerHTML = `
        <div class="title-group">
          <div class="badge"><i class="fa ${card.icon || "fa-star"}"></i></div>
          <div class="card-title">
            <h3 class="card-maintitle">${card.title || "未知标题"}</h3>
            <p class="card-subtitle">${displayUrl}</p>
          </div>
        </div>
        <p class="card-desc">${card.desc || ""}</p>
        <button class="card-btn" onclick="window.open('${card.url || "#"}')">访问</button>
      `;
      state.dom.cardsContainer.appendChild(cardEl);
    });
  },

  // 显示错误信息
  showError(msg) {
    state.dom.cardsContainer.innerHTML = `
      <div class="error-message">
        <i class="fa fa-exclamation-circle"></i>
        <p>${msg}</p>
      </div>
    `;
  }
};

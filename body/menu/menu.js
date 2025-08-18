const contextMenu = document.getElementById('contextMenu');
let targetElement = null;

// 右键菜单定位与显示
document.addEventListener('contextmenu', e => {
  e.preventDefault();
  targetElement = e.target;
  const { offsetWidth: w, offsetHeight: h } = contextMenu;
  const { innerWidth: winW, innerHeight: winH } = window;
  
  // 计算位置并显示菜单
  contextMenu.style.cssText = `
    display: block;
    left: ${Math.min(e.clientX, winW - w)}px;
    top: ${Math.min(e.clientY, winH - h)}px;
  `;

});

// 核心修改：点击任意位置（包括关于卡片打开时）都关闭菜单
document.addEventListener('click', e => {
  if (!contextMenu.contains(e.target)) {
    contextMenu.style.display = 'none';
  }
});

// 菜单功能处理
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', () => {
    const action = item.querySelector('span').textContent.trim();
    switch (action) {
      case 'COPY':
        copyHoveredContent();
        break;
      case 'REFRESH':
        window.location.reload();
        break;
      case 'ABOUT':
        createAboutCard();
        break;
      case 'OPEN IN NEW TAB':
        openInNewTab();
        break;
    }
    contextMenu.style.display = 'none'; // 点击菜单项后也关闭
  });
});

// 在新标签页打开
function openInNewTab() {
  const linkEl = targetElement.closest('a');
  if (linkEl?.href) {
    window.open(linkEl.href, '_blank');
    showCopyFeedback('已在新标签页打开');
  }
}

// 复制功能
function copyHoveredContent() {
  if (!targetElement) return;
  
  const text = getCleanText(targetElement).trim();
  if (!text) return showCopyFeedback('无可用内容', false);
  
  navigator.clipboard.writeText(text)
    .then(() => showCopyFeedback('Copied'))
    .catch(() => showCopyFeedback('复制失败', false));
}

// 文本清洗
function getCleanText(el) {
  return (el.innerText || el.textContent || '')
    .replace(/\n+/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

// 反馈提示
function showCopyFeedback(msg, success = true) {
  const feedback = Object.assign(document.createElement('div'), {
    textContent: msg,
    className: `copy-feedback ${success ? 'success' : 'error'}`
  });
  
  document.body.appendChild(feedback);
  setTimeout(() => feedback.style.opacity = '1', 10);
  setTimeout(() => {
    feedback.style.opacity = '0';
    setTimeout(() => feedback.remove(), 300);
  }, 3000);
}

// 关于卡片
function createAboutCard() {
  if (document.querySelector('.about-card')) return;
  
  const card = Object.assign(document.createElement('div'), {
    className: 'about-card',
    innerHTML: `
      <div class="about-content">
        <button class="close-btn">&times;</button>
        <h3>关于本站</h3>
        <p>· 纯静态网站，托管于 Github Pages</p>
        <p>· 使用纯 HTML/CSS/JS 开发</p>
        <p>· 博客使用 VitePress</p>
        <p>基于 MIT 开源协议，使用请保留版权信息</p>
      </div>
    `
  });
  
  document.body.appendChild(card);
  setTimeout(() => card.classList.add('active'), 10);
  
  // 关闭逻辑
  const close = () => {
    card.classList.remove('active');
    setTimeout(() => card.remove(), 300);
  };
  
  card.querySelector('.close-btn').addEventListener('click', close);
  card.addEventListener('click', e => e.target === card && close());
}
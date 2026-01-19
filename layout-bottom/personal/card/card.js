document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal');
  const contactCard = document.getElementById('contact-card');
  const contactValue = document.getElementById('contact-value');
  const giscusCard = document.getElementById('giscus-card');

  let activeMode = null;
  let activeContactType = null; // 新增：记录当前激活的联系方式类型(email/qq)

  const buttons = {
    email: { el: document.querySelector('.bottom-button.email a'), value: 'apotato@foxmail.com', title: '邮箱联系方式', card: contactCard, type: 'email' },
    qq:    { el: document.querySelector('.bottom-button.qq a'), value: '2933351447', title: 'QQ联系方式', card: contactCard, type: 'qq' },
    giscus:{ el: document.querySelector('.bottom-button.gisgus a'), card: giscusCard, isGiscus: true, type: 'giscus' }
  };

  Object.values(buttons).forEach(btn => {
    btn.el.addEventListener('click', e => {
      e.preventDefault();
      
      // 按钮判断逻辑
      if (btn.isGiscus) {
        // Giscus按钮逻辑
        if (activeMode === 'giscus') {
          closeAll();
        } else {
          openCard(btn);
        }
      } else {
        // 联系方式按钮切换逻辑（Email/QQ）
        if (activeMode === 'contact') {
          if (activeContactType === btn.type) {
            closeAll();
          } else {
            switchContact(btn);
          }
        } else {
          openCard(btn);
        }
      }
    });
  });

  // 切换联系方式的函数
  function switchContact(btn) {
    activeContactType = btn.type;
    contactValue.textContent = btn.value;
    // 可以在这里添加切换动画效果（可选）
    contactCard.classList.add('switching');
    setTimeout(() => contactCard.classList.remove('switching'), 300);
  }

  function openCard(btn) {
    activeMode = btn.isGiscus ? 'giscus' : 'contact';
    if (!btn.isGiscus) {
      activeContactType = btn.type; // 记录当前激活的联系方式类型
    }

    // 关闭另一张卡
    [contactCard, giscusCard].forEach(c => {
      if (c !== btn.card) c.classList.remove('active','closing','giscus-mode');
    });

    modal.classList.add('active');

    if (!btn.isGiscus) {
      contactValue.textContent = btn.value;
      btn.card.classList.remove('giscus-mode'); // 联系方式保持小尺寸
    } else {
      loadGiscus();
      btn.card.classList.add('giscus-mode'); // Giscus 大尺寸
    }

    btn.card.classList.remove('closing');
    btn.card.classList.add('active');
  }

  function closeAll() {
    activeMode = null;
    activeContactType = null; // 重置激活的联系方式类型
    [contactCard, giscusCard].forEach(c => {
      if (c.classList.contains('active')) {
        c.classList.add('closing');
        setTimeout(() => c.classList.remove('active','closing','giscus-mode','switching'), 350);
      }
    });
    setTimeout(() => modal.classList.remove('active'), 400);
  }

  function loadGiscus() {
    const container = document.getElementById('giscus-container');
    if (!container || container.dataset.loaded) return;
    container.dataset.loaded = '1';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.setAttribute('data-repo', 'potatoone/potatoone.github.io');
    script.setAttribute('data-repo-id', 'R_kgDONVdxPA');
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', 'DIC_kwDONVdxPM4C1Iyg');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-theme', 'catppuccin_macchiato');
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('crossorigin', 'anonymous');
    container.appendChild(script);
  }

  modal.addEventListener('click', e => { if (e.target === modal) closeAll(); });
  document.addEventListener('keydown', e => { if (e.key==='Escape') closeAll(); });
});
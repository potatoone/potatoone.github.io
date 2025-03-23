document.addEventListener('DOMContentLoaded', () => {
  // DOM元素和状态变量
  const modal = document.getElementById('contact-modal');
  const box = document.querySelector(".box");
  const front = document.querySelector(".front");
  const back = document.querySelector(".back");
  const contactValue = document.getElementById('contact-value');
  const cardTitle = document.querySelector('.card-title');
  
  let isReverse = false, currentContact = '', activeButton = null;

  // 联系方式和卡片状态配置
  const contactButtons = {
    email: { 
      el: document.querySelector('.bottom-button.email a'), 
      value: 'apotato@foxmail.com', 
      title: '邮箱联系方式' 
    },
    qq: { 
      el: document.querySelector('.bottom-button.qq a'), 
      value: '2933351447', 
      title: 'QQ联系方式' 
    }
  };
  
  const cardStates = {
    hidden: { front: 'translateY(100%) scale(0.1) rotateX(0deg)', back: 'rotateX(-180deg)' },
    visible: { front: 'translateY(0) scale(1) rotateX(180deg)', back: 'translateY(0) scale(1) rotateX(0deg)' }
  };
  
  // 初始化和事件绑定
  front.style.transform = cardStates.hidden.front;
  back.style.transform = cardStates.hidden.back;

  Object.values(contactButtons).forEach(btn => {
    btn.el.addEventListener('click', e => {
      e.preventDefault();
      if (modal.classList.contains('active') && activeButton === btn.el) {
        closeModal();
        return;
      }
      activeButton = btn.el;
      currentContact = btn.value;
      cardTitle.textContent = btn.title;
      contactValue.textContent = btn.value;
      if (isReverse) setCardState(false);
      modal.classList.add('active');
      setTimeout(() => setCardState(true), 200);
    });
  });

  // 交互处理函数
  function setCardState(visible) {
    const state = visible ? cardStates.visible : cardStates.hidden;
    front.style.transition = back.style.transition = 'transform 1s, opacity 1s';
    front.style.transform = state.front;
    back.style.transform = state.back;
    box.classList[visible ? 'add' : 'remove']("flipped");
    isReverse = visible;
  }

  function closeModal() {
    if (isReverse) {
      setCardState(false);
      setTimeout(() => {
        modal.classList.remove('active');
        activeButton = null;
      }, 600);
    } else {
      modal.classList.remove('active');
      activeButton = null;
    }
  }

  // 其他事件监听
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });
  box.addEventListener('click', () => navigator.clipboard.writeText(currentContact).catch(err => console.error('复制失败', err)));
});
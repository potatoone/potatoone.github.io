document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const modal = document.getElementById('contact-modal');
    const box = document.querySelector(".box");
    const front = document.querySelector(".front");
    const back = document.querySelector(".back");
    const contactValue = document.getElementById('contact-value');
    const cardTitle = document.querySelector('.card-title');
    
    const emailBtn = document.querySelector('.bottom-button.email a');
    const qqBtn = document.querySelector('.bottom-button.qq a');
    
    var isReverse = false;
    var currentContact = '';

    // 初始化卡片的 transform 属性
    front.style.transform = 'translateY(100%) scale(0.1) rotateX(0deg)';
    back.style.transform = 'rotateX(-180deg)';
  
    // 邮箱点击事件
    emailBtn.addEventListener('click', function(e) {
      e.preventDefault();
      currentContact = 'apotato@foxmail.com';
      showContactCard('邮箱联系方式', currentContact);
      
      // 添加延迟后翻转卡片
      setTimeout(function() {
        flipCard();
      }, 200);
    });
  
    // QQ点击事件
    qqBtn.addEventListener('click', function(e) {
      e.preventDefault();
      currentContact = '2933351447';
      showContactCard('QQ联系方式', currentContact);
      
      // 添加延迟后翻转卡片
      setTimeout(function() {
        flipCard();
      }, 200);
    });
  
    // 显示联系方式卡片
    function showContactCard(title, value) {
      cardTitle.textContent = title;
      contactValue.textContent = value;
      
      // 确保卡片处于正面状态
      if (isReverse) {
        box.classList.remove("flipped");
        front.style.transform = 'translateY(100%) scale(0.1) rotateX(0deg)';
        back.style.transform = 'rotateX(-180deg)';
        isReverse = false;
      }
      
      // 显示模态窗口
      modal.classList.add('active');
    }
  
    // 点击背景关闭模态窗口
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        // 如果卡片是翻转状态，先翻回来
        if (isReverse) {
          box.classList.remove("flipped");
          front.style.transform = 'translateY(100%) scale(0.1) rotateX(0deg)';
          back.style.transform = 'rotateX(-180deg)';
          isReverse = false;
          // 添加延迟，等卡片翻转回来后再关闭模态窗口
          setTimeout(function() {
            modal.classList.remove('active');
          }, 600); // 与卡片翻转动画持续时间相同
        } else {
          modal.classList.remove('active');
        }
      }
    });
  
    // 卡片翻转函数
    function flipCard() {
      if (isReverse) {
        front.style.transition = 'transform 1s, opacity 1s';
        back.style.transition = 'transform 1s, opacity 1s';
        front.style.transform = 'translateY(100%) scale(0.1) rotateX(0deg)';
        back.style.transform = 'rotateX(-180deg)';
        box.classList.remove("flipped");
      } else {
        front.style.transition = 'transform 1s, opacity 1s';
        back.style.transition = 'transform 1s, opacity 1s';
        front.style.transform = 'translateY(0) scale(1) rotateX(180deg)';
        back.style.transform = 'translateY(0) scale(1) rotateX(0deg)';
        box.classList.add("flipped");
      }
      isReverse = !isReverse;
    }
  
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        // 如果卡片是翻转状态，先翻回来
        if (isReverse) {
          box.classList.remove("flipped");
          front.style.transform = 'translateY(100%) scale(0.1) rotateX(0deg)';
          back.style.transform = 'rotateX(-180deg)';
          isReverse = false;
          // 添加延迟，等卡片翻转回来后再关闭模态窗口
          setTimeout(function() {
            modal.classList.remove('active');
          }, 600); // 与卡片翻转动画持续时间相同
        } else {
          modal.classList.remove('active');
        }
      }
    });
    
    // 添加点击卡片自动复制功能
    box.addEventListener('click', function() {
      navigator.clipboard.writeText(currentContact)
        .catch(err => console.error('复制失败', err));
    });
  });
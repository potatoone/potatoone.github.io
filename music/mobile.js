document.addEventListener('DOMContentLoaded', function() {
    // 创建移动端切换按钮
    const mobileToggle = document.createElement('div');
    mobileToggle.className = 'mobile-toggle';
    mobileToggle.innerHTML = '<i class="fas fa-music"></i>';
    document.body.appendChild(mobileToggle);
    
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    
    // 获取播放器元素
    const player = document.querySelector('.player');
    const audioPlayer = document.getElementById('audio-player');
    
    // 初始化时根据窗口大小设置
    handleResponsiveLayout();
    
    // 移动端切换按钮点击事件
    mobileToggle.addEventListener('click', function() {
      player.classList.toggle('active');
      overlay.classList.toggle('active');
      
      // 如果播放器已激活并且音乐正在播放，添加旋转动画
      if (player.classList.contains('active') && !audioPlayer.paused) {
        mobileToggle.classList.add('playing-animation');
      } else {
        mobileToggle.classList.remove('playing-animation');
      }
      
      // 根据播放器状态切换显示状态
      updateVisibility();
    });
    
    // 点击遮罩层关闭播放器
    overlay.addEventListener('click', function() {
      player.classList.remove('active');
      overlay.classList.remove('active');
      updateVisibility();
    });
    
    // 为文档添加点击事件监听器，点击外部区域时收起播放器
    document.addEventListener('click', function(event) {
      // 检查点击的元素是否在播放器内部或是移动端按钮
      const isClickInsidePlayer = player.contains(event.target);
      const isClickOnToggle = mobileToggle.contains(event.target);
      
      // 如果点击的是外部区域且当前是移动端模式且播放器处于激活状态
      if (!isClickInsidePlayer && !isClickOnToggle && 
          window.innerWidth <= 768 && player.classList.contains('active')) {
        player.classList.remove('active');
        overlay.classList.remove('active');
        updateVisibility();
      }
    });
    
    // 监听音频播放状态变化
    audioPlayer.addEventListener('play', function() {
      if (window.innerWidth <= 768) {
        mobileToggle.classList.add('playing-animation');
      }
    });
    
    audioPlayer.addEventListener('pause', function() {
      mobileToggle.classList.remove('playing-animation');
    });
    
    // 监听窗口大小变化
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResponsiveLayout, 250);
    });
    
    // 处理响应式布局
    function handleResponsiveLayout() {
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // 移动端模式
        player.classList.add('mobile-view');
        player.classList.remove('active');
        overlay.classList.remove('active');
      } else {
        // 桌面端模式
        player.classList.remove('mobile-view', 'active');
        overlay.classList.remove('active');
      }
      
      // 更新可见性
      updateVisibility();
    }
    
    // 更新播放器和按钮的可见性
    function updateVisibility() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
        // 移动端模式下，根据播放器激活状态决定按钮和遮罩的显示
        if (player.classList.contains('active')) {
            mobileToggle.style.opacity = '0'; // 淡出按钮
            setTimeout(() => {
            mobileToggle.style.display = 'none';
            }, 300); // 等待动画完成
            overlay.style.display = 'block'; // 立即显示遮罩，opacity由CSS过渡处理
        } else {
            player.classList.remove('active');
            mobileToggle.style.display = 'flex';
            mobileToggle.style.opacity = '1';
            // 遮罩的隐藏由CSS处理
        }
        } else {
        // 桌面模式下
        mobileToggle.style.display = 'none';
        player.classList.remove('active'); // 确保没有active类
        overlay.classList.remove('active');
        }
    }
  });
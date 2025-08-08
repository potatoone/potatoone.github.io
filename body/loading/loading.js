// 当DOM内容加载完成时执行
document.addEventListener('DOMContentLoaded', function() {
    const startTime = new Date().getTime();    // 记录页面开始加载的时间戳
    const minLoadingTime = 1500;     // 设置最小加载显示时间为1.5秒
    
    // 隐藏加载页面并显示主内容的函数
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainContent = document.querySelector('.background');
        const elapsedTime = new Date().getTime() - startTime;
        
        // 如果经过的时间少于最小加载时间，延迟执行
        if (elapsedTime < minLoadingTime) {
            setTimeout(hideLoadingScreen, minLoadingTime - elapsedTime);
            return;
        }
        
        // 设置加载页面渐隐效果
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
        mainContent.style.display = 'block';
        
        // 等待淡出动画完成后完全移除加载页面
        setTimeout(() => loadingScreen.style.display = 'none', 500);
    }
    
    // 监听页面完全加载事件
    window.addEventListener('load', hideLoadingScreen);
    
    // 设置超时保护机制，防止加载过久
    setTimeout(function() {
        if (document.getElementById('loading-screen').style.visibility !== 'hidden') {
            hideLoadingScreen();
        }
    }, 10000); // 10秒超时
});
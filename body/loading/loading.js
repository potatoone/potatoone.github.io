// 当DOM内容加载完成时执行
document.addEventListener('DOMContentLoaded', function() {
    // 记录页面开始加载的时间戳
    const startTime = new Date().getTime();
    // 设置最小加载显示时间为5秒，确保加载动画至少显示这么长时间
    const minLoadingTime = 5000;
    
    // 隐藏加载页面并显示主内容的函数
    function hideLoadingScreen() {
        // 获取加载页面元素
        const loadingScreen = document.getElementById('loading-screen');
        // 获取主内容元素
        const mainContent = document.querySelector('.background');
        // 计算从开始到现在经过的时间
        const elapsedTime = new Date().getTime() - startTime;
        
        // 如果经过的时间少于最小加载时间，延迟执行
        if (elapsedTime < minLoadingTime) {
            // 递归调用自身，延迟剩余的时间
            setTimeout(hideLoadingScreen, minLoadingTime - elapsedTime);
            return;
        }
        
        // 设置加载页面渐隐效果
        loadingScreen.style.opacity = '0';
        // 隐藏加载页面，但保留空间
        loadingScreen.style.visibility = 'hidden';
        // 显示主内容
        mainContent.style.display = 'block';
        
        // 等待淡出动画完成后完全移除加载页面
        setTimeout(() => loadingScreen.style.display = 'none', 500);
    }
    
    // 监听页面完全加载事件
    window.addEventListener('load', hideLoadingScreen);
    
    // 设置超时保护机制，防止加载过久
    setTimeout(function() {
        // 检查加载页面是否已隐藏
        if (document.getElementById('loading-screen').style.visibility !== 'hidden') {
            // 如果10秒后仍未隐藏，则强制隐藏加载页面
            hideLoadingScreen();
        }
    }, 10000); // 10秒超时
});
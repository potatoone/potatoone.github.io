// 检测移动设备
function isMobileDevice() {
// 检查屏幕宽度
const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
if (screenWidth < 768) return true;

// 检查用户代理字符串是否包含移动设备标识
return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 条件加载窗口管理器资源
if (!isMobileDevice()) {
// 只在非移动设备上加载
document.write('<link rel="stylesheet" href="./windows/window.css">');
document.write('<script src="./windows/window.js" defer><\/script>');
}
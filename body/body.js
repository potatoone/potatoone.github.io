// 检测移动设备
function isMobileDevice() {
// 检查屏幕宽度
const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
if (screenWidth < 200) return true;

}

// 条件加载窗口管理器资源
if (!isMobileDevice()) {
// 只在非移动设备上加载
document.write('<link rel="stylesheet" href="./res/windows/window.css">');
document.write('<script src="./res/windows/window.js" defer><\/script>');
}
// ==============================================
// 背景遮罩层 - 用于增强烟花显示效果的半透明黑色背景
// ==============================================
// 创建遮罩层DOM元素
const backgroundOverlay = document.createElement('div');
// 使用with语句简化样式设置（针对遮罩层的样式对象）
with(backgroundOverlay.style) {
  position = 'absolute';      // 绝对定位，覆盖整个页面
  top = left = 0;             // 定位到页面左上角
  width = height = '100%';    // 宽度和高度均占满整个页面
  backgroundColor = 'rgba(0,0,0,0.57)';  // 半透明黑色（透明度57%）
  display = 'none';           // 默认隐藏，需要时再显示
}
// 将遮罩层添加到页面中
document.body.appendChild(backgroundOverlay);

// ==============================================
// 烟花颜色配置 - 定义烟花粒子和轨迹的颜色组合
// ==============================================
const fireworkColors = [
  { main: '#FF5E5E', trail: '#ff3d00' },    // 红色系（粒子色，轨迹色）
  { main: '#FFB95E', trail: '#ff9800' },    // 橙色系
  { main: '#FFF65E', trail: '#ffeb3b' },    // 黄色系
  { main: '#B9FF5E', trail: '#cddc39' },    // 黄绿色系
  { main: '#5EFF5E', trail: '#8bc34a' },    // 绿色系
  { main: '#5EFFB9', trail: '#4caf50' },    // 青绿色系
  { main: '#5EFFFF', trail: '#00bcd4' },    // 青色系
  { main: '#5EB9FF', trail: '#2196f3' },    // 蓝色系
  { main: '#5E5EFF', trail: '#3f51b5' },    // 靛色系
  { main: '#B95EFF', trail: '#673ab7' },    // 紫色系
  { main: '#FF5EFF', trail: '#9c27b0' },    // 粉紫色系
  { main: '#FF5EB9', trail: '#e91e63' }     // 粉红色系
];

// ==============================================
// 创建单个烟花 - 包含上升轨迹和爆炸效果
// ==============================================
function createFirework() {
  // 1. 计算烟花位置参数
  const startX = 50 + Math.random() * (window.innerWidth - 100); // 底部随机X坐标（左右留边距）
  const centerY = 150 + Math.random() * (window.innerHeight * 0.5); // 烟花爆炸中心Y坐标（上半部分）
  const riseDistance = window.innerHeight - centerY; // 上升总距离（从底部到爆炸中心）
  
  // 2. 计算轨迹线参数（控制长度，避免超过爆炸中心）
  const trailLengthRatio = 0.2 + Math.random() * 0.2; // 轨迹长度占上升距离的20%-40%
  const trailLength = riseDistance * trailLengthRatio; // 实际轨迹线长度
  
  // 3. 动画时间参数
  const riseDuration = 1 + Math.random() * 0.7; // 上升动画时长（1-1.7秒随机）
  const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)]; // 随机选择颜色组合
  
  // 4. 创建上升轨迹线
  const trailLine = document.createElement('div');
  trailLine.className = 'trail-line'; // 添加样式类
  // 集中设置轨迹线样式
  trailLine.style.cssText = `
    left:${startX - 1}px; /* 水平居中对齐发射点 */
    width:2px; /* 细线效果 */
    background:linear-gradient(to top, ${color.trail}, ${color.main}); /* 从轨迹色到粒子色的渐变 */
    --rise-distance:${riseDistance}px; /* CSS变量：上升总距离（用于动画） */
    --trail-length:${trailLength}px; /* CSS变量：轨迹线长度（用于动画） */
    animation:rise ${riseDuration}s linear forwards; /* 应用上升动画 */
  `;
  document.body.appendChild(trailLine); // 添加到页面
  
  // 5. 上升结束后执行爆炸效果（延迟时间等于上升动画时长）
  setTimeout(() => {
    trailLine.remove(); // 移除轨迹线（爆炸后不再需要）
    
    // 创建爆炸粒子容器（用于统一管理粒子）
    const explosion = document.createElement('div');
    explosion.style.cssText = `
      position:absolute;
      left:${startX}px; /* 与轨迹线X坐标一致 */
      top:${centerY}px; /* 爆炸中心Y坐标 */
    `;
    document.body.appendChild(explosion);
    
    // 生成200个爆炸粒子
    for (let i = 0; i < 200; i++) {
      const particle = document.createElement('div');
      // 计算粒子扩散角度（360度均匀分布）
      const angle = (i / 200) * 2 * Math.PI;
      // 计算粒子扩散距离（随机分布，中心密集边缘稀疏）
      const distance = (120 + Math.random() * 80) * (0.2 + 0.8 * Math.sqrt(Math.random()));
      // 计算粒子大小（中心大边缘小）
      const size = 4 + Math.random() * 2 - (distance / 200) * 3;
      
      // 设置粒子样式和动画
      particle.className = 'particle';
      particle.style.cssText = `
        background-color:${color.main}; /* 使用主色作为粒子颜色 */
        width:${size}px;
        height:${size}px;
        animation:explode ${1.5 + Math.random() * 0.5}s ease-out ${Math.random() * 0.2}s forwards; /* 爆炸动画（1.5-2秒，带随机延迟） */
        transform:translate3d(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px, 0); /* 3D变换实现扩散效果 */
      `;
      explosion.appendChild(particle); // 添加到粒子容器
    }
    
    // 爆炸结束后移除粒子容器（2.5秒后，确保动画完成）
    setTimeout(() => explosion.remove(), 2500);
  }, riseDuration * 1000);
}

// ==============================================
// 烟花控制逻辑 - 管理烟花的启动和停止
// ==============================================
let fireworksTimer = null; // 用于存储定时器ID，便于后续清除
let fireworksActive = false; // 烟花活动状态标记

// 初始发射一批烟花（4个，间隔900ms）
function startShow() {
  for (let i = 0; i < 4; i++) {
    setTimeout(createFirework, i * 900);
  }
}

// 受控启动烟花效果
function startShowControlled() {
  if (fireworksActive) return; // 已启动则直接返回，避免重复启动
  fireworksActive = true; // 标记为活动状态
  backgroundOverlay.style.display = 'block'; // 显示背景遮罩
  startShow(); // 启动初始烟花
  // 设置定时器，持续发射烟花（每2.5秒发射1-3个，间隔700ms）
  fireworksTimer = setInterval(() => {
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      setTimeout(createFirework, i * 700);
    }
  }, 2500);
}

// 烟花停止控制
function stopShowControlled() {
  fireworksActive = false;
  clearInterval(fireworksTimer); // 直接清除定时器（即使为null也安全）
  fireworksTimer = null;
  backgroundOverlay.style.display = 'none';
  // 批量移除所有相关元素
  document.querySelectorAll('.trail-line, .particle').forEach(e => e.remove());
}

// 全局开关函数（合并判断逻辑）
window.toggleFireworks = show => show ? startShowControlled() : stopShowControlled();

// 页面初始化逻辑
window.addEventListener('load', () => {
  // 初始化检查和状态监听合并
  const updateFireworks = () => window.checkAndToggleFireworks?.();
  updateFireworks(); // 初始检查
  document.addEventListener('playbackStateChanged', updateFireworks);
});
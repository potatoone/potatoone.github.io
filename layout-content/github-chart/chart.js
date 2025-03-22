// 生成GitHub风格的贡献图
function generateContributionGraph() {
  const container = document.querySelector('.github-contributions');
  if (!container) return;
  
  // 清空容器
  container.innerHTML = '';
  
  // 添加周标签 (Sun to Sat)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach((day, index) => {
    const dayLabel = document.createElement('div');
    dayLabel.className = 'day-label';
    dayLabel.textContent = day;
    dayLabel.style.gridRow = index + 2;
    container.appendChild(dayLabel);
  });
  
  // 添加月份标签
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach((month, index) => {
    const monthLabel = document.createElement('div');
    monthLabel.className = 'month-label';
    
    // 更精确地计算月份位置，确保均匀分布
    // 53列中放置12个月份，每个月份间隔约4.4列
    const columnPosition = Math.floor(index * (53 / 12)) + 2; // +2 因为第一列是星期标签
    monthLabel.style.gridColumn = columnPosition;
    
    monthLabel.textContent = month;
    container.appendChild(monthLabel);
  });
  
  // 获取当前日期
  const today = new Date();
  
  // 生成过去一年的日期单元格
  for (let i = 365; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // 创建贡献单元格
    const cell = document.createElement('div');
    cell.className = 'contribution-cell';
    
    // 随机生成贡献等级
    const level = Math.floor(Math.random() * 5); // 0-4
    cell.classList.add(`level-${level}`);
    
    // 计算单元格在网格中的位置
    const dayOfWeek = date.getDay();
    const weekOffset = Math.floor(i / 7) + 1;
    const column = 53 - weekOffset;
    
    cell.style.gridRow = dayOfWeek + 2;
    cell.style.gridColumn = column + 2;
    
    // 添加工具提示
    const tooltip = document.createElement('div');
    tooltip.className = 'contribution-tooltip';
    tooltip.textContent = `${level} contributions on ${date.toDateString()}`;
    cell.appendChild(tooltip);
    
    container.appendChild(cell);
  }
}

// 页面加载时初始化图表
document.addEventListener('DOMContentLoaded', function() {
  generateContributionGraph();
  // 颜色调整已经移到setcolor.js，这里不需要再调用
});
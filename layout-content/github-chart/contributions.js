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
  
  // 获取真实GitHub贡献数据
  fetch('https://github-contributions-api.jogruber.de/v4/potatoone')
    .then(response => {
      if (!response.ok) {
        throw new Error('网络响应不正常');
      }
      return response.json();
    })
    .then(data => {
      // 确保数据存在且有contributions属性
      if (data && data.contributions) {
        renderContributions(data.contributions, container);
      } else {
        console.error('API返回的数据格式不符合预期');
      }
    })
    .catch(error => {
      console.error('获取贡献数据出错:', error);
      // 出错时使用随机数据作为备用
      renderRandomContributions(container);
    });
}

// 渲染真实贡献数据
function renderContributions(contributions, container) {
  // 获取当前日期
  const today = new Date();
  
  // 处理最近365天的数据
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // 格式化日期为YYYY-MM-DD格式，用于查找对应的贡献数据
    const dateString = date.toISOString().split('T')[0];
    
    // 创建贡献单元格
    const cell = document.createElement('div');
    cell.className = 'contribution-cell';
    
    // 查找这一天的贡献数据
    const contribution = contributions.find(c => c.date === dateString);
    const count = contribution ? contribution.count : 0;
    
  // 根据贡献数量确定等级
  let level = 0;
  if (count > 0) {
    if (count <= 3) level = 1;        // 1-3次贡献：淡色
    else if (count <= 6) level = 2;   // 4-6次贡献：浅色
    else if (count <= 9) level = 3;   // 7-9次贡献：中等色
    else level = 4;                   // 10+次贡献：深色
  }
    
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
    tooltip.textContent = `${count} contribution${count !== 1 ? 's' : ''} on ${date.toDateString()}`;
    cell.appendChild(tooltip);
    
    container.appendChild(cell);
  }
}

// 备用：如果API获取失败，使用随机数据
function renderRandomContributions(container) {
  const today = new Date();
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
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
    
    const tooltip = document.createElement('div');
    tooltip.className = 'contribution-tooltip';
    tooltip.textContent = `${level} contribution${level !== 1 ? 's' : ''} on ${date.toDateString()}`;
    cell.appendChild(tooltip);
    
    container.appendChild(cell);
  }
}

// 页面加载时初始化图表
document.addEventListener('DOMContentLoaded', function() {
  generateContributionGraph();
});
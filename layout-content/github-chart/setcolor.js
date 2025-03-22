// 颜色处理相关函数集合

// RGB转HSL函数
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // 灰色
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch(max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// HSL转RGBA字符串
function hslToRgbaString(h, s, l, a) {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// 分析页面获取主要颜色
function getDominantColors() {
  // 获取背景元素
  const backgroundElement = document.querySelector('.background') || document.body;
  
  // 获取元素样式
  const style = window.getComputedStyle(backgroundElement);
  
  // 提取颜色信息
  let colors = [];
  
  // 1. 尝试获取backgroundColor
  const bgColor = style.backgroundColor;
  if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
    colors.push(parseRgbColor(bgColor));
  }
  
  // 2. 尝试获取backgroundImage (简单处理线性渐变)
  const bgImage = style.backgroundImage;
  if (bgImage && bgImage.includes('linear-gradient')) {
    const gradientColors = extractGradientColors(bgImage);
    colors = colors.concat(gradientColors);
  }
  
  // 3. 如果没有找到颜色或颜色太少，采样DOM树中的其他元素
  if (colors.length < 4) {
    colors = colors.concat(sampleColorsFromDOM());
  }
  
  // 4. 如果仍然没有足够的颜色，添加默认颜色
  if (colors.length === 0) {
    // 默认暗色方案
    return [
      { r: 10, g: 15, b: 30 },    // 深蓝色
      { r: 30, g: 40, b: 70 },    // 中蓝色
      { r: 100, g: 80, b: 180 },  // 紫色
      { r: 190, g: 30, b: 80 }    // 红色
    ];
  }
  
  // 如果颜色数量不足4个，复制现有颜色
  while (colors.length < 4) {
    colors.push({...colors[colors.length % colors.length]});
  }
  
  // 根据亮度排序颜色
  colors.sort((a, b) => {
    const brightnessA = (a.r * 299 + a.g * 587 + a.b * 114) / 1000;
    const brightnessB = (b.r * 299 + b.g * 587 + b.b * 114) / 1000;
    return brightnessA - brightnessB;
  });
  
  // 返回前4种主要颜色
  return colors.slice(0, 4);
}

// 从CSS线性渐变中提取颜色
function extractGradientColors(gradientStr) {
  const colors = [];
  const regex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/g;
  let match;
  
  while ((match = regex.exec(gradientStr)) !== null) {
    colors.push({
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3])
    });
  }
  
  return colors;
}

// 从DOM树采样颜色
function sampleColorsFromDOM() {
  const colors = [];
  const elements = document.querySelectorAll('div, section, header, footer, nav');
  
  // 仅采样前20个元素以避免性能问题
  const samplesToTake = Math.min(elements.length, 20);
  
  for (let i = 0; i < samplesToTake; i++) {
    const style = window.getComputedStyle(elements[i]);
    const bgColor = style.backgroundColor;
    const textColor = style.color;
    
    if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
      colors.push(parseRgbColor(bgColor));
    }
    
    if (textColor && textColor !== 'transparent' && textColor !== 'rgba(0, 0, 0, 0)') {
      colors.push(parseRgbColor(textColor));
    }
  }
  
  return colors;
}

// 解析RGB颜色字符串为对象
function parseRgbColor(colorStr) {
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }
  return null;
}

// 根据主要颜色生成贡献图调色板
function generateContributionPalette(dominantColors) {
  // 确定背景是亮色还是暗色
  const bgColor = dominantColors[0]; // 最暗的颜色（已排序）
  const brightness = (bgColor.r * 299 + bgColor.g * 587 + bgColor.b * 114) / 1000;
  const isDark = brightness < 128;
  
  // 转换为HSL来获取色相
  const bgHSL = rgbToHsl(bgColor.r, bgColor.g, bgColor.b);
  const mainHue = bgHSL[0]; // 主色相
  
  // 生成调色板
  const palette = {
    level0: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)',
    level1: '',
    level2: '',
    level3: '',
    level4: ''
  };
  
  // 使用其他采集的颜色或在主色相基础上生成颜色
  if (dominantColors.length >= 4) {
    // 使用排序后的颜色（从暗到亮）
    const color1 = dominantColors[1];
    const color2 = dominantColors[2];
    const color3 = dominantColors[3];
    
    // 转换为HSL获取色相
    const hsl1 = rgbToHsl(color1.r, color1.g, color1.b);
    const hsl2 = rgbToHsl(color2.r, color2.g, color2.b);
    const hsl3 = rgbToHsl(color3.r, color3.g, color3.b);
    
    // 生成调色板，调整透明度和亮度
    palette.level1 = isDark ? 
      `rgba(${color1.r}, ${color1.g}, ${color1.b}, 0.7)` : 
      `rgba(${color1.r}, ${color1.g}, ${color1.b}, 0.6)`;
      
    palette.level2 = isDark ? 
      `rgba(${color2.r}, ${color2.g}, ${color2.b}, 0.8)` : 
      `rgba(${color2.r}, ${color2.g}, ${color2.b}, 0.7)`;
      
    palette.level3 = isDark ? 
      `rgba(${color3.r}, ${color3.g}, ${color3.b}, 0.85)` : 
      `rgba(${color3.r}, ${color3.g}, ${color3.b}, 0.8)`;
      
    // level4使用色相互补色，保持对比度
    palette.level4 = isDark ? 
      hslToRgbaString((hsl3[0] + 180) % 360, hsl3[1], hsl3[2], 0.9) : 
      hslToRgbaString((hsl3[0] + 180) % 360, hsl3[1], Math.max(30, hsl3[2] - 20), 0.9);
  } else {
    // 回退到基于主色相的方案
    palette.level1 = isDark ? 
      hslToRgbaString(mainHue, 80, 70, 0.7) : 
      hslToRgbaString(mainHue, 70, 40, 0.7);
      
    palette.level2 = isDark ? 
      hslToRgbaString(mainHue, 85, 65, 0.8) : 
      hslToRgbaString(mainHue, 80, 35, 0.8);
      
    palette.level3 = isDark ? 
      hslToRgbaString(mainHue, 90, 60, 0.85) : 
      hslToRgbaString(mainHue, 90, 30, 0.85);
      
    palette.level4 = isDark ? 
      hslToRgbaString((mainHue + 180) % 360, 80, 50, 0.9) : 
      hslToRgbaString((mainHue + 180) % 360, 80, 35, 0.9);
  }
  
  return palette;
}

// 动态采集网站背景色并调整贡献图颜色
function adjustContributionColors() {
  try {
    // 获取主要颜色
    const dominantColors = getDominantColors();
    
    // 生成贡献图调色板
    const palette = generateContributionPalette(dominantColors);
    
    // 判断背景亮度以设置文字颜色
    const bgColor = dominantColors[0];
    const brightness = (bgColor.r * 299 + bgColor.g * 587 + bgColor.b * 114) / 1000;
    const isDark = brightness < 128;
    
    // 设置CSS变量
    document.documentElement.style.setProperty('--contrib-level0', palette.level0);
    document.documentElement.style.setProperty('--contrib-level1', palette.level1);
    document.documentElement.style.setProperty('--contrib-level2', palette.level2);
    document.documentElement.style.setProperty('--contrib-level3', palette.level3);
    document.documentElement.style.setProperty('--contrib-level4', palette.level4);
    
    // 设置文本颜色
    document.documentElement.style.setProperty('--contrib-text', isDark ? 
      'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)');
    
    // 输出调试信息
    console.log('Dominant colors:', dominantColors);
    console.log('Generated palette:', palette);
    
  } catch (error) {
    console.error('Error adjusting contribution colors:', error);
    // 出错时使用默认配色
    setDefaultColors();
  }
}

// 设置默认颜色
function setDefaultColors() {
  document.documentElement.style.setProperty('--contrib-level0', 'rgba(255, 255, 255, 0.15)');
  document.documentElement.style.setProperty('--contrib-level1', 'rgba(160, 145, 216, 0.8)');
  document.documentElement.style.setProperty('--contrib-level2', 'rgba(106, 80, 255, 0.8)');
  document.documentElement.style.setProperty('--contrib-level3', 'rgba(95, 38, 250, 0.85)');
  document.documentElement.style.setProperty('--contrib-level4', 'rgba(207, 23, 84, 0.9)');
  document.documentElement.style.setProperty('--contrib-text', 'rgba(255, 255, 255, 0.7)');
}

// 导出函数，使其可以在chart.js中使用
window.colorUtils = {
  adjustContributionColors
};

// 页面加载完成后初始化颜色
document.addEventListener('DOMContentLoaded', function() {
  adjustContributionColors();
});

// 窗口大小改变时重新适应
window.addEventListener('resize', function() {
  adjustContributionColors();
});
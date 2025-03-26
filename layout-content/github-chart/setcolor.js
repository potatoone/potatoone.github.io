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

// 计算两个颜色的欧几里得距离（用于颜色相似性比较）
function colorDistance(color1, color2) {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  );
}

// 从图片或背景中获取主要颜色
async function getDominantColor() {
  // 获取背景元素
  const backgroundElement = document.querySelector('.background') || document.body;
  const style = window.getComputedStyle(backgroundElement);
  
  // 创建一个Canvas来分析背景
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  // 设置画布尺寸
  const size = 100; // 减小尺寸以提高性能
  canvas.width = size;
  canvas.height = size;
  
  return new Promise((resolve, reject) => {
    // 检查背景是否为图片
    if (style.backgroundImage && style.backgroundImage !== 'none' && !style.backgroundImage.includes('gradient')) {
      // 从background-image URL中提取图片URL
      const imgUrl = style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
      
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // 允许跨域图片
      img.onload = () => {
        // 将图片绘制到canvas
        ctx.drawImage(img, 0, 0, size, size);
        const dominantColor = analyzeCanvasColors(ctx, size);
        resolve(dominantColor);
      };
      img.onerror = () => {
        console.error('Failed to load background image');
        // 回退到简单的背景颜色分析
        resolve(fallbackColorExtraction());
      };
      img.src = imgUrl;
    } else {
      // 如果没有背景图片，直接分析背景颜色
      resolve(fallbackColorExtraction());
    }
  });
}

// 分析Canvas中的颜色并返回最常见的颜色
function analyzeCanvasColors(ctx, size) {
  // 获取像素数据
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  // 颜色频率映射
  const colorFrequency = {};
  
  // 遍历所有像素
  for (let i = 0; i < data.length; i += 4) {
    // 忽略完全透明的像素
    if (data[i+3] < 10) continue;
    
    // 简化颜色以减少可能的变体数量（量化）
    const r = Math.floor(data[i] / 10) * 10;
    const g = Math.floor(data[i+1] / 10) * 10;
    const b = Math.floor(data[i+2] / 10) * 10;
    
    const colorKey = `${r},${g},${b}`;
    
    if (!colorFrequency[colorKey]) {
      colorFrequency[colorKey] = 1;
    } else {
      colorFrequency[colorKey]++;
    }
  }
  
  // 找出出现频率最高的颜色
  let maxFrequency = 0;
  let dominantColorKey = '0,0,0'; // 默认黑色
  
  Object.keys(colorFrequency).forEach(colorKey => {
    if (colorFrequency[colorKey] > maxFrequency) {
      maxFrequency = colorFrequency[colorKey];
      dominantColorKey = colorKey;
    }
  });
  
  // 解析颜色值
  const [r, g, b] = dominantColorKey.split(',').map(Number);
  return { r, g, b };
}

// 备用的颜色提取方法
function fallbackColorExtraction() {
  const backgroundElement = document.querySelector('.background') || document.body;
  const style = window.getComputedStyle(backgroundElement);
  
  // 尝试提取背景颜色
  const bgColor = style.backgroundColor;
  if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
    return parseRgbColor(bgColor);
  }
  
  // 尝试从渐变中提取
  const bgImage = style.backgroundImage;
  if (bgImage && bgImage.includes('linear-gradient')) {
    const gradientColors = extractGradientColors(bgImage);
    if (gradientColors.length > 0) {
      return gradientColors[0];
    }
  }
  
  // 默认颜色
  return { r: 30, g: 40, b: 70 }; // 默认深蓝色
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
  return { r: 0, g: 0, b: 0 }; // 默认黑色
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

// 根据主要颜色生成贡献图调色板（简化版）
function generateContributionPalette(dominantColor) {
  // 转换为HSL来获取色相
  const [h, s, l] = rgbToHsl(dominantColor.r, dominantColor.g, dominantColor.b);
  
  // 计算亮度
  const brightness = (dominantColor.r * 299 + dominantColor.g * 587 + dominantColor.b * 114) / 1000;
  const isDark = brightness < 128;
  
  // 生成调色板
  const palette = {
    level0: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  };
  
  // 简化：使用相同的色相，只调整透明度和亮度
  if (isDark) {
    // 暗背景下使用亮色系列
    palette.level1 = hslToRgbaString(h, 70, 70, 0.3);
    palette.level2 = hslToRgbaString(h, 80, 75, 0.5);
    palette.level3 = hslToRgbaString(h, 90, 80, 0.7);
    palette.level4 = hslToRgbaString(h, 100, 85, 0.9);
  } else {
    // 亮背景下使用深色系列
    palette.level1 = hslToRgbaString(h, 70, 40, 0.3);
    palette.level2 = hslToRgbaString(h, 80, 35, 0.5);
    palette.level3 = hslToRgbaString(h, 90, 30, 0.7);
    palette.level4 = hslToRgbaString(h, 100, 25, 0.9);
  }
  
  return palette;
}

// 动态采集网站背景色并调整贡献图颜色
async function adjustContributionColors() {
  try {
    // 获取主要颜色
    const dominantColor = await getDominantColor();
    console.log('Dominant color:', dominantColor);
    
    // 生成贡献图调色板
    const palette = generateContributionPalette(dominantColor);
    
    // 判断背景亮度以设置文字颜色
    const brightness = (dominantColor.r * 299 + dominantColor.g * 587 + dominantColor.b * 114) / 1000;
    const isDark = brightness < 128;
    
    // 转换为HSL来获取色相（为tooltip颜色使用）
    const [h, s, l] = rgbToHsl(dominantColor.r, dominantColor.g, dominantColor.b);
    
    // 设置CSS变量
    document.documentElement.style.setProperty('--contrib-level0', palette.level0);
    document.documentElement.style.setProperty('--contrib-level1', palette.level1);
    document.documentElement.style.setProperty('--contrib-level2', palette.level2);
    document.documentElement.style.setProperty('--contrib-level3', palette.level3);
    document.documentElement.style.setProperty('--contrib-level4', palette.level4);
    
    // 设置文本颜色
    document.documentElement.style.setProperty('--contrib-text', isDark ? 
      'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)');
    
    // 设置tooltip颜色 - 使用与主色相相同但更深的颜色
    document.documentElement.style.setProperty('--contrib-tooltip', 
      isDark ? 
        hslToRgbaString(h, 60, 30, 1) :  // 暗色背景下使用稍亮但深色的tooltip
        hslToRgbaString(h, 60, 15, 1)    // 亮色背景下使用更深色的tooltip
    );
    
    // 输出调试信息
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
  document.documentElement.style.setProperty('--contrib-tooltip', 'rgba(0, 0, 0, 0.85)');
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
  // 使用节流函数避免过于频繁地调用
  if (window.resizeTimer) {
    clearTimeout(window.resizeTimer);
  }
  window.resizeTimer = setTimeout(function() {
    adjustContributionColors();
  }, 250);
});
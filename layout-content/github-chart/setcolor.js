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

// 从图片或背景中获取主要颜色
async function getDominantColor() {
  // 获取背景元素
  const backgroundElement = document.querySelector('.background') || document.body;
  const style = window.getComputedStyle(backgroundElement);
  
  // 检查背景是否为图片
  if (style.backgroundImage && style.backgroundImage !== 'none' && !style.backgroundImage.includes('gradient')) {
    return extractColorFromImage(style.backgroundImage);
  }
  
  // 尝试提取背景颜色
  const bgColor = style.backgroundColor;
  if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
    return parseRgbColor(bgColor);
  }
  
  // 尝试从渐变中提取
  if (style.backgroundImage && style.backgroundImage.includes('linear-gradient')) {
    const gradientColors = extractGradientColors(style.backgroundImage);
    if (gradientColors.length > 0) {
      return gradientColors[0];
    }
  }
  
  // 默认颜色
  return { r: 30, g: 40, b: 70 };
}

// 从背景图像中提取颜色
function extractColorFromImage(backgroundImage) {
  return new Promise((resolve) => {
    // 从background-image URL中提取图片URL
    const imgUrl = backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
    
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // 允许跨域图片
    
    // 创建Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const size = 100; // 减小尺寸以提高性能
    canvas.width = size;
    canvas.height = size;
    
    img.onload = () => {
      // 将图片绘制到canvas
      ctx.drawImage(img, 0, 0, size, size);
      
      // 获取像素数据
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      
      // 颜色频率映射
      const colorFrequency = {};
      
      // 遍历所有像素
      for (let i = 0; i < data.length; i += 4) {
        // 忽略完全透明的像素
        if (data[i+3] < 10) continue;
        
        // 简化颜色（量化）
        const r = Math.floor(data[i] / 10) * 10;
        const g = Math.floor(data[i+1] / 10) * 10;
        const b = Math.floor(data[i+2] / 10) * 10;
        
        const colorKey = `${r},${g},${b}`;
        colorFrequency[colorKey] = (colorFrequency[colorKey] || 0) + 1;
      }
      
      // 找出出现频率最高的颜色
      let maxFrequency = 0;
      let dominantColorKey = '30,40,70'; // 默认颜色
      
      Object.keys(colorFrequency).forEach(colorKey => {
        if (colorFrequency[colorKey] > maxFrequency) {
          maxFrequency = colorFrequency[colorKey];
          dominantColorKey = colorKey;
        }
      });
      
      // 解析颜色值
      const [r, g, b] = dominantColorKey.split(',').map(Number);
      resolve({ r, g, b });
    };
    
    img.onerror = () => {
      console.error('Failed to load background image');
      resolve({ r: 30, g: 40, b: 70 });
    };
    
    img.src = imgUrl;
  });
}

// 解析RGB颜色字符串为对象
function parseRgbColor(colorStr) {
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  return rgbMatch ? 
    { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) } : 
    { r: 0, g: 0, b: 0 };
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

// 根据主要颜色生成贡献图调色板
function generateContributionPalette(dominantColor) {
  // 转换为HSL来获取色相
  const [h, s, l] = rgbToHsl(dominantColor.r, dominantColor.g, dominantColor.b);
  
  // 计算亮度判断是暗色还是亮色背景
  const brightness = (dominantColor.r * 299 + dominantColor.g * 587 + dominantColor.b * 114) / 1000;
  const isDark = brightness < 100;
  
  // 生成调色板，贡献越多颜色越深
  return {
    level0: isDark ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
    level1: isDark ? hslToRgbaString(h, 70, 70, 0.4) : hslToRgbaString(h, 30, 70, 0.9),
    level2: isDark ? hslToRgbaString(h, 80, 60, 0.5) : hslToRgbaString(h, 40, 60, 0.9),
    level3: isDark ? hslToRgbaString(h, 90, 50, 0.7) : hslToRgbaString(h, 50, 50, 0.9),
    level4: isDark ? hslToRgbaString(h, 100, 40, 0.9) : hslToRgbaString(h, 60, 40, 0.9),
    textColor: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.9)',
    tooltipColor: isDark ? hslToRgbaString(h, 70, 25, 1) : hslToRgbaString(h, 50, 40, 1)
  };
}

// 动态采集网站背景色并调整贡献图颜色
async function adjustContributionColors() {
  try {
    // 获取主要颜色
    const dominantColor = await getDominantColor();
    console.log('Dominant color:', dominantColor);
    
    // 生成贡献图调色板
    const palette = generateContributionPalette(dominantColor);
    
    // 设置CSS变量
    document.documentElement.style.setProperty('--contrib-level0', palette.level0);
    document.documentElement.style.setProperty('--contrib-level1', palette.level1);
    document.documentElement.style.setProperty('--contrib-level2', palette.level2);
    document.documentElement.style.setProperty('--contrib-level3', palette.level3);
    document.documentElement.style.setProperty('--contrib-level4', palette.level4);
    document.documentElement.style.setProperty('--contrib-text', palette.textColor);
    document.documentElement.style.setProperty('--contrib-tooltip', palette.tooltipColor);
    
    console.log('Updated color palette:', palette);
    return palette;
  } catch (error) {
    console.error('Error adjusting contribution colors:', error);
    setDefaultColors();
    return null;
  }
}

// 设置默认颜色
function setDefaultColors() {
  const defaultPalette = {
    level0: 'rgba(255, 255, 255, 0.15)',
    level1: 'rgba(160, 145, 216, 0.8)',
    level2: 'rgba(106, 80, 255, 0.8)',
    level3: 'rgba(95, 38, 250, 0.85)',
    level4: 'rgba(207, 23, 84, 0.9)',
    textColor: 'rgba(255, 255, 255, 0.7)',
    tooltipColor: 'rgba(0, 0, 0, 0.85)'
  };
  
  // 设置CSS变量
  Object.entries(defaultPalette).forEach(([key, value]) => {
    const cssVar = `--contrib-${key.replace('Color', '')}`;
    document.documentElement.style.setProperty(cssVar, value);
  });
  
  return defaultPalette;
}

// 初始化颜色监听和更新
function initColorHandling() {
  // 初始延迟加载
  setTimeout(adjustContributionColors, 300);
  
  // 监听DOM变化
  const observer = new MutationObserver((mutations) => {
    if (document.querySelector('.contribution-chart') || document.querySelector('.js-calendar-graph')) {
      adjustContributionColors();
      observer.disconnect();
    }
  });
  
  // 监听整个文档变化
  observer.observe(document.body, { childList: true, subtree: true });
  
  // 长延迟保底更新
  setTimeout(() => {
    adjustContributionColors();
    observer.disconnect();
  }, 1500);
  
  // 窗口大小变化时更新
  window.addEventListener('resize', debounce(adjustContributionColors, 250));
}

// 节流函数
function debounce(func, wait) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), wait);
  };
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initColorHandling);
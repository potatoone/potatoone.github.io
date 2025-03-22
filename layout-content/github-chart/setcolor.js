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
  
  // 根据背景色生成调色板
  function generatePaletteFromBackground(r, g, b, isDark) {
    // 从背景色提取色相(hue)
    const [h, s, l] = rgbToHsl(r, g, b);
    
    // 针对不同背景生成不同的调色方案
    if (isDark) {
      // 暗色背景：使用较亮的渐变色，保持原背景的色相
      return {
        level0: `rgba(255, 255, 255, 0.15)`,
        level1: hslToRgbaString(h, 80, 70, 0.7),  // 较亮，低饱和度
        level2: hslToRgbaString(h, 85, 65, 0.8),  // 中等亮度
        level3: hslToRgbaString(h, 90, 60, 0.85), // 稍暗
        level4: hslToRgbaString((h + 180) % 360, 80, 50, 0.9) // 互补色
      };
    } else {
      // 亮色背景：使用较暗的渐变色
      return {
        level0: `rgba(0, 0, 0, 0.05)`,
        level1: hslToRgbaString(h, 70, 40, 0.7),
        level2: hslToRgbaString(h, 80, 35, 0.8),
        level3: hslToRgbaString(h, 90, 30, 0.85),
        level4: hslToRgbaString((h + 180) % 360, 80, 35, 0.9) // 互补色
      };
    }
  }
  
  // 动态采集背景色并调整贡献图颜色
  function adjustContributionColors() {
    // 尝试获取背景元素
    const backgroundElement = document.querySelector('.background') || document.body;
    
    // 尝试获取背景色
    let bgColor = getComputedStyle(backgroundElement).backgroundColor;
    
    // 如果背景色为transparent，尝试获取父元素背景
    if (bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
      bgColor = getComputedStyle(document.body).backgroundColor;
    }
    
    // 如果仍然为transparent，设置默认颜色
    if (bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
      bgColor = 'rgb(10, 15, 30)'; // 默认深色背景
    }
    
    // 解析RGB颜色
    const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      
      // 计算亮度
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      const isDark = brightness < 128;
      
      // 从背景色生成调色板
      const palette = generatePaletteFromBackground(r, g, b, isDark);
      
      // 设置CSS变量
      document.documentElement.style.setProperty('--contrib-level0', palette.level0);
      document.documentElement.style.setProperty('--contrib-level1', palette.level1);
      document.documentElement.style.setProperty('--contrib-level2', palette.level2);
      document.documentElement.style.setProperty('--contrib-level3', palette.level3);
      document.documentElement.style.setProperty('--contrib-level4', palette.level4);
      
      // 设置文本颜色
      document.documentElement.style.setProperty('--contrib-text', isDark ? 
        'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)');
    }
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
/**
 * 精简版自动取色器 - 保持核心功能同时减少代码量
 */

// 颜色工具类
class ColorPicker {
  // RGB转HSL
  static rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? 
        (g - b) / d + (g < b ? 6 : 0) : 
        max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  // HSL转RGBA字符串
  static hslToRgba(h, s, l, a) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r, g, b;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    
    return `rgba(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}, ${a})`;
  }

  // 从背景获取主色
  static async getDominantColor() {
    const bgEl = document.querySelector('.background') || document.body;
    const style = getComputedStyle(bgEl);
    
    // 处理背景图片
    if (style.backgroundImage?.includes('url')) {
      const imgUrl = style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];
      if (imgUrl) return this.extractColorFromImage(imgUrl);
    }
    
    // 处理背景颜色
    if (style.backgroundColor && style.backgroundColor !== 'transparent') {
      return this.parseRgbColor(style.backgroundColor);
    }
    
    // 处理渐变
    if (style.backgroundImage?.includes('gradient')) {
      const colors = this.extractGradientColors(style.backgroundImage);
      if (colors.length) return colors[0];
    }
    
    return { r: 30, g: 40, b: 70 }; // 默认颜色
  }

  // 从图片提取颜色
  static extractColorFromImage(imgUrl) {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 50;
        canvas.width = canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        
        const data = ctx.getImageData(0, 0, size, size).data;
        const colorMap = new Map();
        
        for (let i = 0; i < data.length; i += 4) {
          if (data[i+3] < 10) continue; // 跳过透明像素
          const r = Math.floor(data[i] / 20) * 20;
          const g = Math.floor(data[i+1] / 20) * 20;
          const b = Math.floor(data[i+2] / 20) * 20;
          const key = `${r},${g},${b}`;
          colorMap.set(key, (colorMap.get(key) || 0) + 1);
        }
        
        const dominant = [...colorMap.entries()].sort((a, b) => b[1] - a[1])[0];
        resolve(dominant ? { r: +dominant[0].split(',')[0], g: +dominant[0].split(',')[1], b: +dominant[0].split(',')[2] } : { r: 30, g: 40, b: 70 });
      };
      img.onerror = () => resolve({ r: 30, g: 40, b: 70 });
      img.src = imgUrl;
    });
  }

  // 解析RGB颜色
  static parseRgbColor(colorStr) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match ? { r: +match[1], g: +match[2], b: +match[3] } : { r: 0, g: 0, b: 0 };
  }

  // 从渐变提取颜色
  static extractGradientColors(gradientStr) {
    return (gradientStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/g) || [])
      .map(color => {
        const [, r, g, b] = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
        return { r: +r, g: +g, b: +b };
      });
  }

  // 生成贡献图调色板
  static generatePalette({ r, g, b }) {
    const [h, s, l] = this.rgbToHsl(r, g, b);
    const isDark = (r * 299 + g * 587 + b * 114) / 1000 < 100;
    
    return {
      level0: isDark ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
      level1: isDark ? this.hslToRgba(h, 70, 70, 0.4) : this.hslToRgba(h, 30, 70, 0.9),
      level2: isDark ? this.hslToRgba(h, 80, 60, 0.5) : this.hslToRgba(h, 40, 60, 0.9),
      level3: isDark ? this.hslToRgba(h, 90, 50, 0.7) : this.hslToRgba(h, 50, 50, 0.9),
      level4: isDark ? this.hslToRgba(h, 100, 40, 0.9) : this.hslToRgba(h, 60, 40, 0.9),
      textColor: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.9)',
      tooltipColor: isDark ? this.hslToRgba(h, 70, 25, 1) : this.hslToRgba(h, 50, 40, 1)
    };
  }

  // 更新颜色变量
  static async updateColors() {
    try {
      const color = await this.getDominantColor();
      const palette = this.generatePalette(color);
      
      Object.entries(palette).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--contrib-${key.replace('Color', '')}`, value);
      });
      
      console.log('颜色更新:', palette);
      return palette;
    } catch (error) {
      console.error('取色失败:', error);
      this.setDefaultColors();
      return null;
    }
  }

  // 设置默认颜色
  static setDefaultColors() {
    const defaults = {
      level0: 'rgba(255, 255, 255, 0.15)',
      level1: 'rgba(160, 145, 216, 0.8)',
      level2: 'rgba(106, 80, 255, 0.8)',
      level3: 'rgba(95, 38, 250, 0.85)',
      level4: 'rgba(207, 23, 84, 0.9)',
      textColor: 'rgba(255, 255, 255, 0.7)',
      tooltipColor: 'rgba(0, 0, 0, 0.85)'
    };
    
    Object.entries(defaults).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--contrib-${key.replace('Color', '')}`, value);
    });
  }
}

// 初始化监听
document.addEventListener('DOMContentLoaded', () => {
  // 初始取色
  setTimeout(() => ColorPicker.updateColors(), 500);
  
  // 防抖函数
  let timeout;
  const debounce = (func, delay) => {
    clearTimeout(timeout);
    timeout = setTimeout(func, delay);
  };
  
  // 监听DOM变化
  const observer = new MutationObserver(() => {
    debounce(() => ColorPicker.updateColors(), 300);
  });
  
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['style', 'class'],
    childList: true,
    subtree: true
  });
  
  // 监听窗口变化
  window.addEventListener('resize', () => {
    debounce(() => ColorPicker.updateColors(), 300);
  });
});    
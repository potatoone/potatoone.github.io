class ColorPicker {
  // RGB转HSL
  static rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
        case g: h = ((b - r) / d + 2); break;
        case b: h = ((r - g) / d + 4); break;
      }
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
    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return `rgba(${Math.round((r + m) * 255)},${Math.round((g + m) * 255)},${Math.round((b + m) * 255)},${a})`;
  }

  // 获取主色
  static async getDominantColor() {
    const bgEl = document.querySelector('.background') || document.body;
    const style = getComputedStyle(bgEl);

    // 背景图片
    if (style.backgroundImage?.includes('url')) {
      const imgUrl = style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];
      if (imgUrl) return this.extractColorFromImage(imgUrl);
    }

    // 渐变
    if (style.backgroundImage?.includes('gradient')) {
      const colors = this.extractGradientColors(style.backgroundImage);
      if (colors.length) {
        // 取中间色或平均色
        if (colors.length === 1) return colors[0];
        const mid = colors[Math.floor(colors.length / 2)];
        return mid;
      }
    }

    // 背景色
    if (style.backgroundColor && style.backgroundColor !== 'transparent') {
      return this.parseRgbColor(style.backgroundColor);
    }

    return { r: 30, g: 40, b: 70 };
  }

  // 图片主色提取（更快更准）
  static extractColorFromImage(imgUrl) {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const size = 100, canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
        canvas.width = canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data, colorMap = {};
        let max = 0, dominant = [30, 40, 70], cx = size / 2, cy = size / 2, maxDist = Math.sqrt(cx*cx + cy*cy);
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
          const i = (y * size + x) * 4;
          if (data[i+3] < 32) continue;
          const r = Math.round(data[i] / 16) * 16, g = Math.round(data[i+1] / 16) * 16, b = Math.round(data[i+2] / 16) * 16;
          // 新增：排除低饱和度（灰色）像素
          const [h, s] = ColorPicker.rgbToHsl(r, g, b);
          if (s < 15) continue; // 只统计饱和度大于15的色
          const dist = Math.sqrt((x-cx)*(x-cx) + (y-cy)*(y-cy)), weight = 1.2 - dist / maxDist, key = `${r},${g},${b}`;
          colorMap[key] = (colorMap[key] || 0) + weight;
          if (colorMap[key] > max) { max = colorMap[key]; dominant = [r, g, b]; }
        }
        resolve({ r: dominant[0], g: dominant[1], b: dominant[2] });
      };
      img.onerror = () => resolve({ r: 30, g: 40, b: 70 });
      img.src = imgUrl;
    });
  }

  // 解析RGB
  static parseRgbColor(colorStr) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match ? { r: +match[1], g: +match[2], b: +match[3] } : { r: 0, g: 0, b: 0 };
  }

  // 提取渐变色
  static extractGradientColors(str) {
    return (str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g) || []).map(c => {
      const [r, g, b] = c.match(/\d+/g).map(Number);
      return { r, g, b };
    });
  }

  // 生成调色板
  static generatePalette({ r, g, b }) {
    const [h, s, l] = this.rgbToHsl(r, g, b);
    const isDark = (r * 299 + g * 587 + b * 114) / 1000 < 100;
    return {
      level0: isDark ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
      level1: this.hslToRgba(h, isDark ? 70 : 30, 70, isDark ? 0.4 : 0.9),
      level2: this.hslToRgba(h, isDark ? 80 : 40, 60, isDark ? 0.5 : 0.9),
      level3: this.hslToRgba(h, isDark ? 90 : 50, 50, isDark ? 0.7 : 0.9),
      level4: this.hslToRgba(h, isDark ? 100 : 60, 40, 0.9),
      textColor: 'rgba(255,255,255,0.8)',
      tooltipColor: isDark ? this.hslToRgba(h, 70, 25, 1) : this.hslToRgba(h, 50, 40, 1)
    };
  }

  // 更新颜色变量
  static async updateColors() {
    try {
      const color = await this.getDominantColor();
      const palette = this.generatePalette(color);
      Object.entries(palette).forEach(([k, v]) => {
        document.documentElement.style.setProperty(`--contrib-${k.replace('Color', '')}`, v);
      });
      return palette;
    } catch {
      this.setDefaultColors();
      return null;
    }
  }

  // 默认色
  static setDefaultColors() {
    const d = {
      level0: 'rgba(255,255,255,0.15)',
      level1: 'rgba(160,145,216,0.8)',
      level2: 'rgba(106,80,255,0.8)',
      level3: 'rgba(95,38,250,0.85)',
      level4: 'rgba(207,23,84,0.9)',
      textColor: 'rgba(255,255,255,0.7)',
      tooltipColor: 'rgba(0,0,0,0.85)'
    };
    Object.entries(d).forEach(([k, v]) => {
      document.documentElement.style.setProperty(`--contrib-${k.replace('Color', '')}`, v);
    });
  }
}

// 初始化监听
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('wallpaperUpdated', () => {
    setTimeout(() => {
      ColorPicker.updateColors();
    }, 500);
  });
});
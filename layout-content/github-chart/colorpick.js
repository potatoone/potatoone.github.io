class ColorPicker {
  static rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  static hslToRgba(h, s, l, a) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let [r, g, b] = [0, 0, 0];
    if (h < 60) [r, g] = [c, x];
    else if (h < 120) [r, g] = [x, c];
    else if (h < 180) [g, b] = [c, x];
    else if (h < 240) [g, b] = [x, c];
    else if (h < 300) [r, b] = [x, c];
    else [r, b] = [c, x];
    return `rgba(${Math.round((r + m) * 255)},${Math.round((g + m) * 255)},${Math.round((b + m) * 255)},${a})`;
  }

  static async getDominantColor() {
    const el = document.querySelector('.background') || document.body;
    const style = getComputedStyle(el);
    const bgImg = style.backgroundImage;

    if (bgImg?.includes('url')) {
      const url = bgImg.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];
      if (url) return this.extractColorFromImage(url);
    }

    if (bgImg?.includes('gradient')) {
      const colors = this.extractGradientColors(bgImg);
      return colors[Math.floor(colors.length / 2)] || { r: 30, g: 40, b: 70 };
    }

    if (style.backgroundColor && style.backgroundColor !== 'transparent') {
      return this.parseRgbColor(style.backgroundColor);
    }

    return { r: 30, g: 40, b: 70 };
  }

static extractColorFromImage(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 100, cx = 50, cy = 50;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      const map = {}, maxDist = Math.sqrt(cx * cx + cy * cy);
      let max = 0, dominant = [180, 180, 180]; // 默认偏淡灰青

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const i = (y * size + x) * 4;
          if (data[i + 3] < 32) continue; // 透明像素跳过

          const r = data[i], g = data[i + 1], b = data[i + 2];
          const [h, s, l] = this.rgbToHsl(r, g, b);

          // 排除深色（l<40）与低饱和（s<30）
          if (l < 40 || s < 30) continue;

          // 惩罚压抑色调（蓝紫调）
          const huePenalty = (h >= 210 && h <= 260) ? 0.6 : 1;

          // 中心权重
          const dx = x - cx, dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const weight = huePenalty * (1.2 - dist / maxDist);

          const key = `${Math.round(r / 8) * 8},${Math.round(g / 8) * 8},${Math.round(b / 8) * 8}`;
          map[key] = (map[key] || 0) + weight;

          if (map[key] > max) {
            max = map[key];
            dominant = key.split(',').map(Number);
          }
        }
      }

      resolve({ r: dominant[0], g: dominant[1], b: dominant[2] });
    };
    img.onerror = () => resolve({ r: 200, g: 200, b: 210 }); // 柔和默认色
    img.src = url;
  });
}


  static parseRgbColor(str) {
    const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match ? { r: +match[1], g: +match[2], b: +match[3] } : { r: 0, g: 0, b: 0 };
  }

  static extractGradientColors(str) {
    return (str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g) || []).map(c => {
      const [r, g, b] = c.match(/\d+/g).map(Number);
      return { r, g, b };
    });
  }

  static generatePalette({ r, g, b }) {
    const [h] = this.rgbToHsl(r, g, b);
    return {
      level0: 'rgba(255,255,255,0.06)', // 空格固定浅白
      level1: this.hslToRgba(h, 60, 75, 0.9),
      level2: this.hslToRgba(h, 65, 70, 0.9),
      level3: this.hslToRgba(h, 70, 65, 0.9),
      level4: this.hslToRgba(h, 75, 60, 0.9),
      textColor: 'rgba(255, 255, 255, 0.95)',
      tooltipColor: this.hslToRgba(h, 50, 50, 1)
    };
  }

  static async updateColors() {
    try {
      const color = await this.getDominantColor();
      const palette = this.generatePalette(color);
      for (const [k, v] of Object.entries(palette)) {
        document.documentElement.style.setProperty(`--contrib-${k.replace('Color', '')}`, v);
      }
      return palette;
    } catch {
      this.setDefaultColors();
      return null;
    }
  }

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
    for (const [k, v] of Object.entries(d)) {
      document.documentElement.style.setProperty(`--contrib-${k.replace('Color', '')}`, v);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('wallpaperUpdated', () => {
    setTimeout(() => ColorPicker.updateColors(), 500);
  });
});


// 初始化监听
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('wallpaperUpdated', () => {
    setTimeout(() => {
      ColorPicker.updateColors();
    }, 500);
  });
});
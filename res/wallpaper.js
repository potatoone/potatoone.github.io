/**
 * 必应每日壁纸背景加载器（优化版：切换壁纸时保持信息面板显示）
 */
document.addEventListener('DOMContentLoaded', () => {
  const BingWallpaper = (() => {
    const API_URL = 'https://bing.biturl.top';
    const CACHE_DURATION = 86400000; // 24小时缓存
    
    let container = document.body;
    let infoButton, infoElement, infoToggle;
    let currentWallpaperData = null;
    let currentIndex = 0;
    let isInfoPanelVisible = false;
    
    // 工具函数：获取缓存键
    const getCacheKey = index => `bing_wallpaper_cache_${index}`;
    const getCacheTimeKey = index => `bing_wallpaper_timestamp_${index}`;
    
    // 工具函数：根据index获取日期字符串 (格式: YYYYMMDD)
    const getDateByIndex = index => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 工具函数：格式化日期为 年份后两位+月日格式 (例如: 250614)
    const formatShortDate = dateStr => 
      dateStr ? `${dateStr.substring(2, 4)}${dateStr.substring(4, 6)}${dateStr.substring(6, 8)}` : '';
    
    // 从缓存加载
    const loadFromCache = index => {
      try {
        const timestamp = localStorage.getItem(getCacheTimeKey(index));
        if (timestamp && Date.now() - timestamp < CACHE_DURATION) {
          const cachedData = localStorage.getItem(getCacheKey(index));
          if (cachedData) {
            currentWallpaperData = JSON.parse(cachedData);
            applyWallpaper(currentWallpaperData);
            return true;
          }
        }
      } catch (e) {
        console.error('读取缓存失败:', e);
      }
      return false;
    };
    
    // 从API加载壁纸
    const loadWallpaper = (index = 0, forceReload = false) => {
      isInfoPanelVisible = infoToggle?.checked || false;
      
      if (index < 0 || index > 7) {
        console.error('index参数必须在0-7之间');
        return;
      }
      
      currentIndex = index;
      
      if (!forceReload && loadFromCache(index)) {
        console.log(`从缓存加载壁纸，index=${index}`);
        return;
      }
      
      const params = new URLSearchParams({
        resolution: 'UHD',
        format: 'json',
        index: index.toString(),
        mkt: 'zh-CN'
      });
      
      const url = `${API_URL}?${params.toString()}${forceReload ? '&random=' + Math.random() : ''}`;
      
      fetch(url)
        .then(res => res.ok ? res.json() : Promise.reject(`API错误: ${res.status}`))
        .then(data => {
          currentWallpaperData = {
            url: data.url,
            copyright: data.copyright,
            date: data.end_date,
            index
          };
          
          saveToCache(currentWallpaperData);
          applyWallpaper(currentWallpaperData);
        })
        .catch(error => {
          console.error('加载壁纸失败:', error);
          const fallbackData = {
            url: 'https://www.bing.com/th?id=OHR.SedonaSpring_ZH-CN6305197600_1920x1080.jpg',
            copyright: '红色岩层，塞多纳，亚利桑那州，美国 (© Jim Ekstrand/Alamy Stock Photo)',
            date: getDateByIndex(index),
            index
          };
          applyWallpaper(fallbackData);
        });
    };
    
    // 保存到缓存
    const saveToCache = data => {
      try {
        localStorage.setItem(getCacheKey(data.index), JSON.stringify(data));
        localStorage.setItem(getCacheTimeKey(data.index), Date.now());
      } catch (e) {
        console.error('保存缓存失败:', e);
      }
    };
    
    // 应用壁纸
    const applyWallpaper = data => {
      if (!data || !data.url) return;
      
      const img = new Image();
      img.onload = () => {
        container.style.background = `url('${data.url}') no-repeat center/cover fixed`;
        createInfoButton();
        console.log(`壁纸设置成功，index=${data.index}，日期: ${formatShortDate(data.date)}`);
        
        document.dispatchEvent(new CustomEvent('wallpaperUpdated', {
          detail: { url: data.url, date: data.date }
        }));
        
        window.toggleFireworks?.();
      };
      img.onerror = () => console.error('图片加载失败:', data.url);
      img.src = data.url;
    };
    
    // 创建信息按钮和面板
    const createInfoButton = () => {
      // 移除旧元素
      [infoButton, infoElement, infoToggle].forEach(el => el?.remove());

      // 创建隐藏checkbox
      infoToggle = document.createElement('input');
      Object.assign(infoToggle, { type: 'checkbox', id: 'wallpaper-info-toggle', style: 'display:none' });
      infoToggle.checked = isInfoPanelVisible;

      // 创建信息按钮
      infoButton = document.createElement('label');
      infoButton.setAttribute('for', 'wallpaper-info-toggle');
      infoButton.style.cssText = 'position:fixed;top:5px;right:5px;width:17px;height:17px;border-radius:50%;background:rgba(0,0,0,0.3);color:white;display:flex;align-items:center;justify-content:center;font-size:10px;cursor:pointer;z-index:10;opacity:0.4;transition:opacity 0.3s,background-color 0.3s';
      infoButton.innerHTML = '<i>i</i>';

      // 创建信息面板
      infoElement = document.createElement('div');
      infoElement.className = 'wallpaper-info-panel';
      infoElement.style.cssText = 'position:fixed;top:22px;right:22px;background:rgba(0,0,0,0.37);backdrop-filter:blur(5px);color:white;padding:7px;border-radius:4px;box-sizing:border-box;font-size:9px;max-width:220px;z-index:10;opacity:0;pointer-events:none;transition:opacity 0.3s';

      // 切换事件
      infoToggle.addEventListener('change', () => {
        isInfoPanelVisible = infoToggle.checked;
        infoElement.style.cssText = `position:fixed;top:22px;right:22px;background:rgba(0,0,0,0.37);backdrop-filter:blur(5px);color:white;padding:7px;border-radius:4px;box-sizing:border-box;font-size:9px;max-width:220px;z-index:10;opacity:${isInfoPanelVisible ? '1' : '0'};pointer-events:${isInfoPanelVisible ? 'auto' : 'none'};transition:opacity 0.3s`;
        
        if (isInfoPanelVisible) updateInfoPanelContent(currentWallpaperData);
      });

      // 初始状态设置
      if (isInfoPanelVisible) {
        updateInfoPanelContent(currentWallpaperData);
        infoElement.style.opacity = '1';
        infoElement.style.pointerEvents = 'auto';
      }

      document.body.append(infoToggle, infoButton, infoElement);
    };
    
    // 更新信息面板内容（仅修改 innerHTML 部分的样式）
    const updateInfoPanelContent = data => {
      infoElement.innerHTML = `
        <div style="display:flex;align-items:center;height:32px"> <!-- 外层容器垂直居中，设置最小高度确保对齐 -->
          <div style="display:flex;flex-direction:column;margin-right:8px">
            <div style="font-weight:bold;margin-bottom:4px;text-align:center">${formatShortDate(data.date)}</div>
            <div style="display:flex">
              <button style="background:rgba(255,255,255,0.1);color:white;border:none;border-radius:3px;padding:1px 6px;margin-right:2px;cursor:pointer;font-size:12px;opacity:${data.index < 7 ? '0.8' : '0.3'}" ${data.index < 7 ? '' : 'disabled'}>-</button>
              <button style="background:rgba(255,255,255,0.1);color:white;border:none;border-radius:3px;padding:1px 6px;cursor:pointer;font-size:12px;opacity:${data.index > 0 ? '0.8' : '0.3'}" ${data.index > 0 ? '' : 'disabled'}>+</button>
            </div>
          </div>
          <!-- 版权信息容器添加 vertical-align: middle 增强居中效果 -->
          <div style="flex:1;white-space:normal;line-height:1.2;vertical-align:middle">${data.copyright}</div>
        </div>
      `;
      
      // 绑定按钮事件（保持不变）
      const prevBtn = infoElement.querySelector('button:first-child');
      const nextBtn = infoElement.querySelector('button:last-child');
      
      if (data.index < 7) prevBtn.onclick = () => loadWallpaper(data.index + 1, true);
      if (data.index > 0) nextBtn.onclick = () => loadWallpaper(data.index - 1, true);
    };
    
    // 公开API
    return {
      init: (options = {}) => {
        if (options.container) {
          const el = document.querySelector(options.container);
          if (el) container = el;
        }
        loadWallpaper(0);
      },
      refresh: () => loadWallpaper(currentIndex, true),
      setContainer: selector => {
        const el = document.querySelector(selector);
        if (el) container = el;
      },
      loadByIndex: index => loadWallpaper(index, true)
    };
  })();
  
  // 初始化壁纸
  BingWallpaper.init({ container: '.background' });
  
  // 暴露接口
  window.BingWallpaper = BingWallpaper;
});
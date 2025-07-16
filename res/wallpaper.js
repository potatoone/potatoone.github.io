/**
 * 必应每日壁纸背景加载器
 */
document.addEventListener('DOMContentLoaded', () => {
  const BingWallpaper = (() => {
    const API_URL = 'https://bing.biturl.top';
    const MAX_CACHE_COUNT = 7;

    let container = document.body;
    let infoButton, infoElement, infoToggle;
    let currentWallpaperData = null;
    let currentIndex = 0;
    let isInfoPanelVisible = false;

    // 缓存键生成
    const getCacheKey = index => `bing_wallpaper_cache_${index}`;
    const getCacheIndexListKey = () => 'bing_wallpaper_cache_indices';

    // 日期处理
    const getCurrentSystemDate = () => {
      const date = new Date();
      return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    };

    const getDateByIndex = index => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    };

    const formatShortDate = dateStr => 
      dateStr ? `${dateStr.substring(2, 4)}${dateStr.substring(4, 6)}${dateStr.substring(6, 8)}` : '';

    // 缓存池管理（按日期顺序保留最近7天）
    const manageCachePool = (newIndex) => {
      // 生成0-7的索引数组（最近7天）
      const validIndices = Array.from({length: 8}, (_, i) => i);
      
      // 清除不在有效范围内的缓存
      const cachedIndices = JSON.parse(localStorage.getItem(getCacheIndexListKey()) || '[]');
      cachedIndices.forEach(idx => {
        if (!validIndices.includes(idx)) {
          localStorage.removeItem(getCacheKey(idx));
          console.log(`[壁纸] 清除无效缓存 index=${idx}`);
        }
      });
      
      // 更新缓存索引列表
      localStorage.setItem(getCacheIndexListKey(), JSON.stringify(validIndices));
      console.log(`[壁纸] 当前缓存索引: ${validIndices.join(', ')}`);
    };

    // 缓存有效性检查
    const isCacheValid = (index) => {
      // 检查索引范围
      if (index < 0 || index > 7) return false;
      
      const cacheData = JSON.parse(localStorage.getItem(getCacheKey(index)) || '{}');
      
      // 确保至少有url字段
      if (!cacheData.url) {
        console.log(`[壁纸] 缓存缺少url字段 index=${index}`);
        return false;
      }
      
      // 检查缓存日期是否匹配预期日期
      const expectedDate = getDateByIndex(index);
      if (cacheData.date !== expectedDate) {
        console.log(`[壁纸] 缓存日期不匹配 index=${index} 缓存=${cacheData.date} 预期=${expectedDate}`);
        return false;
      }
      
      return true;
    };

    // 从缓存加载
    const loadFromCache = index => {
      if (!isCacheValid(index)) return false;
      
      try {
        const cacheData = JSON.parse(localStorage.getItem(getCacheKey(index)));
        currentWallpaperData = cacheData;
        applyWallpaper(currentWallpaperData);
        return true;
      } catch (e) {
        console.error(`[壁纸] 缓存解析失败 index=${index}`, e);
        localStorage.removeItem(getCacheKey(index));
        return false;
      }
    };

    // 从API加载（修复：严格检查缓存）
    const loadWallpaper = (index = 0, forceReload = false) => {
      if (index < 0 || index > 7) {
        console.error(`[参数错误] index必须在0-7之间，当前=${index}`);
        return;
      }
      
      currentIndex = index;
      isInfoPanelVisible = infoToggle?.checked || false;
      
      // 非强制刷新时优先使用缓存
      if (!forceReload && loadFromCache(index)) {
        return;
      }
      
      console.log(`[壁纸 API] 请求 index=${index} 日期=${getDateByIndex(index)}`);
      const params = new URLSearchParams({
        resolution: 'UHD',
        format: 'json',
        index: index,
        mkt: 'zh-CN'
      });
      
      fetch(`${API_URL}?${params}`)
        .then(res => res.ok ? res.json() : Promise.reject(res.status))
        .then(data => {
          // 构建完整的壁纸数据对象
          currentWallpaperData = {
            url: data.url,
            copyright: data.copyright,
            date: data.end_date || getDateByIndex(index),
            index
          };
          
          // 保存缓存并更新缓存池
          localStorage.setItem(getCacheKey(index), JSON.stringify(currentWallpaperData));
          manageCachePool(index);
          console.log(`[壁纸 API] 加载成功 index=${index} 日期=${currentWallpaperData.date}`);
          
          applyWallpaper(currentWallpaperData);
        })
        .catch(error => {
          console.error(`[壁纸API] 加载失败 index=${index}`, error);
          // 尝试使用过期缓存作为降级
          const oldData = localStorage.getItem(getCacheKey(index));
          if (oldData) {
            try {
              currentWallpaperData = JSON.parse(oldData);
              applyWallpaper(currentWallpaperData);
              console.log(`[壁纸] 使用过期缓存 index=${index}`);
            } catch (e) {
              console.error(`[壁纸] 缓存降级失败 index=${index}`, e);
            }
          }
        });
    };

    // 应用壁纸
    const applyWallpaper = data => {
      const img = new Image();
      img.onload = () => {
        container.style.background = `url('${data.url}') no-repeat center/cover fixed`;
        createInfoButton();
        console.log(`[壁纸] 设置完成 index=${data.index}`);
        
        // 触发壁纸更新事件
        setTimeout(() => {
          document.dispatchEvent(new Event('wallpaperUpdated'));
        }, 100);
      };
      img.onerror = () => console.error(`[壁纸] 图片加载失败 ${data.url}`);
      img.src = data.url;
    };

    // 创建信息面板
    const createInfoButton = () => {
      [infoButton, infoElement, infoToggle].forEach(el => el?.remove());

      infoToggle = document.createElement('input');
      Object.assign(infoToggle, { type: 'checkbox', id: 'wallpaper-info-toggle', style: 'display:none' });
      infoToggle.checked = isInfoPanelVisible;

      infoButton = document.createElement('label');
      infoButton.setAttribute('for', 'wallpaper-info-toggle');
      infoButton.style.cssText = 'position:fixed;top:5px;right:5px;width:17px;height:17px;border-radius:50%;background:rgba(0, 0, 0, 0.14);backdrop-filter:blur(2px);color:white;display:flex;align-items:center;justify-content:center;font-size:10px;z-index:10;';
      infoButton.innerHTML = '<i>i</i>';

      infoElement = document.createElement('div');
      infoElement.className = 'wallpaper-info-panel';
      infoElement.style.cssText = 'position:fixed;top:22px;right:22px;background:rgba(0,0,0,0.37);backdrop-filter:blur(5px);color:white;padding:7px;border-radius:4px;box-sizing:border-box;font-size:9px;max-width:240px;z-index:10;opacity:0;pointer-events:none;transition:opacity 0.3s';

      infoToggle.addEventListener('change', () => {
        isInfoPanelVisible = infoToggle.checked;
        infoElement.style.opacity = isInfoPanelVisible ? '1' : '0';
        infoElement.style.pointerEvents = isInfoPanelVisible ? 'auto' : 'none';
        if (isInfoPanelVisible) updateInfoPanelContent(currentWallpaperData);
      });

      if (isInfoPanelVisible) {
        updateInfoPanelContent(currentWallpaperData);
        infoElement.style.opacity = '1';
        infoElement.style.pointerEvents = 'auto';
      }

      document.body.append(infoToggle, infoButton, infoElement);
    };

    const updateInfoPanelContent = data => {
      infoElement.innerHTML = `
        <div style="display:flex;align-items:center;height:32px">
          <div style="display:flex;flex-direction:column;margin-right:8px">
            <div style="font-weight:bold;margin-bottom:3px;text-align:center">${formatShortDate(data.date)}</div>
            <div style="display:flex">
              <button style="background:rgba(255,255,255,0.06);color:white;border:none;border-radius:3px;padding:1px 6px;margin-right:3px;font-size:12px;opacity:${data.index < 7 ? '1' : '0.25'}" ${data.index < 7 ? '' : 'disabled'}>-</button>
              <button style="background:rgba(255,255,255,0.06);color:white;border:none;border-radius:3px;padding:1px 6px;font-size:12px;opacity:${data.index > 0 ? '1' : '0.25'}" ${data.index > 0 ? '' : 'disabled'}>+</button>
            </div>
          </div>
          <div style="flex:1;white-space:normal;line-height:1.2">${data.copyright}</div>
        </div>
      `;
      
      const prevBtn = infoElement.querySelector('button:first-child');
      const nextBtn = infoElement.querySelector('button:last-child');
      
      if (data.index < 7) prevBtn.onclick = () => loadWallpaper(data.index + 1);
      if (data.index > 0) nextBtn.onclick = () => loadWallpaper(data.index - 1);
    };

    return {
      init: (options = {}) => {
        if (options.container) {
          const el = document.querySelector(options.container);
          if (el) container = el;
        }
        
        // 初始化监听
        document.addEventListener('wallpaperUpdated', () => {
          setTimeout(() => {
              console.log('[壁纸] 触发颜色拾取器更新');
          }, 500);
        });
        
        loadWallpaper(0);
      },
      refresh: () => loadWallpaper(currentIndex, true),
      setContainer: selector => {
        const el = document.querySelector(selector);
        if (el) container = el;
      },
      loadByIndex: index => loadWallpaper(index)
    };
  })();
  
  BingWallpaper.init({ container: '.background' });
  window.BingWallpaper = BingWallpaper;
});
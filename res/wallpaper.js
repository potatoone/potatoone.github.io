/**
 * 必应每日壁纸背景加载器
 * 使用index参数实现7天内壁纸切换
 */

document.addEventListener('DOMContentLoaded', () => {
  const BingWallpaper = (() => {
    const API_URL = 'https://bing.biturl.top';
    const CACHE_DURATION = 86400000; // 24小时缓存
    
    let container = document.body;
    let infoButton = null;
    let infoElement = null;
    let currentWallpaperData = null;
    let isPanelVisible = false;
    let currentIndex = 0; // 0=今天，1=昨天，2=前天...最大7
    
    // 工具函数：获取缓存键
    const getCacheKey = (index) => `bing_wallpaper_cache_${index}`;
    const getCacheTimeKey = (index) => `bing_wallpaper_timestamp_${index}`;
    
    // 工具函数：根据index获取日期字符串 (格式: YYYYMMDD)
    const getDateByIndex = (index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 工具函数：格式化日期为 年份后两位+月日格式 (例如: 250614)
    const formatShortDate = (dateStr) => 
      dateStr ? `${dateStr.substring(2, 4)}${dateStr.substring(4, 6)}${dateStr.substring(6, 8)}` : '';
    
    // 从缓存加载
    const loadFromCache = (index) => {
      try {
        const timestamp = localStorage.getItem(getCacheTimeKey(index));
        if (timestamp && Date.now() - timestamp < CACHE_DURATION) {
          const cachedData = localStorage.getItem(getCacheKey(index));
          if (cachedData) {
            const imageData = JSON.parse(cachedData);
            currentWallpaperData = imageData;
            applyWallpaper(imageData);
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
      if (index < 0 || index > 7) {
        console.error('index参数必须在0-7之间');
        return;
      }
      
      currentIndex = index;
      
      // 如果不强制刷新且缓存存在，则使用缓存
      if (!forceReload && loadFromCache(index)) {
        console.log(`从缓存加载壁纸，index=${index}`);
        return;
      }
      
      // 生成请求参数
      const params = new URLSearchParams({
        resolution: 'UHD',
        format: 'json',
        index: index.toString(),
        mkt: 'zh-CN'
      });
      
      // 生成请求URL，强制刷新时添加随机参数
      const url = `${API_URL}?${params.toString()}${forceReload ? '&random=' + Math.random() : ''}`;
      
      fetch(url)
        .then(res => res.ok ? res.json() : Promise.reject(`API错误: ${res.status}`))
        .then(data => {
          const imageData = {
            url: data.url,
            copyright: data.copyright,
            date: data.start_date,
            index: index
          };
          
          currentWallpaperData = imageData;
          saveToCache(imageData);
          applyWallpaper(imageData);
        })
        .catch(error => {
          console.error('加载壁纸失败:', error);
          const fallbackData = {
            url: 'https://www.bing.com/th?id=OHR.SedonaSpring_ZH-CN6305197600_1920x1080.jpg',
            copyright: '红色岩层，塞多纳，亚利桑那州，美国 (© Jim Ekstrand/Alamy Stock Photo)',
            date: getDateByIndex(index),
            index: index
          };
          currentWallpaperData = fallbackData;
          applyWallpaper(fallbackData);
        });
    };
    
    // 保存到缓存
    const saveToCache = (data) => {
      try {
        localStorage.setItem(getCacheKey(data.index), JSON.stringify(data));
        localStorage.setItem(getCacheTimeKey(data.index), Date.now());
      } catch (e) {
        console.error('保存缓存失败:', e);
      }
    };
    
    // 应用壁纸
    const applyWallpaper = (data) => {
      if (!data || !data.url) return;
      
      const img = new Image();
      img.onload = () => {
        container.style.background = `url('${data.url}') no-repeat center/cover fixed`;
        createInfoButton();
        console.log(`壁纸设置成功，index=${data.index}，日期: ${formatShortDate(data.date)}`);
        window.toggleFireworks?.();
      };
      img.onerror = () => console.error('图片加载失败:', data.url);
      img.src = data.url;
    };
    
    // 创建信息按钮和面板
    const createInfoButton = () => {
      // 移除旧元素
      infoButton?.remove();
      infoElement?.remove();
      
      // 创建信息按钮
      infoButton = document.createElement('div');
      Object.assign(infoButton.style, {
        position: 'fixed', top: '5px', right: '5px',
        width: '17px', height: '17px', borderRadius: '50%',
        backgroundColor: 'rgba(0,0,0,0.3)', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', cursor: 'pointer', zIndex: '1000',
        opacity: '0.4', transition: 'opacity 0.3s, background-color 0.3s'
      });
      infoButton.innerHTML = '<i>i</i>';
      
      // 创建信息面板
      infoElement = document.createElement('div');
      Object.assign(infoElement.style, {
        position: 'fixed', top: '22px', right: '22px',
        background: 'rgba(0,0,0,0.37)', backdropFilter: 'blur(5px)',
        color: 'white', padding: '8px 12px', borderRadius: '4px',
        boxSizing: 'border-box', fontSize: '10px', maxWidth: '300px',
        zIndex: '999', display: 'none', opacity: '0', transition: 'opacity 0.3s'
      });
      
      // 点击事件
      infoButton.onclick = (e) => {
        e.stopPropagation();
        toggleInfoPanel();
      };
      
      // 鼠标事件
      infoButton.onmouseenter = () => {
        infoButton.style.opacity = '0.7';
        infoButton.style.backgroundColor = 'rgba(133,76,214,0.6)';
      };
      
      infoButton.onmouseleave = () => {
        if (!isPanelVisible) {
          infoButton.style.opacity = '0.5';
          infoButton.style.backgroundColor = 'rgba(0,0,0,0.3)';
        }
      };
      
      // 添加到文档
      document.body.append(infoButton, infoElement);
      
      // 恢复面板状态
      if (isPanelVisible && currentWallpaperData) {
        showInfoPanel();
      }
      
      // 点击外部隐藏面板
      document.addEventListener('click', hidePanelOnClickOutside);
    };
    
    // 显示信息面板
    const showInfoPanel = () => {
      if (!currentWallpaperData) return;
      
      updateInfoPanelContent(currentWallpaperData);
      infoElement.style.display = 'block';
      setTimeout(() => infoElement.style.opacity = '1', 10);
      infoButton.style.opacity = '0.7';
      infoButton.style.backgroundColor = 'rgba(133,76,214,0.6)';
      isPanelVisible = true;
    };
    
    // 隐藏信息面板
    const hideInfoPanel = () => {
      infoElement.style.opacity = '0';
      infoElement.addEventListener('transitionend', () => {
        infoElement.style.display = 'none';
      }, { once: true });
      infoButton.style.opacity = '0.5';
      infoButton.style.backgroundColor = 'rgba(0,0,0,0.3)';
      isPanelVisible = false;
    };
    
    // 切换信息面板显示状态
    const toggleInfoPanel = () => {
      if (isPanelVisible) {
        hideInfoPanel();
      } else {
        showInfoPanel();
      }
    };
    
    // 点击外部隐藏面板
    const hidePanelOnClickOutside = (e) => {
      if (infoElement && !infoElement.contains(e.target) && e.target !== infoButton) {
        hideInfoPanel();
      }
    };
    
    // 更新信息面板内容
    const updateInfoPanelContent = (data) => {
      infoElement.innerHTML = '';
      
      // 创建主容器
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'flex-start';
      
      // 创建导航区域
      const nav = document.createElement('div');
      nav.style.display = 'flex';
      nav.style.flexDirection = 'column';
      nav.style.marginRight = '8px';
      
      // 添加日期显示 (修改为年份后两位+月日格式)
      const dateEl = document.createElement('div');
      dateEl.textContent = formatShortDate(data.date);
      dateEl.style.fontWeight = 'bold';
      dateEl.style.marginBottom = '4px';
      dateEl.style.textAlign = 'center';
      
      // 添加按钮容器
      const buttons = document.createElement('div');
      buttons.style.display = 'flex';
      
      // 上一张按钮
      const prevBtn = document.createElement('button');
      prevBtn.textContent = '-';
      prevBtn.style.cssText = 'background:rgba(255,255,255,0.1);color:white;border:none;border-radius:3px;padding:2px 6px;margin-right:2px;cursor:pointer;font-size:10px;opacity:0.8';
      
      // 下一张按钮
      const nextBtn = document.createElement('button');
      nextBtn.textContent = '+';
      nextBtn.style.cssText = 'background:rgba(255,255,255,0.1);color:white;border:none;border-radius:3px;padding:2px 6px;cursor:pointer;font-size:10px;opacity:0.8';
      
      // 添加到容器
      buttons.append(prevBtn, nextBtn);
      nav.append(dateEl, buttons);
      
      // 添加版权信息
      const copyrightEl = document.createElement('div');
      copyrightEl.textContent = data.copyright;
      copyrightEl.style.flex = '1';
      copyrightEl.style.whiteSpace = 'normal';
      copyrightEl.style.lineHeight = '1.4';
      
      // 添加到主容器
      container.append(nav, copyrightEl);
      infoElement.append(container);
      
      // 设置按钮状态
      // 前一天按钮
      if (data.index < 7) {
        prevBtn.onclick = () => {
          loadWallpaper(data.index + 1, true); // 加载前一天
        };
      } else {
        prevBtn.disabled = true;
        prevBtn.style.opacity = '0.3';
        prevBtn.style.cursor = 'not-allowed';
      }
      
      // 后一天按钮
      if (data.index > 0) {
        nextBtn.onclick = () => {
          loadWallpaper(data.index - 1, true); // 加载后一天
        };
      } else {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.3';
        nextBtn.style.cursor = 'not-allowed';
      }
    };
    
    // 公开API
    return {
      init: (options = {}) => {
        if (options.container) {
          const el = document.querySelector(options.container);
          if (el) container = el;
        }
        
        loadWallpaper(0); // 默认加载今天的壁纸
      },
      refresh: () => loadWallpaper(currentIndex, true), // 强制刷新当前壁纸
      setContainer: (selector) => {
        const el = document.querySelector(selector);
        if (el) container = el;
      },
      loadByIndex: (index) => { // 通过index加载壁纸
        loadWallpaper(index, true);
      }
    };
  })();
  
  // 初始化壁纸
  BingWallpaper.init({
    container: '.background',
  });
  
  // 暴露接口
  window.BingWallpaper = BingWallpaper;
});    
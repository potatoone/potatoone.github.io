/**
 * 必应每日壁纸背景加载器
 * 从Bing API获取每日壁纸并设置为网页背景
 */

document.addEventListener('DOMContentLoaded', function() {
    const BingWallpaper = (() => {
      // 私有变量
      const apiUrl = 'https://dailybing.com/api/v1';
      const defaultParams = {
        date: 'latest', // 可以是'latest'或特定日期，格式为'yyyyMMdd'
        lang: 'zh-CN',  // 语言: zh-CN,en-US等
        mode: 'image'   // mode: 'image' 获取图片URL; 'json' 获取完整信息
      };
      
      // 缓存键，用于本地存储
      const CACHE_KEY = 'bing_wallpaper_cache';
      const CACHE_TIME_KEY = 'bing_wallpaper_timestamp';
      const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时缓存
      
      // 容器元素
      let container = document.body;
      let loadingIndicator = null;
      
      // 初始化函数
      function init(options = {}) {
        // 合并选项
        const config = {...defaultParams, ...options};
        
        // 如果指定了容器选择器
        if (options.container) {
          const customContainer = document.querySelector(options.container);
          if (customContainer) {
            container = customContainer;
          }
        }
        
        // 创建加载指示器
        createLoadingIndicator();
        
        // 尝试从缓存加载
        if (options.useCache !== false && loadFromCache()) {
          console.log('必应壁纸已从缓存加载');
          removeLoadingIndicator();
          return;
        }
        
        // 否则从API加载
        loadWallpaper(config);
      }
      
      // 创建加载指示器
      function createLoadingIndicator() {
        loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'bing-wallpaper-loading';
        loadingIndicator.innerHTML = '加载壁纸中...';
        
        const style = loadingIndicator.style;
        style.position = 'fixed';
        style.top = '20px';
        style.right = '20px';
        style.background = 'rgba(0,0,0,0.5)';
        style.color = 'white';
        style.padding = '10px';
        style.borderRadius = '5px';
        style.zIndex = '9999';
        
        document.body.appendChild(loadingIndicator);
      }
      
      // 移除加载指示器
      function removeLoadingIndicator() {
        if (loadingIndicator && loadingIndicator.parentNode) {
          loadingIndicator.parentNode.removeChild(loadingIndicator);
          loadingIndicator = null;
        }
      }
      
      // 从缓存加载
      function loadFromCache() {
        try {
          const timestamp = localStorage.getItem(CACHE_TIME_KEY);
          const now = new Date().getTime();
          
          // 检查缓存是否过期
          if (timestamp && (now - timestamp < CACHE_DURATION)) {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) {
              const data = JSON.parse(cachedData);
              applyWallpaper(data);
              return true;
            }
          }
        } catch (error) {
          console.error('读取壁纸缓存失败:', error);
        }
        
        return false;
      }
      
      // 修改loadWallpaper函数，使用JSONP方式请求数据(避开CORS限制)
      function loadWallpaper(config) {
        // 清除任何之前的JSONP脚本
        const oldScript = document.getElementById('bing-jsonp');
        if (oldScript && oldScript.parentNode) {
          oldScript.parentNode.removeChild(oldScript);
        }
        
        // 显示加载指示器
        if (!loadingIndicator) {
          createLoadingIndicator();
        }
        
        // 创建全局回调函数
        window.processBingWallpaper = function(data) {
          try {
            if (data && data.images && data.images.length > 0) {
              const imageData = {
                url: 'https://www.bing.com' + data.images[0].url,
                copyright: data.images[0].copyright
              };
              
              // 保存到缓存并应用
              saveToCache(imageData);
              applyWallpaper(imageData);
            } else {
              throw new Error('无效的数据格式');
            }
          } catch (error) {
            console.error('处理壁纸数据失败:', error);
            showError('加载必应壁纸失败');
            applyFallbackWallpaper();
          } finally {
            // 移除加载指示器
            removeLoadingIndicator();
          }
        };
        
        // 创建脚本元素，通过JSONP方式获取数据
        const script = document.createElement('script');
        script.id = 'bing-jsonp';
        script.src = 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN&callback=processBingWallpaper';
        
        // 设置超时处理
        const timeout = setTimeout(() => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
            showError('获取壁纸超时，使用本地壁纸');
            applyFallbackWallpaper();
            removeLoadingIndicator();
          }
        }, 10000); // 10秒超时
        
        // 添加错误处理
        script.onerror = () => {
          clearTimeout(timeout);
          showError('获取壁纸失败，使用本地壁纸');
          applyFallbackWallpaper();
          removeLoadingIndicator();
        };
        
        // 添加到文档
        document.body.appendChild(script);
      }
      
      // 保存到缓存
      function saveToCache(data) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(CACHE_TIME_KEY, new Date().getTime());
        } catch (error) {
          console.error('保存壁纸缓存失败:', error);
        }
      }
      
      // 应用壁纸
      function applyWallpaper(data) {
        if (!data || !data.url) {
          console.error('无效的壁纸数据');
          return;
        }
        
        // 预加载图片
        const img = new Image();
        
        img.onload = function() {
          // 图片加载完成后设置为背景
          container.style.backgroundImage = `url('${data.url}')`;
          container.style.backgroundSize = 'cover';
          container.style.backgroundPosition = 'center';
          container.style.backgroundRepeat = 'no-repeat';
          container.style.backgroundAttachment = 'fixed';
          
          // 添加图片信息（如果有）
          if (data.copyright) {
            showImageInfo(data);
          }
          
          console.log('必应壁纸设置成功');
        };
        
        img.onerror = function() {
          console.error('壁纸图片加载失败');
          showError('壁纸图片加载失败，请稍后再试');
        };
        
        // 开始加载图片
        img.src = data.url;
      }
      
      // 显示图片信息
      function showImageInfo(data) {
        if (!data.copyright) return;
        
        // 创建或获取信息容器
        let infoElement = document.querySelector('.bing-wallpaper-info');
        
        if (!infoElement) {
          infoElement = document.createElement('div');
          infoElement.className = 'bing-wallpaper-info';
          
          const style = infoElement.style;
          style.position = 'fixed';
          style.bottom = '10px';
          style.right = '10px';
          style.background = 'rgba(0,0,0,0.5)';
          style.color = 'white';
          style.padding = '5px 10px';
          style.borderRadius = '3px';
          style.fontSize = '12px';
          style.maxWidth = '300px';
          style.zIndex = '999';
          
          document.body.appendChild(infoElement);
        }
        
        // 设置信息内容
        infoElement.textContent = data.copyright;
      }
      
      // 显示错误信息
      function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'bing-wallpaper-error';
        errorElement.textContent = message;
        
        const style = errorElement.style;
        style.position = 'fixed';
        style.top = '20px';
        style.right = '20px';
        style.background = 'rgba(255,0,0,0.7)';
        style.color = 'white';
        style.padding = '10px';
        style.borderRadius = '5px';
        style.zIndex = '9999';
        
        document.body.appendChild(errorElement);
        
        // 3秒后自动消失
        setTimeout(() => {
          if (errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
          }
        }, 3000);
      }
      
      // 刷新壁纸，忽略缓存强制重新获取
      function refresh() {
        loadWallpaper({...defaultParams, useCache: false});
      }
      
      // 公开API
      return {
        init,
        refresh,
        setContainer: (selector) => {
          const newContainer = document.querySelector(selector);
          if (newContainer) {
            container = newContainer;
          }
        }
      };
    })();
    
    // 初始化壁纸
    BingWallpaper.init();
    
    // 将接口暴露到全局，以便其他脚本使用
    window.BingWallpaper = BingWallpaper;
  });
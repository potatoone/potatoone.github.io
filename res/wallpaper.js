/**
 * 必应每日壁纸背景加载器
 * 使用简单API获取每日壁纸并设置为网页背景
 */

document.addEventListener('DOMContentLoaded', function() {
  const BingWallpaper = (() => {
    // 私有变量
    const apiUrl = 'https://bing.biturl.top';  // 简单可靠的必应壁纸API
    
    // 缓存键
    const CACHE_KEY = 'bing_wallpaper_cache';
    const CACHE_TIME_KEY = 'bing_wallpaper_timestamp';
    const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1小时缓存
    
    // 容器元素
    let container = document.body;
    let infoButton = null;
    let infoElement = null;
    
    // 初始化函数
    function init(options = {}) {
      // 如果指定了容器选择器
      if (options.container) {
        const customContainer = document.querySelector(options.container);
        if (customContainer) {
          container = customContainer;
        }
      }
      
      // 尝试从缓存加载
      if (options.useCache !== false && loadFromCache()) {
        console.log('必应壁纸已从缓存加载');
        return;
      }
      
      // 否则从API加载
      loadWallpaper();
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
    
    // 从API加载壁纸数据
    function loadWallpaper() {
      // 发起请求
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // API返回的数据: { url, copyright, copyright_link, start_date, end_date }
          const imageData = {
            url: data.url,
            copyright: data.copyright
          };
          
          // 保存到缓存
          saveToCache(imageData);
          
          // 应用壁纸
          applyWallpaper(imageData);
        })
        .catch(error => {
          console.error('加载必应壁纸失败:', error);
          
          // 在失败时使用备用URL
          const fallbackUrl = 'https://www.bing.com/th?id=OHR.SedonaSpring_ZH-CN6305197600_1920x1080.jpg';
          applyWallpaper({
            url: fallbackUrl,
            copyright: '红色岩层，塞多纳，亚利桑那州，美国 (© Jim Ekstrand/Alamy Stock Photo)'
          });
        });
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
        
        // 创建信息按钮和信息面板（如果有版权信息）
        if (data.copyright) {
          createInfoButton(data);
        }
        
        console.log('必应壁纸设置成功');
      };
      
      img.onerror = function() {
        console.error('壁纸图片加载失败:', data.url);
      };
      
      // 开始加载图片
      img.src = data.url;
    }
    
    // 创建信息按钮和面板
    function createInfoButton(data) {
      // 如果已经存在则移除
      if (infoButton) {
        infoButton.remove();
      }
      if (infoElement) {
        infoElement.remove();
      }
      
      // 创建信息按钮 - 这是一个小图标，放在右上角
      infoButton = document.createElement('div');
      infoButton.className = 'bing-wallpaper-info-button';
      
      // 设置按钮样式
      const buttonStyle = infoButton.style;
      buttonStyle.position = 'fixed';
      buttonStyle.top = '10px';
      buttonStyle.right = '10px';
      buttonStyle.width = '15px';
      buttonStyle.height = '15px';
      buttonStyle.borderRadius = '50%';
      buttonStyle.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      buttonStyle.color = 'white';
      buttonStyle.display = 'flex';
      buttonStyle.alignItems = 'center';
      buttonStyle.justifyContent = 'center';
      buttonStyle.fontSize = '10px';
      buttonStyle.cursor = 'pointer';
      buttonStyle.zIndex = '1000';
      buttonStyle.opacity = '0.4';
      buttonStyle.transition = 'opacity 0.3s, background-color 0.3s';
      
      // 添加信息图标
      infoButton.innerHTML = '<i>i</i>';
      
      // 创建信息面板
      infoElement = document.createElement('div');
      infoElement.className = 'bing-wallpaper-info';
      infoElement.textContent = data.copyright;
      
      // 设置信息面板样式
      const infoStyle = infoElement.style;
      infoStyle.position = 'fixed';
      infoStyle.top = '30px';
      infoStyle.right = '10px';
      infoStyle.background = 'rgba(0, 0, 0, 0.3)';  // 背景颜色
      infoStyle.color = 'white';
      infoStyle.padding = '8px 12px';
      infoStyle.borderRadius = '4px';
      infoStyle.fontSize = '12px';
      infoStyle.maxWidth = '300px';
      infoStyle.zIndex = '999';
      infoStyle.display = 'none'; // 默认隐藏
      infoStyle.opacity = '0';
      infoStyle.transition = 'opacity 0.3s';
      
      // 添加鼠标事件
      infoButton.addEventListener('mouseenter', () => {
        // 显示信息面板
        infoElement.style.display = 'block';
        // 使用setTimeout确保在显示后才添加过渡效果
        setTimeout(() => {
          infoElement.style.opacity = '1';
        }, 10);
        
        // 高亮按钮
        infoButton.style.opacity = '0.7';
        infoButton.style.backgroundColor = 'rgba(133, 76, 214, 0.6)';  // 悬浮背景颜色
      });
      
      infoButton.addEventListener('mouseleave', () => {
        // 隐藏信息面板
        infoElement.style.opacity = '0';
        
        // 监听过渡结束后隐藏元素
        infoElement.addEventListener('transitionend', function hidePanel() {
          infoElement.style.display = 'none';
          infoElement.removeEventListener('transitionend', hidePanel);
        });
        
        // 恢复按钮样式
        infoButton.style.opacity = '0.5';  // 按钮透明度
        infoButton.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'; // 背景颜色
      });
      
      // 添加到文档
      document.body.appendChild(infoButton);
      document.body.appendChild(infoElement);
    }
    
    // 刷新壁纸，忽略缓存强制重新获取
    function refresh() {
      loadWallpaper();
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
  BingWallpaper.init({
    container: '.container', // 为特定容器设置背景
    useCache: true          // 是否使用缓存
  });
  
  // 将接口暴露到全局，以便其他脚本使用
  window.BingWallpaper = BingWallpaper;
});
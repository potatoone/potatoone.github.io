document.addEventListener('DOMContentLoaded', function() {
    // 获取 .sentence 元素
    const sentenceElement = document.querySelector('.sentence');
  
    // 检查元素是否存在
    if (!sentenceElement) {
      console.error('.sentence 元素未找到');
      return;
    }
  
    // 缓存键和缓存时长（1小时）
    const CACHE_KEY = 'ciba_text';
    const CACHE_TIME_KEY = 'ciba_text_time';
    const CACHE_DURATION = 60 * 60 * 1000; // 1小时
  
    // 尝试从缓存加载数据
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    const now = new Date().getTime();
  
    if (cachedData && cachedTime && (now - cachedTime < CACHE_DURATION)) {
      // 使用缓存数据
      const data = JSON.parse(cachedData);
      displaySentence(data);
    } else {
      // 从API获取数据
      fetch('https://api.leafone.cn/api/cibatext')
        .then(response => response.json())
        .then(data => {
          if (data && data.code === 200 && data.data) {
            // 缓存数据
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            localStorage.setItem(CACHE_TIME_KEY, now);
            displaySentence(data);
          } else {
            sentenceElement.textContent = 'Unable to fetch sentence';
          }
        })
        .catch(error => {
          console.error('Failed to fetch sentence:', error);
          sentenceElement.textContent = 'Failed to fetch sentence';
        });
    }
  
    // 显示一言内容
    function displaySentence(data) {
      const content = data.data.content;
      sentenceElement.innerHTML = `<div>${content}</div>`;
    }
  });
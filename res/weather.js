document.addEventListener('DOMContentLoaded', function() {
    // 获取 .weather 元素
    const weatherElement = document.querySelector('.weather');
  
    // 检查元素是否存在
    if (!weatherElement) {
      console.error('.weather 元素未找到');
      return;
    }
  
    // 显示静态样例数据（在API不可用时使用）
    displayStaticWeather();
  
    // 缓存键和缓存时长（1小时）
    const CACHE_KEY = 'weather_data';
    const CACHE_TIME_KEY = 'weather_time';
    const CACHE_DURATION = 1 * 60 * 1000; // 10分钟
  
    // 尝试从缓存加载数据
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    const now = new Date().getTime();
  
    if (cachedData && cachedTime && (now - cachedTime < CACHE_DURATION)) {
      // 使用缓存数据
      const data = JSON.parse(cachedData);
      displayWeather(data);
    } else {
      // OpenWeatherMap API Key - 请替换为你自己的API Key
      const apiKey = '1c3d914583728b43fc61c5e43c2d825c';
      const city = 'Shenzhen'; // 默认城市
      
      // 发起API请求
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
          // 缓存数据
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(CACHE_TIME_KEY, now);
          displayWeather(data);
        })
        .catch(error => {
          console.error('获取天气数据失败:', error);
          // 保持静态样例数据
        });
    }
  
    // 显示静态样例天气数据
    function displayStaticWeather() {
      weatherElement.innerHTML = `
        <div class="weather-icon">
          <i class="fas fa-cloud-sun"></i>
        </div>
        <div class="weather-info">
          <div class="weather-data-row">
            <span class="weather-temp">25°C</span>
            <span class="weather-humidity">65%</span>
          </div>
          <div class="weather-city">Beijing</div>
        </div>
      `;
    }
  
    // 显示从API获取的天气信息
    function displayWeather(data) {
      if (!data || !data.main) {
        console.error('无效的天气数据:', data);
        return;
      }
  
      // 提取温度、湿度和城市名
      const temp = Math.round(data.main.temp);
      const humidity = data.main.humidity;
      const city = data.name;
      const weatherStatus = data.weather[0].main;
      const weatherIcon = getWeatherIcon(weatherStatus);
  
      // 创建天气HTML
      weatherElement.innerHTML = `
        <div class="weather-icon">
          <i class="${weatherIcon}"></i>
        </div>
        <div class="weather-info">
          <div class="weather-data-row">
            <span class="weather-temp">${temp}°C</span>
            <span class="weather-humidity">${humidity}%</span>
          </div>
          <div class="weather-city">${city}</div>
        </div>
      `;
    }
  
    // 根据天气状态返回对应的Font Awesome图标类
    function getWeatherIcon(weatherStatus) {
      switch(weatherStatus.toLowerCase()) {
        case 'clear':
          return 'fas fa-sun';
        case 'clouds':
          return 'fas fa-cloud';
        case 'rain':
          return 'fas fa-cloud-rain';
        case 'drizzle':
          return 'fas fa-cloud-rain';
        case 'thunderstorm':
          return 'fas fa-bolt';
        case 'snow':
          return 'fas fa-snowflake';
        case 'mist':
        case 'smoke':
        case 'haze':
        case 'dust':
        case 'fog':
        case 'sand':
        case 'ash':
        case 'squall':
        case 'tornado':
          return 'fas fa-smog';
        default:
          return 'fas fa-cloud';
      }
    }
  });
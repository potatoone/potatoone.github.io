document.addEventListener('DOMContentLoaded', function() {
    const sentenceElement = document.querySelector('.sentence');
    if (!sentenceElement) {
        console.error('.sentence 元素未找到');
        return;
    }

    const apiUrl = 'https://api.vvhan.com/api/dailyEnglish';
    const localStorageKey = 'dailyEnglish';
    const cacheDuration = 2 * 60 * 60 * 1000; // 2 小时

    // 1. 尝试从 localStorage 获取数据
    const cachedData = localStorage.getItem(localStorageKey);
    const cachedTime = localStorage.getItem(localStorageKey + '_timestamp');

    if (cachedData && cachedTime && (Date.now() - cachedTime < cacheDuration)) {
        // 1.1 如果 localStorage 中有数据，并且未过期，则直接使用
        const data = JSON.parse(cachedData);
        sentenceElement.textContent = data.en || 'Unable to fetch sentence';
    } else {
        // 2. 如果 localStorage 中没有数据，或者已过期，则从 API 获取
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const english = data.data.en || 'Unable to fetch sentence';
                    sentenceElement.textContent = english;

                    // 2.1 将数据存储到 localStorage，并记录时间戳
                    localStorage.setItem(localStorageKey, JSON.stringify(data.data));
                    localStorage.setItem(localStorageKey + '_timestamp', Date.now());
                } else {
                    console.error('Failed to fetch sentence:', data.message);
                    sentenceElement.textContent = 'Unable to fetch sentence';
                }
            })
            .catch(error => {
                console.error('Failed to fetch sentence:', error);
                sentenceElement.textContent = 'Unable to fetch sentence';
            });
    }
});
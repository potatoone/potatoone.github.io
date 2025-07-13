document.addEventListener('DOMContentLoaded', () => {
    const sentenceEl = document.querySelector('.sentence');
    if (!sentenceEl) return console.error('[ERROR] .sentence 元素未找到');

    const API_URL = 'https://api.vvhan.com/api/dailyEnglish';
    const CACHE_KEY = 'dailyEnglish';

    // 获取今日日期（YYYYMMDD）
    const getToday = () => {
        const d = new Date();
        return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    };

    // 1. 读取缓存
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedDate = localStorage.getItem(`${CACHE_KEY}_date`);
    const today = getToday();

    // 2. 仅当缓存存在且日期匹配时使用缓存
    if (cachedData && cachedDate === today) {
        try {
            const { en } = JSON.parse(cachedData);
            sentenceEl.textContent = en;
            console.log(`[一言] 使用缓存内容: ${en.substring(0, 20)}...`);
            return; // 缓存有效，直接返回
        } catch (e) {
            console.error('[一言] 缓存解析失败:', e.message);
        }
    }

    // 3. 缓存无效/不存在，请求API
    console.log('[一言] 开始请求API...');
    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP错误 ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (data.success && data.data?.en) {
                const { en } = data.data;
                sentenceEl.textContent = en;
                // 4. 保存新缓存
                localStorage.setItem(CACHE_KEY, JSON.stringify(data.data));
                localStorage.setItem(`${CACHE_KEY}_date`, today);
                console.log(`[一言] API请求成功，更新缓存 (${today})`);
                console.log(`[一言] 一言内容: ${en.substring(0, 20)}...`);
            } else {
                throw new Error(`API返回异常: ${data.message || '无数据'}`);
            }
        })
        .catch(err => {
            sentenceEl.textContent = '获取失败';
            console.error('[一言] API请求失败:', err.message);
        });
});
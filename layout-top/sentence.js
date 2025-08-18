document.addEventListener('DOMContentLoaded', () => {
    const sentenceEl = document.querySelector('.sentence');
    if (!sentenceEl) return console.error('[ERROR] .sentence 元素未找到');

    // 新接口地址
    const API_URL = 'https://open.iciba.com/dsapi/';
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
            // 从缓存中提取英文句子（新接口字段为content）
            const { content } = JSON.parse(cachedData);
            if (content) {
                sentenceEl.textContent = content;
                console.log(`[一言] 使用缓存内容: ${content.substring(0, 20)}...`);
                return; // 缓存有效，直接返回
            }
        } catch (e) {
            console.error('[一言] 缓存解析失败:', e.message);
        }
    }

    // 3. 缓存无效/不存在，请求新API
    console.log('[一言] 开始请求新API...');
    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP错误 ${res.status}`);
            return res.json();
        })
        .then(data => {
            // 新接口直接返回句子对象，无需data嵌套
            if (data.content) {
                const { content } = data;
                sentenceEl.textContent = content;
                // 4. 保存新缓存
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(`${CACHE_KEY}_date`, today);
                console.log(`[一言] API请求成功，更新缓存 (${today})`);
                console.log(`[一言] 一言内容: ${content.substring(0, 20)}...`);
            } else {
                throw new Error(`API返回异常: 未找到content字段`);
            }
        })
        .catch(err => {
            sentenceEl.textContent = '获取失败';
            console.error('[一言] API请求失败:', err.message);
        });
});
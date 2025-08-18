document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.sentence');
    if (!el) return;

    const [key, dateKey] = ['yiyanCache', 'yiyanDate'];
    const today = new Date().toDateString();
    const [cache, cacheDate] = [localStorage.getItem(key), localStorage.getItem(dateKey)];

    // 过滤HTML标签的函数
    const stripTags = (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || '';
    };

    // 使用缓存
    if (cache && cacheDate === today) {
        el.textContent = stripTags(cache);
        return;
    }

    el.textContent = '加载中...';
    fetch('https://v.api.aa1.cn/api/yiyan/index.php')
        .then(r => r.text())
        .then(text => {
            const pureText = stripTags(text); // 过滤标签
            el.textContent = pureText;
            localStorage.setItem(key, pureText); // 缓存过滤后的内容
            localStorage.setItem(dateKey, today);
        })
        .catch(() => el.textContent = '获取失败');
});

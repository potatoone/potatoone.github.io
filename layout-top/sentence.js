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
    // 注意：这里假设接口地址也需要相应更改
    fetch('https://v2.xxapi.cn/api/yiyan?type=poetry')
        .then(r => r.json())  // 解析为JSON格式
        .then(response => {
            // 检查接口是否返回成功
            if (response.code === 200) {
                const pureText = stripTags(response.data); // 从data字段获取内容
                el.textContent = pureText;
                localStorage.setItem(key, pureText); // 缓存过滤后的内容
                localStorage.setItem(dateKey, today);
            } else {
                el.textContent = '获取失败: ' + (response.msg || '未知错误');
            }
        })
        .catch(() => el.textContent = '网络请求失败');
});

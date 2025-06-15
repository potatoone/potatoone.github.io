document.addEventListener('DOMContentLoaded', function() {
    const sentenceElement = document.querySelector('.sentence');
    if (!sentenceElement) {
        console.error('.sentence 元素未找到');
        return;
    }

    const params = new URLSearchParams({
        file: 'json',
        date: '',
    });

    const apiUrl = 'https://open.iciba.com/dsapi/?' + params.toString();

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const content = data.content || 'Unable to fetch sentence';
            sentenceElement.innerHTML = `<div>${content}</div>`;
        })
        .catch(error => {
            console.error('Failed to fetch sentence:', error);
            sentenceElement.textContent = 'Failed to fetch sentence';
        });
});
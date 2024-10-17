console.log('Script loaded');

// 在文件开头更新 API_KEY
const API_KEY = '1d946cf537ebd65ad6721c9b84da4bf6.vZhGOzhz9oQZiQbb';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 简单的 base64url 编码函数
function base64url(source) {
    // 编码为Base64
    let encodedSource = CryptoJS.enc.Base64.stringify(source);
    // 替换URL不安全字符
    encodedSource = encodedSource.replace(/=+$/, '');
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');
    return encodedSource;
}

// 简单的 JWT 编码函数
function simpleJwtEncode(payload, secret) {
    const header = {
        "alg": "HS256",
        "sign_type": "SIGN"
    };
    const encodedHeader = base64url(CryptoJS.enc.Utf8.parse(JSON.stringify(header)));
    const encodedPayload = base64url(CryptoJS.enc.Utf8.parse(JSON.stringify(payload)));
    const signature = base64url(CryptoJS.HmacSHA256(encodedHeader + "." + encodedPayload, secret));
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// 添加生成JWT token的函数
function generateToken(apiKey, expSeconds = 3600) {
    const [id, secret] = apiKey.split('.');
    const payload = {
        api_key: id,
        exp: Math.floor(Date.now() / 1000) + expSeconds,
        timestamp: Math.floor(Date.now() / 1000)
    };
    
    return simpleJwtEncode(payload, secret);
}

// 添加调用API的函数
async function callAPI(messages) {
    try {
        console.log('Generating token...');
        const token = generateToken(API_KEY);
        console.log('Token generated successfully:', token);

        console.log('Sending API request...');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model: 'glm-4',
                messages: messages,
                stream: false // 禁用流式响应，因为可能导致解析问题
            })
        });

        if (!response.ok) {
            console.error('API response not OK:', response.status, response.statusText);
            const errorBody = await response.text();
            console.error('Error response body:', errorBody);
            throw new Error(`API request failed: ${response.statusText}\n${errorBody}`);
        }

        console.log('API response received');
        const data = await response.json();
        console.log('API response data:', data);

        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error in callAPI:', error);
        throw error;
    }
}

// ... 其余代码保持不变 ...

// 添加这些函数到 script.js 文件中

function initializeAIChat() {
    // 移除下拉菜单
    const featureSelect = document.getElementById('ai-feature-select');
    if (featureSelect) {
        featureSelect.remove();
    }

    const aiChatButton = document.getElementById('ai-chat-button');
    const aiChatWindow = document.getElementById('ai-chat-window');
    const aiChatClose = document.getElementById('ai-chat-close');
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiChatSend = document.getElementById('ai-chat-send');
    const aiChatMessages = document.getElementById('ai-chat-messages');

    aiChatButton.addEventListener('click', () => {
        aiChatWindow.style.display = 'flex';
    });

    aiChatClose.addEventListener('click', () => {
        aiChatWindow.style.display = 'none';
    });

    aiChatSend.addEventListener('click', sendMessage);
    aiChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = aiChatInput.value.trim();
        if (message) {
            addMessage('user', message);
            aiChatInput.value = '';

            const loadingAnimation = showLoadingAnimation();
            try {
                const response = await callAPI([{ role: 'user', content: message }]);
                removeLoadingAnimation(loadingAnimation);
                addMessage('ai', response);
            } catch (error) {
                console.error('Error calling AI API:', error);
                removeLoadingAnimation(loadingAnimation);
                addMessage('ai', '抱歉，我遇到了一些问题。请稍后再试。');
            }
        }
    }

    function addMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.textContent = text;
        aiChatMessages.appendChild(messageElement);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }

    function showLoadingAnimation() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-animation';
        loadingElement.textContent = '正思考...';
        aiChatMessages.appendChild(loadingElement);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        return loadingElement;
    }

    function removeLoadingAnimation(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
}

// 确保在页面加载完成后初始化 AI 聊天功能
window.addEventListener('load', () => {
    initializeAIChat();
    // 其他初始化代码...
});

// 添加其他必要的函数，如 generatePPT, generateCopywriting, getWeatherForecast, normalChat 等

// 修改 checkElements 函数
function checkElements() {
    const elements = [
        'time-display', 'greeting-message', 'settings-icon', 'settings-panel',
        'theme-select', 'background-upload', 'ai-chat-button', 'ai-chat-window',
        'ai-chat-close', 'ai-chat-input', 'ai-chat-send', 'ai-chat-messages',
        'url-grid', 'add-url-square'
    ];
    
    elements.forEach(id => {
        if (!document.getElementById(id)) {
            console.error(`Element with id "${id}" not found`);
        }
    });
}

// 修改页面加载事件监听器
window.addEventListener('load', () => {
    console.log('Window loaded');
    setTimeout(initializeAllFeatures, 0);  // 使用 setTimeout 确保在 DOM 完全加载执行
});

// 添加URL功能
function initializeUrlFeatures() {
    const addUrlSquare = document.getElementById('add-url-square');
    const urlGrid = document.getElementById('url-grid');

    addUrlSquare.addEventListener('click', () => {
        const url = prompt('请输入新的网址：');
        if (url) {
            const title = prompt('请输入网址标题（可选）：');
            createUrlSquare(url, title);
        }
    });

    function createUrlSquare(url, title) {
        const square = document.createElement('div');
        square.className = 'url-square';
        
        // 确保 URL 有正确的格式
        let formattedUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            formattedUrl = 'http://' + url;
        }

        square.innerHTML = `
            <div class="url-content">${title || new URL(formattedUrl).hostname}</div>
            <button class="delete-button">×</button>
        `;
        
        // 修改点击事件，使用 formattedUrl
        square.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-button')) {
                window.open(formattedUrl, '_blank');
            }
        });

        square.querySelector('.delete-button').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('是否删除此网址？')) {
                square.remove();
            }
        });

        urlGrid.insertBefore(square, addUrlSquare);
    }

    // 加载保存的 URL
    loadSavedUrls();

    // 保存 URL 到 localStorage
    function saveUrls() {
        const squares = urlGrid.querySelectorAll('.url-square:not(#add-url-square)');
        const urls = Array.from(squares).map(square => ({
            url: square.getAttribute('data-url'),
            title: square.querySelector('.url-content').textContent
        }));
        localStorage.setItem('savedUrls', JSON.stringify(urls));
    }

    // 从 localStorage 加载保存的 URL
    function loadSavedUrls() {
        const savedUrls = JSON.parse(localStorage.getItem('savedUrls')) || [];
        savedUrls.forEach(item => createUrlSquare(item.url, item.title));
    }

    // 在添加和删除 URL 时保存
    const originalInsertBefore = urlGrid.insertBefore;
    urlGrid.insertBefore = function() {
        originalInsertBefore.apply(this, arguments);
        saveUrls();
    };

    urlGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-button')) {
            setTimeout(saveUrls, 0);
        }
    });
}

// 添加这个函数来初始化所有功能
function initializeAllFeatures() {
    console.log('Initializing all features...');
    
    checkElements();  // 添加这行来检查所有元素

    // 初始化时间显示
    function updateTime() {
        const now = new Date();
        document.querySelector('.hours').textContent = now.getHours().toString().padStart(2, '0');
        document.querySelector('.minutes').textContent = now.getMinutes().toString().padStart(2, '0');
        document.querySelector('.seconds').textContent = now.getSeconds().toString().padStart(2, '0');
    }
    setInterval(updateTime, 1000);
    updateTime(); // 立即更新一次

    // 初始化问候语
    function updateGreeting() {
        const greetingElement = document.getElementById('greeting-message');
        const hour = new Date().getHours();
        let greeting;
        if (hour < 12) greeting = "早上好！";
        else if (hour < 18) greeting = "下午好！";
        else greeting = "晚上好！";
        greetingElement.textContent = greeting;
    }
    updateGreeting();

    // 初始化设置面板
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel');
    settingsIcon.addEventListener('click', () => {
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });

    // 初始化主题切换
    const themeSelect = document.getElementById('theme-select');
    themeSelect.addEventListener('change', (e) => {
        document.body.className = e.target.value === 'dark' ? 'dark-theme' : '';
    });

    // 初始化背景上传
    const backgroundUpload = document.getElementById('background-upload');
    backgroundUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.body.style.backgroundImage = `url(${event.target.result})`;
            }
            reader.readAsDataURL(file);
        }
    });

    // 初始化 AI 聊天功能
    initializeAIChat();

    // 初始化 URL 功能
    initializeUrlFeatures();

    // 添加搜索栏
    addSearchBar();

    console.log('All features initialized.');
}

// 添加新的函数来创建搜索栏
function addSearchBar() {
    const greetingElement = document.getElementById('greeting-message');
    if (!greetingElement) {
        console.error('Greeting message element not found');
        return;
    }

    const searchBarHTML = `
        <div id="search-bar">
            <form action="https://www.baidu.com/s" method="GET" target="_blank">
                <input type="text" name="wd" placeholder="搜索...">
                <button type="submit"></button>
            </form>
        </div>
    `;

    greetingElement.insertAdjacentHTML('afterend', searchBarHTML);
}

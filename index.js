const COLORS = ["#FF0000", "#FFA500", "#FFFF00", "#008000", "#00FFFF", "#0000FF", "#800080",]
let rundowns = [
    { cd: 10, text: "吸气", color: "red" },
    { cd: 10, text: "呼气", color: "green" },
    //  { cd: 5, text: "放松" },
];
let MaxCountdown = 10;

let rundownIndex = 0;
let roundNumber = 0; // 新增的轮次计数器
let countdownInterval;
let currentCount = 10;
let beginTime = 0;
let isTts = localStorage.getItem('isTts') !== 'false'; // 是否启用TTS

function updateTimeDifference() {
    const now = Date.now();
    const difference = Math.round((now - beginTime) / 1000);
    const minutes = Math.floor(difference / 60).toString().padStart(2, '0');
    const seconds = (difference % 60).toString().padStart(2, '0');
    document.getElementById('time-difference').textContent = `${minutes}:${seconds}`;
}

function createParticles() {
    const particlesContainer = document.getElementById("particles");
    particlesContainer.innerHTML = "";

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 3 + "s";
        particle.style.animationDuration = Math.random() * 2 + 2 + "s";
        particlesContainer.appendChild(particle);
    }
}

const container = document.querySelector(".countdown-container");

function updateCountdown() {
    enableWakeLock();
    // 更新进度计算逻辑
    const rundownProgress = ((rundownIndex + 1) / rundowns.length) * 100; // 最大3个阶段
    const roundProgress = ((roundNumber + 1) / MaxCountdown) * 100;

    updateTimeDifference();

    document.getElementById("rundownLabel").textContent = `[${rundownIndex + 1
        }/${rundowns.length}]`;

    const process = `[${roundNumber + 1}/${MaxCountdown}]`
    document.getElementById("roundLabel").textContent = process;
    document.getElementById("overall_progress").textContent = process;

    document.getElementById(
        "rundownProgress"
    ).style.width = `${rundownProgress}%`;
    document.getElementById(
        "roundProgress"
    ).style.width = `${roundProgress}%`;
    const countdownElement = document.getElementById("countdown");
    const countdownText = document.getElementById("countdownText");
    const restartBtn = document.getElementById("restartBtn");

    countdownElement.textContent = currentCount;

    if (currentCount === 0) {
        clearInterval(countdownInterval);
        countdownElement.textContent = "✔";
        countdownText.textContent = "倒计时结束";
        container.classList.add("finished");
        rundownIndex++;
        if (rundownIndex < rundowns.length) {
            setTimeout(() => {
                startCountdown();
            }, 1000);
        } else {
            roundNumber++; // 增加轮次计数器
            if (roundNumber < MaxCountdown) {
                console.log("开始下一轮:" + roundNumber);
                rundownIndex = 0; // 重置倒计时索引
                console.log("Round " + roundNumber + " finished.");
                setTimeout(() => {
                    startCountdown();
                }, 1000);
            } else {
                console.log("All rounds finished.");
                tts("全部完成！")
                // 创建庆祝效果
                const endTime = Date.now();
                const totalTime = Math.round((endTime - beginTime) / 1000);
                console.log("总用时：" + totalTime + "秒");
                releaseWakeLock();
            }
        }
        // restartBtn.classList.add('show');

        // 创建庆祝效果
        setTimeout(() => {
            container.classList.remove("finished");
        }, 1000);
    } else {
        currentCount--;
    }
}

function startCountdown() {
    // rundownIndex = 0;
    currentCount = rundowns[rundownIndex].cd;
    const countdownText = document.getElementById("countdownText");
    const restartBtn = document.getElementById("restartBtn");
    const container = document.querySelector(".countdown-container");
    const progressCircle = document.querySelector(".progress-ring-circle");

    countdownText.textContent =
        rundowns[rundownIndex].text + rundowns[rundownIndex].cd + "秒";
    tts(rundowns[rundownIndex].text)
    // restartBtn.classList.remove("show");
    container.classList.remove("finished");
    document.getElementById("countdown").style.color =
        rundowns[rundownIndex].color;

    // 重置进度条动画
    progressCircle.style.animation = "none";
    progressCircle.offsetHeight; // 触发重排
    progressCircle.style.animation =
        "progressAnimation 15s linear forwards";

    // 创建粒子效果
    createParticles();

    // 立即显示初始数字
    updateCountdown();

    // 开始倒计时
    countdownInterval = setInterval(updateCountdown, 1000);
}

// 页面加载时自动开始倒计时
window.addEventListener("load", async () => {
    let u = new URL(location.href);
    let max = u.searchParams.get("max");
    if (max) {
        MaxCountdown = +max;
    }
    let title = u.searchParams.get("title");
    if (title) document.title = title;
    let cd = u.searchParams.get("cd");
    if (cd) {
        rundowns = cd.split(';').map((item, i) => {
            let ii = item.split(',');
            return { cd: +ii[0], text: ii[1] ?? `第${i + 1}节`, color: COLORS[i % 7] };
        });
    }

    restart();
});

function restart() {
    tts("开始")
    enableWakeLock();
    rundownIndex = 0;
    roundNumber = 0;
    beginTime = Date.now();
    clearInterval(countdownInterval);
    startCountdown();
}

/**
 * 文本转语音函数（兼容主流浏览器）
 * @param {string} text - 待转换的文本（支持中英文）
 * @param {object} [options] - 可配置参数
 * @param {number} [options.rate=1] - 语速 (0.1~10, 默认1)
 * @param {number} [options.pitch=1] - 音调 (0~2, 默认1)
 * @param {number} [options.volume=1] - 音量 (0~1, 默认1)
 * @param {string} [options.lang='zh-CN'] - 语言编码 (如 'en-US')
 */
// 添加语音播报开关点击事件
window.addEventListener('load', () => {
    const ttsCheckbox = document.getElementById('ttsCheckbox');
    
    ttsCheckbox.addEventListener('change', () => {
        isTts = ttsCheckbox.checked;
    });
});

function tts(text, options = {}) {
    if (!isTts) return;
    // 1. 环境检测
    if (!('speechSynthesis' in window)) {
        console.error('浏览器不支持语音合成功能');
        return;
    }

    // 2. 参数合并与默认值设置
    const { rate = 1, pitch = 1, volume = 1, lang = 'zh-CN' } = options;

    // 3. 创建语音实例
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = Math.max(0.1, Math.min(10, rate)); // 限制有效范围
    utterance.pitch = Math.max(0, Math.min(2, pitch));
    utterance.volume = Math.max(0, Math.min(1, volume));

    // 4. 播放控制（停止当前语音避免重叠）
    window.speechSynthesis.cancel();

    // 5. 事件监听
    utterance.onstart = () => console.log('语音开始播放');
    utterance.onend = () => console.log('语音播放结束');
    utterance.onerror = (e) => console.error('语音播放错误:', e.error);

    // 6. 播放语音
    window.speechSynthesis.speak(utterance);
}

let wakeLock;
async function enableWakeLock() {
    if (wakeLock?.released === false) return;
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
            console.error('唤醒失败:', err);
        }
    }
}

async function releaseWakeLock() {
    if (wakeLock) {
        if (wakeLock.released === false) await wakeLock.release();
    }
}

document.getElementById('ttsCheckbox').addEventListener('change', (event) => {
    isTts = event.target.checked;
    localStorage.setItem('isTts', isTts);
    console.log('isTts:', isTts);   
});

document.getElementById('ttsCheckbox').checked = isTts;

// enableWakeLock();


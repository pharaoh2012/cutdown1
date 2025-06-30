      const COLORS = ["#FF0000","#FFA500","#FFFF00","#008000","#00FFFF","#0000FF","#800080",]
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
        // 更新进度计算逻辑
        const rundownProgress = ((rundownIndex + 1) / rundowns.length) * 100; // 最大3个阶段
        const roundProgress = ((roundNumber + 1) / MaxCountdown) * 100;

        document.getElementById("rundownLabel").textContent = `[${
          rundownIndex + 1
        }/${rundowns.length}]`;

        document.getElementById("roundLabel").textContent = `[${
          roundNumber + 1
        }/${MaxCountdown}]`;

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
              // 创建庆祝效果
              const endTime = Date.now();
              const totalTime = Math.round((endTime - beginTime) / 1000);
              console.log("总用时：" + totalTime + "秒");
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
        restartBtn.classList.remove("show");
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
        let path = location.hash || location.search;
        if (path) {
          path = path.substring(1);
          const config = await fetch(path).then((r) => r.json());
          document.title = config.title;
          MaxCountdown = config.MaxCountdown;
          rundowns = config.countdowns;
        }

        beginTime = Date.now();
        startCountdown();
      });
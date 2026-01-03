```dataviewjs
const container = this.container.createEl('div', { cls: 'mobile-timers' });

function updateTimers() {
    const now = new Date();
    
    // 倒计时逻辑（到22:30）
    const countdownTarget = new Date();
    countdownTarget.setHours(22, 30, 0, 0);
    if (now > countdownTarget) {
        countdownTarget.setDate(countdownTarget.getDate() + 1);
    }
    const countdownDiff = countdownTarget - now;
    
    // 格式化时间函数
    const formatTime = (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return {
            h: hours.toString().padStart(2, '0'),
            m: minutes.toString().padStart(2, '0')
        };
    };
    
    const countdown = formatTime(countdownDiff);
    
    // 颜色计算
    const countdownIntensity = Math.min(1, 1 - (countdownDiff / (1000 * 60 * 60 * 8)));
    const countdownColor = `rgb(${Math.floor(50 + 200 * countdownIntensity)}, ${Math.floor(180 - 150 * countdownIntensity)}, ${Math.floor(100 - 50 * countdownIntensity)})`;
    
    // 日期格式化
    const weekday = ["日","一","二","三","四","五","六"][now.getDay()];
    const dateStr = `${now.getMonth()+1}月${now.getDate()}日 周${weekday}`;
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    container.innerHTML = `
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            height: 120px;
        ">
            <!-- 当前时间 -->
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                flex: 1;
                height: 100%;
            ">
                <div style="
                    font-size: 0.9em;
                    color: var(--text-muted);
                    margin-bottom: 8px;
                ">
                    ${dateStr}
                </div>
                <div style="
                    font-size: 3.5em;
                    font-weight: bold;
                    color: var(--text-accent);
                    line-height: 1;
                    text-align: center;
                ">
                    ${timeStr}
                </div>
            </div>
            
            <!-- 倒计时 -->
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                flex: 1;
                height: 100%;
            ">
                <div style="
                    font-size: 0.9em;
                    color: var(--text-muted);
                    margin-bottom: 8px;
                ">
                    ⏳ 22:30截止
                </div>
                <div style="
                    font-size: 3.2em;
                    font-weight: bold;
                    color: ${countdownColor};
                    line-height: 1;
                    text-align: center;
                ">
                    ${countdown.h}:${countdown.m}
                </div>
            </div>
        </div>
        
        <style>
            .mobile-timers {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                -webkit-tap-highlight-color: transparent;
                width: 100%;
            }
            .mobile-timers > div {
                width: 100%;
            }
        </style>
    `;
}

updateTimers();
setInterval(updateTimers, 1000);
```
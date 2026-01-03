```dataviewjs
const container = this.container.createEl('div', { cls: 'seven-year-countdown' });

// 设置结束日期：2032-09-05
const endDate = new Date('2032-09-05T00:00:00');

function updateCountdown() {
    const now = new Date();
    const remaining = endDate - now;
    
    // 计算时间组件
    const years = Math.floor(remaining / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((remaining % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((remaining % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    container.innerHTML = `
        <div class="countdown-container">
            <div class="countdown-title">✨ 七 年 一 生 ✨</div>
            
            <div class="countdown-grid">
                <div class="time-unit">
                    <div class="time-value">${years}</div>
                    <div class="time-label">年</div>
                </div>
                
                <div class="time-unit">
                    <div class="time-value">${months}</div>
                    <div class="time-label">月</div>
                </div>
                
                <div class="time-unit">
                    <div class="time-value">${days}</div>
                    <div class="time-label">日</div>
                </div>
                
                <div class="time-unit">
                    <div class="time-value">${hours.toString().padStart(2, '0')}</div>
                    <div class="time-label">时</div>
                </div>
                
                <div class="time-unit">
                    <div class="time-value">${minutes.toString().padStart(2, '0')}</div>
                    <div class="time-label">分</div>
                </div>
                
                <div class="time-unit">
                    <div class="time-value">${seconds.toString().padStart(2, '0')}</div>
                    <div class="time-label">秒</div>
                </div>
            </div>
            
            <div class="end-date">2032-09-05</div>
        </div>
        
        <style>
            :root {
                /* 浅色模式变量 */
                --bg-color-light: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
                --card-bg-light: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                --border-color-light: #3498db;
                --text-primary-light: #2c3e50;
                --text-secondary-light: #34495e;
                --accent-color-light: #3498db;
                --muted-color-light: #7f8c8d;
                
                /* 深色模式变量 */
                --bg-color-dark: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                --card-bg-dark: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                --border-color-dark: #3498db;
                --text-primary-dark: #ecf0f1;
                --text-secondary-dark: #bdc3c7;
                --accent-color-dark: #3498db;
                --muted-color-dark: #95a5a6;
                
                /* 默认使用浅色变量 */
                --bg-color: var(--bg-color-light);
                --card-bg: var(--card-bg-light);
                --border-color: var(--border-color-light);
                --text-primary: var(--text-primary-light);
                --text-secondary: var(--text-secondary-light);
                --accent-color: var(--accent-color-light);
                --muted-color: var(--muted-color-light);
            }

            /* 深色模式检测 */
            @media (prefers-color-scheme: dark) {
                :root {
                    --bg-color: var(--bg-color-dark);
                    --card-bg: var(--card-bg-dark);
                    --border-color: var(--border-color-dark);
                    --text-primary: var(--text-primary-dark);
                    --text-secondary: var(--text-secondary-dark);
                    --accent-color: var(--accent-color-dark);
                    --muted-color: var(--muted-color-dark);
                }
            }

            .seven-year-countdown {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
            }

            .countdown-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 20px;
                background: var(--card-bg);
                border-radius: 12px;
                border: 1px solid var(--border-color);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }

            .countdown-title {
                text-align: center;
                font-size: 1.6em;
                font-weight: 600;
                color: var(--accent-color);
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                letter-spacing: 1px;
                margin: 0;
            }

            .countdown-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 12px;
                text-align: center;
                align-items: center;
            }

            .time-unit {
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .time-value {
                font-size: 1.8em;
                font-weight: 700;
                color: var(--text-primary);
                letter-spacing: 1px;
                padding: 8px 0;
            }

            .time-label {
                font-size: 0.85em;
                color: var(--accent-color);
                font-weight: 500;
                text-transform: uppercase;
            }

            .end-date {
                text-align: center;
                font-size: 0.95em;
                font-weight: 500;
                color: var(--muted-color);
                padding-top: 12px;
                border-top: 1px solid rgba(0, 0, 0, 0.1);
                margin-top: 5px;
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .countdown-grid {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                }
                
                .countdown-title {
                    font-size: 1.4em;
                }
                
                .time-value {
                    font-size: 1.6em;
                }
            }

            @media (max-width: 480px) {
                .countdown-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .countdown-title {
                    font-size: 1.2em;
                }
                
                .time-value {
                    font-size: 1.4em;
                }
            }
        </style>
    `;
}

updateCountdown();
setInterval(updateCountdown, 1000);
```
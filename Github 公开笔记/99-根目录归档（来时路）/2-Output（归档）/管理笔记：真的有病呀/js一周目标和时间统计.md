---
相关链接:
  - "[[Ob插件Dataview]]"
  - "[[@PKM-✅Ob插件Charts-行动记录_提示词]]"
下联:
  - "[[🎯📊一周目标和时间统计|🎯📊一周目标和时间统计]]"
创建日期: 2025-03-11
笔记内容:
  - 低级
---
```dataviewjs
// ==================== 添加 ECharts 加载函数 ====================
function loadECharts() {
    return new Promise((resolve, reject) => {
        if (typeof window.echarts !== 'undefined') {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js";
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
    });
}

// Markdown 渲染函数
function renderMarkdown(text) {
    return dv.span(text).innerHTML;
}

function renderTimeCategoryChart(data) {
    const chartDom = document.getElementById('time-category-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
    }

    // 生成唯一的工具类名防止全局污染
    const tooltipClass = 'obsidian-tooltip-' + Math.random().toString(36).substr(2, 9);
    
    const option = {
        tooltip: {
            trigger: 'item',
            className: tooltipClass,
            enterable: true, // 允许鼠标进入tooltip
            formatter: function(params) {
                const data = params.data;
                let tooltipContent = `<b>${data.name}</b><br/>总时间: ${formatTime(data.value)}<br/>`;
                data.items.forEach(item => {
                    // 解析双链格式 [[文件名]] 或 [[文件名#标题]]
                    const match = item.link.match(/\[\[([^\]]+)\]\]/);
                    let displayName = item.content;
                    let linkTarget = '';
                    
                    if (match && match[1]) {
                        const linkParts = match[1].split('#');
                        const file = linkParts[0].trim();
                        const heading = linkParts[1] ? linkParts[1].trim() : '';
                        linkTarget = `obsidian://open?file=${encodeURIComponent(file)}${heading ? '&heading=' + encodeURIComponent(heading) : ''}`;
                        displayName = item.content.replace(match[0], file + (heading ? `#${heading}` : ''));
                    }
                    
                    tooltipContent += `<div class="tooltip-item">
                        ${displayName} (${formatTime(item.time)})
                        ${linkTarget ? `<a href="${linkTarget}" class="obsidian-link" target="_blank">↗</a>` : ''}
                    </div>`;
                });
                return tooltipContent;
            }
        },
        series: [
            {
                name: '时间分类',
                type: 'pie',
                radius: '70%',
                data: data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    myChart.setOption(option);
    
    // 添加自定义样式
    const style = document.createElement('style');
    style.innerHTML = `
        .${tooltipClass} {
            max-height: 70vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border-radius: 8px;
            border: none;
            padding: 15px;
            background: var(--background-primary);
            color: var(--text-normal);
        }
        .${tooltipClass} .tooltip-item {
            padding: 5px 0;
            border-bottom: 1px solid var(--background-modifier-border);
        }
        .${tooltipClass} .obsidian-link {
            display: inline-block;
            margin-left: 8px;
            padding: 0 6px;
            background: var(--interactive-accent);
            color: white !important;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
        }
        .${tooltipClass} .obsidian-link:hover {
            background: var(--interactive-accent-hover);
        }
    `;
    document.head.appendChild(style);
    
    // 响应式调整
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

// 🏆 专业级活动追踪仪表盘 - 带AI少女秘书和神秘奖励系统
dv.span(`# 🏅 目标与时间分析 - ${moment().format("YYYY年第W周")}`);

// 分钟数格式化函数
function formatMinutes(minutes) {
    if (minutes < 60) {
        return `${minutes}分钟`;
    } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
    }
}

// ==================== 1. 配置区 ====================
const CONFIG = {
    JOURNAL_PATH: "Documents/md/✍️/日记",
    THEME: {
        primary: "#4361ee",
        completed: "#2ecc71",
        onTrack: "#3498db",
        behind: "#e74c3c",
        background: "#f8f9fa"
    },
    // 活动分类配置
    CATEGORIES: {
        "产出（每日12个）": { 
            unit: "个", 
            icon: "📊", 
            colors: ["#a29bfe", "#a29bfe", "#FFB5C5"],
            regex: /(?:\+|\-)?\s*(\d+)\s*(?:个)?\s*(?:#📊)?产出（每日12个）/gi,
            timeRegex: /产出（每日12个）.*?【⏳(\d{2}):(\d{2}):(\d{2}) 】/gi,
            target: 84,     // 每周目标产出数，日均12次
            timeTarget: 210,
            rewards: ["🎁 拆开神秘包裹", "🖼️ 大自然之旅", "⛳ 一段激励人心的话，送给自己", "与AI进行一场深度对话"]
        },
        "表达（每日12次）": { 
            unit: "次", 
            icon: "💬", 
            colors: ["#9b59b6", "#9b59b6", "#FFB5C5"],
            regex: /(?:\+|\-)?\s*(\d+)\s*(?:次)?\s*(?:#📊)?表达（每日12次）/gi,
            timeRegex: /表达（每日12次）.*?【⏳(\d{2}):(\d{2}):(\d{2}) 】/gi,
            target: 84,     // 每周目标资讯数,日均50💬每天表达
            timeTarget: 210,
            rewards: ["🎤 K歌之夜", "🎭 即兴表达内容", "💬 与AI深夜谈心会"]
        },
        "视频（每日1个）": { 
            unit: "个", 
            icon: "🎬", 
            colors: ["#3498db", "#3498db", "#BBFFFF"],
            regex: /(?:\+|\-)?\s*(\d+)\s*(?:个)?\s*(?:#📊)?视频（每日1个）/gi,
            timeRegex: /视频（每日1个）.*?【⏳(\d{2}):(\d{2}):(\d{2}) 】/gi,
            target: 7,     // 每周目标视频数
            timeTarget: 210,
            rewards: ["📹 专属VLOG拍摄", "🎞️ 私人影院体验", "🎥 导演剪辑课", "菜谱-制作最爱吃的豆腐菜"]
        },
        "资讯（每日12条）": { 
            unit: "条", 
            icon: "📰", 
            colors: ["#2ecc71", "#2ecc71", "#2ecc71"],
            regex: /(?:\+|\-)?\s*(\d+)\s*(?:条)?\s*(?:#📊)?资讯（每日12条）/gi,
            timeRegex: /资讯（每日12条）.*?【⏳(\d{2}):(\d{2}):(\d{2}) 】/gi,
            target: 84,     // 每周目标资讯数,日均50👨‍🎓每天收集外界的资讯50条到笔记
            timeTarget: 210,
            rewards: ["🧠 头脑风暴", "📚 随机读一本书的内容", "🔍 解谜冒险夜"]
        },
        "笔记（每日50条）": { 
            unit: "条", 
            icon: "📰", 
            colors: ["#2ecc71", "#2ecc71", "#2ecc71"],
            regex: /(?:\+|\-)?\s*(\d+)\s*(?:条)?\s*(?:#📊)?笔记（每日50条）/gi,
            timeRegex: /笔记（每日50条）.*?【⏳(\d{2}):(\d{2}):(\d{2}) 】/gi,
            target: 84,     // 每周目标资讯数,日均50👨‍🎓每天收集外界的资讯50条到笔记
            timeTarget: 210,
            rewards: ["🧠 头脑风暴", "📚 随机读一本书的内容", "🔍 解谜冒险夜"]
        },
        "使用AI（每日12次）": { 
            unit: "次", 
            icon: "🤖", 
            colors: ["#95a5a6", "#95a5a6", "#95a5a6"],
            regex: /(?:\+|\-)?\s*(\d+)\s*(?:次)?\s*(?:#📊)?使用AI（每日12次）/gi,
            timeRegex: /使用AI（每日12次）.*?【⏳(\d{2}):(\d{2}):(\d{2}) 】/gi,
            target: 84,     // 每周目标资讯数,日均50🤖使用AI
            timeTarget: 210,
            rewards: ["🤖 AI女友体验", "💻 科技产品评测", "🚀 未来科技展"]
        },
        "做餐（每日3个）": { 
            unit: "个", 
            icon: "👨‍🍳", 
            colors: ["#2ecc71", "#2ecc71", "#2ecc71"],
            regex: /(?:\+|\-)?\s*(\d+)\s*(?:个)?\s*(?:#📊)?做餐（每日3个）/gi,
            timeRegex: /做餐（每日3个）.*?【⏳(\d{2}):(\d{2}):(\d{2}) 】/gi,
            target: 21,     // 每周目标视频数，日均3
            timeTarget: 210,
            rewards: ["🍣 菜谱制作体验", "👩‍🍳 获得神秘菜谱制作配方", "🍷 红酒晚餐"]
        },
        "用餐（每日12次）": { 
            unit: "次", 
            icon: "🍽️", 
            colors: ["#2ecc71", "#2ecc71", "#2ecc71"],
            regex: /(?:\b|^)(\d+)\s*(?:次)?\s*(?:#📊)?用餐（每日12次）/gi,
            timeRegex: /用餐（每日12次）.*?【⏳(\d{2}):(\d{2}):(\d{2}) 】/gi,
            target: 84,   // 每周目标饮食次数，日均12次
            timeTarget: 420,
            rewards: ["🍜 亲手做一个牛腩面，并去AI分享体验", "🍰 甜点大师课", "🍫 巧克力礼盒"]
        },
        "运动（每日12次）": { 
            unit: "次", 
            icon: "💪", 
            colors: ["#f39c12", "#f39c12", "#f39c12"],
            regex: /(?:\+|\-)?\s*(\d+)\s*(?:次)?\s*(?:#📊)?运动（每日12次）/gi,
            timeRegex: /运动（每日12次）.*?【⏳(\d{2}):(\d{2}):(\d{2}) 】/gi,
            target: 84,     // 每周目标视频数，日均12次
            timeTarget: 210,
            rewards: ["💃 即兴舞蹈", "🏋️ 蛋白粉礼包", "🧘‍♀️ 从高空窃取奖励"]
        },
        "跑步（每日3公里）": { 
            unit: "公里", 
            icon: "🏃", 
            colors: ["#e74c3c", "#e74c3c", "#e74c3c"],
            regex: /(?:\+|\-)\s*(\d+(?:\.\d+)?)\s*(?:公里|km|跑步（每日3公里）)/gi,
            timeRegex: /跑步（每日3公里）.*?【⏳(\d{2}):(\d{2}):(\d{2}) 】/gi,
            target: 21,   // 每周目标公里数，日均3公里
            timeTarget: 300,  // 每周目标分钟数
            rewards: ["🏃‍♀️ 与AI陪跑", "阅读一本书的内容", "💆 足底按摩"] // 神秘奖励
        },
        "睡觉（睡眠8小时）": { 
            unit: "次", 
            icon: "📰", 
            colors: ["#2ecc71", "#2ecc71", "#2ecc71"],
            regex: /(?:\+|\-)?\s*(\d+)\s*(?:次)?\s*(?:#📊)?睡觉（睡眠8小时）/gi,
            timeRegex: /睡觉（睡眠8小时）.*?【⏳(\d{2}):(\d{2}):(\d{2}) 】/gi,
            target: 7,     // 
            timeTarget: 56,
            rewards: ["🧠 头脑风暴", "📚 知识分享会", "🔍 解谜冒险夜"]
        },
        "用药（每日3次）": { 
            unit: "条", 
            icon: "📰", 
            colors: ["#2ecc71", "#2ecc71", "#2ecc71"],
            regex: /(?:\+|\-)?\s*(\d+)\s*(?:次)?\s*(?:#📊)?用药（每日3次）/gi,
            timeRegex: /用药（每日3次）.*?【⏳(\d{2}):(\d{2}):(\d{2}) 】/gi,
            target: 21,     // 
            timeTarget: 2,
            rewards: ["🧠 头脑风暴", "📚 知识分享会", "🔍 解谜冒险夜"]
        }
    },
    // 时间饼图分类配置
    TIME_CATEGORIES: {
        "工作": { color: "#36A2EB", emoji: "📊" },
        "学习": { color: "#4CAF50", emoji: "👨‍🎓" },
        "阅读": { color: "#20B2AA", emoji: "📖" },
        "饮食": { color: "#FF9F40", emoji: "🍽️" },
        "运动": { color: "#FF6384", emoji: "💪" },
        "休息": { color: "#9966FF", emoji: "💤" },
        "娱乐": { color: "#FFCD56", emoji: "🎮" },
        "其他": { color: "#C9CBCF", emoji: "🔄" }
    },
    // AI秘书配置
    AI_SECRETARY: {
        name: "小爱",
        avatar: "👩‍💼",
        greetings: [
            "主人今天好棒呀～继续加油解锁我的神秘奖励吧！",
            "哥哥的努力我都看在眼里，晚上有特别惊喜哦～",
            "看着你专注的样子，我的心跳都加速了呢💕",
            "完成目标的话，人家会给你意想不到的奖励～"
        ],
        // 整体完成时的特殊奖励
        specialRewards: [
            "🏝️ 周末温泉旅行",
            "💃 私人舞蹈表演",
            "🎁 神秘大礼包",
            "🍾 香槟庆祝之夜"
        ]
    }
};

// ==================== 2. 时间范围设置 ====================
const now = moment();
const startOfWeek = moment().startOf('isoWeek');
const endOfWeek = moment().endOf('isoWeek');
const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

// 随机选择AI秘书问候语
const randomGreeting = CONFIG.AI_SECRETARY.greetings[Math.floor(Math.random() * CONFIG.AI_SECRETARY.greetings.length)];

dv.span(`📅 **统计周期**: ${startOfWeek.format("YYYY-MM-DD")} 至 ${endOfWeek.format("YYYY-MM-DD")}  
⏳ **数据更新时间**: ${now.format("YYYY-MM-DD HH:mm")}
${CONFIG.AI_SECRETARY.avatar} **${CONFIG.AI_SECRETARY.name}**: ${randomGreeting}`);

// ==================== 3. 数据采集 ====================
function formatMinutesShort(minutes) {
    if (minutes < 60) {
        return `${minutes}m`;
    } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
    }
}

let weeklyData = Array(7).fill().map((_, i) => {
    const date = startOfWeek.clone().add(i, 'days');
    return {
        date: date.format("YYYY-MM-DD"),
        weekday: weekDays[i],
        isToday: date.isSame(now, 'day'),
        isWeekend: [5, 6].includes(date.day()),
        isFuture: date.isAfter(now, 'day'),
        data: {},
        time: {},
        expected: {},
        lastActivity: {} // 新增：存储每个分类的最后活动时间
    };
});

let stats = {};
// 初始化统计对象并添加weekActivity数组
Object.keys(CONFIG.CATEGORIES).forEach(cat => {
    stats[cat] = {
        total: 0,
        timeTotal: 0,
        daysCompleted: 0,
        completionRate: 0,
        timeCompletion: 0,
        dailyAvg: 0,
        timeDailyAvg: 0,
        remaining: 0,
        dailyRequired: 0,
        isOnTrack: true,
        weekActivity: Array(7).fill(false),  // 添加活跃度数组
        streak: 0,  // 连续达成天数
        rewardUnlocked: false, // 奖励解锁状态
        lastActivityTime: null // 新增：最近一次活动时间
    };
});

// 新增：时间饼图数据
let timePieData = {};
let totalMinutes = 0;

// 时间提取函数（改进版）
const extractTimeData = (text, date) => {
    const timeEntries = [];
    
    // 优化正则表达式以匹配双链前的文本
    const timePattern = /(\d{2}:\d{2})\s*(.*?)(?:\s*[+\-]\s*\d+(?:\.\d+)?\s*\S*)?\s*#📊([^⌛]+)⌛️([^【]+)【⏳(\d{2}):(\d{2}):(\d{2}) 】/gi
    let match;
    
    while ((match = timePattern.exec(text)) !== null) {
        const time = match[1];
        const activity = match[2].trim(); // 这里会包含双链但不含后面的计数信息
        const rawCategory = match[3].trim();
        const timeCategory = match[4].trim();
        const hours = parseInt(match[5]);
        const minutes = parseInt(match[6]);
        const seconds = parseInt(match[7]);
        const totalMinutes = hours * 60 + minutes + Math.round(seconds / 60);
        
        // 确定分类
        let category = "其他";
        for (const [cat, config] of Object.entries(CONFIG.TIME_CATEGORIES)) {
            if (timeCategory.includes(cat)) {
                category = cat;
                break;
            }
        }
        
        // 提取双链和标签
        const taskLine = match[0];
        const links = [...taskLine.matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1]);
        const tags = [...taskLine.matchAll(/#([^\s#]+)/g)].map(m => m[1]);
        
        // 提取时间限制 (新增)
        let timeLimit = null;
        const timeLimitMatch = taskLine.match(/⌛️🥊\s*(\d+)\s*m/);
        if (timeLimitMatch) {
            timeLimit = parseInt(timeLimitMatch[1]);
        }
        
        timeEntries.push({ 
            time,
            activity,
            fullDescription: taskLine.trim(),
            category, 
            minutes: totalMinutes,
            date,
            links,
            tags,
            timeLimit // 新增时间限制字段
        });
    }
    
    return timeEntries;
};

// 使用dayIndex参数修复活跃度统计
await Promise.all(weeklyData.map(async (day, dayIndex) => {
    if (day.isFuture) return;
    
    const fileName = `${day.date}.md`;
    const file = app.vault.getAbstractFileByPath(`${CONFIG.JOURNAL_PATH}/${fileName}`);
    
    if (file) {
        try {
            const content = await dv.io.load(file.path);
            
            // 提取时间饼图数据（使用新格式）
            const timeEntries = extractTimeData(content, day.date);
            timeEntries.forEach(entry => {
                const { activity, category, minutes } = entry;
                
                // 初始化数据结构
                if (!timePieData[category]) {
                    timePieData[category] = {
                        totalMinutes: 0,
                        activities: {}
                    };
                }
                
                // 累加分类总时间
                timePieData[category].totalMinutes += minutes;
                totalMinutes += minutes;
                
                // 累加具体活动时间
                if (!timePieData[category].activities[activity]) {
                    timePieData[category].activities[activity] = {
                        minutes: 0,
                        count: 0
                    };
                }
                timePieData[category].activities[activity].minutes += minutes;
                
                // 更新活动数量
                Object.entries(CONFIG.CATEGORIES).forEach(([cat, config]) => {
                    if (activity.includes(cat)) {
                        const matches = [...content.matchAll(config.regex)];
                        const count = matches.reduce((sum, match) => {
                            return sum + parseFloat(match[1]);
                        }, 0);
                        
                        timePieData[category].activities[activity].count = 
                            (timePieData[category].activities[activity].count || 0) + count;
                    }
                });
            });
            
            // 新增：解析每个分类的最后活动时间
            Object.entries(CONFIG.CATEGORIES).forEach(([cat, config]) => {
                // 计算每日目标值
                day.expected[cat] = (config.target / 7).toFixed(1);
                
                // 提取数量
                const matches = [...content.matchAll(config.regex)];
                day.data[cat] = matches.reduce((sum, match) => {
                    return sum + parseFloat(match[1]);
                }, 0);
                
                // 提取⌛️ - 修改为匹配新格式
                const timeMatches = [...content.matchAll(config.timeRegex)];
                day.time[cat] = timeMatches.reduce((sum, match) => {
                    // 将HH:MM:SS转换为分钟数
                    const hours = parseInt(match[1]);
                    const minutes = parseInt(match[2]);
                    const seconds = parseInt(match[3]);
                    return sum + hours * 60 + minutes + Math.round(seconds / 60);
                }, 0);
                
                // 更新统计和活跃度 - 这个部分被错误地放在了循环外
                if (day.data[cat] > 0) {
                    stats[cat].total += day.data[cat];
                    stats[cat].timeTotal += day.time[cat];
                    stats[cat].daysCompleted++;
                    // 修复：设置当天的活跃状态
                    stats[cat].weekActivity[dayIndex] = true;
                    stats[cat].streak++;
                    
                    // 更新连续达成天数
                    stats[cat].streak++;
                    
                    // ==== 修改点1：优化最后活动时间计算 ====
                    const today = moment();
                    const dayDate = moment(day.date);
                    
                    if (dayDate.isSame(today, 'day')) {
    // 更精确的正则，只匹配活动行开头的时间
    const timePattern = new RegExp(`^-\\s+(\\d{2}:\\d{2}).*?${cat}`, 'gm');
    const timeMatches = [...content.matchAll(timePattern)];
    
    if (timeMatches.length > 0) {
        // 找到最近的时间点（最大时间）
        let maxTime = null;
        timeMatches.forEach(match => {
            const timeStr = match[1];
            // 验证时间格式 (HH:mm)
            if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
                const timeObj = moment(`${day.date} ${timeStr}`, "YYYY-MM-DD HH:mm");
                if (!maxTime || timeObj.isAfter(maxTime)) {
                    maxTime = timeObj;
                }
            }
        });
        
        if (maxTime) {
            stats[cat].lastActivityTime = maxTime;
        } else {
            // 没有有效时间，使用当前时间（更准确）
            stats[cat].lastActivityTime = moment();
        }
    } else {
        // 没有找到时间点，使用当前时间
        stats[cat].lastActivityTime = moment();
    }
} else {
    // 不是今天，使用当天日期+中午12点
    stats[cat].lastActivityTime = moment(day.date).set({hour:12, minute:0});
}
                } else {
                    stats[cat].streak = 0;
                }
            }); // 这里应该是forEach的结束
            
        } catch(e) {
            console.error(`读取错误: ${file.path}`, e);
        }
    }
}));

// 计算完成率和平均值
const daysPassed = weeklyData.filter(d => !d.isFuture).length;
Object.keys(stats).forEach(cat => {
    const target = CONFIG.CATEGORIES[cat].target;
    const timeTarget = CONFIG.CATEGORIES[cat].timeTarget;
    
    stats[cat].completionRate = Math.min(100, (stats[cat].total / target) * 100);
    stats[cat].timeCompletion = Math.min(100, (stats[cat].timeTotal / timeTarget) * 100);
    stats[cat].dailyAvg = (stats[cat].total / daysPassed).toFixed(1);
    stats[cat].timeDailyAvg = (stats[cat].timeTotal / daysPassed).toFixed(0);
    stats[cat].remaining = Math.max(0, target - stats[cat].total);
    stats[cat].dailyRequired = (target / 7).toFixed(1);
    stats[cat].isOnTrack = stats[cat].total >= (target / 7 * daysPassed);
    
    // 检查是否解锁奖励
    stats[cat].rewardUnlocked = stats[cat].completionRate >= 100;
});

// ==================== 4. 多维趋势分析 - 柱状图 ====================
dv.span("## 📈 多维趋势分析");
dv.span(`### 活动数量与活跃度指数分析`);
window.renderChart({
    type: 'bar',
    data: {
        labels: weeklyData.map(d => d.weekday),
        datasets: [
            ...Object.entries(CONFIG.CATEGORIES).map(([cat, cfg]) => ({
                label: `${cfg.icon} ${cat}`,
                data: weeklyData.map(d => d.data[cat] || 0),
                backgroundColor: cfg.colors[0] + '80',
                borderColor: cfg.colors[1],
                borderWidth: 1,
                yAxisID: 'y'
            })),
            {
                type: 'line',
                label: '活跃度指数',
                data: weeklyData.map(d => 
                    Object.values(d.data).reduce((sum, val) => sum + (val || 0), 0)
                ),
                borderColor: '#FF0000', // 改为红色
                backgroundColor: 'transparent',
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#FF0000', // 改为红色
                tension: 0.4, // 添加曲线效果
                yAxisID: 'y1',
                order: 1
            },
            ...Object.entries(CONFIG.CATEGORIES).map(([cat, cfg]) => ({
                label: `${cfg.icon} ${cat}目标`,
                data: weeklyData.map(d => parseFloat(d.expected[cat]) || 0),
                type: 'line',
                borderColor: cfg.colors[1] + '80',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                yAxisID: 'y',
                order: 2
            }))
        ]
    },
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    afterBody: (items) => {
                        const day = weeklyData[items[0].dataIndex];
                        return Object.entries(day.time)
                            .filter(([_, val]) => val > 0)
                            .map(([cat, val]) => `${CONFIG.CATEGORIES[cat].icon} ${cat}⌛️: ${formatMinutes(val)}`)
                            .join('\n');
                    },
                    footer: (items) => {
                        const day = weeklyData[items[0].dataIndex];
                        const activityIndex = Object.values(day.data).reduce((sum, val) => sum + (val || 0), 0);
                        return `活跃度指数: ${activityIndex}`;
                    }
                }
            }
        },
        scales: {
            y: { 
                title: { display: true, text: '活动数量', font: { weight: 'bold' } },
                beginAtZero: true,
                grid: { display: true }
            },
            y1: {
                position: 'right',
                title: { display: true, text: '活跃度指数', font: { weight: 'bold' } },
                grid: { drawOnChartArea: false },
                min: 0,
                ticks: {
                    precision: 0
                }
            },
            x: {
                title: { display: true, text: '日期', font: { weight: 'bold' } },
                ticks: {
                    callback: function(value, index) {
                        return weeklyData[index].isToday ? 
                            `👉 ${this.getLabelForValue(index)} 👈` : 
                            this.getLabelForValue(index);
                    }
                }
            }
        }
    }
}, this.container);

// ==================== 5. 激励型进度卡片 ====================
dv.span("## 🚀 目标完成进度");

// 分组配置
const GROUP_CONFIG = {
    "产出价值💰": {
        color: "#4361ee",
        description: "每日必须完成的基础目标",
        categories: ["产出（每日12个）", "表达（每日12次）", "视频（每日1个）"]
    },
    "提升和日常💪": {
        color: "#9b59b6",
        description: "提升能力的进阶目标",
        categories: ["资讯（每日12条）", "笔记（每日50条）", "使用AI（每日12次）", "做餐（每日3个）", "用餐（每日12次）", "运动（每日12次）", "跑步（每日3公里）", "睡觉（睡眠8小时）", "用药（每日3次）"]
    }
};

// 创建分组卡片
const groupCards = Object.entries(GROUP_CONFIG).map(([groupName, groupConfig]) => {
    // 筛选属于该组的分类
    const groupCategories = Object.entries(CONFIG.CATEGORIES)
        .filter(([cat]) => groupConfig.categories.includes(cat));
    
    // 生成组内卡片
    const categoryCards = groupCategories.map(([cat, cfg]) => {
        const stat = stats[cat];
        
        // 进度条渲染函数
        const renderCompactProgressBar = (percent, color, current, target, unit, isTime = false) => `
            <div style="margin: 2px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <span style="font-weight: bold; font-size: 0.95em;">
                        ${isTime ? formatMinutes(current) : current}${unit} / ${isTime ? formatMinutes(target) : target}${unit}
                    </span>
                    <span style="font-size: 0.85em; color: #555;">${percent.toFixed(1)}%</span>
                </div>
                <div style="height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; width: ${percent}%; background: ${color};"></div>
                </div>
            </div>
        `;
        
        // 活跃度圆点
        const activityDots = stat.weekActivity.map(active => 
            active ? `<span style="color: ${cfg.colors[1]}">●</span>` : `<span style="color: #ddd">●</span>`
        ).join('');
        
        // 最后活动时间显示
        let lastActivityText = "无记录";
        if (stat.lastActivityTime) {
            const diffMinutes = moment().diff(stat.lastActivityTime, 'minutes');
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            if (diffDays > 0) {
                lastActivityText = `${diffDays}天前`;
            } else if (diffHours > 0) {
                lastActivityText = `${diffHours}小时前`;
            } else if (diffMinutes > 0) {
                lastActivityText = `${diffMinutes}分钟前`;
            } else {
                lastActivityText = "刚刚";
            }
        }
        
        // 奖励显示逻辑
        let rewardSection = "";
        if (stat.rewardUnlocked) {
            const randomReward = cfg.rewards[Math.floor(Math.random() * cfg.rewards.length)];
            rewardSection = `
                <div style="margin-top: 8px; padding: 8px; background: ${cfg.colors[2]}; 
                            border-radius: 4px; font-size: 0.85em; border: 1px dashed ${cfg.colors[1]};">
                    <div style="display: flex; align-items: center; gap: 5px; color: ${cfg.colors[1]};">
                        <span style="font-size: 1.2em;">🎁</span>
                        <strong>神秘奖励解锁:</strong>
                    </div>
                    <div style="margin-top: 5px;">${randomReward}</div>
                </div>
            `;
        } else if (stat.completionRate > 50) {
            rewardSection = `
                <div style="margin-top: 8px; padding: 8px; background: ${cfg.colors[2]}; 
                            border-radius: 4px; font-size: 0.85em; text-align: center;">
                    <span style="color: ${cfg.colors[1]};">❓</span> 完成目标解锁神秘奖励
                </div>
            `;
        } else {
            rewardSection = `
                <div style="margin-top: 8px; padding: 8px; background: ${cfg.colors[2]}; 
                            border-radius: 4px; font-size: 0.85em; text-align: center;">
                    保持努力，奖励就在前方！
                </div>
            `;
        }
        
        return `
            <div style="border-left: 3px solid ${cfg.colors[1]}; padding: 8px 10px; margin: 8px 0;
                        background: white; border-radius: 0 6px 6px 0; box-shadow: 0 1px 4px rgba(0,0,0,0.05);
                        display: flex;">
                <!-- 左侧：图标和标题 -->
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                        <span style="font-size: 1.4em;">${cfg.icon}</span>
                        <h3 style="margin: 0; font-size: 1.1em; color: #d35400;">${cat}</h3>
                    </div>
                    
                    <!-- 进度条区域 -->
                    <div style="margin-bottom: 5px;">
                        ${renderCompactProgressBar(stat.completionRate, cfg.colors[1], stat.total, cfg.target, cfg.unit)}
                        ${renderCompactProgressBar(stat.timeCompletion, cfg.colors[1], stat.timeTotal, cfg.timeTarget, "", true)}
                    </div>
                    
                    <!-- 紧凑平均值区域 -->
                    <div style="display: flex; justify-content: space-between; font-size: 0.8em; color: #777; margin-top: 5px;">
                        <div>数量: <b>${stat.dailyAvg}${cfg.unit}</b></div>
                        <div>时间: <b>${formatMinutes(stat.timeDailyAvg)}</b></div>
                    </div>
                    
                    <!-- 奖励区域 -->
                    ${rewardSection}
                </div>
                
                <!-- 右侧：活跃度区域 -->
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; 
                            min-width: 60px; margin-left: 10px;">
                    <div style="font-size: 0.75em; color: #6c757d; margin-bottom: 2px;">活跃天数</div>
                    <div style="font-size: 1.1em; font-weight: bold; color: ${cfg.colors[1]};">
                        ${stat.daysCompleted}/7
                    </div>
                    <div style="font-size: 1.2em; letter-spacing: 2px; margin-top: 5px;">
                        ${activityDots}
                    </div>
                    <div style="font-size: 0.75em; color: #6c757d; margin-top: 5px;">连续: ${stat.streak}天</div>
                    <div style="font-size: 0.7em; text-align: center; margin-top: 3px;">
                        上一次: <b>${lastActivityText}</b>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // 计算组完成率
    const groupCompletion = groupCategories.reduce((sum, [cat]) => {
        return sum + stats[cat].completionRate;
    }, 0) / groupCategories.length;
    
    return `
        <div style="border: 1px solid ${groupConfig.color}30; border-radius: 8px; padding: 15px; 
                    background: linear-gradient(to bottom, ${groupConfig.color}08, white); 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <!-- 分组标题 -->
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; padding-bottom: 10px; 
                        border-bottom: 1px solid ${groupConfig.color}30;">
                <div style="width: 6px; height: 30px; background: ${groupConfig.color}; border-radius: 3px;"></div>
                <div>
                    <h3 style="margin: 0; color: ${groupConfig.color};">${groupName}</h3>
                    <div style="font-size: 0.85em; color: #6c757d; margin-top: 3px;">
                        ${groupConfig.description} | 完成率: ${groupCompletion.toFixed(1)}%
                    </div>
                </div>
            </div>
            
            <!-- 组内卡片 -->
            ${categoryCards}
        </div>
    `;
}).join('');

// 双列响应式布局
dv.span(`
<div style="
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 20px;
    margin-top: 20px;
">
    ${groupCards}
</div>
`);

// ==================== 6. 多维趋势分析 - 剩余图表 ====================
// 6.1 完成率雷达图
dv.span(`### 完成率对比分析`);
window.renderChart({
    type: 'radar',
    data: {
        labels: Object.keys(CONFIG.CATEGORIES),
        datasets: [
            {
                label: '数量完成率 (%)',
                data: Object.values(stats).map(s => s.completionRate),
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                borderColor: 'rgba(46, 204, 113, 1)',
                pointBackgroundColor: 'rgba(46, 204, 113, 1)',
                pointBorderColor: '#fff',
                pointHoverRadius: 6
            },
            {
                label: '时间完成率 (%)',
                data: Object.values(stats).map(s => s.timeCompletion),
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                borderColor: 'rgba(231, 76, 60, 1)',
                pointBackgroundColor: 'rgba(231, 76, 60, 1)',
                pointBorderColor: '#fff',
                pointHoverRadius: 6
            }
        ]
    },
    options: {
        scales: {
            r: {
                angleLines: { display: true },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: { stepSize: 20, backdropColor: 'transparent' },
                pointLabels: { font: { size: 12 } }
            }
        },
        plugins: {
            legend: { position: 'top' }
        }
    }
}, this.container);

// ==================== 6.2 时间与数量分配比例 ====================
dv.span(`### 时间与数量分配比例`);
const totalTime = Object.values(stats).reduce((sum, stat) => sum + stat.timeTotal, 0);

// 创建环形图配置
const timeQuantityChart = {
    type: 'doughnut',
    data: {
        labels: Object.keys(CONFIG.CATEGORIES),
        datasets: [{
            data: Object.keys(CONFIG.CATEGORIES).map(cat => stats[cat].timeTotal),
            backgroundColor: Object.values(CONFIG.CATEGORIES).map(c => c.colors[0]),
            borderColor: Object.values(CONFIG.CATEGORIES).map(c => c.colors[1]),
            borderWidth: 2
        }]
    },
    options: {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (item) => {
                        const cat = Object.keys(CONFIG.CATEGORIES)[item.dataIndex];
                        const time = item.raw;
                        const quantity = stats[cat].total;
                        const percent = totalTime > 0 ? (time / totalTime * 100).toFixed(1) : 0;
                        return [
                            `${cat}: ${quantity}${CONFIG.CATEGORIES[cat].unit}`,
                            `${formatMinutes(time)} (${percent}%)`
                        ];
                    }
                }
            },
            legend: { 
                position: 'right',
                labels: {
                    generateLabels: (chart) => {
                        return chart.data.labels.map((label, i) => {
                            const cat = label;
                            const meta = chart.getDatasetMeta(0);
                            const quantity = stats[cat].total;
                            
                            return {
                                text: `${label}: ${quantity}${CONFIG.CATEGORIES[cat].unit}`,
                                fillStyle: chart.data.datasets[0].backgroundColor[i],
                                strokeStyle: chart.data.datasets[0].borderColor[i],
                                lineWidth: 1,
                                hidden: false,
                                index: i
                            };
                        });
                    }
                } 
            }
        },
        cutout: '50%'
    }
};

// 渲染环形图
window.renderChart(timeQuantityChart, this.container);

// ==================== 6.3 时间分类饼图 ====================
if (totalMinutes > 0) {
    dv.span(`### ⏱️ 时间分配详情（按分类分组）`);
    
    // 创建分类数据结构
    const categoryGroups = {};
    
    // 首先按预设分类分组
    Object.entries(CONFIG.TIME_CATEGORIES).forEach(([category, config]) => {
        categoryGroups[category] = {
            emoji: config.emoji,
            color: config.color,
            totalMinutes: 0,
            activities: {},
            dailyRecords: {},
            tags: new Set(),
            links: new Set()
        };
    });
    
    // 添加"未分类"组
    categoryGroups["未分类"] = {
        emoji: "❓",
        color: "#C9CBCF",
        totalMinutes: 0,
        activities: {},
        dailyRecords: {},
        tags: new Set(),
        links: new Set()
    };
    
    // 重新填充数据
    await Promise.all(weeklyData.map(async (day, dayIndex) => {
        if (day.isFuture) return;
        
        const fileName = `${day.date}.md`;
        const file = app.vault.getAbstractFileByPath(`${CONFIG.JOURNAL_PATH}/${fileName}`);
        
        if (file) {
            try {
                const content = await dv.io.load(file.path);
                const timeEntries = extractTimeData(content, day.date);
                
                timeEntries.forEach(entry => {
                    const { category, minutes, date, links, tags } = entry;
                    
                    // 初始化数据结构
                    if (!categoryGroups[category]) {
                        categoryGroups[category] = {
                            emoji: "❓",
                            color: "#C9CBCF",
                            totalMinutes: 0,
                            activities: {},
                            dailyRecords: {},
                            tags: new Set(),
                            links: new Set()
                        };
                    }
                    
                    // 累加分类总时间
                    categoryGroups[category].totalMinutes += minutes;
                    totalMinutes += minutes;
                    
                    // 累加具体活动时间
                    if (!categoryGroups[category].activities[entry.activity]) {
                        categoryGroups[category].activities[entry.activity] = {
                            minutes: 1,
                            count: 0,
                            tags: new Set(),
                            links: new Set()
                        };
                    }
                    categoryGroups[category].activities[entry.activity].minutes += minutes;
                    categoryGroups[category].activities[entry.activity].count += 1;
                    
                    // 按日期存储记录
                    if (!categoryGroups[category].dailyRecords[date]) {
                        categoryGroups[category].dailyRecords[date] = {
                            totalMinutes: 0,
                            entries: []
                        };
                    }
                    categoryGroups[category].dailyRecords[date].totalMinutes += minutes;
                    categoryGroups[category].dailyRecords[date].entries.push(entry);
                });
                
            } catch(e) {
                console.error(`读取错误: ${file.path}`, e);
            }
        }
    }));
    
    // 过滤掉空分类并按时间排序
    const sortedGroups = Object.entries(categoryGroups)
        .filter(([_, group]) => group.totalMinutes > 0)
        .sort((a, b) => b[1].totalMinutes - a[1].totalMinutes);
    
    // 创建可点击链接的函数
    const createClickableLinks = (text) => {
        // 处理双链 [[...]]
        let result = text.replace(/\[\[([^\]]+)\]\]/g, (match, p1) => {
            return `<a href="${p1}" class="internal-link" target="_blank" rel="noopener">[[${p1}]]</a>`;
        });
        // 处理标签 #...
        result = result.replace(/#([^\s#]+)/g, (match, p1) => {
            return `<a href="#${p1}" class="tag" target="_blank" rel="noopener">#${p1}</a>`;
        });
        return result;
    };
    
    // 显示分类摘要
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = Math.round(totalMinutes % 60);
    let totalTimeStr = `${totalMinutes.toFixed(0)}分钟`;
    if (totalHours > 0) {
        totalTimeStr = `${totalHours}小时${totalMins > 0 ? `${totalMins}分钟` : ''}`;
    }
    dv.span(`**总计记录时间**: ${totalTimeStr}`);
    
    // 创建饼图容器
    dv.span('<div id="time-category-chart" style="height:600px;"></div>');
    
    // 加载 ECharts 并渲染图表
    try {
        await loadECharts(); // 确保 ECharts 已加载
    } catch (e) {
        console.error("加载 ECharts 失败:", e);
        dv.span("> 图表渲染失败，请检查网络连接");
    }

    // 准备时间分类饼图数据
    const timeCategoryData = {};
    for (const [category, group] of sortedGroups) {
        timeCategoryData[category] = {
            totalTime: group.totalMinutes,
            items: []
        };
        
        // 遍历每天的记录
        for (const date in group.dailyRecords) {
            const entries = group.dailyRecords[date].entries;
            for (const entry of entries) {
                timeCategoryData[category].items.push({
                    content: entry.activity,
                    time: entry.minutes,
                    link: entry.links.length > 0 ? `[[${entry.links[0]}]]` : ''
                });
            }
        }
    }

    const pieData = Object.keys(timeCategoryData).map(category => {
    // 对当前分类的items数组按time降序排序（用时多到用时少）
    const sortedItems = [...timeCategoryData[category].items].sort((a, b) => b.time - a.time);
    
    return {
        name: category,
        value: timeCategoryData[category].totalTime,
        items: sortedItems  // 使用排序后的数组
    };
});

renderTimeCategoryChart(pieData);
    
    // ==== 重构：按日期分组显示（时间倒序）====
    // 计算每个分类的累计完成量
    const cumulativeData = {};
    Object.keys(CONFIG.CATEGORIES).forEach(cat => {
        cumulativeData[cat] = {};
        let cumulative = 0;
        weeklyData.forEach(day => {
            if (!day.isFuture) {
                cumulative += day.data[cat] || 0;
                cumulativeData[cat][day.date] = cumulative;
            }
        });
    });
    
    // 显示分类详情（按日期分组，时间倒序）
    for (const [category, group] of sortedGroups) {
        const percentage = Math.round((group.totalMinutes / totalMinutes) * 100);
        const hours = Math.floor(group.totalMinutes / 60);
        const mins = Math.round(group.totalMinutes % 60);
        let timeStr = `${group.totalMinutes.toFixed(0)}分钟`;
        if (hours > 0) {
            timeStr = `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
        }
        
        // 创建可点击的标签和双链
        const categoryTags = [...group.tags].map(t => `#${t}`).join(' ');
        const categoryLinks = [...group.links].map(l => `[[${l}]]`).join(' ');
        
        const clickableTags = createClickableLinks(categoryTags);
        const clickableLinks = createClickableLinks(categoryLinks);
        
        // 按日期分组显示（时间倒序）
        const sortedDates = Object.keys(group.dailyRecords)
            .sort((a, b) => new Date(b) - new Date(a));
        
        dv.span(`
<details>
<summary style="cursor: pointer; font-weight: bold; margin: 8px 0;">
    ${group.emoji} <span style="color: ${group.color}">${category}</span>: ${timeStr} (${percentage}%)
    ${categoryTags ? `<span style="margin-left: 10px; color: #666;">${clickableTags}</span>` : ''}
    ${categoryLinks ? `<span style="margin-left: 10px; color: #666;">${clickableLinks}</span>` : ''}
</summary>
<div style="margin-left: 20px; margin-top: 8px;">
    ${
            sortedDates.map(date => {
                const weekday = weekDays[moment(date).isoWeekday() - 1];
                const dailyTotal = group.dailyRecords[date].totalMinutes;
                const records = group.dailyRecords[date].entries
                    .sort((a, b) => {
                        // 将时间字符串转换为可比较的数字 (HH:mm → HHmm)
                        const timeA = parseInt(a.time.replace(':', ''));
                        const timeB = parseInt(b.time.replace(':', ''));
                        return timeB - timeA; // 降序排列（最新的在最前面）
                    });
                
                // 格式化日期总时间
                const dailyHours = Math.floor(dailyTotal / 60);
                const dailyMins = Math.round(dailyTotal % 60);
                let dailyTimeStr = `${dailyTotal.toFixed(0)}分钟`;
                if (dailyHours > 0) {
                    dailyTimeStr = `${dailyHours}小时${dailyMins > 0 ? `${dailyMins}分钟` : ''}`;
                }
                
                // ==== 修复后的累计进度条 ====
const progressBars = Object.entries(CONFIG.CATEGORIES)
    .filter(([cat, cfg]) => {
        // 检查当前活动是否属于这个分类
        const activityMatch = records.some(record => 
            record.fullDescription.includes(cat) || 
            record.tags.some(tag => tag.includes(cat))
        );
        return cumulativeData[cat][date] > 0 && activityMatch;
    })
    .map(([cat, cfg]) => {
        const cumulativeValue = cumulativeData[cat][date];
        const target = cfg.target;
        const percentage = Math.min(100, (cumulativeValue / target) * 100);
        
        return `
<div style="margin-bottom: 8px;">
    <div style="display: flex; justify-content: space-between; font-size: 0.85em; margin-bottom: 3px;">
        <div>${cfg.icon} ${cat}</div>
        <div>${cumulativeValue.toFixed(1)}${cfg.unit} / ${target}${cfg.unit}</div>
    </div>
    <div style="height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden;">
        <div style="height: 100%; width: ${percentage}%; background: ${cfg.colors[1]};"></div>
    </div>
</div>
        `;
    }).join('');
                
                return `
<div style="margin-bottom: 20px;">
    <div style="font-weight: bold; color: ${group.color}; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
        <span>${date} (${weekday})</span>
        <span>总计: ${dailyTimeStr}</span>
    </div>
    
    <!-- 累计进度条 -->
    ${progressBars}
    
    <!-- 详细活动记录 -->
    ${
                    records.map(entry => {
                        const actHours = Math.floor(entry.minutes / 60);
                        const actMins = Math.round(entry.minutes % 60);
                        let actTimeStr = `${entry.minutes.toFixed(0)}分钟`;
                        if (actHours > 0) {
                            actTimeStr = `${actHours}小时${actMins > 0 ? `${actMins}分钟` : ''}`;
                        }
                        
                        // 提取数量信息
                        let quantityInfo = '';
                        const quantityMatch = entry.fullDescription.match(/(?:\+|\-)\s*(\d+(?:\.\d+)?)\s*(\S*)/);
                        if (quantityMatch) {
                            const quantity = quantityMatch[1];
                            const unit = quantityMatch[2] || '';
                            quantityInfo = `<span style="color: ${group.color}; font-weight: bold; margin-left: 5px;">+${quantity}${unit}</span>`;
                        }
                        
                        // 创建可点击的活动描述
                        const activityDesc = createClickableLinks(entry.activity);
                        
                        // 处理标签和双链
                        const recordTags = entry.tags.map(t => `#${t}`).join(' ');
                        const recordLinks = entry.links.map(l => `[[${l}]]`).join(' ');
                        
                        const clickableRecordTags = createClickableLinks(recordTags);
                        const clickableRecordLinks = createClickableLinks(recordLinks);
                        
                        // 格式化时间点 - 确保显示格式为 HH:mm
                        const formattedTime = entry.time.includes(':') ? entry.time : `${entry.time.substring(0,2)}:${entry.time.substring(2,4)}`;
                        
                        // ==== 新增：时间限制警告显示 ====
                        let timeLimitWarning = '';
                        if (entry.timeLimit) {
                            if (entry.minutes <= entry.timeLimit) {
                                // 未超时
                                timeLimitWarning = `<span style="color: #27ae60; margin-left: 5px;">✅ (${entry.minutes}/${entry.timeLimit}m)</span>`;
                            } else {
                                // 计算超时比例
                                const overtimePercent = Math.round(((entry.minutes - entry.timeLimit) / entry.timeLimit) * 100);
                                let emoji = '⚠️';
                                let color = '#f39c12';
                                
                                if (overtimePercent > 100) {
                                    emoji = '🔥🔥';
                                    color = '#e74c3c';
                                } else if (overtimePercent > 50) {
                                    emoji = '🔥';
                                    color = '#e67e22';
                                }
                                
                                timeLimitWarning = `<span style="color: ${color}; margin-left: 5px;">${emoji} 超时${overtimePercent}%</span>`;
                            }
                        }
                        
                        return `
<div style="margin: 10px 0;">
    <!-- 第一行：时间+用时+事项描述+数量 -->
    <div style="display: flex; align-items: flex-start; margin-bottom: 5px;">
        <span style="color: #666; font-size: 0.9em; min-width: 50px; padding-top: 3px;">${formattedTime}</span>
        <div>
	        ${actTimeStr} 
            <span>${activityDesc}</span>
            ${quantityInfo}
            ${timeLimitWarning}
        </div>
    </div>
    
    <!-- 第二行：标签 -->
    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85em; color: #6c757d;">
        <div style="display: flex; gap: 8px;">
            ${recordTags ? `<div>${clickableRecordTags}</div>` : ''}
            ${recordLinks ? `<div>${clickableRecordLinks}</div>` : ''}
        </div>
    </div>
</div>
                        `;
                    }).join('') || '<div style="color: #adb5bd; font-style: italic; padding: 10px;">无详细活动记录</div>'
                }
</div>
                `;
            }).join('')
        }
</div>
</details>
        `);
    }
} else {
    dv.span("> 尚未记录时间分配数据");
}

// ==================== 8. 每日活动详情 ====================
dv.span(`
<div style="
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
">
    <h3 style="color: ${CONFIG.THEME.primary}; margin-top: 0">📝 每日活动详情</h3>
    <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
    ">
    ${weeklyData.map(day => {
        if (day.isFuture) return '';
        
        const activities = Object.entries(day.data)
            .filter(([_,v]) => v > 0)
            .map(([cat,v]) => {
                const expected = day.expected[cat] || 0;
                const diff = (v - expected).toFixed(1);
                return `
        <div style="
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #eee;
        ">
            <div style="display: flex; align-items: center;">
                <span style="color: ${CONFIG.CATEGORIES[cat].colors[1]}; margin-right: 8px;">
                    ${CONFIG.CATEGORIES[cat].icon}
                </span>
                <span>${cat}</span>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: bold;">${v}${CONFIG.CATEGORIES[cat].unit}</div>
                <div style="font-size: 0.85em; color: ${
                    diff > 0 ? CONFIG.THEME.completed : 
                    diff < 0 ? CONFIG.THEME.behind : '#6c757d'
                }">
                    ${diff > 0 ? '+' : ''}${diff} vs 目标
                </div>
            </div>
        </div>
                `;
            }).join('');
        
        // 计算当日活跃度
        const activityIndex = Object.values(day.data).reduce((sum, val) => sum + val, 0);
        
        return `
    <div style="
        background: ${day.isToday ? CONFIG.THEME.primary + '08' : 'white'};
        border: 1px solid ${day.isToday ? CONFIG.THEME.primary + '30' : '#eee'};
        border-radius: 8px;
        padding: 16px;
        position: relative;
    ">
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #f1f3f5;
        ">
            <div style="font-weight: bold; color: ${day.isToday ? CONFIG.THEME.primary : '#495057'}">
                ${day.weekday} ${day.isToday ? '✨' : ''}
            </div>
            <div style="color: #6c757d; font-size: 0.9em;">
                ${day.date.substring(5)}
            </div>
        </div>
        
        ${activities || `
        <div style="
            color: #adb5bd;
            text-align: center;
            padding: 20px 0;
            font-style: italic;
        ">
            当日无活动记录
        </div>
        `}
        
        <div style="
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid #f1f3f5;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <span>🔥 活跃度指数</span>
            <span style="
                font-weight: bold;
                font-size: 1.2em;
                color: ${activityIndex > 0 ? CONFIG.THEME.primary : '#6c757d'};
            ">
                ${activityIndex}
            </span>
        </div>
    </div>
        `;
    }).join('')}
    </div>
</div>
`);

// ==================== 9. AI少女秘书综合评估 ====================
// 计算总体指标
const totalActivities = Object.values(stats).reduce((sum, stat) => sum + stat.total, 0);
const totalTimeSpent = Object.values(stats).reduce((sum, stat) => sum + stat.timeTotal, 0);
const avgCompletion = Object.values(stats).reduce((sum, stat) => sum + stat.completionRate, 0) / Object.keys(stats).length;
const avgTimeCompletion = Object.values(stats).reduce((sum, stat) => sum + stat.timeCompletion, 0) / Object.keys(stats).length;
const bestCategory = Object.entries(stats).sort((a, b) => b[1].completionRate - a[1].completionRate)[0];
const weakCategory = Object.entries(stats).sort((a, b) => a[1].completionRate - b[1].completionRate)[0];
const bestDay = weeklyData.reduce((best, day) => {
    const total = Object.values(day.data).reduce((sum, val) => sum + (val || 0), 0);
    return total > best.total ? { date: day.date, weekday: day.weekday, total } : best;
}, { total: 0 });

// 计算完成的目标数量
const completedTargets = Object.values(stats).filter(stat => stat.completionRate >= 100).length;
const totalTargets = Object.keys(stats).length;

// 成就徽章
const achievementBadges = Object.entries(stats)
    .filter(([_, stat]) => stat.completionRate >= 100)
    .map(([cat]) => `<span style="font-size: 1.5em; margin-right: 10px;" title="${cat}已完成目标">${CONFIG.CATEGORIES[cat].icon}🏅</span>`)
    .join('');

// 神秘奖励显示
let specialRewardSection = "";
if (completedTargets > 0) {
    // 随机选择一个特殊奖励
    const randomSpecialReward = CONFIG.AI_SECRETARY.specialRewards[Math.floor(Math.random() * CONFIG.AI_SECRETARY.specialRewards.length)];
    
    specialRewardSection = `
    <div style="background: linear-gradient(to right, #4361ee, #3a0ca3); color: white; border-radius: 8px; padding: 15px; margin-top: 15px;">
        <h4 style="margin-top: 0; color: white;">🌟 神秘奖励</h4>
        <div style="text-align: center; padding: 10px; font-size: 1.2em;">
            ${CONFIG.AI_SECRETARY.avatar} ${CONFIG.AI_SECRETARY.name}: "恭喜完成${completedTargets}个目标！你的奖励是:"
        </div>
        <div style="text-align: center; font-size: 1.5em; font-weight: bold; margin: 10px 0;">
            ${randomSpecialReward}
        </div>
        <div style="text-align: center; font-size: 0.9em;">
            完成所有${totalTargets}个目标解锁终极神秘大奖！
        </div>
    </div>
    `;
}

dv.span(`
<div style="
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
">
    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
        <div style="font-size: 3em;">${CONFIG.AI_SECRETARY.avatar}</div>
        <div>
            <div style="font-size: 1.4em; font-weight: bold; color: #e91e63;">AI秘书 ${CONFIG.AI_SECRETARY.name}</div>
            <div style="font-size: 1.1em; color: #555; margin-top: 5px;">"主人本周完成了${completedTargets}/${totalTargets}个目标，${completedTargets > totalTargets/2 ? '太棒了！' : '继续加油哦～'}"</div>
        </div>
    </div>
    
    <h3 style="color: ${CONFIG.THEME.primary}; margin-top: 0">📊 本周综合评估</h3>
    
    ${achievementBadges ? `
    <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2em; color: #e67e22;">🏆 成就徽章</span>
            <div style="display: flex; gap: 5px;">
                ${achievementBadges}
            </div>
        </div>
    </div>
    ` : ''}
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 20px;">
        <!-- 完成率卡片 -->
        <div style="border-left: 4px solid ${CONFIG.THEME.primary}; padding: 0 15px;">
            <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">平均完成率</div>
            <div style="font-size: 2em; font-weight: bold; color: ${CONFIG.THEME.primary};">${avgCompletion.toFixed(1)}%</div>
            <div style="height: 6px; background: #f0f0f0; border-radius: 3px; margin-top: 8px; overflow: hidden;">
                <div style="height: 100%; width: ${avgCompletion}%; background: ${CONFIG.THEME.primary};"></div>
            </div>
            <div style="font-size: 0.85em; color: #6c757d; margin-top: 5px;">时间完成率: ${avgTimeCompletion.toFixed(1)}%</div>
        </div>
        
        <!-- 活跃度卡片 -->
        <div style="border-left: 4px solid #3498db; padding: 0 15px;">
            <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">总活跃度</div>
            <div style="font-size: 2em; font-weight: bold; color: #3498db;">${totalActivities}</div>
            <div style="font-size: 0.85em; color: #6c757d; margin-top: 8px;">总时间投入: ${formatMinutes(totalTimeSpent)}</div>
            <div style="font-size: 0.85em; color: #6c757d; margin-top: 3px;">日均活跃: ${(totalActivities / daysPassed).toFixed(1)}</div>
        </div>
        
        <!-- 最佳表现卡片 -->
        <div style="border-left: 4px solid ${CONFIG.CATEGORIES[bestCategory[0]].colors[1]}; padding: 0 15px;">
            <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">最佳表现</div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.8em;">${CONFIG.CATEGORIES[bestCategory[0]].icon}</span>
                <div>
                    <div style="font-size: 1.5em; font-weight: bold; color: ${CONFIG.CATEGORIES[bestCategory[0]].colors[1]};">${bestCategory[0]}</div>
                    <div style="font-size: 1.2em;">${bestCategory[1].completionRate.toFixed(1)}%</div>
                </div>
            </div>
            <div style="font-size: 0.85em; color: #6c757d; margin-top: 5px;">完成 ${bestCategory[1].total}${CONFIG.CATEGORIES[bestCategory[0]].unit}</div>
        </div>
        
        <!-- 需关注卡片 -->
        <div style="border-left: 4px solid ${CONFIG.CATEGORIES[weakCategory[0]].colors[1]}; padding: 0 15px;">
            <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">需关注领域</div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.8em;">${CONFIG.CATEGORIES[weakCategory[0]].icon}</span>
                <div>
                    <div style="font-size: 1.5em; font-weight: bold; color: ${CONFIG.CATEGORIES[weakCategory[0]].colors[1]};">${weakCategory[0]}</div>
                    <div style="font-size: 1.2em;">${weakCategory[1].completionRate.toFixed(1)}%</div>
                </div>
            </div>
            <div style="font-size: 0.85em; color: #6c757d; margin-top: 5px;">还需完成 ${weakCategory[1].remaining}${CONFIG.CATEGORIES[weakCategory[0]].unit}</div>
        </div>
    </div>
    
    <!-- 评估摘要 -->
    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-top: 15px;">
        <h4 style="margin-top: 0; color: #495057;">📝 评估摘要</h4>
        <ul style="padding-left: 20px; margin-bottom: 0;">
            <li>本周完成率 <b>${avgCompletion.toFixed(1)}%</b>，${avgCompletion > 70 ? '表现优异' : avgCompletion > 50 ? '达到基本要求' : '需进一步提升'}</li>
            <li>最活跃的一天是 <b>${bestDay.weekday}</b>，活跃度指数达 <b>${bestDay.total}</b></li>
            <li><b>${bestCategory[0]}</b> 表现最佳，完成率 <b>${bestCategory[1].completionRate.toFixed(1)}%</b></li>
            <li><b>${weakCategory[0]}</b> 需特别关注，剩余目标 <b>${weakCategory[1].remaining}${CONFIG.CATEGORIES[weakCategory[0]].unit}</b></li>
            <li>时间投入最长的领域是 <b>${Object.entries(stats).sort((a,b) => b[1].timeTotal - a[1].timeTotal)[0][0]}</b></li>
        </ul>
    </div>
    
    <!-- 神秘奖励 -->
    ${specialRewardSection}
</div>
`);

// ==================== 10. 详细数据表格 ====================
dv.span("## 📋 每日详细记录");
const headers = ["日期", "星期", 
    ...Object.entries(CONFIG.CATEGORIES).flatMap(([cat, cfg]) => [
        `${cfg.icon} ${cat}`, 
        `⏱️ ${cat}时间`
    ]), 
    "总数量",
    "总时间"
];

const rows = weeklyData.map(day => [
    day.date + (day.isToday ? " ✅" : "") + (day.isWeekend ? " 🌟" : ""),
    day.weekday,
    ...Object.entries(CONFIG.CATEGORIES).flatMap(([cat, cfg]) => [
        day.data[cat] > 0 ? 
            `<span style="color: ${cfg.colors[1]}; font-weight: bold;">${day.data[cat]}${cfg.unit}</span>` : 
            "—",
        day.time[cat] > 0 ? 
            `<span style="color: ${cfg.colors[1]};">${formatMinutesShort(day.time[cat])}</span>` : 
            "—"
    ]),
    Object.values(day.data).reduce((sum, val) => sum + (val || 0), 0),
    `<b>${formatMinutesShort(Object.values(day.time).reduce((sum, val) => sum + (val || 0), 0))}</b>`
]);

dv.table(headers, rows);

// ==================== 11. 潜能激发区 ====================
dv.span(`
<div style="
    background: linear-gradient(135deg, #4361ee, #3a0ca3);
    color: white;
    border-radius: 8px;
    padding: 25px;
    margin: 20px 0;
">
    <h3 style="margin-top: 0; color: white; text-align: center;">💥 潜能激发区</h3>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
        <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2.5em;">🚀</div>
            <div style="font-size: 1.2em; font-weight: bold; margin: 10px 0;">爆发力指数</div>
            <div style="font-size: 2em; font-weight: bold;">${Math.min(100, Math.round(avgCompletion * 1.2))}%</div>
            <div style="margin-top: 10px;">你还有${Math.round(100 - avgCompletion)}%的潜能等待释放！</div>
        </div>
        
        <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2.5em;">💪</div>
            <div style="font-size: 1.2em; font-weight: bold; margin: 10px 0;">毅力挑战</div>
            <div style="font-size: 2em; font-weight: bold;">${Math.max(...Object.values(stats).map(s => s.streak))}天</div>
            <div style="margin-top: 10px;">当前最长连续达成记录！</div>
        </div>
        
        <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2.5em;">🏆</div>
            <div style="font-size: 1.2em; font-weight: bold; margin: 10px 0;">下周目标</div>
            <div style="font-size: 1.8em; font-weight: bold; margin: 10px 0;">+10%</div>
            <div>将平均完成率提升到${Math.min(100, Math.round(avgCompletion + 10))}%！</div>
        </div>
    </div>
    
    <!-- 神秘奖励预览 -->
    <div style="margin-top: 25px; padding: 20px; background: rgba(255,255,255,0.2); border-radius: 8px; text-align: center;">
        <h4 style="margin-top: 0;">🎁 神秘奖励预览</h4>
        <div style="font-size: 1.1em; margin: 15px 0;">
            完成目标即可解锁以下神秘奖励：
        </div>
        <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
            ${Object.entries(CONFIG.CATEGORIES).map(([cat, cfg]) => `
                <div style="text-align: center;">
                    <div style="font-size: 2.5em; margin-bottom: 5px;">${cfg.icon}</div>
                    <div style="font-size: 0.9em; margin-bottom: 5px;">${cat}</div>
                    <div style="font-size: 1.8em;">${stats[cat].rewardUnlocked ? cfg.rewards[0] : '❓'}</div>
                </div>
            `).join('')}
        </div>
        <div style="margin-top: 20px; font-weight: bold;">
            完成所有目标解锁终极神秘大奖！
        </div>
    </div>
</div>
`);

```
你要根据我的需求完善代码，不允许出错
1. 显示空白的坐标
2. 可读性优化
3. 优化这个版本的任务趋势统计，使其非常正确的

Obsidian 用charts的type: 'line'，已经从2个属性中获取捕捉到来之不同笔记页面的任务符号的日期，形成折线图

- [[反向任务（包含3 个版本） 251215]] <span class="timer-p" id="ea55oi1j" data-dur="11111" data-ts="1765243194">【⏳20:00:00 】</span>➕ 2025-12-09 ⏳ 2025-12-09
- 这条任务包含3个日期数量：12-05➕创建，12-06⏳计划计时，12-09✅完成  ➕ 2025-12-05 ⏳ 2025-12-06 ✅ 2025-12-09
计时显示在⏳计划计时：专注累计，⏳ 2025-12-08 累计2小时
- 任务2 <span class="timer-p" id="ea55oi1j" data-dur="1111" data-ts="1765243194">【⏳01:00:00 】</span> ⏳ 2025-12-08
- 任务1 <span class="timer-p" id="ea55oi1j" data-dur="0" data-ts="1765243194">【⏳01:00:00 】</span> ⏳ 2025-12-08 ✅ 2025-12-09
- [[@PKM-行动记录]]  +100次 #📊I输入⌛️工作   [duration:: 5m]  [startTime:: 13:25] ⏳ 2025-12-09 📅 2025-12-09 ✅ 2025-12-09
- 任务 <span class="timer-p" id="0a7jktwa" data-dur="0" data-ts="1765257908">【⏳01:00:00 】</span> ➕ 2025-12-02 ⏳ 2025-12-02 ✅ 2025-12-09
		- 方案日期 🏁 2025-12-09

坐标：范围日期
折线一：➕ 创建日期
折线二：🏁 方案日期
折线三：✅ 完成日期
折线四：重复量
重复次数就是+几次，例如专注时长2小时时间内，+9次
折线五：专注时长

你要根据我的需求完善代码，不允许出错
修复重复次数计算：例如这里是+9次
- [[习惯养成]] <span class="timer-p" id="yoc5jstm" data-dur="0" data-ts="1765243389">【⏳02:00:00 】</span> +9次 ⏳ 2025-12-09
- 修复专注时长计算：例如这里是12-09曲线坐标，专注2小时专注<span class="timer-p" id="ea55oi1j" data-dur="0" data-ts="1765243194">【⏳02:00:00 】</span>
 - [[习惯养成]] <span class="timer-p" id="yoc5jstm" data-dur="0" data-ts="1765243389">【⏳02:00:00 】</span> +9次 ⏳ 2025-12-09



在 Obsidian笔记.md页面中，dataviewjs和charts制作一个任务tasks趋势查询，基于2个日期属性[开始日期][结束日期]的动态范围，获取所有页面符合条件的任务日期趋势，支持空日期坐标也要显示数据
- 创建日期 ➕ 2025-12-01
- 创建日期 ➕ 2025-12-03
- 完成日期 ✅ 2025-12-01
- 完成日期 ✅ 2025-12-03

在 Obsidian 中制作一个曲线图，展示任务的日期趋势即可，如果那天日期没有任务日期，也要显示日期坐标
你要根据我的需求完善代码Obsidian dataviewjs和charts代码，不允许出错
制作三个独立代码：第一个代码的坐标按周，第二个代码的坐标按月，第三个代码的坐标按季
专注累积用1小时，而不是 data-dur="0"的秒累积
- [[反向任务（包含3 个版本） 251215]] <span class="timer-p" id="511sq8sr" data-dur="0" data-ts="1765264900">【⏳01:00:00 】</span> ➕ 2025-12-09 ⏳ 2025-12-09
```dataviewjs
// ==================== 任务趋势折线图（已优化） ====================
// 修复：显示空白坐标，可读性优化，正确统计任务趋势

// 1. 获取当前笔记的日期范围
const currentFile = dv.current();
const startDate = currentFile['进行日期'] ? dv.date(currentFile['进行日期']) : dv.date('2021-01-01');
const endDate = currentFile['截止日期'] ? dv.date(currentFile['截止日期']) : dv.date('2021-01-30');

// 2. 生成日期范围内的所有日期（确保包含空白坐标）
function getDateRange(start, end) {
    const dates = [];
    let current = dv.date(start);
    const endDateObj = dv.date(end);
    
    while (current <= endDateObj) {
        dates.push(current.toISODate());
        current = current.plus({ days: 1 });
    }
    return dates;
}

// 3. 获取所有任务（从当前文件）
function getAllTasks() {
    try {
        const currentFileTasks = dv.current().file.tasks || [];
        console.log(`📋 找到 ${currentFileTasks.length} 个任务`);
        return currentFileTasks;
    } catch (error) {
        console.error("❌ 获取任务失败:", error);
        return [];
    }
}

// 4. 提取日期函数（优化可读性）
function extractDate(text, pattern) {
    const match = text.match(pattern);
    return match ? match[1] : null;
}

// 5. 提取重复次数（修复：正确提取 +X次）
function extractRepeatCount(text) {
    const repeatMatch = text.match(/\+(\d+)次/);
    return repeatMatch ? parseInt(repeatMatch[1]) : 0;
}

// 6. 提取专注时长（修复：从多个来源提取）
function extractFocusDuration(text) {
    let totalHours = 0;
    
    // 方法1：从【⏳HH:MM:SS】格式提取
    const focusMatch = text.match(/【⏳(\d{2}):(\d{2}):(\d{2})】/);
    if (focusMatch) {
        const hours = parseInt(focusMatch[1]);
        const minutes = parseInt(focusMatch[2]);
        const seconds = parseInt(focusMatch[3]);
        totalHours += hours + minutes/60 + seconds/3600;
    }
    
    // 方法2：从data-dur属性提取（秒转小时）
    const durMatch = text.match(/data-dur="(\d+)"/);
    if (durMatch) {
        const seconds = parseInt(durMatch[1]);
        totalHours += seconds / 3600;
    }
    
    return totalHours;
}

// 主执行逻辑
const allTasks = getAllTasks();
const dateRange = getDateRange(startDate, endDate);

// 7. 初始化统计数据
const taskStats = {
    '创建日期': {},    // ➕ 标记
    '方案日期': {},    // 🏁 标记
    '完成日期': {},    // ✅ 标记
    '重复次数': {},    // +X次
    '专注时长': {}     // ⏳ 时长
};

// 初始化所有日期为0（确保空白坐标显示）
dateRange.forEach(date => {
    taskStats['创建日期'][date] = 0;
    taskStats['方案日期'][date] = 0;
    taskStats['完成日期'][date] = 0;
    taskStats['重复次数'][date] = 0;
    taskStats['专注时长'][date] = 0;
});

// 8. 统计任务数据
allTasks.forEach((task, index) => {
    try {
        const text = task.text || '';
        const status = task.status || '';
        
        // 调试信息
        if (index < 5) {
            console.log(`🔍 处理任务 ${index+1}: ${text.substring(0, 80)}...`);
        }
        
        // 1. 提取创建日期（➕标记）
        const createDate = extractDate(text, /➕\s*(\d{4}-\d{2}-\d{2})/);
        if (createDate && dateRange.includes(createDate)) {
            taskStats['创建日期'][createDate] += 1;
            console.log(`   ➕ 创建日期: ${createDate}`);
        }
        
        // 2. 提取方案日期（🏁标记）
        const solutionDate = extractDate(text, /🏁\s*(\d{4}-\d{2}-\d{2})/);
        if (solutionDate && dateRange.includes(solutionDate)) {
            taskStats['方案日期'][solutionDate] += 1;
            console.log(`   🏁 方案日期: ${solutionDate}`);
        }
        
        // 3. 提取完成日期（✅标记）
        const completeDate = extractDate(text, /✅\s*(\d{4}-\d{2}-\d{2})/);
        if (completeDate && dateRange.includes(completeDate)) {
            taskStats['完成日期'][completeDate] += 1;
            console.log(`   ✅ 完成日期: ${completeDate}`);
        }
        
        // 4. 提取计划日期（⏳标记）- 用于重复次数和专注时长
        const planDate = extractDate(text, /⏳\s*(\d{4}-\d{2}-\d{2})/);
        if (planDate && dateRange.includes(planDate)) {
            // 4.1 提取重复次数（修复：正确提取 +X次）
            const repeatCount = extractRepeatCount(text);
            if (repeatCount > 0) {
                taskStats['重复次数'][planDate] += repeatCount;
                console.log(`   🔄 重复次数: ${planDate} -> +${repeatCount}次`);
            }
            
            // 4.2 提取专注时长
            const focusHours = extractFocusDuration(text);
            if (focusHours > 0) {
                taskStats['专注时长'][planDate] += focusHours;
                console.log(`   ⏱️ 专注时长: ${planDate} -> ${focusHours.toFixed(2)}小时`);
            }
        }
        
    } catch (error) {
        console.error(`❌ 处理任务时出错: ${error.message}`);
    }
});

// 9. 检查是否有数据
const hasData = Object.values(taskStats).some(category => 
    Object.values(category).some(count => count > 0)
);

// 如果没有数据，显示提示但不填充示例数据（保持空白坐标）
if (!hasData) {
    console.warn("⚠️ 未找到有效数据，将显示空白图表");
}

// 10. 生成日期标签（优化可读性）
function getDateLabels(dates) {
    if (dates.length === 0) return [];
    
    const start = moment(dates[0]);
    const end = moment(dates[dates.length-1]);
    const daysDiff = end.diff(start, 'days');
    
    if (daysDiff <= 7) {
        // 一周内：显示完整日期和星期
        return dates.map(date => {
            const dateObj = moment(date);
            const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][dateObj.day()];
            return `${dateObj.format('MM-DD')}(${dayOfWeek})`;
        });
    } else if (daysDiff <= 31) {
        // 一个月内：显示日期和星期
        return dates.map((date, index) => {
            if (index % 2 === 0) {
                const dateObj = moment(date);
                return dateObj.format('MM-DD');
            }
            return '';
        });
    } else {
        // 更长时间：每周显示一个点
        const labels = [];
        for (let i = 0; i < dates.length; i += 7) {
            const dateObj = moment(dates[i]);
            labels.push(dateObj.format('MM-DD'));
        }
        return labels;
    }
}

// 11. 创建图表
function createChart() {
    // 显示标题
    dv.header(3, `📈 任务趋势分析 (${moment(startDate).format('YYYY-MM-DD')} 至 ${moment(endDate).format('YYYY-MM-DD')})`);
    
    // 检查Charts插件是否可用
    if (typeof window.renderChart === 'undefined') {
        dv.paragraph("⚠️ **Charts插件未启用** - 请安装并启用 Obsidian Charts 插件");
        return;
    }
    
    // 准备日期标签
    const dateLabels = getDateLabels(dateRange);
    
    // 准备图表数据
    const chartData = {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [
                {
                    label: '➕ 创建日期',
                    data: dateRange.map(date => taskStats['创建日期'][date]),
                    borderColor: '#3B82F6', // 蓝色
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.2,
                    pointRadius: 4,
                    pointBackgroundColor: '#3B82F6'
                },
                {
                    label: '🏁 方案日期',
                    data: dateRange.map(date => taskStats['方案日期'][date]),
                    borderColor: '#F59E0B', // 橙色
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.2,
                    pointRadius: 4,
                    pointBackgroundColor: '#F59E0B'
                },
                {
                    label: '✅ 完成日期',
                    data: dateRange.map(date => taskStats['完成日期'][date]),
                    borderColor: '#10B981', // 绿色
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                    pointRadius: 4,
                    pointBackgroundColor: '#10B981'
                },
                {
                    label: '🔄 重复次数',
                    data: dateRange.map(date => taskStats['重复次数'][date]),
                    borderColor: '#EF4444', // 红色
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                    pointRadius: 4,
                    pointBackgroundColor: '#EF4444'
                },
                {
                    label: '⏱️ 专注时长 (小时)',
                    data: dateRange.map(date => taskStats['专注时长'][date]),
                    borderColor: '#8B5CF6', // 紫色
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                    pointRadius: 4,
                    pointBackgroundColor: '#8B5CF6',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: {
                            size: 11
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 12 },
                    bodyFont: { size: 11 },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let value = context.parsed.y;
                            
                            if (label.includes('专注时长')) {
                                return `${label}: ${value.toFixed(2)} 小时`;
                            } else if (label.includes('重复次数')) {
                                return `${label}: ${value} 次`;
                            } else {
                                return `${label}: ${value} 个`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        stepSize: 1,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    title: {
                        display: true,
                        text: '任务数量',
                        font: {
                            size: 11
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        callback: function(value) {
                            return value.toFixed(1) + 'h';
                        }
                    },
                    title: {
                        display: true,
                        text: '专注时长 (小时)',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    };
    
    // 创建图表容器
    const chartContainer = this.container.createEl('div', {
        cls: 'task-trend-chart-container'
    });
    
    chartContainer.style.height = '500px';
    chartContainer.style.width = '100%';
    chartContainer.style.margin = '15px 0';
    chartContainer.style.padding = '10px';
    chartContainer.style.borderRadius = '6px';
    chartContainer.style.border = '1px solid var(--background-modifier-border)';
    chartContainer.style.backgroundColor = 'var(--background-primary)';
    chartContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
    
    // 渲染图表
    try {
        window.renderChart(chartData, chartContainer);
        
        // 显示数据摘要
        const summaryLines = [];
        Object.entries(taskStats).forEach(([category, data]) => {
            const total = Object.values(data).reduce((a, b) => a + b, 0);
            if (total > 0) {
                if (category === '专注时长') {
                    summaryLines.push(`${category}: ${total.toFixed(2)}小时`);
                } else if (category === '重复次数') {
                    summaryLines.push(`${category}: ${total}次`);
                } else {
                    summaryLines.push(`${category}: ${total}个`);
                }
            }
        });
        
        if (summaryLines.length > 0) {
            dv.paragraph(`📊 **数据摘要**: ${summaryLines.join(' | ')}`);
        } else {
            dv.paragraph("📊 **数据摘要**: 暂无数据");
        }
        
        // 显示调试信息
        if (!hasData) {
            dv.paragraph("ℹ️ **提示**: 当前没有找到任务数据。请确保：");
            dv.paragraph("1. 任务格式正确（包含➕、🏁、✅、⏳、+X次等标记）");
            dv.paragraph("2. 日期在指定范围内（2021-01-01 至 2021-01-30）");
            dv.paragraph("3. 图表将显示空白坐标，直到有数据");
        }
        
    } catch (error) {
        console.error("❌ 图表渲染失败:", error);
        dv.paragraph("❌ **图表渲染失败**: " + error.message);
        displayDataTable();
    }
}

// 12. 显示数据表格（备用）
function displayDataTable() {
    dv.header(4, "📋 详细数据表格");
    
    let tableData = [["日期", "创建日期", "方案日期", "完成日期", "重复次数", "专注时长(小时)"]];
    
    dateRange.forEach(date => {
        const dateObj = moment(date);
        const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][dateObj.day()];
        
        tableData.push([
            `${dateObj.format('MM-DD')}(${dayOfWeek})`,
            taskStats['创建日期'][date],
            taskStats['方案日期'][date],
            taskStats['完成日期'][date],
            taskStats['重复次数'][date],
            taskStats['专注时长'][date].toFixed(2)
        ]);
    });
    
    dv.table(tableData[0], tableData.slice(1));
}

// 13. 执行主函数
try {
    console.log("🚀 开始执行任务趋势分析...");
    console.log(`📅 日期范围: ${dateRange[0]} 至 ${dateRange[dateRange.length-1]} (共${dateRange.length}天)`);
    console.log(`📝 任务数量: ${allTasks.length}`);
    
    createChart.call(this);
    
    console.log("✅ 任务趋势分析完成");
} catch (error) {
    console.error("❌ 执行失败:", error);
    dv.paragraph("❌ **代码执行失败**: " + error.message);
    
    // 显示调试信息
    dv.paragraph("**调试信息**:");
    dv.paragraph(`- 日期范围: ${dateRange.length} 天`);
    dv.paragraph(`- 任务数量: ${allTasks.length}`);
}
```

```dataviewjs
// ==================== 任务趋势折线图（修复空白坐标显示） ====================
// 修复：正确显示空白日期和任务曲线，优化统计逻辑

// 1. 获取当前笔记的日期范围
const currentFile = dv.current();
const startDate = currentFile['进行日期'] ? dv.date(currentFile['进行日期']) : dv.date('2025-12-07');
const endDate = currentFile['截止日期'] ? dv.date(currentFile['截止日期']) : dv.date('2025-12-09');

// 2. 生成日期范围内的所有日期（确保包含空白坐标）
function getDateRange(start, end) {
    const dates = [];
    let current = dv.date(start);
    const endDateObj = dv.date(end);
    
    while (current <= endDateObj) {
        dates.push(current.toISODate());
        current = current.plus({ days: 1 });
    }
    return dates;
}

// 3. 获取所有任务（从当前文件）
function getAllTasks() {
    try {
        const currentFileTasks = dv.current().file.tasks || [];
        console.log(`📋 找到 ${currentFileTasks.length} 个任务`);
        if (currentFileTasks.length > 0) {
            console.log("📝 任务示例:", currentFileTasks.slice(0, 3).map(t => t.text?.substring(0, 60)));
        }
        return currentFileTasks;
    } catch (error) {
        console.error("❌ 获取任务失败:", error);
        return [];
    }
}

// 4. 提取日期函数
function extractDate(text, pattern) {
    const match = text.match(pattern);
    return match ? match[1] : null;
}

// 5. 提取重复次数（修复：正确提取 +X次）
function extractRepeatCount(text) {
    // 先尝试精确匹配 +X次 格式
    const repeatMatch = text.match(/\+(\d+)次/);
    if (repeatMatch) {
        return parseInt(repeatMatch[1]);
    }
    return 0;
}

// 6. 提取专注时长（从多个来源提取）
function extractFocusDuration(text) {
    let totalHours = 0;
    
    // 方法1：从【⏳HH:MM:SS】格式提取
    const focusMatch = text.match(/【⏳(\d{2}):(\d{2}):(\d{2})】/);
    if (focusMatch) {
        const hours = parseInt(focusMatch[1]);
        const minutes = parseInt(focusMatch[2]);
        const seconds = parseInt(focusMatch[3]);
        totalHours = hours + minutes/60 + seconds/3600;
        console.log(`⏱️ 从【⏳HH:MM:SS】提取专注时长: ${totalHours.toFixed(2)}小时`);
    }
    
    // 方法2：从data-dur属性提取（秒转小时）
    const durMatch = text.match(/data-dur="(\d+)"/);
    if (durMatch) {
        const seconds = parseInt(durMatch[1]);
        const hours = seconds / 3600;
        console.log(`⏱️ 从data-dur提取专注时长: ${hours.toFixed(2)}小时`);
        return hours; // 如果有data-dur，优先使用它
    }
    
    return totalHours;
}

// 主执行逻辑
const allTasks = getAllTasks();
const dateRange = getDateRange(startDate, endDate);

console.log(`📅 日期范围: ${dateRange[0]} 至 ${dateRange[dateRange.length-1]} (共${dateRange.length}天)`);
console.log("📊 所有日期:", dateRange);

// 7. 初始化统计数据（使用更直观的键名）
const taskStats = {
    '创建日期': {},    // ➕ 标记
    '方案日期': {},    // 🏁 标记
    '完成日期': {},    // ✅ 标记
    '重复次数': {},    // +X次
    '专注时长': {}     // ⏳ 时长
};

// 初始化所有日期（关键：空白日期初始化为0，确保X轴显示所有日期）
dateRange.forEach(date => {
    // 所有日期都初始化为0，确保空白坐标显示
    taskStats['创建日期'][date] = 0;
    taskStats['方案日期'][date] = 0;
    taskStats['完成日期'][date] = 0;
    taskStats['重复次数'][date] = 0;
    taskStats['专注时长'][date] = 0;
});

console.log("📊 初始化后的统计数据结构:", taskStats);

// 8. 统计任务数据（精确统计每个日期）
allTasks.forEach((task, index) => {
    try {
        const text = task.text || '';
        const status = task.status || '';
        
        console.log(`\n🔍 处理任务 ${index+1}: ${text.substring(0, 80)}...`);
        
        // 1. 提取创建日期（➕标记）
        const createDate = extractDate(text, /➕\s*(\d{4}-\d{2}-\d{2})/);
        if (createDate) {
            if (dateRange.includes(createDate)) {
                taskStats['创建日期'][createDate] += 1;
                console.log(`   ✅ 找到创建日期: ${createDate} (累计: ${taskStats['创建日期'][createDate]})`);
            } else {
                console.log(`   ⚠️ 创建日期 ${createDate} 不在统计范围内`);
            }
        }
        
        // 2. 提取方案日期（🏁标记）
        const solutionDate = extractDate(text, /🏁\s*(\d{4}-\d{2}-\d{2})/);
        if (solutionDate) {
            if (dateRange.includes(solutionDate)) {
                taskStats['方案日期'][solutionDate] += 1;
                console.log(`   ✅ 找到方案日期: ${solutionDate} (累计: ${taskStats['方案日期'][solutionDate]})`);
            }
        }
        
        // 3. 提取完成日期（✅标记）
        const completeDate = extractDate(text, /✅\s*(\d{4}-\d{2}-\d{2})/);
        if (completeDate) {
            if (dateRange.includes(completeDate)) {
                taskStats['完成日期'][completeDate] += 1;
                console.log(`   ✅ 找到完成日期: ${completeDate} (累计: ${taskStats['完成日期'][completeDate]})`);
            }
        }
        
        // 4. 提取计划日期（⏳标记）- 用于重复次数和专注时长
        const planDate = extractDate(text, /⏳\s*(\d{4}-\d{2}-\d{2})/);
        if (planDate && dateRange.includes(planDate)) {
            // 4.1 提取重复次数（修复：正确提取 +X次）
            const repeatCount = extractRepeatCount(text);
            if (repeatCount > 0) {
                taskStats['重复次数'][planDate] += repeatCount;
                console.log(`   🔄 找到重复次数: ${planDate} -> +${repeatCount}次 (累计: ${taskStats['重复次数'][planDate]}次)`);
            }
            
            // 4.2 提取专注时长
            const focusHours = extractFocusDuration(text);
            if (focusHours > 0) {
                taskStats['专注时长'][planDate] += focusHours;
                console.log(`   ⏱️ 找到专注时长: ${planDate} -> ${focusHours.toFixed(2)}小时 (累计: ${taskStats['专注时长'][planDate].toFixed(2)}小时)`);
            }
        }
        
    } catch (error) {
        console.error(`❌ 处理任务时出错: ${error.message}`);
    }
});

// 9. 显示最终统计数据
console.log("\n📊 最终统计数据:");
dateRange.forEach(date => {
    const hasData = taskStats['创建日期'][date] > 0 || 
                   taskStats['方案日期'][date] > 0 || 
                   taskStats['完成日期'][date] > 0 ||
                   taskStats['重复次数'][date] > 0 ||
                   taskStats['专注时长'][date] > 0;
    
    if (hasData) {
        console.log(`${date}: 创建(${taskStats['创建日期'][date]}), 方案(${taskStats['方案日期'][date]}), 完成(${taskStats['完成日期'][date]}), 重复(${taskStats['重复次数'][date]}次), 专注(${taskStats['专注时长'][date].toFixed(2)}小时)`);
    } else {
        console.log(`${date}: 空白日期`);
    }
});

// 10. 检查是否有数据
const hasData = Object.values(taskStats).some(category => 
    Object.values(category).some(count => count > 0)
);

if (!hasData) {
    console.warn("⚠️ 未找到有效数据，图表将显示空白坐标");
}

// 11. 生成日期标签（优化可读性）
function getDateLabels(dates) {
    if (dates.length === 0) return [];
    
    const start = moment(dates[0]);
    const end = moment(dates[dates.length-1]);
    const daysDiff = end.diff(start, 'days');
    
    if (daysDiff <= 14) {
        // 两周内：显示完整日期和星期
        return dates.map(date => {
            const dateObj = moment(date);
            const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][dateObj.day()];
            return `${dateObj.format('MM-DD')}(${dayOfWeek})`;
        });
    } else if (daysDiff <= 31) {
        // 一个月内：隔天显示
        return dates.map((date, index) => {
            if (index % 2 === 0) {
                const dateObj = moment(date);
                return dateObj.format('MM-DD');
            }
            return '';
        });
    } else {
        // 更长时间：每周显示
        return dates.map((date, index) => {
            if (index % 7 === 0) {
                const dateObj = moment(date);
                return dateObj.format('MM-DD');
            }
            return '';
        });
    }
}

// 12. 创建图表
function createChart() {
    // 显示标题
    dv.header(3, `📈 任务趋势分析 (${moment(startDate).format('YYYY-MM-DD')} 至 ${moment(endDate).format('YYYY-MM-DD')})`);
    
    // 检查Charts插件是否可用
    if (typeof window.renderChart === 'undefined') {
        dv.paragraph("⚠️ **Charts插件未启用** - 请安装并启用 Obsidian Charts 插件");
        return;
    }
    
    // 准备日期标签
    const dateLabels = getDateLabels(dateRange);
    
    // 准备图表数据
    const chartData = {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [
                {
                    label: '➕ 创建日期',
                    data: dateRange.map(date => taskStats['创建日期'][date]),
                    borderColor: '#3B82F6', // 蓝色
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.2,
                    pointRadius: 5,
                    pointBackgroundColor: '#3B82F6',
                    pointHoverRadius: 7
                },
                {
                    label: '🏁 方案日期',
                    data: dateRange.map(date => taskStats['方案日期'][date]),
                    borderColor: '#F59E0B', // 橙色
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.2,
                    pointRadius: 5,
                    pointBackgroundColor: '#F59E0B',
                    pointHoverRadius: 7
                },
                {
                    label: '✅ 完成日期',
                    data: dateRange.map(date => taskStats['完成日期'][date]),
                    borderColor: '#10B981', // 绿色
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                    pointRadius: 5,
                    pointBackgroundColor: '#10B981',
                    pointHoverRadius: 7
                },
                {
                    label: '🔄 重复次数',
                    data: dateRange.map(date => taskStats['重复次数'][date]),
                    borderColor: '#EF4444', // 红色
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                    pointRadius: 5,
                    pointBackgroundColor: '#EF4444',
                    pointHoverRadius: 7,
                    yAxisID: 'y' // 使用主Y轴
                },
                {
                    label: '⏱️ 专注时长 (小时)',
                    data: dateRange.map(date => taskStats['专注时长'][date]),
                    borderColor: '#8B5CF6', // 紫色
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                    pointRadius: 5,
                    pointBackgroundColor: '#8B5CF6',
                    pointHoverRadius: 7,
                    yAxisID: 'y1' // 使用次Y轴
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: {
                            size: 11,
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    titleFont: { 
                        size: 12,
                        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                    },
                    bodyFont: { 
                        size: 11,
                        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                    },
                    padding: 10,
                    cornerRadius: 6,
                    callbacks: {
                        title: function(tooltipItems) {
                            const dateIndex = tooltipItems[0].dataIndex;
                            const date = dateRange[dateIndex];
                            const dateObj = moment(date);
                            const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][dateObj.day()];
                            return `${dateObj.format('YYYY-MM-DD')} (星期${dayOfWeek})`;
                        },
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let value = context.parsed.y;
                            
                            if (label.includes('专注时长')) {
                                return `${label}: ${value.toFixed(2)} 小时`;
                            } else if (label.includes('重复次数')) {
                                return `${label}: ${value} 次`;
                            } else {
                                return `${label}: ${value} 个`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.08)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 10,
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                        },
                        maxRotation: 45,
                        minRotation: 0,
                        color: 'var(--text-muted)'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 10,
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                        },
                        stepSize: 1,
                        color: 'var(--text-muted)',
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    title: {
                        display: true,
                        text: '任务数量 (个)',
                        font: {
                            size: 11,
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                            weight: 'bold'
                        },
                        color: 'var(--text-normal)',
                        padding: {top: 10, bottom: 10}
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        font: {
                            size: 10,
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                        },
                        color: 'var(--text-muted)',
                        callback: function(value) {
                            return value.toFixed(1) + 'h';
                        }
                    },
                    title: {
                        display: true,
                        text: '专注时长 (小时)',
                        font: {
                            size: 11,
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                            weight: 'bold'
                        },
                        color: 'var(--text-normal)',
                        padding: {top: 10, bottom: 10}
                    }
                }
            }
        }
    };
    
    // 创建图表容器
    const chartContainer = this.container.createEl('div', {
        cls: 'task-trend-chart-container'
    });
    
    chartContainer.style.height = '520px';
    chartContainer.style.width = '100%';
    chartContainer.style.margin = '20px 0';
    chartContainer.style.padding = '15px';
    chartContainer.style.borderRadius = '8px';
    chartContainer.style.border = '1px solid var(--background-modifier-border)';
    chartContainer.style.backgroundColor = 'var(--background-primary)';
    chartContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
    
    // 渲染图表
    try {
        window.renderChart(chartData, chartContainer);
        
        // 显示数据摘要
        const summaryLines = [];
        const totalByCategory = {};
        
        Object.entries(taskStats).forEach(([category, data]) => {
            const total = Object.values(data).reduce((a, b) => a + b, 0);
            totalByCategory[category] = total;
            
            if (total > 0) {
                if (category === '专注时长') {
                    summaryLines.push(`${category}: ${total.toFixed(2)}小时`);
                } else if (category === '重复次数') {
                    summaryLines.push(`${category}: ${total}次`);
                } else {
                    summaryLines.push(`${category}: ${total}个`);
                }
            }
        });
        
        // 显示日期统计详情
        dv.paragraph("### 📊 详细统计");
        
        let tableData = [["日期", "创建日期", "方案日期", "完成日期", "重复次数", "专注时长(小时)"]];
        
        dateRange.forEach(date => {
            const dateObj = moment(date);
            const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][dateObj.day()];
            const dateLabel = `${dateObj.format('MM-DD')}(${dayOfWeek})`;
            
            // 高亮有数据的行
            const hasDataOnDate = taskStats['创建日期'][date] > 0 || 
                                 taskStats['方案日期'][date] > 0 || 
                                 taskStats['完成日期'][date] > 0 ||
                                 taskStats['重复次数'][date] > 0 ||
                                 taskStats['专注时长'][date] > 0;
            
            tableData.push([
                hasDataOnDate ? `**${dateLabel}**` : dateLabel,
                taskStats['创建日期'][date],
                taskStats['方案日期'][date],
                taskStats['完成日期'][date],
                taskStats['重复次数'][date],
                taskStats['专注时长'][date].toFixed(2)
            ]);
        });
        
        dv.table(tableData[0], tableData.slice(1));
        
        if (summaryLines.length > 0) {
            dv.paragraph(`**📈 数据汇总**: ${summaryLines.join(' | ')}`);
        } else {
            dv.paragraph("**📈 数据汇总**: 暂无数据（所有日期均为空白）");
        }
        
        // 显示空白日期信息
        const blankDates = dateRange.filter(date => 
            taskStats['创建日期'][date] === 0 && 
            taskStats['方案日期'][date] === 0 && 
            taskStats['完成日期'][date] === 0 &&
            taskStats['重复次数'][date] === 0 &&
            taskStats['专注时长'][date] === 0
        );
        
        if (blankDates.length > 0) {
            dv.paragraph(`**📅 空白日期**: ${blankDates.length}天 (${blankDates.map(d => moment(d).format('MM-DD')).join(', ')})`);
        }
        
    } catch (error) {
        console.error("❌ 图表渲染失败:", error);
        dv.paragraph("❌ **图表渲染失败**: " + error.message);
        
        // 显示备选数据视图
        displayDataTable();
    }
}

// 13. 显示数据表格（备用）
function displayDataTable() {
    dv.header(4, "📋 详细数据表格");
    
    let tableData = [["日期", "创建日期", "方案日期", "完成日期", "重复次数", "专注时长(小时)"]];
    
    dateRange.forEach(date => {
        const dateObj = moment(date);
        const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][dateObj.day()];
        
        tableData.push([
            `${dateObj.format('MM-DD')}(${dayOfWeek})`,
            taskStats['创建日期'][date],
            taskStats['方案日期'][date],
            taskStats['完成日期'][date],
            taskStats['重复次数'][date],
            taskStats['专注时长'][date].toFixed(2)
        ]);
    });
    
    dv.table(tableData[0], tableData.slice(1));
}

// 14. 执行主函数
try {
    console.log("🚀 开始执行任务趋势分析...");
    console.log(`📅 日期范围: ${dateRange[0]} 至 ${dateRange[dateRange.length-1]} (共${dateRange.length}天)`);
    console.log(`📝 任务数量: ${allTasks.length}`);
    
    createChart.call(this);
    
    console.log("✅ 任务趋势分析完成");
} catch (error) {
    console.error("❌ 执行失败:", error);
    dv.paragraph("❌ **代码执行失败**: " + error.message);
    
    // 显示调试信息
    dv.paragraph("**调试信息**:");
    dv.paragraph(`- 日期范围: ${dateRange.length} 天`);
    dv.paragraph(`- 任务数量: ${allTasks.length}`);
}
```

```dataviewjs
// ==================== 任务趋势折线图（已优化） ====================
// 修复：显示空白坐标，可读性优化，正确统计任务趋势

// 1. 获取当前笔记的日期范围
const currentFile = dv.current();
const startDate = currentFile['进行日期'] ? dv.date(currentFile['进行日期']) : dv.date('2021-01-01');
const endDate = currentFile['截止日期'] ? dv.date(currentFile['截止日期']) : dv.date('2021-01-30');

// 2. 生成日期范围内的所有日期（确保包含空白坐标）
function getDateRange(start, end) {
    const dates = [];
    let current = dv.date(start);
    const endDateObj = dv.date(end);
    
    while (current <= endDateObj) {
        dates.push(current.toISODate());
        current = current.plus({ days: 1 });
    }
    return dates;
}

// 3. 获取所有任务（从当前文件）
function getAllTasks() {
    try {
        const currentFileTasks = dv.current().file.tasks || [];
        console.log(`📋 找到 ${currentFileTasks.length} 个任务`);
        return currentFileTasks;
    } catch (error) {
        console.error("❌ 获取任务失败:", error);
        return [];
    }
}

// 4. 提取日期函数（优化可读性）
function extractDate(text, pattern) {
    const match = text.match(pattern);
    return match ? match[1] : null;
}

// 5. 提取重复次数（修复：正确提取 +X次）
function extractRepeatCount(text) {
    const repeatMatch = text.match(/\+(\d+)次/);
    return repeatMatch ? parseInt(repeatMatch[1]) : 0;
}

// 6. 提取专注时长（修复：从多个来源提取）
function extractFocusDuration(text) {
    let totalHours = 0;
    
    // 方法1：从【⏳HH:MM:SS】格式提取
    const focusMatch = text.match(/【⏳(\d{2}):(\d{2}):(\d{2})】/);
    if (focusMatch) {
        const hours = parseInt(focusMatch[1]);
        const minutes = parseInt(focusMatch[2]);
        const seconds = parseInt(focusMatch[3]);
        totalHours += hours + minutes/60 + seconds/3600;
    }
    
    // 方法2：从data-dur属性提取（秒转小时）
    const durMatch = text.match(/data-dur="(\d+)"/);
    if (durMatch) {
        const seconds = parseInt(durMatch[1]);
        totalHours += seconds / 3600;
    }
    
    return totalHours;
}

// 主执行逻辑
const allTasks = getAllTasks();
const dateRange = getDateRange(startDate, endDate);

// 7. 初始化统计数据
const taskStats = {
    '创建日期': {},    // ➕ 标记
    '方案日期': {},    // 🏁 标记
    '完成日期': {},    // ✅ 标记
    '重复次数': {},    // +X次
    '专注时长': {}     // ⏳ 时长
};

// 初始化所有日期为0（确保空白坐标显示）
dateRange.forEach(date => {
    taskStats['创建日期'][date] = 0;
    taskStats['方案日期'][date] = 0;
    taskStats['完成日期'][date] = 0;
    taskStats['重复次数'][date] = 0;
    taskStats['专注时长'][date] = 0;
});

// 8. 统计任务数据
allTasks.forEach((task, index) => {
    try {
        const text = task.text || '';
        const status = task.status || '';
        
        // 调试信息
        if (index < 5) {
            console.log(`🔍 处理任务 ${index+1}: ${text.substring(0, 80)}...`);
        }
        
        // 1. 提取创建日期（➕标记）
        const createDate = extractDate(text, /➕\s*(\d{4}-\d{2}-\d{2})/);
        if (createDate && dateRange.includes(createDate)) {
            taskStats['创建日期'][createDate] += 1;
            console.log(`   ➕ 创建日期: ${createDate}`);
        }
        
        // 2. 提取方案日期（🏁标记）
        const solutionDate = extractDate(text, /🏁\s*(\d{4}-\d{2}-\d{2})/);
        if (solutionDate && dateRange.includes(solutionDate)) {
            taskStats['方案日期'][solutionDate] += 1;
            console.log(`   🏁 方案日期: ${solutionDate}`);
        }
        
        // 3. 提取完成日期（✅标记）
        const completeDate = extractDate(text, /✅\s*(\d{4}-\d{2}-\d{2})/);
        if (completeDate && dateRange.includes(completeDate)) {
            taskStats['完成日期'][completeDate] += 1;
            console.log(`   ✅ 完成日期: ${completeDate}`);
        }
        
        // 4. 提取计划日期（⏳标记）- 用于重复次数和专注时长
        const planDate = extractDate(text, /⏳\s*(\d{4}-\d{2}-\d{2})/);
        if (planDate && dateRange.includes(planDate)) {
            // 4.1 提取重复次数（修复：正确提取 +X次）
            const repeatCount = extractRepeatCount(text);
            if (repeatCount > 0) {
                taskStats['重复次数'][planDate] += repeatCount;
                console.log(`   🔄 重复次数: ${planDate} -> +${repeatCount}次`);
            }
            
            // 4.2 提取专注时长
            const focusHours = extractFocusDuration(text);
            if (focusHours > 0) {
                taskStats['专注时长'][planDate] += focusHours;
                console.log(`   ⏱️ 专注时长: ${planDate} -> ${focusHours.toFixed(2)}小时`);
            }
        }
        
    } catch (error) {
        console.error(`❌ 处理任务时出错: ${error.message}`);
    }
});

// 9. 检查是否有数据
const hasData = Object.values(taskStats).some(category => 
    Object.values(category).some(count => count > 0)
);

// 如果没有数据，显示提示但不填充示例数据（保持空白坐标）
if (!hasData) {
    console.warn("⚠️ 未找到有效数据，将显示空白图表");
}

// 10. 生成日期标签（优化可读性）
function getDateLabels(dates) {
    if (dates.length === 0) return [];
    
    const start = moment(dates[0]);
    const end = moment(dates[dates.length-1]);
    const daysDiff = end.diff(start, 'days');
    
    if (daysDiff <= 7) {
        // 一周内：显示完整日期和星期
        return dates.map(date => {
            const dateObj = moment(date);
            const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][dateObj.day()];
            return `${dateObj.format('MM-DD')}(${dayOfWeek})`;
        });
    } else if (daysDiff <= 31) {
        // 一个月内：显示日期和星期
        return dates.map((date, index) => {
            if (index % 2 === 0) {
                const dateObj = moment(date);
                return dateObj.format('MM-DD');
            }
            return '';
        });
    } else {
        // 更长时间：每周显示一个点
        const labels = [];
        for (let i = 0; i < dates.length; i += 7) {
            const dateObj = moment(dates[i]);
            labels.push(dateObj.format('MM-DD'));
        }
        return labels;
    }
}

// 11. 创建图表
function createChart() {
    // 显示标题
    dv.header(3, `📈 任务趋势分析 (${moment(startDate).format('YYYY-MM-DD')} 至 ${moment(endDate).format('YYYY-MM-DD')})`);
    
    // 检查Charts插件是否可用
    if (typeof window.renderChart === 'undefined') {
        dv.paragraph("⚠️ **Charts插件未启用** - 请安装并启用 Obsidian Charts 插件");
        return;
    }
    
    // 准备日期标签
    const dateLabels = getDateLabels(dateRange);
    
    // 准备图表数据
    const chartData = {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [
                {
                    label: '➕ 创建日期',
                    data: dateRange.map(date => taskStats['创建日期'][date]),
                    borderColor: '#3B82F6', // 蓝色
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.2,
                    pointRadius: 4,
                    pointBackgroundColor: '#3B82F6'
                },
                {
                    label: '🏁 方案日期',
                    data: dateRange.map(date => taskStats['方案日期'][date]),
                    borderColor: '#F59E0B', // 橙色
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.2,
                    pointRadius: 4,
                    pointBackgroundColor: '#F59E0B'
                },
                {
                    label: '✅ 完成日期',
                    data: dateRange.map(date => taskStats['完成日期'][date]),
                    borderColor: '#10B981', // 绿色
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                    pointRadius: 4,
                    pointBackgroundColor: '#10B981'
                },
                {
                    label: '🔄 重复次数',
                    data: dateRange.map(date => taskStats['重复次数'][date]),
                    borderColor: '#EF4444', // 红色
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                    pointRadius: 4,
                    pointBackgroundColor: '#EF4444'
                },
                {
                    label: '⏱️ 专注时长 (小时)',
                    data: dateRange.map(date => taskStats['专注时长'][date]),
                    borderColor: '#8B5CF6', // 紫色
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                    pointRadius: 4,
                    pointBackgroundColor: '#8B5CF6',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: {
                            size: 11
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 12 },
                    bodyFont: { size: 11 },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let value = context.parsed.y;
                            
                            if (label.includes('专注时长')) {
                                return `${label}: ${value.toFixed(2)} 小时`;
                            } else if (label.includes('重复次数')) {
                                return `${label}: ${value} 次`;
                            } else {
                                return `${label}: ${value} 个`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        stepSize: 1,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    title: {
                        display: true,
                        text: '任务数量',
                        font: {
                            size: 11
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        callback: function(value) {
                            return value.toFixed(1) + 'h';
                        }
                    },
                    title: {
                        display: true,
                        text: '专注时长 (小时)',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    };
    
    // 创建图表容器
    const chartContainer = this.container.createEl('div', {
        cls: 'task-trend-chart-container'
    });
    
    chartContainer.style.height = '500px';
    chartContainer.style.width = '100%';
    chartContainer.style.margin = '15px 0';
    chartContainer.style.padding = '10px';
    chartContainer.style.borderRadius = '6px';
    chartContainer.style.border = '1px solid var(--background-modifier-border)';
    chartContainer.style.backgroundColor = 'var(--background-primary)';
    chartContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
    
    // 渲染图表
    try {
        window.renderChart(chartData, chartContainer);
        
        // 显示数据摘要
        const summaryLines = [];
        Object.entries(taskStats).forEach(([category, data]) => {
            const total = Object.values(data).reduce((a, b) => a + b, 0);
            if (total > 0) {
                if (category === '专注时长') {
                    summaryLines.push(`${category}: ${total.toFixed(2)}小时`);
                } else if (category === '重复次数') {
                    summaryLines.push(`${category}: ${total}次`);
                } else {
                    summaryLines.push(`${category}: ${total}个`);
                }
            }
        });
        
        if (summaryLines.length > 0) {
            dv.paragraph(`📊 **数据摘要**: ${summaryLines.join(' | ')}`);
        } else {
            dv.paragraph("📊 **数据摘要**: 暂无数据");
        }
        
        // 显示调试信息
        if (!hasData) {
            dv.paragraph("ℹ️ **提示**: 当前没有找到任务数据。请确保：");
            dv.paragraph("1. 任务格式正确（包含➕、🏁、✅、⏳、+X次等标记）");
            dv.paragraph("2. 日期在指定范围内（2021-01-01 至 2021-01-30）");
            dv.paragraph("3. 图表将显示空白坐标，直到有数据");
        }
        
    } catch (error) {
        console.error("❌ 图表渲染失败:", error);
        dv.paragraph("❌ **图表渲染失败**: " + error.message);
        displayDataTable();
    }
}

// 12. 显示数据表格（备用）
function displayDataTable() {
    dv.header(4, "📋 详细数据表格");
    
    let tableData = [["日期", "创建日期", "方案日期", "完成日期", "重复次数", "专注时长(小时)"]];
    
    dateRange.forEach(date => {
        const dateObj = moment(date);
        const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][dateObj.day()];
        
        tableData.push([
            `${dateObj.format('MM-DD')}(${dayOfWeek})`,
            taskStats['创建日期'][date],
            taskStats['方案日期'][date],
            taskStats['完成日期'][date],
            taskStats['重复次数'][date],
            taskStats['专注时长'][date].toFixed(2)
        ]);
    });
    
    dv.table(tableData[0], tableData.slice(1));
}

// 13. 执行主函数
try {
    console.log("🚀 开始执行任务趋势分析...");
    console.log(`📅 日期范围: ${dateRange[0]} 至 ${dateRange[dateRange.length-1]} (共${dateRange.length}天)`);
    console.log(`📝 任务数量: ${allTasks.length}`);
    
    createChart.call(this);
    
    console.log("✅ 任务趋势分析完成");
} catch (error) {
    console.error("❌ 执行失败:", error);
    dv.paragraph("❌ **代码执行失败**: " + error.message);
    
    // 显示调试信息
    dv.paragraph("**调试信息**:");
    dv.paragraph(`- 日期范围: ${dateRange.length} 天`);
    dv.paragraph(`- 任务数量: ${allTasks.length}`);
}
```

```dataviewjs
// ==================== 任务趋势折线图（适配你的格式） ====================

// 1. 获取当前笔记的日期范围
const currentFile = dv.current();
const startDate = currentFile['进行日期'] ? dv.date(currentFile['进行日期']) : dv.date('2025-12-01');
const endDate = currentFile['截止日期'] ? dv.date(currentFile['截止日期']) : dv.date('2025-12-07');

// 2. 生成日期范围内的所有日期
function getDateRange(start, end) {
    const dates = [];
    let current = dv.date(start);
    const endDateObj = dv.date(end);
    
    while (current <= endDateObj) {
        dates.push(current.toISODate());
        current = current.plus({ days: 1 });
    }
    return dates;
}

// 3. 获取所有任务
function getAllTasks() {
    try {
        // 获取当前文件的所有任务
        const currentFileTasks = dv.current().file.tasks || [];
        
        // 显示找到的任务数量
        console.log(`找到 ${currentFileTasks.length} 个任务`);
        if (currentFileTasks.length > 0) {
            console.log("任务示例:", currentFileTasks.slice(0, 3).map(t => t.text?.substring(0, 100)));
        }
        
        return currentFileTasks;
    } catch (error) {
        console.error("获取任务失败:", error);
        return [];
    }
}

const allTasks = getAllTasks();
const dateRange = getDateRange(startDate, endDate);

// 4. 初始化统计数据 - 按照你的要求分类
const taskStats = {
    发现问题: {},    // 创建日期（➕标记）
    完成任务: {},    // 完成日期（✅标记）
    给出方案: {},    // 方案日期（🏁标记）
    重复次数: {},    // 计划日期（⏳标记）+X次
    专注时长: {}     // 计划日期（⏳标记）+专注时长（小时）
};

// 初始化所有日期的数据
dateRange.forEach(date => {
    taskStats.发现问题[date] = 0;
    taskStats.完成任务[date] = 0;
    taskStats.给出方案[date] = 0;
    taskStats.重复次数[date] = 0;
    taskStats.专注时长[date] = 0;
});

// 5. 统计不同类型的任务
allTasks.forEach(task => {
    try {
        const text = task.text || '';
        const status = task.status || ' ';
        
        // 调试：显示任务内容
        console.log("处理任务:", { 
            text: text.substring(0, 100), 
            status,
            hasPlus: text.includes('➕'),
            hasCheck: text.includes('✅'),
            hasFlag: text.includes('🏁'),
            hasTimer: text.includes('⏳'),
            hasRepeat: text.includes('+') && text.includes('次')
        });
        
        // 1. 提取创建日期（发现问题）- ➕标记
        const createMatch = text.match(/➕\s*(\d{4}-\d{2}-\d{2})/);
        if (createMatch) {
            const createDate = createMatch[1];
            if (dateRange.includes(createDate)) {
                taskStats.发现问题[createDate] = (taskStats.发现问题[createDate] || 0) + 1;
                console.log(`发现创建日期: ${createDate} -> 发现问题+1`);
            }
        }
        
        // 2. 提取完成日期（完成任务）- ✅标记
        const completeMatch = text.match(/✅\s*(\d{4}-\d{2}-\d{2})/);
        if (completeMatch) {
            const completeDate = completeMatch[1];
            if (dateRange.includes(completeDate)) {
                taskStats.完成任务[completeDate] = (taskStats.完成任务[completeDate] || 0) + 1;
                console.log(`发现完成日期: ${completeDate} -> 完成任务+1`);
            }
        }
        
        // 3. 提取方案日期（给出方案）- 🏁标记
        const solutionMatch = text.match(/🏁\s*(\d{4}-\d{2}-\d{2})/);
        if (solutionMatch) {
            const solutionDate = solutionMatch[1];
            if (dateRange.includes(solutionDate)) {
                taskStats.给出方案[solutionDate] = (taskStats.给出方案[solutionDate] || 0) + 1;
                console.log(`发现方案日期: ${solutionDate} -> 给出方案+1`);
            }
        }
        
        // 4. 提取计划日期（用于重复次数和专注时长）- ⏳标记
        const planMatch = text.match(/⏳\s*(\d{4}-\d{2}-\d{2})/);
        if (planMatch) {
            const planDate = planMatch[1];
            if (dateRange.includes(planDate)) {
                // 修复：提取重复次数（+X次）
                const repeatMatch = text.match(/\+(\d+)次/);
                if (repeatMatch) {
                    const repeatCount = parseInt(repeatMatch[1]);
                    taskStats.重复次数[planDate] = (taskStats.重复次数[planDate] || 0) + repeatCount;
                    console.log(`发现计划日期(重复): ${planDate} -> 重复次数+${repeatCount}`);
                }
                
                // 修复：提取专注时长（从【⏳HH:MM:SS】提取小时）
                const focusMatch = text.match(/【⏳(\d{2}):(\d{2}):(\d{2})】/);
                if (focusMatch) {
                    // 将时间字符串转换为小时数
                    const hours = parseInt(focusMatch[1]);
                    const minutes = parseInt(focusMatch[2]);
                    const seconds = parseInt(focusMatch[3]);
                    
                    // 转换为小时（例如02:00:00 = 2小时）
                    const totalHours = hours + minutes/60 + seconds/3600;
                    
                    taskStats.专注时长[planDate] = (taskStats.专注时长[planDate] || 0) + totalHours;
                    console.log(`发现计划日期(专注): ${planDate} -> 专注时长+${totalHours}小时`);
                }
                
                // 修复：从timer-p的data-dur属性提取时长（秒转小时）
                const durMatch = text.match(/data-dur="(\d+)"/);
                if (durMatch) {
                    const seconds = parseInt(durMatch[1]);
                    const hours = seconds / 3600; // 秒转小时
                    
                    taskStats.专注时长[planDate] = (taskStats.专注时长[planDate] || 0) + hours;
                    console.log(`从data-dur提取专注时长: ${planDate} -> ${hours}小时`);
                }
            }
        }
        
    } catch (error) {
        console.error("处理任务时出错:", error);
    }
});

// 6. 如果没有数据，显示示例数据用于测试
const hasData = Object.values(taskStats).some(category => 
    Object.values(category).some(count => count > 0)
);

if (!hasData) {
    console.warn("未找到有效数据，使用示例数据");
    
    // 添加示例数据
    dateRange.forEach((date, index) => {
        taskStats.发现问题[date] = Math.floor(Math.random() * 3) + 1;
        taskStats.完成任务[date] = Math.floor(Math.random() * 2) + 1;
        taskStats.给出方案[date] = Math.floor(Math.random() * 2);
        taskStats.重复次数[date] = Math.floor(Math.random() * 4) + 5; // 模拟+5到+9次
        taskStats.专注时长[date] = Math.floor(Math.random() * 3) + 1; // 模拟1-3小时
    });
}

// 7. 准备日期标签
function getDateLabels(dates) {
    const daysDiff = moment(dates[dates.length-1]).diff(moment(dates[0]), 'days');
    
    if (daysDiff <= 7) {
        // 一周内：显示完整日期和星期
        return dates.map(date => {
            const dateObj = moment(date);
            const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][dateObj.day()];
            return `${dateObj.format('MM-DD')}(${dayOfWeek})`;
        });
    } else if (daysDiff <= 31) {
        // 一个月内：每周显示一个点
        const labels = [];
        for (let i = 0; i < dates.length; i += 7) {
            const dateObj = moment(dates[i]);
            labels.push(dateObj.format('MM-DD'));
        }
        return labels;
    } else {
        // 更长时间：每月显示一个点
        const labels = [];
        let current = moment(dates[0]);
        const end = moment(dates[dates.length-1]);
        
        while (current <= end) {
            labels.push(current.format('MM月'));
            current = current.add(1, 'month');
        }
        return labels;
    }
}

// 8. 创建图表
function createChart() {
    // 显示标题
    dv.header(3, `📈 任务趋势分析 (${moment(startDate).format('YYYY-MM-DD')} 至 ${moment(endDate).format('YYYY-MM-DD')})`);
    
    // 检查Charts插件是否可用
    if (typeof window.renderChart === 'undefined') {
        dv.paragraph("⚠️ **Charts插件未启用**");
        dv.paragraph("请安装并启用 Obsidian Charts 插件");
        return;
    }
    
    // 准备图表数据
    const chartData = {
        type: 'line',
        data: {
            labels: getDateLabels(dateRange),
            datasets: [
                {
                    label: '🔍 发现问题（创建日期）',
                    data: dateRange.map(date => taskStats.发现问题[date]),
                    borderColor: '#3B82F6', // 蓝色
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4
                },
                {
                    label: '✅ 完成任务（完成日期）',
                    data: dateRange.map(date => taskStats.完成任务[date]),
                    borderColor: '#10B981', // 绿色
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4
                },
                {
                    label: '📋 给出方案（方案日期）',
                    data: dateRange.map(date => taskStats.给出方案[date]),
                    borderColor: '#F59E0B', // 橙色
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4
                },
                {
                    label: '🔄 重复次数（计划日期）',
                    data: dateRange.map(date => taskStats.重复次数[date]),
                    borderColor: '#EF4444', // 红色
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4,
                    yAxisID: 'y' // 使用主Y轴
                },
                {
                    label: '⏱️ 专注时长（小时）',
                    data: dateRange.map(date => taskStats.专注时长[date]),
                    borderColor: '#8B5CF6', // 紫色
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4,
                    yAxisID: 'y1' // 使用次Y轴（因为单位不同）
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 10,
                        padding: 8,
                        font: {
                            size: 10
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label.includes('专注时长')) {
                                return `${label}: ${context.parsed.y.toFixed(2)} 小时`;
                            } else {
                                return `${label}: ${context.parsed.y} 个`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 9
                        },
                        maxRotation: 45
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 9
                        },
                        stepSize: 1
                    },
                    title: {
                        display: true,
                        text: '任务数量',
                        font: {
                            size: 10
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false, // 避免与主Y轴网格重叠
                    },
                    ticks: {
                        font: {
                            size: 9
                        },
                        callback: function(value) {
                            return value.toFixed(1) + 'h'; // 显示小数并加单位
                        }
                    },
                    title: {
                        display: true,
                        text: '专注时长（小时）',
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    };
    
    // 创建图表容器
    const chartContainer = this.container.createEl('div', {
        cls: 'task-trend-chart'
    });
    
    chartContainer.style.height = '450px'; // 增加高度以容纳双Y轴
    chartContainer.style.width = '100%';
    chartContainer.style.margin = '10px 0';
    chartContainer.style.padding = '5px';
    chartContainer.style.borderRadius = '4px';
    chartContainer.style.border = '1px solid var(--background-modifier-border)';
    chartContainer.style.backgroundColor = 'var(--background-primary)';
    
    // 渲染图表
    try {
        window.renderChart(chartData, chartContainer);
        
        // 显示数据摘要（格式化专注时长）
        const summary = Object.entries(taskStats).map(([category, data]) => {
            const total = Object.values(data).reduce((a, b) => a + b, 0);
            if (category === '专注时长') {
                return `${category}: ${total.toFixed(2)}小时`;
            }
            return `${category}: ${total}`;
        }).join(' | ');
        
        dv.paragraph(`📊 **数据摘要**: ${summary}`);
        
    } catch (error) {
        console.error("图表渲染失败:", error);
        dv.paragraph("❌ **图表渲染失败**: " + error.message);
        
        // 显示数据表格作为备选
        displayDataTable();
    }
}

// 9. 显示数据表格（如果图表渲染失败）
function displayDataTable() {
    dv.header(4, "📋 详细数据");
    
    let tableData = [["日期", "发现问题", "完成任务", "给出方案", "重复次数", "专注时长(小时)"]];
    
    dateRange.forEach(date => {
        const dateObj = moment(date);
        const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][dateObj.day()];
        
        tableData.push([
            `${dateObj.format('MM-DD')}(${dayOfWeek})`,
            taskStats.发现问题[date],
            taskStats.完成任务[date],
            taskStats.给出方案[date],
            taskStats.重复次数[date],
            taskStats.专注时长[date].toFixed(2) // 显示2位小数
        ]);
    });
    
    dv.table(tableData[0], tableData.slice(1));
}

// 10. 执行
try {
    createChart.call(this);
} catch (error) {
    console.error("执行失败:", error);
    dv.paragraph("❌ **代码执行失败**: " + error.message);
    
    // 显示调试信息
    dv.paragraph("**调试信息**:");
    dv.paragraph(`- 日期范围: ${dateRange.length} 天 (${startDate} 到 ${endDate})`);
    dv.paragraph(`- 任务数量: ${allTasks.length}`);
    
    Object.entries(taskStats).forEach(([category, data]) => {
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        if (category === '专注时长') {
            dv.paragraph(`- ${category}: ${total.toFixed(2)}小时`);
        } else {
            dv.paragraph(`- ${category}: ${total}`);
        }
    });
}
```
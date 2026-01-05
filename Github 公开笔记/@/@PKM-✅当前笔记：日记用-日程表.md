###### @日记用，甘特图默认按1小时间隔显示
```dataviewjs
// 高效版文件名甘特图
const currentNote = dv.current();
const fileName = currentNote.file.name;
const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
if (!dateMatch) { dv.paragraph("❌ 文件名格式不正确"); return; }
const currentDate = dateMatch[1];

// 搜索所有笔记中的任务
const tasks = [];
const allNotes = dv.pages().sort(p => p.file.mtime.ts, 'desc').slice(0, 100);

// 解析duration格式并返回格式化的文本
function parseDuration(durationStr) {
    if (!durationStr) return {minutes: 0, text: "0m"};
    
    let totalMinutes = 0;
    const hourMatch = durationStr.match(/(\d+(\.\d+)?)h/);
    const minMatch = durationStr.match(/(\d+(\.\d+)?)m/);
    
    if (hourMatch) totalMinutes += parseFloat(hourMatch[1]) * 60;
    if (minMatch) totalMinutes += parseFloat(minMatch[1]);
    
    // 如果没有匹配到h或m，尝试解析为数字
    if (!hourMatch && !minMatch) {
        const num = parseFloat(durationStr);
        if (!isNaN(num)) totalMinutes = num;
    }
    
    totalMinutes = Math.round(totalMinutes);
    
    // 格式化显示文本
    let displayText = "";
    if (totalMinutes >= 60) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        displayText = hours + "h" + (minutes > 0 ? minutes + "m" : "");
    } else {
        displayText = totalMinutes + "m";
    }
    
    return {minutes: totalMinutes, text: displayText};
}

function calculateMinutes(start, end) {
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let s = sH * 60 + sM, e = eH * 60 + eM;
    return e < s ? e + 1440 - s : e - s;
}

for (const note of allNotes) {
    try {
        const content = await dv.io.load(note.file.path);
        
        // 按行处理，跳过空行和代码块
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('```')) continue;
            
            // 模式1: 双链任务，支持复杂duration
            let match = trimmedLine.match(/^- \[(.)\] \[\[([^\]]+)\]\] .*?\[duration::\s*([\dhms.]+?)\].*?\[startTime::\s*(\d{1,2}:\d{2})\].*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                const durationInfo = parseDuration(match[3]);
                tasks.push({
                    name: match[2].replace(/\.md$/, ''),
                    start: match[4],
                    rawDuration: durationInfo.minutes,
                    durationText: durationInfo.text,
                    isDone: match[1] === 'x' || match[1] === 'X'
                });
                continue;
            }
            
            // 模式2: 双链任务，带计时器标签
            match = trimmedLine.match(/^- \[(.)\] \[\[([^\]]+)\]\] <span[^>]*>.*?<\/span>.*?\[duration::\s*([\dhms.]+?)\].*?\[startTime::\s*(\d{1,2}:\d{2})\].*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                const durationInfo = parseDuration(match[3]);
                tasks.push({
                    name: match[2].replace(/\.md$/, ''),
                    start: match[4],
                    rawDuration: durationInfo.minutes,
                    durationText: durationInfo.text,
                    isDone: match[1] === 'x' || match[1] === 'X'
                });
                continue;
            }
            
            // 模式3: 双链任务，时间段格式
            match = trimmedLine.match(/^- \[(.)\] \[\[([^\]]+)\]\] .*?(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})\s*.*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                const minutes = calculateMinutes(match[3], match[4]);
                const durationInfo = parseDuration(minutes + "m");
                tasks.push({
                    name: match[2].replace(/\.md$/, ''),
                    start: match[3],
                    rawDuration: minutes,
                    durationText: durationInfo.text,
                    isDone: match[1] === 'x' || match[1] === 'X'
                });
                continue;
            }
            
            // 模式4: 未双链任务，支持复杂duration - 修复名称提取
            match = trimmedLine.match(/^- \[(.)\] (.+?)(?:<span[^>]*>.*?<\/span>)?.*?\[duration::\s*([\dhms.]+?)\].*?\[startTime::\s*(\d{1,2}:\d{2})\].*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                // 提取任务名称：从"- [ ] "之后到<span>或[duration::之前的所有内容
                const taskNameMatch = line.match(/^-\s*\[.\] (.+?)(?=\s*(?:<span|\[duration::|$))/);
                let taskName = taskNameMatch ? taskNameMatch[1].trim() : match[2].trim();
                
                // 清理任务名称：移除标签和符号
                taskName = taskName
                    .replace(/#[^\s]+/g, '')
                    .replace(/\+[^\s]+/g, '')
                    .replace(/\s{2,}/g, ' ')
                    .trim();
                
                if (taskName && taskName !== "未命名任务") {
                    const durationInfo = parseDuration(match[3]);
                    tasks.push({
                        name: taskName,
                        start: match[4],
                        rawDuration: durationInfo.minutes,
                        durationText: durationInfo.text,
                        isDone: match[1] === 'x' || match[1] === 'X'
                    });
                }
                continue;
            }
            
            // 模式5: 未双链任务，时间段格式 - 修复名称提取
            match = trimmedLine.match(/^- \[(.)\] (.+?)(?:<span[^>]*>.*?<\/span>)?.*?(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})\s*.*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                // 提取任务名称：从"- [ ] "之后到<span>或时间之前的所有内容
                const taskNameMatch = line.match(/^-\s*\[.\] (.+?)(?=\s*(?:<span|\d{1,2}:\d{2}\s*[-~]|$))/);
                let taskName = taskNameMatch ? taskNameMatch[1].trim() : match[2].trim();
                
                // 清理任务名称：移除标签和符号
                taskName = taskName
                    .replace(/#[^\s]+/g, '')
                    .replace(/\+[^\s]+/g, '')
                    .replace(/\s{2,}/g, ' ')
                    .trim();
                
                if (taskName && taskName !== "未命名任务") {
                    const minutes = calculateMinutes(match[3], match[4]);
                    const durationInfo = parseDuration(minutes + "m");
                    tasks.push({
                        name: taskName,
                        start: match[3],
                        rawDuration: minutes,
                        durationText: durationInfo.text,
                        isDone: match[1] === 'x' || match[1] === 'X'
                    });
                }
            }
        }
    } catch (err) {}
}

// 显示结果
if (tasks.length === 0) {
    dv.paragraph(`📭 ${currentDate} 暂无任务安排`);
} else {
    // 去重
    const uniqueTasks = [];
    const seen = new Set();
    tasks.forEach(t => {
        const key = `${t.name}-${t.start}-${t.rawDuration}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueTasks.push(t);
        }
    });
    
    // 排序
    uniqueTasks.sort((a, b) => a.start.localeCompare(b.start));
    
    // 生成甘特图 - 添加小时间隔设置
    let mermaidCode = `\`\`\`mermaid
gantt
    dateFormat HH:mm
    axisFormat %H:%M
    tickInterval 1hour\n`;
    
    // 时间段分组
    const sections = {};
    uniqueTasks.forEach(task => {
        const hour = parseInt(task.start.split(':')[0]);
        let section = hour >= 1 && hour < 5 ? "🌙 凌晨" :
                     hour >= 5 && hour < 8 ? "🌅 清晨" :
                     hour >= 8 && hour < 11 ? "🌞 上午" :
                     hour >= 11 && hour < 13 ? "☀️ 中午" :
                     hour >= 13 && hour < 17 ? "📊 下午" :
                     hour >= 17 && hour < 19 ? "🌆 傍晚" :
                     hour >= 19 && hour < 23 ? "🌃 晚上" :"🌌 深夜";
        
        (sections[section] = sections[section] || []).push(task);
    });
    
    // 添加section - 在任务名称前显示durationText
    ["🌌 深夜", "🌙 凌晨", "🌅 清晨", "🌞 上午",
     "☀️ 中午", "📊 下午", "🌆 傍晚", "🌃 晚上"]
    .forEach(section => {
        if (sections[section] && sections[section].length > 0) {
            mermaidCode += `\n    section ${section}\n`;
            sections[section].forEach(t => {
                const done = t.isDone ? 'done, ' : '';
                const displayName = t.name.length > 25 ? t.name.substring(0, 22) + "..." : t.name;
                // 在任务名称前显示durationText
                mermaidCode += `    (${t.durationText}) ${displayName} :${done}${t.start}, ${t.rawDuration}m\n`;
            });
        }
    });
    
    mermaidCode += "```";
    dv.paragraph(mermaidCode);
    
    // 统计信息
    const completed = uniqueTasks.filter(t => t.isDone).length;
    const total = uniqueTasks.length;
    const totalHours = uniqueTasks.reduce((sum, t) => sum + t.rawDuration, 0) / 60;
    const hoursDisplay = totalHours < 0.1 ? "<0.1小时" : 
                        totalHours % 1 === 0 ? `${totalHours.toFixed(0)}小时` : 
                        `${totalHours.toFixed(1)}小时`;
    
    dv.el("div", `📊 ${completed}/${total} 完成 | ⏱️ ${hoursDisplay}`);
}
```
###### 250103 归档，好像跟251223-极简（甘特图只有任务名称）一模一样
```dataviewjs
// 高效版文件名甘特图
const currentNote = dv.current();
const fileName = currentNote.file.name;
const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
if (!dateMatch) { dv.paragraph("❌ 文件名格式不正确"); return; }
const currentDate = dateMatch[1];

// 搜索所有笔记中的任务
const tasks = [];
const allNotes = dv.pages().sort(p => p.file.mtime.ts, 'desc').slice(0, 100);

// 解析duration格式并返回格式化的文本
function parseDuration(durationStr) {
    if (!durationStr) return {minutes: 0, text: "0m"};
    
    let totalMinutes = 0;
    const hourMatch = durationStr.match(/(\d+(\.\d+)?)h/);
    const minMatch = durationStr.match(/(\d+(\.\d+)?)m/);
    
    if (hourMatch) totalMinutes += parseFloat(hourMatch[1]) * 60;
    if (minMatch) totalMinutes += parseFloat(minMatch[1]);
    
    // 如果没有匹配到h或m，尝试解析为数字
    if (!hourMatch && !minMatch) {
        const num = parseFloat(durationStr);
        if (!isNaN(num)) totalMinutes = num;
    }
    
    totalMinutes = Math.round(totalMinutes);
    
    // 格式化显示文本
    let displayText = "";
    if (totalMinutes >= 60) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        displayText = hours + "h" + (minutes > 0 ? minutes + "m" : "");
    } else {
        displayText = totalMinutes + "m";
    }
    
    return {minutes: totalMinutes, text: displayText};
}

function calculateMinutes(start, end) {
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let s = sH * 60 + sM, e = eH * 60 + eM;
    return e < s ? e + 1440 - s : e - s;
}

for (const note of allNotes) {
    try {
        const content = await dv.io.load(note.file.path);
        
        // 按行处理，跳过空行和代码块
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('```')) continue;
            
            // 模式1: 双链任务，支持复杂duration
            let match = trimmedLine.match(/^- \[(.)\] \[\[([^\]]+)\]\] .*?\[duration::\s*([\dhms.]+?)\].*?\[startTime::\s*(\d{1,2}:\d{2})\].*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                const durationInfo = parseDuration(match[3]);
                tasks.push({
                    name: match[2].replace(/\.md$/, ''),
                    start: match[4],
                    rawDuration: durationInfo.minutes,
                    durationText: durationInfo.text,
                    isDone: match[1] === 'x' || match[1] === 'X'
                });
                continue;
            }
            
            // 模式2: 双链任务，带计时器标签
            match = trimmedLine.match(/^- \[(.)\] \[\[([^\]]+)\]\] <span[^>]*>.*?<\/span>.*?\[duration::\s*([\dhms.]+?)\].*?\[startTime::\s*(\d{1,2}:\d{2})\].*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                const durationInfo = parseDuration(match[3]);
                tasks.push({
                    name: match[2].replace(/\.md$/, ''),
                    start: match[4],
                    rawDuration: durationInfo.minutes,
                    durationText: durationInfo.text,
                    isDone: match[1] === 'x' || match[1] === 'X'
                });
                continue;
            }
            
            // 模式3: 双链任务，时间段格式
            match = trimmedLine.match(/^- \[(.)\] \[\[([^\]]+)\]\] .*?(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})\s*.*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                const minutes = calculateMinutes(match[3], match[4]);
                const durationInfo = parseDuration(minutes + "m");
                tasks.push({
                    name: match[2].replace(/\.md$/, ''),
                    start: match[3],
                    rawDuration: minutes,
                    durationText: durationInfo.text,
                    isDone: match[1] === 'x' || match[1] === 'X'
                });
                continue;
            }
            
            // 模式4: 未双链任务，支持复杂duration - 修复名称提取
            match = trimmedLine.match(/^- \[(.)\] (.+?)(?:<span[^>]*>.*?<\/span>)?.*?\[duration::\s*([\dhms.]+?)\].*?\[startTime::\s*(\d{1,2}:\d{2})\].*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                // 提取任务名称：从"- [ ] "之后到<span>或[duration::之前的所有内容
                const taskNameMatch = line.match(/^-\s*\[.\] (.+?)(?=\s*(?:<span|\[duration::|$))/);
                let taskName = taskNameMatch ? taskNameMatch[1].trim() : match[2].trim();
                
                // 清理任务名称：移除标签和符号
                taskName = taskName
                    .replace(/#[^\s]+/g, '')
                    .replace(/\+[^\s]+/g, '')
                    .replace(/\s{2,}/g, ' ')
                    .trim();
                
                if (taskName && taskName !== "未命名任务") {
                    const durationInfo = parseDuration(match[3]);
                    tasks.push({
                        name: taskName,
                        start: match[4],
                        rawDuration: durationInfo.minutes,
                        durationText: durationInfo.text,
                        isDone: match[1] === 'x' || match[1] === 'X'
                    });
                }
                continue;
            }
            
            // 模式5: 未双链任务，时间段格式 - 修复名称提取
            match = trimmedLine.match(/^- \[(.)\] (.+?)(?:<span[^>]*>.*?<\/span>)?.*?(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})\s*.*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                // 提取任务名称：从"- [ ] "之后到<span>或时间之前的所有内容
                const taskNameMatch = line.match(/^-\s*\[.\] (.+?)(?=\s*(?:<span|\d{1,2}:\d{2}\s*[-~]|$))/);
                let taskName = taskNameMatch ? taskNameMatch[1].trim() : match[2].trim();
                
                // 清理任务名称：移除标签和符号
                taskName = taskName
                    .replace(/#[^\s]+/g, '')
                    .replace(/\+[^\s]+/g, '')
                    .replace(/\s{2,}/g, ' ')
                    .trim();
                
                if (taskName && taskName !== "未命名任务") {
                    const minutes = calculateMinutes(match[3], match[4]);
                    const durationInfo = parseDuration(minutes + "m");
                    tasks.push({
                        name: taskName,
                        start: match[3],
                        rawDuration: minutes,
                        durationText: durationInfo.text,
                        isDone: match[1] === 'x' || match[1] === 'X'
                    });
                }
            }
        }
    } catch (err) {}
}

// 显示结果
if (tasks.length === 0) {
    dv.paragraph(`📭 ${currentDate} 暂无任务安排`);
} else {
    // 去重
    const uniqueTasks = [];
    const seen = new Set();
    tasks.forEach(t => {
        const key = `${t.name}-${t.start}-${t.rawDuration}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueTasks.push(t);
        }
    });
    
    // 排序
    uniqueTasks.sort((a, b) => a.start.localeCompare(b.start));
    
    // 生成甘特图
    let mermaidCode = `\`\`\`mermaid
gantt
    dateFormat HH:mm
    axisFormat %H:%M\n`;
    
    // 时间段分组
    const sections = {};
    uniqueTasks.forEach(task => {
        const hour = parseInt(task.start.split(':')[0]);
        let section = hour >= 1 && hour < 5 ? "🌙 凌晨" :
                     hour >= 5 && hour < 8 ? "🌅 清晨" :
                     hour >= 8 && hour < 11 ? "🌞 上午" :
                     hour >= 11 && hour < 13 ? "☀️ 中午" :
                     hour >= 13 && hour < 17 ? "📊 下午" :
                     hour >= 17 && hour < 19 ? "🌆 傍晚" :
                     hour >= 19 && hour < 23 ? "🌃 晚上" :"🌌 深夜";
        
        (sections[section] = sections[section] || []).push(task);
    });
    
    // 添加section - 在任务名称前显示durationText
    ["🌌 深夜", "🌙 凌晨", "🌅 清晨", "🌞 上午",
     "☀️ 中午", "📊 下午", "🌆 傍晚", "🌃 晚上"]
    .forEach(section => {
        if (sections[section] && sections[section].length > 0) {
            mermaidCode += `\n    section ${section}\n`;
            sections[section].forEach(t => {
                const done = t.isDone ? 'done, ' : '';
                const displayName = t.name.length > 25 ? t.name.substring(0, 22) + "..." : t.name;
                // 在任务名称前显示durationText
                mermaidCode += `    (${t.durationText}) ${displayName} :${done}${t.start}, ${t.rawDuration}m\n`;
            });
        }
    });
    
    mermaidCode += "```";
    dv.paragraph(mermaidCode);
    
    // 统计信息
    const completed = uniqueTasks.filter(t => t.isDone).length;
    const total = uniqueTasks.length;
    const totalHours = uniqueTasks.reduce((sum, t) => sum + t.rawDuration, 0) / 60;
    const hoursDisplay = totalHours < 0.1 ? "<0.1小时" : 
                        totalHours % 1 === 0 ? `${totalHours.toFixed(0)}小时` : 
                        `${totalHours.toFixed(1)}小时`;
    
    dv.el("div", `📊 ${completed}/${total} 完成 | ⏱️ ${hoursDisplay}`);
}
```
###### 251223-极简（甘特图只有任务名称）
```dataviewjs
// 高效版文件名甘特图
const currentNote = dv.current();
const fileName = currentNote.file.name;
const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
if (!dateMatch) { dv.paragraph("❌ 文件名格式不正确"); return; }
const currentDate = dateMatch[1];

// 搜索所有笔记中的任务
const tasks = [];
const allNotes = dv.pages().sort(p => p.file.mtime.ts, 'desc').slice(0, 100);

// 解析duration格式
function parseDuration(durationStr) {
    if (!durationStr) return 0;
    
    let totalMinutes = 0;
    const hourMatch = durationStr.match(/(\d+(\.\d+)?)h/);
    const minMatch = durationStr.match(/(\d+(\.\d+)?)m/);
    
    if (hourMatch) totalMinutes += parseFloat(hourMatch[1]) * 60;
    if (minMatch) totalMinutes += parseFloat(minMatch[1]);
    
    // 如果没有匹配到h或m，尝试解析为数字
    if (!hourMatch && !minMatch) {
        const num = parseFloat(durationStr);
        if (!isNaN(num)) totalMinutes = num;
    }
    
    return Math.round(totalMinutes);
}

function calculateMinutes(start, end) {
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let s = sH * 60 + sM, e = eH * 60 + eM;
    return e < s ? e + 1440 - s : e - s;
}

for (const note of allNotes) {
    try {
        const content = await dv.io.load(note.file.path);
        
        // 按行处理，跳过空行和代码块
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('```')) continue;
            
            // 模式1: 双链任务，支持复杂duration
            let match = trimmedLine.match(/^- \[(.)\] \[\[([^\]]+)\]\] .*?\[duration::\s*([\dhms.]+?)\].*?\[startTime::\s*(\d{1,2}:\d{2})\].*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                tasks.push({
                    name: match[2].replace(/\.md$/, ''),
                    start: match[4],
                    rawDuration: parseDuration(match[3]),
                    isDone: match[1] === 'x' || match[1] === 'X'
                });
                continue;
            }
            
            // 模式2: 双链任务，带计时器标签
            match = trimmedLine.match(/^- \[(.)\] \[\[([^\]]+)\]\] <span[^>]*>.*?<\/span>.*?\[duration::\s*([\dhms.]+?)\].*?\[startTime::\s*(\d{1,2}:\d{2})\].*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                tasks.push({
                    name: match[2].replace(/\.md$/, ''),
                    start: match[4],
                    rawDuration: parseDuration(match[3]),
                    isDone: match[1] === 'x' || match[1] === 'X'
                });
                continue;
            }
            
            // 模式3: 双链任务，时间段格式
            match = trimmedLine.match(/^- \[(.)\] \[\[([^\]]+)\]\] .*?(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})\s*.*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                tasks.push({
                    name: match[2].replace(/\.md$/, ''),
                    start: match[3],
                    rawDuration: calculateMinutes(match[3], match[4]),
                    isDone: match[1] === 'x' || match[1] === 'X'
                });
                continue;
            }
            
            // 模式4: 未双链任务，支持复杂duration - 修复名称提取
            match = trimmedLine.match(/^- \[(.)\] (.+?)(?:<span[^>]*>.*?<\/span>)?.*?\[duration::\s*([\dhms.]+?)\].*?\[startTime::\s*(\d{1,2}:\d{2})\].*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                // 提取任务名称：从"- [ ] "之后到<span>或[duration::之前的所有内容
                const taskNameMatch = line.match(/^-\s*\[.\] (.+?)(?=\s*(?:<span|\[duration::|$))/);
                let taskName = taskNameMatch ? taskNameMatch[1].trim() : match[2].trim();
                
                // 清理任务名称：移除标签和符号
                taskName = taskName
                    .replace(/#[^\s]+/g, '')
                    .replace(/\+[^\s]+/g, '')
                    .replace(/\s{2,}/g, ' ')
                    .trim();
                
                if (taskName && taskName !== "未命名任务") {
                    tasks.push({
                        name: taskName,
                        start: match[4],
                        rawDuration: parseDuration(match[3]),
                        isDone: match[1] === 'x' || match[1] === 'X'
                    });
                }
                continue;
            }
            
            // 模式5: 未双链任务，时间段格式 - 修复名称提取
            match = trimmedLine.match(/^- \[(.)\] (.+?)(?:<span[^>]*>.*?<\/span>)?.*?(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})\s*.*?⏳\s*(\d{4}-\d{2}-\d{2})/);
            if (match && match[5] === currentDate) {
                // 提取任务名称：从"- [ ] "之后到<span>或时间之前的所有内容
                const taskNameMatch = line.match(/^-\s*\[.\] (.+?)(?=\s*(?:<span|\d{1,2}:\d{2}\s*[-~]|$))/);
                let taskName = taskNameMatch ? taskNameMatch[1].trim() : match[2].trim();
                
                // 清理任务名称：移除标签和符号
                taskName = taskName
                    .replace(/#[^\s]+/g, '')
                    .replace(/\+[^\s]+/g, '')
                    .replace(/\s{2,}/g, ' ')
                    .trim();
                
                if (taskName && taskName !== "未命名任务") {
                    tasks.push({
                        name: taskName,
                        start: match[3],
                        rawDuration: calculateMinutes(match[3], match[4]),
                        isDone: match[1] === 'x' || match[1] === 'X'
                    });
                }
            }
        }
    } catch (err) {}
}

// 显示结果
if (tasks.length === 0) {
    dv.paragraph(`📭 ${currentDate} 暂无任务安排`);
} else {
    // 去重
    const uniqueTasks = [];
    const seen = new Set();
    tasks.forEach(t => {
        const key = `${t.name}-${t.start}-${t.rawDuration}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueTasks.push(t);
        }
    });
    
    // 排序
    uniqueTasks.sort((a, b) => a.start.localeCompare(b.start));
    
    // 生成甘特图
    let mermaidCode = `\`\`\`mermaid
gantt
    dateFormat HH:mm
    axisFormat %H:%M\n`;
    
    // 时间段分组
    const sections = {};
    uniqueTasks.forEach(task => {
        const hour = parseInt(task.start.split(':')[0]);
        let section = hour >= 1 && hour < 5 ? "🌙 凌晨" :
                     hour >= 5 && hour < 8 ? "🌅 清晨" :
                     hour >= 8 && hour < 11 ? "🌞 上午" :
                     hour >= 11 && hour < 13 ? "☀️ 中午" :
                     hour >= 13 && hour < 17 ? "📊 下午" :
                     hour >= 17 && hour < 19 ? "🌆 傍晚" :
                     hour >= 19 && hour < 23 ? "🌃 晚上" : "🌌 深夜";
        
        (sections[section] = sections[section] || []).push(task);
    });
    
    // 添加section
    ["🌌 深夜", "🌙 凌晨", "🌅 清晨", "🌞 上午",
     "☀️ 中午", "📊 下午", "🌆 傍晚", "🌃 晚上"]
    .forEach(section => {
        if (sections[section] && sections[section].length > 0) {
            mermaidCode += `\n    section ${section}\n`;
            sections[section].forEach(t => {
                const done = t.isDone ? 'done, ' : '';
                const displayName = t.name.length > 25 ? t.name.substring(0, 22) + "..." : t.name;
                mermaidCode += `    ${displayName} :${done}${t.start}, ${t.rawDuration}m\n`;
            });
        }
    });
    
    mermaidCode += "```";
    dv.paragraph(mermaidCode);
    
    // 统计信息
    const completed = uniqueTasks.filter(t => t.isDone).length;
    const total = uniqueTasks.length;
    const totalHours = uniqueTasks.reduce((sum, t) => sum + t.rawDuration, 0) / 60;
    const hoursDisplay = totalHours < 0.1 ? "<0.1小时" : 
                        totalHours % 1 === 0 ? `${totalHours.toFixed(0)}小时` : 
                        `${totalHours.toFixed(1)}小时`;
    
    dv.el("div", `📊 ${completed}/${total} 完成 | ⏱️ ${hoursDisplay}`);
}
```
###### 251222
```dataviewjs
// 高效版文件名甘特图
const currentNote = dv.current();
const fileName = currentNote.file.name;
const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
if (!dateMatch) { dv.paragraph("❌ 文件名格式不正确"); return; }
const currentDate = dateMatch[1];

// 搜索所有笔记中的任务
const tasks = [];
const allNotes = dv.pages().sort(p => p.file.mtime.ts, 'desc').slice(0, 100);

for (const note of allNotes) {
    try {
        const content = await dv.io.load(note.file.path);
        const patterns = [
            /- \[(.)\] \[\[(.+?)\]\] .*?\[duration::\s*([\d.]+)(m|h)\].*?\[startTime::\s*(\d{1,2}:\d{2})\].*?⏳\s*(\d{4}-\d{2}-\d{2})/g,
            /- \[(.)\] \[\[(.+?)\]\] <span class="timer-p".*?>.*?<\/span>.*?\[duration::\s*([\d.]+)(m|h)\].*?\[startTime::\s*(\d{1,2}:\d{2})\].*?⏳\s*(\d{4}-\d{2}-\d{2})/g,
            /- \[(.)\] \[\[(.+?)\]\] .*?(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})\s*.*?⏳\s*(\d{4}-\d{2}-\d{2})/g
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const [_, status, name, duration, unit, startTime, taskDate] = pattern === patterns[2] ? 
                    [match[0], match[1], match[2], '0', 'm', match[3], match[6]] : 
                    [match[0], match[1], match[2], match[3], match[4], match[5], match[6]];
                
                if (taskDate === currentDate) {
                    const rawDur = pattern === patterns[2] ? 
                        calculateMinutes(match[3], match[4]) : 
                        (unit === 'h' ? parseFloat(duration) * 60 : parseInt(duration));
                    
                    tasks.push({
                        name: name.replace(/\.md$/, ''),
                        start: startTime,
                        rawDuration: rawDur,
                        isDone: status === 'x' || status === 'X'
                    });
                }
            }
        }
    } catch (err) {}
}

function calculateMinutes(start, end) {
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let s = sH * 60 + sM, e = eH * 60 + eM;
    return e < s ? e + 1440 - s : e - s;
}

// 显示结果
if (tasks.length === 0) {
    dv.paragraph(`📭 ${currentDate} 暂无任务安排`);
} else {
    // 去重
    const uniqueTasks = [];
    const seen = new Set();
    tasks.forEach(t => {
        const key = `${t.name}-${t.start}-${t.rawDuration}`;
        if (!seen.has(key)) { seen.add(key); uniqueTasks.push(t); }
    });
    
    // 排序
    uniqueTasks.sort((a, b) => a.start.localeCompare(b.start));
    
    // 生成甘特图 - 移除日期和星期标题
    let mermaidCode = `\`\`\`mermaid
gantt
    dateFormat HH:mm
    axisFormat %H:%M\n`;
    
    // 时间段分组
    const sections = {};
    uniqueTasks.forEach(task => {
        const hour = parseInt(task.start.split(':')[0]);
        let section = hour >= 1 && hour < 5 ? "🌙 凌晨" :
                     hour >= 5 && hour < 8 ? "🌅 清晨" :
                     hour >= 8 && hour < 11 ? "🌞 上午" :
                     hour >= 11 && hour < 13 ? "☀️ 中午" :
                     hour >= 13 && hour < 17 ? "📊 下午" :
                     hour >= 17 && hour < 19 ? "🌆 傍晚" :
                     hour >= 19 && hour < 23 ? "🌃 晚上" : "🌌 深夜";
        
        (sections[section] = sections[section] || []).push(task);
    });
    
    // 添加section
    ["🌌 深夜", "🌙 凌晨", "🌅 清晨", "🌞 上午",
     "☀️ 中午", "📊 下午", "🌆 傍晚", "🌃 晚上"]
    .forEach(section => {
        if (sections[section] && sections[section].length > 0) {
            mermaidCode += `\n    section ${section}\n`;
            sections[section].forEach(t => {
                const done = t.isDone ? 'done, ' : '';
                const displayName = t.name.length > 25 ? t.name.substring(0, 22) + "..." : t.name;
                mermaidCode += `    ${displayName} :${done}${t.start}, ${t.rawDuration}m\n`;
            });
        }
    });
    
    mermaidCode += "```";
    dv.paragraph(mermaidCode);
    
    // 统计信息
    const completed = uniqueTasks.filter(t => t.isDone).length;
    const total = uniqueTasks.length;
    const totalHours = uniqueTasks.reduce((sum, t) => sum + t.rawDuration, 0) / 60;
    const hoursDisplay = totalHours < 0.1 ? "<0.1小时" : 
                        totalHours % 1 === 0 ? `${totalHours.toFixed(0)}小时` : 
                        `${totalHours.toFixed(1)}小时`;
    
    dv.el("div", `📊 ${completed}/${total} 完成 | ⏱️ ${hoursDisplay}`);
}
```
```dataviewjs
// 获取当前笔记文件名（日期格式）
const noteDate = dv.current().file.name;
const birthDate = "2001-07-01";

// 日期计算函数
function calculateAge(birth, target) {
    const start = moment(birth);
    const end = moment(target);
    
    // 计算周岁
    let years = end.diff(start, 'year');
    start.add(years, 'years');
    
    // 调整未过生日的情况
    if (end.isBefore(start)) years--;
    
    // 计算总天数
    const totalDays = end.diff(moment(birth), 'days');
    
    return { years, totalDays };
}

// 执行计算
if (noteDate && moment(noteDate, "YYYY-MM-DD", true).isValid()) {
    const { years, totalDays } = calculateAge(birthDate, noteDate);
    
    // 创建显示面板
    const container = dv.el('div', '', { cls: 'age-container' });
    
    container.appendChild(dv.el('div', `📅 日记日期：${noteDate}`, { 
        cls: 'age-header' 
    }));
    
    container.appendChild(dv.el('div', `🎂 周岁年龄：${years}岁`, {
        cls: 'age-result'
    }));
    
    container.appendChild(dv.el('div', `⏱️ 人生天数：${totalDays}天`, {
        cls: 'age-result'
    }));
    
    // 添加样式
    dv.el('style', `
        .age-container {
            border: 1px solid var(--background-modifier-border);
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            background-color: var(--background-primary);
        }
        .age-header {
            font-weight: bold;
            border-bottom: 1px dashed var(--background-modifier-border);
            padding-bottom: 8px;
            margin-bottom: 8px;
            color: var(--text-normal);
        }
        .age-result {
            margin: 5px 0;
            padding-left: 10px;
            font-size: 1.1em;
        }
    `);
} else {
    dv.el('p', '⚠️ 当前笔记不是有效日期格式的日记', { 
        cls: 'invalid-note',
        attr: { style: 'color: var(--text-error); padding: 10px;' }
    });
}
```
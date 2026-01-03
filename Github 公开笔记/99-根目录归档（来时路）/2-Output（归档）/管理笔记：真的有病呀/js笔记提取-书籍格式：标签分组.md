```dataviewjs
// 获取所有带有#阅读笔记标签的笔记// 获取所有带有#阅读笔记标签的笔记
const pages = dv.pages('#日记')
    .where(p => p.file.name !== dv.current().file.name); // 排除当前文件

// 创建分组结构：标签 => 书名 => [笔记内容]
const groupedData = {};

// 遍历每个笔记
for (let page of pages) {
    // 读取笔记内容
    const content = await dv.io.load(page.file.path);
    const lines = content.split('\n');
    
    // 逐行处理
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // 匹配格式："书籍名称：页码，内容 #标签"
        const match = line.match(/^([^:：]+)[:：]\s*(\d+)[，,]\s*(.+?)\s+#(\S+)$/);
        if (match) {
            const bookName = match[1].trim();
            const pageNum = parseInt(match[2]);
            const contentText = match[3].trim();
            const tag = match[4].trim();
            
            // 初始化标签分组
            if (!groupedData[tag]) {
                groupedData[tag] = {};
            }
            
            // 初始化书籍分组
            if (!groupedData[tag][bookName]) {
                groupedData[tag][bookName] = [];
            }
            
            // 添加内容到分组
            groupedData[tag][bookName].push({
                text: contentText,
                pageNum: pageNum,
                sourceFile: page.file.path,
                lineNumber: i,
                sourceNote: page.file.name,
                ctime: page.file.ctime
            });
        }
    }
}

// 获取所有标签并排序
const sortedTags = Object.keys(groupedData).sort();

// 创建输出容器
const container = dv.el('div', '');
container.style.maxWidth = '900px';

// 动态添加文字环绕样式
const style = document.createElement('style');
style.textContent = `
.tag-section {
    margin-bottom: 40px;
    padding: 20px;
    border-radius: 12px;
    background: linear-gradient(to bottom, #f8f9ff, #ffffff);
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    border-left: 4px solid #6c5ce7;
}
.tag-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #e0e0e0;
}
.tag-name {
    font-size: 1.4em;
    font-weight: 600;
    color: #6c5ce7;
    margin-right: 15px;
}
.tag-count {
    background: #6c5ce7;
    color: white;
    border-radius: 16px;
    padding: 3px 12px;
    font-size: 0.9em;
}
.book-section {
    margin: 25px 0;
    padding: 0 15px;
}
.book-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}
.book-name {
    font-size: 1.2em;
    font-weight: 500;
    color: #2d3436;
    margin-right: 12px;
}
.book-count {
    background: #00b894;
    color: white;
    border-radius: 14px;
    padding: 2px 10px;
    font-size: 0.85em;
}
.content-card {
    position: relative;
    margin-bottom: 25px;
    padding: 20px;
    border-radius: 10px;
    background: white;
    box-shadow: 0 3px 10px rgba(0,0,0,0.05);
    transition: all 0.3s;
    overflow: hidden;
}
.content-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
}
.wrap-content {
    text-align: justify;
    line-height: 1.7;
    font-size: 0.95em;
}
.wrap-content img {
    float: left;
    margin: 0 20px 10px 0;
    max-width: 180px;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: all 0.3s;
}
.wrap-content img:hover {
    transform: scale(1.03);
}
.page-indicator {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(108, 92, 231, 0.1);
    color: #6c5ce7;
    padding: 3px 10px;
    border-radius: 15px;
    font-size: 0.85em;
    font-weight: 500;
}
.edit-link {
    position: absolute;
    bottom: 15px;
    right: 20px;
    color: #4da6ff;
    font-size: 0.85em;
    text-decoration: none;
    opacity: 0.7;
    transition: opacity 0.3s;
}
.content-card:hover .edit-link {
    opacity: 1;
}
.source-info {
    font-size: 0.8em;
    color: #777;
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px dashed #e0e0e0;
}
.empty-section {
    text-align: center;
    padding: 40px;
    color: #999;
    font-size: 1.1em;
}
.empty-section i {
    font-size: 3em;
    opacity: 0.3;
    margin-bottom: 20px;
}
.stats-bar {
    display: flex;
    justify-content: space-between;
    background: #f8f9ff;
    padding: 15px 20px;
    border-radius: 10px;
    margin-bottom: 30px;
    font-size: 0.95em;
    color: #555;
}
.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.stat-value {
    font-size: 1.4em;
    font-weight: 700;
    color: #6c5ce7;
}
.stat-label {
    font-size: 0.85em;
    color: #777;
}
`;
document.head.appendChild(style);

// 如果没有找到数据
if (sortedTags.length === 0) {
    const emptyDiv = dv.el('div', '', { cls: 'empty-section' });
    emptyDiv.appendChild(dv.el('div', '📭', { style: 'font-size: 4em; opacity: 0.2; margin-bottom: 20px;' }));
    emptyDiv.appendChild(dv.el('h3', '未找到阅读笔记'));
    emptyDiv.appendChild(dv.el('p', '请确保笔记格式为：书籍名称：页码，内容 #标签'));
    emptyDiv.appendChild(dv.el('p', '示例：书籍A：10，这是重要内容 #概念'));
    container.appendChild(emptyDiv);
    dv.container.appendChild(container);
    return;
}

// 创建统计信息栏
const statsBar = dv.el('div', '', { cls: 'stats-bar' });

const totalTags = sortedTags.length;
let totalBooks = 0;
let totalNotes = 0;

// 计算统计数据
for (const tag of sortedTags) {
    totalBooks += Object.keys(groupedData[tag]).length;
    for (const book of Object.keys(groupedData[tag])) {
        totalNotes += groupedData[tag][book].length;
    }
}

statsBar.appendChild(dv.el('div', '', { cls: 'stat-item' })
    .appendChild(dv.span(`<div class="stat-value">${totalTags}</div><div class="stat-label">标签</div>`)));

statsBar.appendChild(dv.el('div', '', { cls: 'stat-item' })
    .appendChild(dv.span(`<div class="stat-value">${totalBooks}</div><div class="stat-label">书籍</div>`)));

statsBar.appendChild(dv.el('div', '', { cls: 'stat-item' })
    .appendChild(dv.span(`<div class="stat-value">${totalNotes}</div><div class="stat-label">笔记</div>`)));

container.appendChild(statsBar);

// 为每个标签创建内容
for (const tag of sortedTags) {
    const tagSection = dv.el('div', '', { cls: 'tag-section' });
    
    // 标签标题
    const tagHeader = dv.el('div', '', { cls: 'tag-header' });
    tagHeader.appendChild(dv.el('h2', `#${tag}`, { cls: 'tag-name' }));
    
    // 计算该标签下的笔记总数
    let tagNoteCount = 0;
    for (const book of Object.keys(groupedData[tag])) {
        tagNoteCount += groupedData[tag][book].length;
    }
    tagHeader.appendChild(dv.el('div', `${tagNoteCount} 条笔记`, { cls: 'tag-count' }));
    tagSection.appendChild(tagHeader);
    
    // 获取该标签下的所有书籍并按书名倒序排列
    const books = Object.keys(groupedData[tag]).sort().reverse();
    
    // 为每本书创建内容
    for (const bookName of books) {
        const bookSection = dv.el('div', '', { cls: 'book-section' });
        
        // 书籍标题
        const bookHeader = dv.el('div', '', { cls: 'book-header' });
        bookHeader.appendChild(dv.el('h3', bookName, { cls: 'book-name' }));
        bookHeader.appendChild(dv.el('div', `${groupedData[tag][bookName].length} 条笔记`, { 
            cls: 'book-count',
            style: 'background: #00b894;' 
        }));
        bookSection.appendChild(bookHeader);
        
        // 按页码分组
        const pageMap = {};
        for (const note of groupedData[tag][bookName]) {
            if (!pageMap[note.pageNum]) {
                pageMap[note.pageNum] = [];
            }
            pageMap[note.pageNum].push(note);
        }
        
        // 按页码排序（升序）
        const sortedPages = Object.keys(pageMap).map(Number).sort((a, b) => a - b);
        
        // 为每个页码创建笔记
        for (const pageNum of sortedPages) {
            // 按创建时间倒序排列笔记
            const notes = pageMap[pageNum].sort((a, b) => b.ctime - a.ctime);
            
            for (const note of notes) {
                // 创建内容卡片
                const card = dv.el('div', '', { cls: 'content-card' });
                
                // 添加页码指示器
                card.appendChild(dv.el('div', `📖 ${pageNum} 页`, { cls: 'page-indicator' }));
                
                // 创建内容显示区域
                const contentDiv = dv.el('div', '', { cls: 'wrap-content' });
                
                // 支持Markdown渲染（包括图片）
                contentDiv.appendChild(dv.span(note.text, { markdown: true }));
                card.appendChild(contentDiv);
                
                // 添加编辑链接
                const editLink = dv.el('a', '✏️ 编辑来源', {
                    cls: 'edit-link',
                    attr: {
                        'href': `obsidian://advanced-uri?filepath=${encodeURIComponent(note.sourceFile)}&line=${note.lineNumber}`,
                        'title': `在 ${note.sourceNote} 中编辑此内容`
                    }
                });
                card.appendChild(editLink);
                
                // 添加来源信息
                const sourceInfo = dv.el('div', `来源: ${note.sourceNote}`, { cls: 'source-info' });
                card.appendChild(sourceInfo);
                
                bookSection.appendChild(card);
            }
        }
        
        tagSection.appendChild(bookSection);
    }
    
    container.appendChild(tagSection);
}

// 最终输出
dv.paragraph(`## 阅读笔记标签分类汇总`);
dv.paragraph(`共找到 ${totalTags} 个标签，${totalBooks} 本书籍，${totalNotes} 条笔记`);
dv.container.appendChild(container);
```
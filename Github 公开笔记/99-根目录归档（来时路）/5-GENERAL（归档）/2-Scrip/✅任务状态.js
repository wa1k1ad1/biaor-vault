module.exports = async function(params) {
    const { quickAddApi } = params;
    
    // 定义7种任务状态（确保符号长度一致）
    const statusChoices = [
        { display: '[ ] ⭕️待定', symbol: '[ ]' },
        { display: '[>] ❕  准备中', symbol: '[>]' },
        { display: '[/] ⚡️进行中', symbol: '[/]' },
        { display: '[<] 📆等待中', symbol: '[<]' },
        { display: '[i]   ❗  中断', symbol: '[i]' },
        { display: '[-] ❌取消', symbol: '[-]' },
        { display: '[x] ✅完成', symbol: '[x]' }
    ];
    
    // 弹出状态选择窗口
    const selected = await quickAddApi.suggester(
        statusChoices.map(item => item.display),
        statusChoices.map(item => item.symbol)
    );
    
    if (selected) {
        // 获取当前编辑器
        const activeView = app.workspace.activeLeaf?.view;
        if (!activeView || !activeView.editor) {
            new Notice('❌ 没有找到可用的编辑器！');
            return;
        }
        
        const editor = activeView.editor;
        const cursor = editor.getCursor();
        const lineContent = editor.getLine(cursor.line);
        
        // 匹配任务状态标记
        const taskRegex = /\[(\s|x|i|\/|<|>|-)\]/;
        const match = lineContent.match(taskRegex);
        
        if (match) {
            // 计算要替换的文本范围
            const start = match.index;
            const end = start + match[0].length;
            
            // 获取当前行的整个文本
            let newLineContent = lineContent;
            
            // 替换状态标记部分
            newLineContent = newLineContent.substring(0, start) + 
                            selected + 
                            newLineContent.substring(end);
            
            // 替换整行内容
            editor.setLine(cursor.line, newLineContent);
            
            // 显示成功提示
            const selectedDisplay = statusChoices.find(item => item.symbol === selected)?.display || selected;
            new Notice(`任务状态已改为: ${selectedDisplay}`);
        } else {
            new Notice('❌ 当前行没有找到任务状态标记！');
        }
    }
};
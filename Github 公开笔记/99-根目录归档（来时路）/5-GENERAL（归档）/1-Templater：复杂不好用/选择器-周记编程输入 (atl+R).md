<%*
try {
    const templateFolder = "周记：自媒体输入 R 键";
    
    // 1. 获取所有模板文件并按名称排序
    const templateFiles = app.vault.getFiles()
        .filter(file => file.path.includes(templateFolder))
        .sort((a, b) => a.name.localeCompare(b.name));
    
    if (templateFiles.length === 0) {
        new Notice(`在文件夹 ${templateFolder} 中未找到模板文件`);
        return;
    }
    
    // 2. 创建选择列表（显示文件名但返回完整路径）
    const choices = templateFiles.map(file => ({
        display: file.name,
        value: file.path
    }));
    
    // 3. 使用Templater的suggester让用户选择
    const selectedPath = await tp.system.suggester(
        choices.map(c => c.display),
        choices.map(c => c.value),
        false,
        "请选择日记模板（已按名称排序）"
    );
    
    if (!selectedPath) {
        new Notice("未选择模板文件");
        return;
    }
    
    // 4. 包含选定模板内容
    const content = await tp.file.include(`[[${selectedPath}]]`);
    tR = (content || '').trim();

} catch(error) {
    console.error("日记模板选择错误:", error);
    new Notice(`操作失败: ${error.message}`);
    tR = ""; // 确保返回空字符串
}
-%>
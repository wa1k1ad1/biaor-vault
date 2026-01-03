module.exports = async (params) => {
    const { app } = params;
    
    try {
        const allFiles = app.vault.getMarkdownFiles();
        const targetFiles = [];
        
        const targetPath = "Documents/md";
        
        for (const file of allFiles) {
            try {
                if (file.path.includes(targetPath)) {
                    const content = await app.vault.cachedRead(file);
                    
                    const yamlMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
                    if (yamlMatch) {
                        const yamlContent = yamlMatch[1];
                        if (yamlContent.includes("笔记内容:") && yamlContent.includes("高级")) {
                            targetFiles.push(file);
                        }
                    }
                }
            } catch (error) {
                console.error("读取文件错误:", file.path, error);
            }
        }
        
        if (targetFiles.length === 0) {
            new Notice("❌ 未找到高级笔记");
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * targetFiles.length);
        const randomFile = targetFiles[randomIndex];
        
        await app.workspace.getLeaf(false).openFile(randomFile);
        new Notice(`⭕️完善高级: ${randomFile.basename}`);
        
    } catch (error) {
        new Notice("❌ 错误");
    }
};
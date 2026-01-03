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
                    if (content.includes("低级")) {
                        targetFiles.push(file);
                    }
                }
            } catch (error) {
                console.error("读取文件错误:", file.path, error);
            }
        }
        
        if (targetFiles.length === 0) {
            new Notice("❌ 未找到低级笔记");
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * targetFiles.length);
        const randomFile = targetFiles[randomIndex];
        
        await app.workspace.getLeaf(false).openFile(randomFile);
        new Notice(`⭕️完善低级: ${randomFile.basename}`);
        
    } catch (error) {
        new Notice("❌ 错误");
    }
};
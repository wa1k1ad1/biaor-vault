---
area:
  - "[[PKM（基础）]]"
笔记类型:
  - 资料笔记
模块资源:
  - "[[笔记工具-🗃️]]"
笔记内容: 高级
---
```meta-bind-embed
[[当前笔记：领域耗时（项目用）]]
```
##### 输出
###### 行动记录
%%实践应用方案%%
- 卡片能添加：文字、图片、音频、视频
- **可用的** Obsidian to Anki 插件，来自 Shiki Ob 拎包入住开荒仓库
###### Ob/Anki 中安装插件
- Anki 安装插件：AnkiConnect，按Ctrl+Shift+A，点击右上角“获取插件”，输入`2055492159`
- Obsi 安装插件：Obsidian_to_Anki，启用并点击插件，复制粘贴到anki插件即可
###### Ob          中设置插件-3步
- 排除导入Anki的Ob笔记![100705|200](https://cdn.jsdelivr.net/gh/wa1k1ad1/Image@main/Img/20260101230115496.png)
	- `文件夹/**  //排除文件夹📂`
	- `**/*.笔记名.md  //排除笔记`
- 间隔自动同步
	- 0~360分钟（调节齿轮是5分钟）![100707|150](https://cdn.jsdelivr.net/gh/wa1k1ad1/Image@main/Img/20260101230115498.png)
- 打勾
- ![100709|150](https://cdn.jsdelivr.net/gh/wa1k1ad1/Image@main/Img/20260101230115499.png)
	- Add File Link，跳转到Ob
	- CurlyCloze，填空类型卡片用，参考[[笔记复盘-APP Ob笔记制作 Anki 记忆卡片#同步（制作填空卡片）|制作填空卡片]]
	- ID Comments，ID号，表示同步成功

#### Anki         中操作
###### 配置“卡片模板”
**提示**：Anki中修改，Obsi中同步
- Anki中修改：按Ctrl+Shift+N，Anki卡片模板，配置卡片类型（英文名称）和字段
	- 英文卡片类型：删除[数据文件夹](C:\Users\18128\AppData\Roaming\Anki2)，重新打开Anki选English (United States)，按CTRL+P选中文界面
```
1. 卡片类型
	2. 字段
2. Image Occlusion // 图片遮盖
	1. Occlusion // 遮盖
	2. Image // 图片
	3. Header // 标题
	4. Back Extra // 背面额外
	5. Comments // 注释
3. Cloze // 填空题
	1. Text // 文字
	2. Back Extra // 背面额外
4. Basic // 问答题
	1. Front // 正面
	2. Back // 背面
5. Basic (optional reversed card) // 问答题（同时生成翻转的卡片<可选>）
	1. Front // 正面
	2. Back // 背面
	3. Add Reverse // 增加翻转的卡片
6. Basic (and reversed card) // 问答题（同时生成翻转的卡片）
	1. Front // 正面
	2. Back //  背面
7. Basic (type in the answer) // 问答题（输入答案）
	1. Front // 正面
	2. Back //  背面
```
- Obsi中同步：![100710|400](https://cdn.jsdelivr.net/gh/wa1k1ad1/Image@main/Img/20260101230115500.png) ^1e5955
###### 重装，备份还原
- 备份文件夹：
	- 粘贴路径：[文件夹路径](C:\Users\18128\AppData\Roaming\Anki2)
###### 账号同步
- **遇到的问题**：PC端Anki同步弹出异常，需要去[Anki网页端](https://ankiweb.net/decks)登入账号激活同步
	- 技巧：网页端可以管理同步内容
- 账号密码：43640664@qq.com，ZXCzxc123
###### 卡片复习
- 卡片选重来/良好（卡组开启FSRS算法）
	- [Anki快速入门2 -如何用FSRS算法提升学习效率，轻松记住更多内容\_哔哩哔哩\_bilibili](https://www.bilibili.com/video/BV1WGrWY7E7V/?spm_id_from=333.1391.0.0&vd_source=541194aae70ba1f5d5903cbad83c4b15)
#### Obsidian 中操作
##### 卡片基础
%%要点输入的位置有规定，所有按照场景来说明%%
- 指定“卡组”和打“标签”，输入位置：笔记顶部
	- `TARGET DECK: 卡组A`  // 一个笔记只能指定一个目标卡组，默认卡组“Default”![100706|150](https://cdn.jsdelivr.net/gh/wa1k1ad1/Image@main/Img/20260101230115497.png)
		- 一个卡组允许有不同的卡片类型
	- `FILE TAGS: 打标签`  // 此笔记的卡片共同标签
```
FILE TAGS: 卡组👀此笔记的卡片共同标签  // File Tags Line 空一行输入即可

TARGET DECK: 👀目标卡组  // Target Deck Line 最上面输入（放md笔记/mk标题开头）
```
___
- 基于我的输入格式，交给 AI 生成正则匹配（Regexp），输入格式（正则匹配成功！），生成anki卡片即可
	- 参考::[官网文档](https://github.com/ObsidianToAnki/Obsidian_to_Anki/wiki/Regex)（**提示**：需翻墙）有 7 种正则匹配![100711|50](https://cdn.jsdelivr.net/gh/wa1k1ad1/Image@main/Img/20260101230115501.png)
- 不能同步的原因
	- Anki和Obsi，没有同时打开
	- 输入的正则不匹配
	- Ob 中插件，没有更新Anki的卡片模板![[笔记复盘-APP Ob笔记制作 Anki 记忆卡片#^1e5955]]
- 卡片支持附件格式
	- 图片：PNG、JPEG

##### 卡片**制作**
###### 不推荐-官网正常制作卡片
```
START // Begin Note
正面
反面
END  // End Note
```
###### 问答题正则（Regexp）
- 来自官网的正则匹配（Regexp）同步
	- Regexp：`^Q: ((?:.+\n)*)\n*A: (.+(?:\n(?:^.{1,3}$|^.{4}(?<!<!--).*))*)`
```
TARGET DECK: 目标卡组
Q: 问题？
A: 答案！
```
###### 问答题正则-标题版（Regexp）
- 来自定制的正则匹配（Regexp）同步
	- Regexp：`^#{6,}(.+)\n*([\s\S]*?)\nEND$`  // 适合代码案例笔记
```
###### 问题？
答案！
END
```
###### 问答题正则-标签版（Regexp）
- Regexp：`((?:[^\n][\n]?)+) #anki/Basic ?\n*((?:\n(?:^.{1,3}$|^.{4}(?<!<!--).*))+)`
```
问题 #anki/Basic
答案
```
###### 问答题正则-标签版-双页翻面，问和答互答版（Regexp）
- Regexp：`((?:[^\n][\n]?)+) #anki/Basic-双页翻面 ?\n*((?:\n(?:^.{1,3}$|^.{4}(?<!<!--).*))+)`
```
问题 #anki/Basic-双页翻面
答案
```
###### 填空题正则-挖空版（Regexp）
- Regexp：`((?:.+\n)*(?:.*{.*)(?:\n(?:^.{1,3}$|^.{4}(?<!<!--).*))*)`
`一条{鱼}！
	- 输入：`{{cl::文字}}`（搭配dataview内联属性）
###### 填空题正则-挖空mk高亮版（Regexp）
- Regexp：`((?:.+\n)*(?:.*==.*)(?:\n(?:^.{1,3}$|^.{4}(?<!<!--).*))*)`
	- 输入：`一条==鱼==`
##### 卡片**删除**同步
```
DEL  // 删除同步卡片：Delete Note Line（在生成的同步码（id）上行输入指令）
<!--ID: 1759998039940--> 
```

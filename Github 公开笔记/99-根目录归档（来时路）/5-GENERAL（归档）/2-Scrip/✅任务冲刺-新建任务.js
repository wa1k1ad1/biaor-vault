module.exports = async function(params) {
  const { quickAddApi } = params;
  
  // 获取当前时间
  const now = new Date();
  const formatTime = (date) => date.toTimeString().slice(0, 5);
  const currentTime = formatTime(now);
  
  // 第一个提示：选择专注时间
  const timeChoices = [
    { display: '5分钟', value: '5' },
    { display: '10分钟', value: '10' },
    { display: '15分钟', value: '15' },
    { display: '20分钟', value: '20' },
    { display: '25分钟', value: '25' },
    { display: '输入自定义时间', value: 'custom' }
  ];
  
  const selectedTimeOption = await quickAddApi.suggester(
    timeChoices.map(item => item.display),
    timeChoices
  );
  
  let minutes = '20'; // 默认值
  
  if (selectedTimeOption.value === 'custom') {
    minutes = await quickAddApi.inputPrompt('🕒请输入专注时间（分钟）:', '20', '20');
  } else {
    minutes = selectedTimeOption.value;
  }
  
  // 第二个提示：输入任务内容
  const task = await quickAddApi.inputPrompt('✅你要进行什么任务？', '', '');
  
  // 计算结束时间
  const endTime = new Date(now.getTime() + parseInt(minutes) * 60000);
  const endTimeFormatted = formatTime(endTime);
  
  // 生成要插入的文本
  const resultText = `- ${currentTime} - ${endTimeFormatted} ⌛️🥊${minutes}m${task} +1个 #📊产出（每日12个）⌛️工作`;
  
  // 获取当前编辑器并插入文本
  const activeView = app.workspace.activeLeaf?.view;
  if (activeView && activeView.editor) {
    const editor = activeView.editor;
    const cursor = editor.getCursor();
    editor.replaceRange(resultText + '\n', cursor);
  }
  
  return resultText;
};
import { tabContextManager } from './contextManager';

// 后台脚本入口
console.log('Chro-Jarvis 后台脚本启动');

// 监听标签页事件
chrome.tabs.onCreated.addListener((tab) => {
  console.log('标签页创建:', tab.id);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('标签页加载完成:', tabId, tab.title);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  console.log('标签页关闭:', tabId);
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request, sender.tab?.id);

  switch (request.action) {
    case 'getTabContext':
      if (sender.tab?.id) {
        const context = tabContextManager.getContext(sender.tab.id, sender.tab);
        sendResponse(context);
      }
      break;

    case 'saveTabContext':
      if (sender.tab?.id) {
        tabContextManager.getContext(sender.tab.id, sender.tab).history = request.history;
        sendResponse({ success: true });
      }
      break;

    case 'translatePage':
      // 处理翻译请求
      console.log('翻译页面请求');
      sendResponse({ success: true });
      break;

    case 'getPageContext':
      // 获取页面上下文
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, { action: 'getPageContent' }, (response) => {
          if (response?.success) {
            sendResponse({
              success: true,
              context: response.content.slice(0, 1000)  // 限制上下文长度
            });
          } else {
            sendResponse({
              success: false,
              error: '无法获取页面内容'
            });
          }
        });
        return true; // 保持消息通道打开
      } else {
        sendResponse({
          success: false,
          error: '无法确定当前标签页'
        });
      }
      break;

    default:
      console.log('未知消息类型:', request.action);
  }
});

import { pageTranslator } from './translator';

// 内容脚本入口
console.log('Chro-Jarvis 内容脚本启动');

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('内容脚本收到消息:', request);

  switch (request.action) {
    case 'translatePage':
      pageTranslator.translatePage().then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        console.error('翻译失败:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true; // 保持消息通道打开

    case 'translateSelection':
      pageTranslator.translateSelection(request.text).then((translatedText) => {
        sendResponse({ success: true, text: translatedText });
      }).catch((error) => {
        console.error('翻译失败:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true;

    case 'getPageContent':
      // 获取页面内容
      try {
        const pageContent = document.body.innerText;
        sendResponse({
          success: true,
          content: pageContent
        });
      } catch (error) {
        console.error('获取页面内容失败:', error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
      return true;

    default:
      console.log('未知消息类型:', request.action);
  }
});

import { useState } from 'react';
import { translator } from '../utils/translator';

function QuickActions() {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslatePage = async () => {
    setIsTranslating(true);

    try {
      // 向内容脚本发送翻译请求
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id!, { action: 'translatePage' }, (response) => {
            if (response?.success) {
              alert('翻译成功');
            } else {
              alert('翻译失败: ' + response?.error);
            }
            setIsTranslating(false);
          });
        }
      });
    } catch (error) {
      console.error('翻译失败:', error);
      alert('翻译失败');
      setIsTranslating(false);
    }
  };

  const handleOpenSidebar = async () => {
    // 打开侧边栏
    await chrome.sidePanel.open({ tabId: await getCurrentTabId() });
  };

  const getCurrentTabId = async (): Promise<number> => {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs[0].id!);
      });
    });
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">快速操作</h3>

      <div className="space-y-3">
        <button
          onClick={handleOpenSidebar}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          打开侧边栏
        </button>

        <button
          onClick={handleTranslatePage}
          disabled={isTranslating}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTranslating ? '翻译中...' : '翻译页面'}
        </button>

        <button
          onClick={() => alert('功能开发中...')}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          其他功能
        </button>
      </div>

      <div className="mt-6 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
        <p>💡 提示：</p>
        <p className="mt-1">• 侧边栏提供更详细的问答功能</p>
        <p className="mt-1">• 翻译功能支持多种语言</p>
        <p className="mt-1">• 每个标签页的对话历史都是独立的</p>
      </div>
    </div>
  );
}

export default QuickActions;

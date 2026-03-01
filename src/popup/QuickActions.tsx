import { useState } from 'react';
import { toast } from '../utils/toast';

function QuickActions() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSidebarOpening, setIsSidebarOpening] = useState(false);

  const handleTranslatePage = async () => {
    setIsTranslating(true);

    try {
      // 向内容脚本发送翻译请求
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        const response = await chrome.tabs.sendMessage(tabs[0].id!, { action: 'translatePage' });
        if (response?.success) {
          toast.success('页面已成功翻译');
        } else {
          toast.error(response?.error || '翻译失败');
        }
      } else {
        toast.error('无法找到当前标签页');
      }
    } catch (error) {
      console.error('翻译失败:', error);
      toast.error('翻译过程中发生错误');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleOpenSidebar = async () => {
    setIsSidebarOpening(true);
    try {
      const tabId = await getCurrentTabId();
      await chrome.sidePanel.open({ tabId });
    } catch (error) {
      console.error('打开侧边栏失败:', error);
      toast.error('无法打开侧边栏');
    } finally {
      setIsSidebarOpening(false);
    }
  };

  const getCurrentTabId = async (): Promise<number> => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          resolve(tabs[0].id);
        } else {
          reject('无法找到当前标签页');
        }
      });
    });
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">快速操作</h3>

      <div className="space-y-3">
        <button
          onClick={handleOpenSidebar}
          disabled={isSidebarOpening}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSidebarOpening ? '打开中...' : '打开侧边栏'}
        </button>

        <button
          onClick={handleTranslatePage}
          disabled={isTranslating}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTranslating ? '翻译中...' : '翻译页面'}
        </button>

        <button
          onClick={() => toast.info('此功能正在开发中')}
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

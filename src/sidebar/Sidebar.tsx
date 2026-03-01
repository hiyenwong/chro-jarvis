import { useState, useEffect } from 'react';
import ChatHistory from './ChatHistory';
import QuestionInput from './QuestionInput';
import { StorageManager } from '../utils/storage';
import { Message } from '../types';

function Sidebar() {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabId, setTabId] = useState<number | null>(null);

  useEffect(() => {
    // 获取当前标签页 ID
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setTabId(tabs[0].id!);
        // 加载聊天历史
        StorageManager.getChatHistory(tabs[0].id!).then((history) => {
          setChatHistory(history.history);
        });
      }
    });
  }, []);

  const handleSendMessage = async (message: Message) => {
    const newHistory = [...chatHistory, message];
    setChatHistory(newHistory);

    // 保存聊天历史到存储
    if (tabId) {
      await StorageManager.saveChatHistory(tabId, {
        url: '',
        title: '',
        history: newHistory
      });
    }
  };

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Chro-Jarvis</h1>
        <p className="text-sm text-gray-500 mt-1">智能页面问答助手</p>
      </div>

      <ChatHistory history={chatHistory} />

      <div className="flex-1 flex items-center justify-center text-gray-500">
        {loading && <p>思考中...</p>}
      </div>

      <QuestionInput onSendMessage={handleSendMessage} onLoading={handleLoading} />
    </div>
  );
}

export default Sidebar;

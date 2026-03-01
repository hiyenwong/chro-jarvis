import { useState } from 'react';
import { createAiProvider } from '../utils/aiApi';
import { StorageManager } from '../utils/storage';
import { TokenTracker } from '../utils/tokenTracker';
import { Message } from '../types';

interface QuestionInputProps {
  onSendMessage: (message: Message) => void;
  onLoading: (loading: boolean) => void;
}

function QuestionInput({ onSendMessage, onLoading }: QuestionInputProps) {
  const [question, setQuestion] = useState('');

  const handleSendQuestion = async () => {
    if (!question.trim()) {
      return;
    }

    // 发送用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: Date.now()
    };
    onSendMessage(userMessage);

    // 清空输入框
    setQuestion('');
    onLoading(true);

    try {
      // 获取配置
      const config = await StorageManager.getConfig();
      const provider = createAiProvider(config);

      // 获取页面上下文（通过后台脚本）
      let context = '';
      try {
        const response = await chrome.runtime.sendMessage({ action: 'getPageContext' });
        if (response?.success && response.context) {
          context = response.context;
        } else {
          console.warn('无法获取页面上下文，将使用默认上下文');
          context = '无法获取页面详细内容，请直接提问关于页面的问题';
        }
      } catch (error) {
        console.warn('获取页面上下文失败:', error);
        context = '无法获取页面详细内容，请直接提问关于页面的问题';
      }

      // 判断是否是页面分析请求
      let apiResponse;
      if (question.toLowerCase().includes('分析页面') || question.toLowerCase().includes('页面分析')) {
        // 调用页面分析功能
        apiResponse = await provider.generateAnswer('请分析这个页面的内容和结构', context);
      } else {
        // 调用 AI 生成答案
        apiResponse = await provider.generateAnswer(question, context);
      }

      // 记录 token 使用情况
      await TokenTracker.recordUsage(
        provider.getProviderName(),
        provider.getModelName(),
        'chat',
        apiResponse.usage,
        {
          url: window.location.href,
          title: document.title
        }
      );

      // 发送助手消息
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: apiResponse.content,
        timestamp: Date.now()
      };
      onSendMessage(assistantMessage);
    } catch (error) {
      console.error('生成答案失败:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '生成答案失败，请检查 API 配置。',
        timestamp: Date.now()
      };
      onSendMessage(errorMessage);
    } finally {
      onLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendQuestion();
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入你的问题，或尝试'分析页面'"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendQuestion}
          disabled={!question.trim()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </div>
    </div>
  );
}

export default QuestionInput;

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

      // 获取页面上下文
      const pageContent = document.body.innerText;
      const context = pageContent.slice(0, 1000);

      // 调用 AI 生成答案
      const apiResponse = await provider.generateAnswer(question, context);

      // 记录 token 使用情况
      await TokenTracker.recordUsage(
        provider.getProviderName() as 'deepseek' | 'zhipu' | 'volcano',
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
          placeholder="输入你的问题..."
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

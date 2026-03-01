import { Message } from '../types';

interface ChatHistoryProps {
  history: Message[];
}

function ChatHistory({ history }: ChatHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">👋 你好！</p>
          <p className="text-sm">在下方输入框中提问，我会为你解答。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {history.map((message) => (
        <div
          key={message.id}
          className={`mb-4 ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <p className="text-xs mt-1 opacity-70">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatHistory;

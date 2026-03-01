/**
 * 空状态组件
 * 用于显示无数据、无消息等状态
 */

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      {icon && (
        <div className="text-5xl mb-4 opacity-50">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4 max-w-xs">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Token 统计空状态
 */
export function TokenStatsEmptyState() {
  return (
    <EmptyState
      icon="📊"
      title="暂无 Token 使用记录"
      description="开始使用 AI 功能后，这里将显示您的 Token 消耗统计"
    />
  );
}

/**
 * 聊天历史空状态
 */
export function ChatHistoryEmptyState() {
  return (
    <EmptyState
      icon="💬"
      title="开始对话"
      description="在下方输入框中提问，我会根据当前页面内容为你解答"
    />
  );
}

/**
 * 设置空状态（首次使用）
 */
export function FirstTimeSetupState() {
  return (
    <div className="p-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">🚀</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          欢迎使用 Chro-Jarvis
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          请先配置 AI 提供商和 API Key 以开始使用
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span>🔒</span>
          <span>您的 API Key 将安全存储在本地</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 错误状态
 */
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = '出错了', message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-red-600 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-4 max-w-xs">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
        >
          重试
        </button>
      )}
    </div>
  );
}

export default EmptyState;

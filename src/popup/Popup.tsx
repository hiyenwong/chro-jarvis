import { useState } from 'react';
import SettingsTab from './SettingsTab';
import QuickActions from './QuickActions';
import TokenStatsPanel from './TokenStatsPanel';

function Popup() {
  const [activeTab, setActiveTab] = useState<'quick-actions' | 'settings' | 'token-stats'>('quick-actions');

  return (
    <div className="w-80 h-96 bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('quick-actions')}
          className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
            activeTab === 'quick-actions'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          快速操作
        </button>
        <button
          onClick={() => setActiveTab('token-stats')}
          className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
            activeTab === 'token-stats'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Token 统计
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
            activeTab === 'settings'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          设置
        </button>
      </div>

      <div className="h-full overflow-y-auto">
        {activeTab === 'quick-actions' && <QuickActions />}
        {activeTab === 'token-stats' && <TokenStatsPanel />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

export default Popup;

import { useState, useEffect } from 'react';
import { StorageManager } from '../utils/storage';
import { Config } from '../types';

function SettingsTab() {
  const [config, setConfig] = useState<Config>({
    aiProvider: 'deepseek',
    apiKey: '',
    targetLanguage: 'zh-CN'
  });

  useEffect(() => {
    StorageManager.getConfig().then((savedConfig) => {
      setConfig(savedConfig);
    });
  }, []);

  const handleSaveConfig = async () => {
    try {
      await StorageManager.saveConfig(config);
      alert('配置已保存');
    } catch (error) {
      console.error('保存配置失败:', error);
      alert('保存配置失败');
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">AI 配置</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">AI 供应商</label>
        <select
          value={config.aiProvider}
          onChange={(e) => setConfig({ ...config, aiProvider: e.target.value as 'deepseek' | 'zhipu' | 'volcano' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="deepseek">DeepSeek</option>
          <option value="zhipu">智谱</option>
          <option value="volcano">火山引擎</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">API Key</label>
        <input
          type="password"
          value={config.apiKey}
          onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入 API Key"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">目标语言</label>
        <select
          value={config.targetLanguage}
          onChange={(e) => setConfig({ ...config, targetLanguage: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="zh-CN">中文（简体）</option>
          <option value="zh-TW">中文（繁体）</option>
          <option value="en">英语</option>
          <option value="ja">日语</option>
          <option value="ko">韩语</option>
          <option value="fr">法语</option>
          <option value="de">德语</option>
          <option value="es">西班牙语</option>
        </select>
      </div>

      <button
        onClick={handleSaveConfig}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        保存配置
      </button>
    </div>
  );
}

export default SettingsTab;

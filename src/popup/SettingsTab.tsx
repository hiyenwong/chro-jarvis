import { useState, useEffect } from 'react';
import { StorageManager } from '../utils/storage';
import { Config } from '../types';
import { toast } from '../utils/toast';
import { secureStorage, CryptoUtils } from '../utils/secureStorage';

function SettingsTab() {
  const [config, setConfig] = useState<Config>({
    aiProvider: 'deepseek',
    apiKey: '',
    targetLanguage: 'zh-CN'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await StorageManager.getConfig();

      // 尝试从安全存储获取 API Key
      const secureApiKey = await secureStorage.getApiKey(savedConfig.aiProvider);
      if (secureApiKey) {
        savedConfig.apiKey = secureApiKey;
      }

      setConfig(savedConfig);
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  const handleSaveConfig = async () => {
    // 验证 API Key
    if (!config.apiKey.trim()) {
      toast.error('请输入 API Key');
      return;
    }

    // 验证 API Key 格式
    const validation = CryptoUtils.validateApiKey(config.aiProvider, config.apiKey.trim());
    if (!validation.valid) {
      toast.error(validation.error || 'API Key 格式不正确');
      setApiKeyValid(false);
      return;
    }

    setIsSaving(true);
    setApiKeyValid(null);

    try {
      // 保存到安全存储
      await secureStorage.setApiKey(config.aiProvider, config.apiKey.trim());

      // 保存配置（不包含实际 API Key）
      await StorageManager.saveConfig({
        ...config,
        apiKey: '' // 不在普通存储中保存 API Key
      });

      setApiKeyValid(true);
      toast.success('配置已安全保存');
    } catch (error) {
      console.error('保存配置失败:', error);
      setApiKeyValid(false);
      toast.error('保存配置失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApiKeyChange = (value: string) => {
    setConfig({ ...config, apiKey: value });
    setApiKeyValid(null);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">AI 配置</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">AI 供应商</label>
        <select
          value={config.aiProvider}
          onChange={(e) => setConfig({ ...config, aiProvider: e.target.value as 'deepseek' | 'zhipu' | 'volcano' | 'openai' | 'claude' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="deepseek">DeepSeek</option>
          <option value="zhipu">智谱 AI</option>
          <option value="volcano">火山引擎</option>
          <option value="openai">OpenAI</option>
          <option value="claude">Claude</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">API Key</label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={config.apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            className={`w-full px-3 py-2 pr-20 border rounded-md focus:outline-none focus:ring-2 ${
              apiKeyValid === false
                ? 'border-red-500 focus:ring-red-500'
                : apiKeyValid === true
                ? 'border-green-500 focus:ring-green-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="请输入 API Key"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {apiKeyValid === true && (
              <span className="text-green-500" title="API Key 有效">✓</span>
            )}
            {apiKeyValid === false && (
              <span className="text-red-500" title="API Key 无效">✕</span>
            )}
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="text-gray-500 hover:text-gray-700 px-2"
              title={showApiKey ? '隐藏' : '显示'}
            >
              {showApiKey ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          🔒 您的 API Key 将使用 AES-256 加密安全存储
        </p>
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
        disabled={isSaving}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? '保存中...' : '保存配置'}
      </button>
    </div>
  );
}

export default SettingsTab;

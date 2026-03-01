import { Config, ChatHistory } from '../types';
import { secureStorage } from './secureStorage';

export class StorageManager {
  // 获取配置（包含安全存储的 API Key）
  static async getConfig(): Promise<Config> {
    const result = await chrome.storage.sync.get('config');
    const baseConfig = result.config as Config || {
      aiProvider: 'deepseek',
      apiKey: '',
      targetLanguage: 'zh-CN'
    };

    // 从安全存储获取 API Key
    const apiKey = await secureStorage.getApiKey(baseConfig.aiProvider);
    if (apiKey) {
      baseConfig.apiKey = apiKey;
    }

    return baseConfig;
  }

  // 保存配置
  static async saveConfig(config: Config): Promise<void> {
    await chrome.storage.sync.set({ config });
  }

  // 获取标签页的聊天历史
  static async getChatHistory(tabId: number): Promise<ChatHistory['']> {
    const storageKey = `tab_${tabId}`;
    const result = await chrome.storage.local.get(storageKey);
    return result[storageKey] as ChatHistory[''] || {
      url: '',
      title: '',
      history: []
    };
  }

  // 保存标签页的聊天历史
  static async saveChatHistory(tabId: number, history: ChatHistory['']): Promise<void> {
    const storageKey = `tab_${tabId}`;
    await chrome.storage.local.set({ [storageKey]: history });
  }
}

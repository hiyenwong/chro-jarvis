import { Config, ChatHistory } from '../types';

export class StorageManager {
  // 获取配置
  static async getConfig(): Promise<Config> {
    const result = await chrome.storage.sync.get('config');
    return result.config as Config || {
      aiProvider: 'deepseek',
      apiKey: '',
      targetLanguage: 'zh-CN'
    };
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

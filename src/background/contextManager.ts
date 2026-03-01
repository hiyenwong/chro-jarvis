import { TabContext } from '../types';

// 标签页上下文管理器
class TabContextManager {
  private contexts = new Map<number, TabContext>();

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.contexts.delete(tabId);
      this.cleanupStorage(tabId);
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.url && this.contexts.has(tabId)) {
        this.contexts.get(tabId)!.url = changeInfo.url;
        this.contexts.get(tabId)!.title = tab.title || '';
      }
    });
  }

  // 获取或创建标签页上下文
  getContext(tabId: number, tab?: chrome.tabs.Tab): TabContext {
    if (!this.contexts.has(tabId)) {
      this.contexts.set(tabId, {
        url: tab?.url || '',
        title: tab?.title || '',
        history: []
      });
    }
    return this.contexts.get(tabId)!;
  }

  // 清理存储
  private async cleanupStorage(tabId: number) {
    const storageKey = `tab_${tabId}`;
    await chrome.storage.local.remove(storageKey);
  }
}

export const tabContextManager = new TabContextManager();

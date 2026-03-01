/**
 * 快捷键管理
 */

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
}

type ShortcutHandler = (e: KeyboardEvent) => void;

/**
 * 快捷键管理器
 */
class KeyboardManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private listeners: Set<ShortcutHandler> = new Set();

  /**
   * 注册快捷键
   */
  register(shortcut: KeyboardShortcut): () => void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);

    // 返回清理函数
    return () => {
      this.shortcuts.delete(key);
    };
  }

  /**
   * 获取快捷键的唯一标识
   */
  private getShortcutKey(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    if (shortcut.ctrlKey) parts.push('ctrl');
    if (shortcut.shiftKey) parts.push('shift');
    if (shortcut.altKey) parts.push('alt');
    if (shortcut.metaKey) parts.push('meta');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  }

  /**
   * 检查快捷键是否匹配
   */
  private matchesShortcut(e: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    return (
      e.key.toLowerCase() === shortcut.key.toLowerCase() &&
      !!e.ctrlKey === !!shortcut.ctrlKey &&
      !!e.shiftKey === !!shortcut.shiftKey &&
      !!e.altKey === !!shortcut.altKey &&
      !!e.metaKey === !!shortcut.metaKey
    );
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    // 在输入框中不触发快捷键（除非是 Escape）
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      if (e.key !== 'Escape') {
        return;
      }
    }

    // 查找匹配的快捷键
    for (const shortcut of this.shortcuts.values()) {
      if (this.matchesShortcut(e, shortcut)) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  };

  /**
   * 启用快捷键监听
   */
  enable(): void {
    if (typeof window === 'undefined') return;
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 禁用快捷键监听
   */
  disable(): void {
    if (typeof window === 'undefined') return;
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 格式化快捷键显示
   */
  formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.metaKey) parts.push('Cmd');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  }

  /**
   * 获取所有已注册的快捷键
   */
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }
}

/**
 * 默认快捷键管理器实例
 */
export const keyboardManager = new KeyboardManager();

/**
 * React Hook for keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  if (typeof window === 'undefined') return;

  // 注册所有快捷键
  const cleanupFunctions = shortcuts.map(shortcut =>
    keyboardManager.register(shortcut)
  );

  // 启用监听
  keyboardManager.enable();

  // 清理函数
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
    keyboardManager.disable();
  };
}

/**
 * 常用快捷键定义
 */
export const COMMON_SHORTCUTS = {
  // 打开侧边栏
  OPEN_SIDEBAR: {
    key: 'i',
    ctrlKey: true,
    shiftKey: true,
    description: '打开侧边栏',
  } as KeyboardShortcut,

  // 翻译页面
  TRANSLATE_PAGE: {
    key: 't',
    ctrlKey: true,
    shiftKey: true,
    description: '翻译页面',
  } as KeyboardShortcut,

  // 打开设置
  OPEN_SETTINGS: {
    key: ',',
    ctrlKey: true,
    description: '打开设置',
  } as KeyboardShortcut,

  // 关闭弹窗/侧边栏
  CLOSE: {
    key: 'Escape',
    description: '关闭',
  } as KeyboardShortcut,

  // 发送消息
  SEND_MESSAGE: {
    key: 'Enter',
    description: '发送消息（在输入框中）',
  } as KeyboardShortcut,

  // 换行（在输入框中）
  NEW_LINE: {
    key: 'Enter',
    shiftKey: true,
    description: '换行（在输入框中）',
  } as KeyboardShortcut,
};

// 初始化快捷键
if (typeof window !== 'undefined') {
  // 全局快捷键
  keyboardManager.register({
    ...COMMON_SHORTCUTS.OPEN_SIDEBAR,
    action: () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.sidePanel.open({ tabId: tabs[0].id });
        }
      });
    },
  });

  keyboardManager.enable();
}

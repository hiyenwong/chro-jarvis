/**
 * Toast 通知系统
 * 用于显示用户友好的通知消息，替代 alert
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  timestamp: number;
}

/**
 * Toast 通知管理器
 */
class ToastManager {
  private toasts: Map<string, HTMLElement> = new Map();
  private container?: HTMLElement;

  /**
   * 确保容器存在
   */
  private ensureContainer(position: string): void {
    if (this.container) {
      return;
    }

    this.container = document.createElement('div');
    this.container.id = 'chrome-jarvis-toast-container';
    this.container.className = `toast-container ${position}`;

    const positionStyles: Record<string, string> = {
      'top-right': 'top: 20px; right: 20px;',
      'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
      'top-left': 'top: 20px; left: 20px;',
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);',
      'bottom-left': 'bottom: 20px; left: 20px;',
    };

    this.container.style.cssText = `
      position: fixed;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
      ${positionStyles[position] || positionStyles['top-right']}
    `;

    document.body.appendChild(this.container);
  }

  /**
   * 显示 Toast 通知
   */
  show(message: string, options: ToastOptions = {}): string {
    const {
      type = 'info',
      duration = 3000,
      position = 'top-right'
    } = options;

    // 确保 DOM 已准备好
    if (typeof document === 'undefined') {
      console.log('[Toast]', message);
      return '';
    }

    this.ensureContainer(position);

    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast = this.createToastElement(id, type, message);

    this.toasts.set(id, toast);
    this.container?.appendChild(toast);

    // 触发动画
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    // 自动隐藏
    if (duration > 0) {
      setTimeout(() => this.hide(id), duration);
    }

    return id;
  }

  /**
   * 显示成功消息
   */
  success(message: string, options?: Omit<ToastOptions, 'type'>): string {
    return this.show(message, { ...options, type: 'success' });
  }

  /**
   * 显示错误消息
   */
  error(message: string, options?: Omit<ToastOptions, 'type'>): string {
    return this.show(message, { ...options, type: 'error', duration: 5000 });
  }

  /**
   * 显示警告消息
   */
  warning(message: string, options?: Omit<ToastOptions, 'type'>): string {
    return this.show(message, { ...options, type: 'warning' });
  }

  /**
   * 显示信息消息
   */
  info(message: string, options?: Omit<ToastOptions, 'type'>): string {
    return this.show(message, { ...options, type: 'info' });
  }

  /**
   * 隐藏指定 Toast
   */
  hide(id: string): void {
    const toast = this.toasts.get(id);
    if (!toast) return;

    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';

    setTimeout(() => {
      toast.remove();
      this.toasts.delete(id);
    }, 300);
  }

  /**
   * 清除所有 Toast
   */
  clear(): void {
    this.toasts.forEach((_, id) => this.hide(id));
  }

  /**
   * 创建 Toast 元素
   */
  private createToastElement(id: string, type: ToastType, message: string): HTMLElement {
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `chrome-jarvis-toast toast-${type}`;

    const colors: Record<ToastType, { bg: string; text: string; icon: string }> = {
      success: { bg: '#10b981', text: '#ffffff', icon: '✓' },
      error: { bg: '#ef4444', text: '#ffffff', icon: '✕' },
      warning: { bg: '#f59e0b', text: '#ffffff', icon: '⚠' },
      info: { bg: '#3b82f6', text: '#ffffff', icon: 'ℹ' },
    };

    const color = colors[type];

    toast.style.cssText = `
      pointer-events: auto;
      min-width: 280px;
      max-width: 400px;
      background: ${color.bg};
      color: ${color.text};
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
      display: flex;
      align-items: center;
      gap: 12px;
      opacity: 0;
      transform: translateX(100%);
      transition: opacity 0.3s ease, transform 0.3s ease;
      cursor: pointer;
    `;

    toast.innerHTML = `
      <span style="flex-shrink: 0; font-size: 16px;">${color.icon}</span>
      <span style="flex: 1; word-break: break-word;">${this.escapeHtml(message)}</span>
      <button style="
        flex-shrink: 0;
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0;
        font-size: 18px;
        line-height: 1;
        opacity: 0.8;
      " aria-label="关闭">×</button>
    `;

    // 点击关闭按钮
    const closeBtn = toast.querySelector('button');
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hide(id);
    });

    // 点击整个 Toast 关闭
    toast.addEventListener('click', () => this.hide(id));

    return toast;
  }

  /**
   * 转义 HTML
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 导出单例
export const toast = new ToastManager();

// 为了兼容性，也导出一个简单的函数
export function showToast(message: string, options?: ToastOptions): string {
  return toast.show(message, options);
}

export function showSuccess(message: string, options?: Omit<ToastOptions, 'type'>): string {
  return toast.success(message, options);
}

export function showError(message: string, options?: Omit<ToastOptions, 'type'>): string {
  return toast.error(message, options);
}

export function showWarning(message: string, options?: Omit<ToastOptions, 'type'>): string {
  return toast.warning(message, options);
}

export function showInfo(message: string, options?: Omit<ToastOptions, 'type'>): string {
  return toast.info(message, options);
}

import { translator } from '../utils/translator';
import { chunkTranslator, TranslationProgress } from '../utils/chunkTranslator';
import { StorageManager } from '../utils/storage';

// 翻译功能实现
export class PageTranslator {
  private isTranslating = false;
  private currentIndicator?: HTMLElement;

  async translatePage(): Promise<void> {
    if (this.isTranslating) {
      return;
    }

    this.isTranslating = true;

    try {
      // 获取页面内容
      const pageContent = document.body.innerText;

      // 估算是否需要分块翻译（超过 3000 字符使用分块翻译）
      const useChunkTranslation = pageContent.length > 3000;

      if (useChunkTranslation) {
        // 使用分块翻译
        const result = await chunkTranslator.translate(pageContent, (progress) => {
          this.updateTranslationProgress(progress);
        });

        if (result.success && result.translatedText) {
          // 替换页面内容
          document.body.innerText = result.translatedText;
          this.showSuccess();
        } else {
          throw new Error(result.error || '翻译失败');
        }
      } else {
        // 使用普通翻译
        this.showTranslationIndicator();
        await translator.translatePage();
        this.showSuccess();
      }
    } catch (error) {
      console.error('翻译失败:', error);
      const errorMessage = error instanceof Error ? error.message : '翻译失败，请检查 API 配置';
      this.showError(errorMessage);
      throw error; // 重新抛出错误以便上层处理
    } finally {
      this.isTranslating = false;
      this.hideTranslationIndicator();
    }
  }

  async translateSelection(text: string): Promise<string> {
    try {
      const config = await StorageManager.getConfig();
      return await translator.translate(text, config.targetLanguage);
    } catch (error) {
      console.error('翻译失败:', error);
      const errorMessage = error instanceof Error ? error.message : '翻译失败，请检查 API 配置';
      this.showError(errorMessage);
      return errorMessage; // 返回错误信息
    }
  }

  private updateTranslationProgress(progress: TranslationProgress): void {
    if (!this.currentIndicator) {
      this.showTranslationIndicator();
    }

    if (this.currentIndicator) {
      const percentage = Math.round(progress.percentage);
      this.currentIndicator.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="spinner" style="
                width: 14px;
                height: 14px;
                border: 2px solid rgba(255,255,255,0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
              "></div>
              <span>正在翻译页面...</span>
            </div>
            <span style="font-size: 12px;">${percentage}%</span>
          </div>
          <div style="
            width: 100%;
            height: 4px;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
            overflow: hidden;
          ">
            <div style="
              width: ${percentage}%;
              height: 100%;
              background: white;
              border-radius: 2px;
              transition: width 0.3s ease;
            "></div>
          </div>
          <div style="font-size: 11px; opacity: 0.9;">
            ${progress.completedChunks}/${progress.totalChunks} 段落
          </div>
        </div>
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      `;
    }
  }

  private showTranslationIndicator(): void {
    // 如果已存在指示器，先移除
    this.hideTranslationIndicator();

    this.currentIndicator = document.createElement('div');
    this.currentIndicator.id = 'chrome-jarvis-translation-indicator';
    this.currentIndicator.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div class="spinner" style="
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        "></div>
        <span>正在翻译页面...</span>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    this.currentIndicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4f46e5;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
    `;

    document.body.appendChild(this.currentIndicator);
  }

  private showSuccess(): void {
    // 显示成功提示
    const successDiv = document.createElement('div');
    successDiv.id = 'chrome-jarvis-translation-success';
    successDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">✓</span>
        <span>翻译完成</span>
      </div>
    `;
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
    `;

    document.body.appendChild(successDiv);

    // 2秒后自动隐藏
    setTimeout(() => {
      successDiv.remove();
    }, 2000);
  }

  private hideTranslationIndicator(): void {
    if (this.currentIndicator) {
      this.currentIndicator.remove();
      this.currentIndicator = undefined;
    }
    // 也尝试移除旧的指示器（兼容性）
    const indicator = document.getElementById('chrome-jarvis-translation-indicator');
    if (indicator && indicator !== this.currentIndicator) {
      indicator.remove();
    }
  }

  private showError(message: string): void {
    // 移除旧错误
    const oldError = document.getElementById('chrome-jarvis-translation-error');
    if (oldError) {
      oldError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.id = 'chrome-jarvis-translation-error';
    errorDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">⚠️</span>
        <span>${this.escapeHtml(message)}</span>
      </div>
    `;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 300px;
    `;

    document.body.appendChild(errorDiv);

    // 5秒后自动隐藏错误信息
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export const pageTranslator = new PageTranslator();

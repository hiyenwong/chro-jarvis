import { createAiProvider, AiProvider } from './aiApi';
import { StorageManager } from './storage';
import { TokenTracker } from './tokenTracker';
import { errorHandler, ApiError } from './errorHandler';

export class Translator {
  private provider?: AiProvider;

  async initialize(): Promise<void> {
    const config = await StorageManager.getConfig();
    this.provider = createAiProvider(config);
  }

  async translate(text: string, targetLang: string): Promise<string> {
    if (!this.provider) {
      await this.initialize();
    }

    if (!this.provider) {
      throw new Error('无法初始化翻译服务');
    }

    try {
      const response = await this.provider.translate(text, targetLang);

      // 记录 token 使用情况
      await TokenTracker.recordUsage(
        this.provider.getProviderName(),
        this.provider.getModelName(),
        'translate',
        response.usage,
        {
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          title: typeof document !== 'undefined' ? document.title : undefined
        }
      );

      return response.content;
    } catch (error) {
      if (error instanceof ApiError) {
        const userMessage = errorHandler.getUserFriendlyMessage(error);
        errorHandler.logError(error, { action: 'translate', textLength: text.length });
        throw new Error(userMessage);
      }
      throw error;
    }
  }

  async translatePage(): Promise<void> {
    // 获取当前页面的所有文本内容
    const pageContent = document.body.innerText;
    const config = await StorageManager.getConfig();

    // 翻译页面内容
    const translatedContent = await this.translate(pageContent, config.targetLanguage);

    // 替换页面内容
    document.body.innerText = translatedContent;
  }
}

export const translator = new Translator();

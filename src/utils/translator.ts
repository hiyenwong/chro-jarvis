import { createAiProvider } from './aiApi';
import { StorageManager } from './storage';
import { TokenTracker } from './tokenTracker';

export class Translator {
  private provider: any;

  async initialize(): Promise<void> {
    const config = await StorageManager.getConfig();
    this.provider = createAiProvider(config);
  }

  async translate(text: string, targetLang: string): Promise<string> {
    if (!this.provider) {
      await this.initialize();
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
      console.error('翻译失败:', error);
      return '翻译失败，请检查 API 配置';
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

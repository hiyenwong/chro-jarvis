import { translator } from '../utils/translator';

// 翻译功能实现
export class PageTranslator {
  private isTranslating = false;

  async translatePage(): Promise<void> {
    if (this.isTranslating) {
      return;
    }

    this.isTranslating = true;

    try {
      await translator.translatePage();
    } catch (error) {
      console.error('翻译失败:', error);
    } finally {
      this.isTranslating = false;
    }
  }

  async translateSelection(text: string): Promise<string> {
    try {
      return await translator.translate(text, 'zh-CN');
    } catch (error) {
      console.error('翻译失败:', error);
      return '翻译失败，请检查 API 配置';
    }
  }
}

export const pageTranslator = new PageTranslator();

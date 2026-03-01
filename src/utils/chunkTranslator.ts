import { translator } from './translator';
import { StorageManager } from './storage';
import { toast } from './toast';

/**
 * 分块翻译配置
 */
interface ChunkTranslationConfig {
  maxChunkSize: number; // 每块最大字符数
  chunkOverlap: number; // 块之间重叠字符数
  delayBetweenChunks: number; // 块之间延迟（毫秒）
  maxConcurrent: number; // 最大并发数
}

/**
 * 翻译进度信息
 */
export interface TranslationProgress {
  totalChunks: number;
  completedChunks: number;
  currentChunk: number;
  percentage: number;
  isProcessing: boolean;
}

/**
 * 翻译进度回调
 */
type ProgressCallback = (progress: TranslationProgress) => void;

/**
 * 文本块
 */
interface TextChunk {
  id: number;
  text: string;
  translated?: string;
  error?: string;
}

/**
 * 分块翻译器
 * 用于处理大型页面的翻译，提供进度显示和错误恢复
 */
export class ChunkTranslator {
  private config: ChunkTranslationConfig;
  private abortController?: AbortController;
  private isTranslating = false;

  constructor(config: Partial<ChunkTranslationConfig> = {}) {
    this.config = {
      maxChunkSize: config.maxChunkSize || 2000,
      chunkOverlap: config.chunkOverlap || 100,
      delayBetweenChunks: config.delayBetweenChunks || 500,
      maxConcurrent: config.maxConcurrent || 1,
    };
  }

  /**
   * 取消翻译
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined;
    }
    this.isTranslating = false;
  }

  /**
   * 检查是否正在翻译
   */
  isActive(): boolean {
    return this.isTranslating;
  }

  /**
   * 分割文本为块
   */
  private splitIntoChunks(text: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    const { maxChunkSize, chunkOverlap } = this.config;

    // 按段落分割
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) continue;

      // 如果单个段落超过最大块大小，需要进一步分割
      if (trimmedParagraph.length > maxChunkSize) {
        // 先保存当前块
        if (currentChunk) {
          chunks.push({ id: chunkIndex++, text: currentChunk.trim() });
          currentChunk = '';
        }

        // 分割长段落
        let remainingText = trimmedParagraph;
        while (remainingText.length > 0) {
          const splitPoint = Math.min(maxChunkSize, remainingText.length);

          // 尝试在句子边界分割
          let safeSplitPoint = splitPoint;
          const lastPeriod = remainingText.lastIndexOf('。', splitPoint);
          const lastExclamation = remainingText.lastIndexOf('！', splitPoint);
          const lastQuestion = remainingText.lastIndexOf('？', splitPoint);
          const lastDot = remainingText.lastIndexOf('.', splitPoint);

          safeSplitPoint = Math.max(lastPeriod, lastExclamation, lastQuestion, lastDot);
          if (safeSplitPoint <= 0) {
            safeSplitPoint = splitPoint;
          } else {
            safeSplitPoint += 1; // 包含标点符号
          }

          chunks.push({ id: chunkIndex++, text: remainingText.slice(0, safeSplitPoint) });
          remainingText = remainingText.slice(safeSplitPoint);
        }

        // 添加重叠文本到下一块
        if (remainingText.length > 0 && chunkOverlap > 0) {
          currentChunk = remainingText.slice(-chunkOverlap);
        }
      } else {
        // 检查添加此段落后是否会超过块大小
        const newChunk = currentChunk + (currentChunk ? '\n\n' : '') + trimmedParagraph;

        if (newChunk.length > maxChunkSize && currentChunk) {
          // 保存当前块
          chunks.push({ id: chunkIndex++, text: currentChunk.trim() });

          // 新块以重叠内容开始
          if (chunkOverlap > 0) {
            const lastParagraphs = currentChunk.split('\n\n');
            const overlapText = lastParagraphs[lastParagraphs.length - 1];
            currentChunk = overlapText.slice(-chunkOverlap) + '\n\n' + trimmedParagraph;
          } else {
            currentChunk = trimmedParagraph;
          }
        } else {
          currentChunk = newChunk;
        }
      }
    }

    // 保存最后一块
    if (currentChunk.trim()) {
      chunks.push({ id: chunkIndex++, text: currentChunk.trim() });
    }

    return chunks;
  }

  /**
   * 翻译单个块
   */
  private async translateChunk(chunk: TextChunk, targetLang: string): Promise<TextChunk> {
    try {
      const translated = await translator.translate(chunk.text, targetLang);
      return { ...chunk, translated };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '翻译失败';
      return { ...chunk, error: errorMessage };
    }
  }

  /**
   * 延迟执行
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 翻译所有块
   */
  private async translateChunks(
    chunks: TextChunk[],
    targetLang: string,
    onProgress?: ProgressCallback
  ): Promise<TextChunk[]> {
    const results: TextChunk[] = new Array(chunks.length);
    let completedCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      // 检查是否已取消
      if (this.abortController?.signal.aborted) {
        throw new Error('翻译已取消');
      }

      // 更新进度
      onProgress?.({
        totalChunks: chunks.length,
        completedChunks: completedCount,
        currentChunk: i + 1,
        percentage: (completedCount / chunks.length) * 100,
        isProcessing: true,
      });

      // 翻译当前块
      const result = await this.translateChunk(chunks[i], targetLang);
      results[i] = result;
      completedCount++;

      // 更新进度
      onProgress?.({
        totalChunks: chunks.length,
        completedChunks: completedCount,
        currentChunk: i + 1,
        percentage: (completedCount / chunks.length) * 100,
        isProcessing: i < chunks.length - 1,
      });

      // 延迟以避免速率限制
      if (i < chunks.length - 1) {
        await this.delay(this.config.delayBetweenChunks);
      }
    }

    return results;
  }

  /**
   * 合并翻译结果
   */
  private mergeChunks(chunks: TextChunk[]): string {
    return chunks
      .filter(chunk => chunk.translated)
      .map(chunk => chunk.translated!)
      .join('\n\n');
  }

  /**
   * 翻译大型文本
   */
  async translate(
    text: string,
    onProgress?: ProgressCallback
  ): Promise<{ success: boolean; translatedText?: string; error?: string }> {
    if (this.isTranslating) {
      return { success: false, error: '已有翻译任务正在进行中' };
    }

    this.isTranslating = true;
    this.abortController = new AbortController();

    try {
      // 获取目标语言
      const config = await StorageManager.getConfig();

      // 分割文本
      const chunks = this.splitIntoChunks(text);

      if (chunks.length === 0) {
        return { success: false, error: '没有需要翻译的内容' };
      }

      // 翻译所有块
      const results = await this.translateChunks(chunks, config.targetLanguage, onProgress);

      // 检查是否有错误
      const failedChunks = results.filter(chunk => chunk.error);
      if (failedChunks.length > 0) {
        console.warn(`${failedChunks.length} 个块翻译失败`);
      }

      // 合并结果
      const translatedText = this.mergeChunks(results);

      return {
        success: true,
        translatedText,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '翻译失败';
      return { success: false, error: errorMessage };
    } finally {
      this.isTranslating = false;
      this.abortController = undefined;
    }
  }

  /**
   * 估算翻译时间
   */
  estimateTime(textLength: number): number {
    const chunks = Math.ceil(textLength / this.config.maxChunkSize);
    const avgTimePerChunk = 2000; // 假设每块需要 2 秒
    return chunks * avgTimePerChunk + (chunks - 1) * this.config.delayBetweenChunks;
  }
}

/**
 * 默认分块翻译器实例
 */
export const chunkTranslator = new ChunkTranslator();

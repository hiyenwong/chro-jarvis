import { ApiResponse, AiProvider } from './aiApi';
import { AiProvider as TokenAiProvider } from '../types/tokenUsage';
import { errorHandler, ApiError } from './errorHandler';

/**
 * AI 提供商基础抽象类
 */
export abstract class BaseAiProvider implements AiProvider {
  protected abstract readonly modelName: string;
  protected abstract readonly apiEndpoint: string;
  protected readonly requestTimeout = 30000; // 30秒超时

  constructor(protected apiKey: string) {}

  abstract getProviderName(): TokenAiProvider;

  getModelName(): string {
    return this.modelName;
  }

  /**
   * 通用 API 调用方法
   */
  protected async makeApiCall(messages: { role: string; content: string }[]): Promise<ApiResponse> {
    return errorHandler.withRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      try {
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(this.getRequestBody(messages)),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await this.safeParseJson(response);
          throw errorHandler.parseApiError(response, errorData);
        }

        const data = await response.json();

        return this.parseResponse(data);
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
          throw error;
        }

        if (error instanceof Error) {
          throw errorHandler.parseNetworkError(error);
        }

        throw new ApiError(
          'unknown' as any,
          error instanceof Error ? error.message : '未知错误'
        );
      }
    });
  }

  /**
   * 获取请求头（子类可覆盖）
   */
  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  /**
   * 获取请求体（子类可覆盖）
   */
  protected getRequestBody(messages: { role: string; content: string }[]): Record<string, any> {
    return {
      model: this.modelName,
      messages,
    };
  }

  /**
   * 解析响应（子类可覆盖）
   */
  protected parseResponse(data: any): ApiResponse {
    const usage = data.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    return {
      content: data.choices[0].message.content,
      usage,
      model: this.modelName,
    };
  }

  /**
   * 安全解析 JSON
   */
  private async safeParseJson(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  /**
   * 生成答案
   */
  async generateAnswer(question: string, context: string): Promise<ApiResponse> {
    return this.makeApiCall([
      {
        role: 'system',
        content: '你是一个智能助手，根据用户提供的上下文回答问题。',
      },
      {
        role: 'user',
        content: `上下文: ${context}\n问题: ${question}`,
      },
    ]);
  }

  /**
   * 翻译
   */
  async translate(text: string, targetLang: string): Promise<ApiResponse> {
    return this.makeApiCall([
      {
        role: 'system',
        content: `你是一个翻译助手，将用户提供的文本翻译成${targetLang}。`,
      },
      {
        role: 'user',
        content: text,
      },
    ]);
  }
}

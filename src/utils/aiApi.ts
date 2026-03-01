import { Config } from '../types';
import { ApiUsage, AiProvider as TokenAiProvider } from '../types/tokenUsage';
import { BaseAiProvider } from './baseAiProvider';

/**
 * API 调用响应（包含内容和使用信息）
 */
export interface ApiResponse {
  content: string;
  usage: ApiUsage;
  model: string;
}

export interface AiProvider {
  generateAnswer: (question: string, context: string) => Promise<ApiResponse>;
  translate: (text: string, targetLang: string) => Promise<ApiResponse>;
  /** 获取 provider 名称 */
  getProviderName: () => TokenAiProvider;
  /** 获取模型名称 */
  getModelName: () => string;
}

export class DeepSeekProvider extends BaseAiProvider {
  protected readonly modelName = 'deepseek-chat';
  protected readonly apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';

  getProviderName(): TokenAiProvider {
    return 'deepseek';
  }
}

export class ZhipuProvider extends BaseAiProvider {
  protected readonly modelName = 'glm-4';
  protected readonly apiEndpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

  getProviderName(): TokenAiProvider {
    return 'zhipu';
  }
}

export class VolcanoProvider extends BaseAiProvider {
  protected readonly modelName = 'ep-20250526153619-ux4h1';
  protected readonly apiEndpoint = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

  getProviderName(): TokenAiProvider {
    return 'volcano';
  }
}

export class OpenAIProvider extends BaseAiProvider {
  protected readonly modelName = 'gpt-3.5-turbo';
  protected readonly apiEndpoint = 'https://api.openai.com/v1/chat/completions';

  getProviderName(): TokenAiProvider {
    return 'openai';
  }
}

export class ClaudeProvider extends BaseAiProvider {
  protected readonly modelName = 'claude-3-sonnet-20250219';
  protected readonly apiEndpoint = 'https://api.anthropic.com/v1/messages';

  getProviderName(): TokenAiProvider {
    return 'claude';
  }

  /**
   * Claude API 使用不同的请求头格式
   */
  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
    };
  }

  /**
   * Claude API 使用不同的请求体格式
   */
  protected getRequestBody(messages: { role: string; content: string }[]): Record<string, any> {
    return {
      model: this.modelName,
      messages,
      max_tokens: 4096,
    };
  }

  /**
   * Claude API 使用不同的响应格式
   */
  protected parseResponse(data: any): ApiResponse {
    const usage = data.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    return {
      content: data.content?.[0]?.text || '',
      usage,
      model: this.modelName,
    };
  }
}

// 工厂函数
export function createAiProvider(config: Config): AiProvider {
  switch (config.aiProvider) {
    case 'deepseek':
      return new DeepSeekProvider(config.apiKey);
    case 'zhipu':
      return new ZhipuProvider(config.apiKey);
    case 'volcano':
      return new VolcanoProvider(config.apiKey);
    case 'openai':
      return new OpenAIProvider(config.apiKey);
    case 'claude':
      return new ClaudeProvider(config.apiKey);
    default:
      throw new Error('Unsupported AI provider');
  }
}

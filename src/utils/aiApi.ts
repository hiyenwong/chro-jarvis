import { Config } from '../types';
import { ApiUsage, DEFAULT_PRICES } from '../types/tokenUsage';

/**
 * API 调用响应（包含内容和使用信息）
 */
export interface ApiResponse {
  content: string;
  usage: ApiUsage;
  model: string;
}

/**
 * 计算 token 成本
 */
function calculateCost(
  usage: ApiUsage,
  provider: string,
  model: string
): number {
  const priceConfig = DEFAULT_PRICES.find(
    (p) => p.provider === provider && p.model === model
  );

  if (!priceConfig) {
    return 0;
  }

  const promptCost = (usage.prompt_tokens / 1000) * priceConfig.promptPrice;
  const completionCost = (usage.completion_tokens / 1000) * priceConfig.completionPrice;

  return promptCost + completionCost;
}

export interface AiProvider {
  generateAnswer: (question: string, context: string) => Promise<ApiResponse>;
  translate: (text: string, targetLang: string) => Promise<ApiResponse>;
  /** 获取 provider 名称 */
  getProviderName: () => string;
  /** 获取模型名称 */
  getModelName: () => string;
}

export class DeepSeekProvider implements AiProvider {
  private apiKey: string;
  private readonly modelName = 'deepseek-chat';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getProviderName(): string {
    return 'deepseek';
  }

  getModelName(): string {
    return this.modelName;
  }

  async generateAnswer(question: string, context: string): Promise<ApiResponse> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: 'system', content: '你是一个智能助手，根据用户提供的上下文回答问题。' },
          { role: 'user', content: `上下文: ${context}\n问题: ${question}` }
        ]
      })
    });

    const data = await response.json();
    const usage: ApiUsage = data.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    };

    return {
      content: data.choices[0].message.content,
      usage,
      model: this.modelName
    };
  }

  async translate(text: string, targetLang: string): Promise<ApiResponse> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: 'system', content: `你是一个翻译助手，将用户提供的文本翻译成${targetLang}。` },
          { role: 'user', content: text }
        ]
      })
    });

    const data = await response.json();
    const usage: ApiUsage = data.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    };

    return {
      content: data.choices[0].message.content,
      usage,
      model: this.modelName
    };
  }
}

export class ZhipuProvider implements AiProvider {
  private apiKey: string;
  private readonly modelName = 'glm-4';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getProviderName(): string {
    return 'zhipu';
  }

  getModelName(): string {
    return this.modelName;
  }

  async generateAnswer(question: string, context: string): Promise<ApiResponse> {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: 'system', content: '你是一个智能助手，根据用户提供的上下文回答问题。' },
          { role: 'user', content: `上下文: ${context}\n问题: ${question}` }
        ]
      })
    });

    const data = await response.json();
    const usage: ApiUsage = data.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    };

    return {
      content: data.choices[0].message.content,
      usage,
      model: this.modelName
    };
  }

  async translate(text: string, targetLang: string): Promise<ApiResponse> {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: 'system', content: `你是一个翻译助手，将用户提供的文本翻译成${targetLang}。` },
          { role: 'user', content: text }
        ]
      })
    });

    const data = await response.json();
    const usage: ApiUsage = data.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    };

    return {
      content: data.choices[0].message.content,
      usage,
      model: this.modelName
    };
  }
}

export class VolcanoProvider implements AiProvider {
  private apiKey: string;
  private readonly modelName = 'ep-20250526153619-ux4h1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getProviderName(): string {
    return 'volcano';
  }

  getModelName(): string {
    return this.modelName;
  }

  async generateAnswer(question: string, context: string): Promise<ApiResponse> {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: 'system', content: '你是一个智能助手，根据用户提供的上下文回答问题。' },
          { role: 'user', content: `上下文: ${context}\n问题: ${question}` }
        ]
      })
    });

    const data = await response.json();
    const usage: ApiUsage = data.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    };

    return {
      content: data.choices[0].message.content,
      usage,
      model: this.modelName
    };
  }

  async translate(text: string, targetLang: string): Promise<ApiResponse> {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: 'system', content: `你是一个翻译助手，将用户提供的文本翻译成${targetLang}。` },
          { role: 'user', content: text }
        ]
      })
    });

    const data = await response.json();
    const usage: ApiUsage = data.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    };

    return {
      content: data.choices[0].message.content,
      usage,
      model: this.modelName
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
    default:
      throw new Error('Unsupported AI provider');
  }
}

// 导出成本计算函数（供外部使用）
export { calculateCost };

import { AiProvider, RequestType } from '../types/tokenUsage';

/**
 * 通用工具函数类
 */
export class CommonUtils {
  /**
   * 生成唯一标识符
   */
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 格式化日期为 YYYY-MM-DD 格式
   */
  static formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 计算 Token 使用成本
   */
  static calculateCost(
    usage: { prompt_tokens: number; completion_tokens: number },
    provider: AiProvider,
    model: string
  ): number {
    const DEFAULT_PRICES = [
      // DeepSeek
      {
        provider: 'deepseek' as AiProvider,
        model: 'deepseek-chat',
        promptPrice: 0.001,
        completionPrice: 0.002,
      },
      // 智谱 AI
      {
        provider: 'zhipu' as AiProvider,
        model: 'glm-4',
        promptPrice: 0.01,
        completionPrice: 0.01,
      },
      // 火山引擎（Doubao）
      {
        provider: 'volcano' as AiProvider,
        model: 'ep-20250526153619-ux4h1',
        promptPrice: 0.004,
        completionPrice: 0.009,
      },
      // OpenAI
      {
        provider: 'openai' as AiProvider,
        model: 'gpt-3.5-turbo',
        promptPrice: 0.0015,
        completionPrice: 0.002,
      },
      // Claude
      {
        provider: 'claude' as AiProvider,
        model: 'claude-3-sonnet-20250219',
        promptPrice: 0.0011,
        completionPrice: 0.0032,
      },
    ];

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

  /**
   * 格式化成本显示
   */
  static formatCost(cost: number): string {
    if (cost < 0.01) {
      return `¥${(cost * 100).toFixed(2)} 分`;
    }
    return `¥${cost.toFixed(4)}`;
  }

  /**
   * 格式化 Token 数量
   */
  static formatTokenCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(2)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(2)}K`;
    }
    return count.toString();
  }

  /**
   * 获取提供商显示名称
   */
  static getProviderDisplayName(provider: AiProvider): string {
    const names: Record<AiProvider, string> = {
      deepseek: 'DeepSeek',
      zhipu: '智谱 AI',
      volcano: '火山引擎',
      openai: 'OpenAI',
      claude: 'Claude',
    };
    return names[provider] || provider;
  }

  /**
   * 获取请求类型显示名称
   */
  static getRequestTypeName(type: RequestType): string {
    const names: Record<RequestType, string> = {
      chat: '问答',
      translate: '翻译',
    };
    return names[type] || type;
  }
}

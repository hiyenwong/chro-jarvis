/**
 * Token 使用类型定义
 */

/**
 * AI 提供商
 */
export type AiProvider = 'deepseek' | 'zhipu' | 'volcano' | 'openai' | 'claude';

/**
 * 请求类型
 */
export type RequestType = 'chat' | 'translate';

/**
 * API 返回的 token 使用信息
 */
export interface ApiUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/**
 * Token 使用记录
 */
export interface TokenUsageRecord {
  id: string;
  timestamp: number;
  provider: AiProvider;
  model: string;
  requestType: RequestType;
  usage: ApiUsage;
  // 成本信息（单位：元）
  cost?: number;
  // 元数据
  metadata?: {
    tabId?: number;
    url?: string;
    title?: string;
  };
}

/**
 * 时间范围
 */
export type TimeRange = 'today' | 'week' | 'month' | 'all';

/**
 * Token 统计摘要（按 provider/model 分组）
 */
export interface TokenStatistics {
  provider: AiProvider;
  model: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  requestCount: number;
  totalCost: number;
}

/**
 * Token 汇总（按时间范围）
 */
export interface TokenSummary {
  timeRange: TimeRange;
  startTime: number;
  endTime: number;
  totalTokens: number;
  totalCost: number;
  statistics: TokenStatistics[];
  // 趋势数据（按天）
  trendData: TrendDataPoint[];
}

/**
 * 趋势数据点
 */
export interface TrendDataPoint {
  date: string; // YYYY-MM-DD 格式
  totalTokens: number;
  totalCost: number;
}

/**
 * Token 价格配置（单位：元/1K tokens）
 * 不同 provider 的不同 model 价格
 */
export interface TokenPrice {
  provider: AiProvider;
  model: string;
  promptPrice: number;  // input 价格
  completionPrice: number;  // output 价格
}

/**
 * 默认价格配置（基于 2025 年的市场价格）
 * 价格单位：元 / 1K tokens
 */
export const DEFAULT_PRICES: TokenPrice[] = [
  // DeepSeek
  {
    provider: 'deepseek',
    model: 'deepseek-chat',
    promptPrice: 0.001,    // 1 元/1M tokens
    completionPrice: 0.002, // 2 元/1M tokens
  },
  // 智谱 AI
  {
    provider: 'zhipu',
    model: 'glm-4',
    promptPrice: 0.01,     // 10 元/1M tokens
    completionPrice: 0.01,  // 10 元/1M tokens
  },
  // 火山引擎（Doubao）
  {
    provider: 'volcano',
    model: 'ep-20250526153619-ux4h1',
    promptPrice: 0.004,    // 4 元/1M tokens
    completionPrice: 0.009, // 9 元/1M tokens
  },
  // OpenAI
  {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    promptPrice: 0.0015,   // 1.5 元/1M tokens
    completionPrice: 0.002, // 2 元/1M tokens
  },
  // Claude
  {
    provider: 'claude',
    model: 'claude-3-sonnet-20250219',
    promptPrice: 0.0011,   // 1.1 元/1M tokens
    completionPrice: 0.0032, // 3.2 元/1M tokens
  },
];

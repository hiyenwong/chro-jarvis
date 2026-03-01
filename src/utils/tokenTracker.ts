import { ApiUsage, AiProvider, RequestType, TokenUsageRecord, TokenSummary, TokenStatistics, TrendDataPoint } from '../types/tokenUsage';
import { CommonUtils } from './commonUtils';

/**
 * 存储键
 */
const STORAGE_KEY_TOKEN_RECORDS = 'token-usage-records';

/**
 * Token 追踪管理器
 */
export class TokenTracker {
  /**
   * 记录一次 API 调用的 token 使用
   */
  static async recordUsage(
    provider: AiProvider,
    model: string,
    requestType: RequestType,
    usage: ApiUsage,
    metadata?: {
      tabId?: number;
      url?: string;
      title?: string;
    }
  ): Promise<void> {
    const records = await this.getAllRecords();

    const record: TokenUsageRecord = {
      id: CommonUtils.generateId(),
      timestamp: Date.now(),
      provider,
      model,
      requestType,
      usage,
      cost: CommonUtils.calculateCost(usage, provider, model),
      metadata
    };

    records.push(record);

    // 限制记录数量，最多保留 1000 条
    if (records.length > 1000) {
      records.splice(0, records.length - 1000);
    }

    await chrome.storage.local.set({
      [STORAGE_KEY_TOKEN_RECORDS]: records
    });
  }

  /**
   * 获取所有记录
   */
  static async getAllRecords(): Promise<TokenUsageRecord[]> {
    const result = await chrome.storage.local.get(STORAGE_KEY_TOKEN_RECORDS);
    return (result[STORAGE_KEY_TOKEN_RECORDS] as TokenUsageRecord[]) || [];
  }

  /**
   * 根据时间范围过滤记录
   */
  static filterByTimeRange(records: TokenUsageRecord[], range: 'today' | 'week' | 'month' | 'all'): TokenUsageRecord[] {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    let startTime: number;
    switch (range) {
      case 'today': {
        // 今天 00:00:00
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startTime = today.getTime();
        break;
      }
      case 'week':
        startTime = now - 7 * dayMs;
        break;
      case 'month':
        startTime = now - 30 * dayMs;
        break;
      case 'all':
      default:
        return records;
    }

    return records.filter((r) => r.timestamp >= startTime);
  }

  /**
   * 获取统计摘要
   */
  static async getSummary(timeRange: 'today' | 'week' | 'month' | 'all' = 'all'): Promise<TokenSummary> {
    const allRecords = await this.getAllRecords();
    const filteredRecords = this.filterByTimeRange(allRecords, timeRange);

    // 计算时间范围
    const now = Date.now();
    let startTime = 0;
    if (filteredRecords.length > 0) {
      startTime = Math.min(...filteredRecords.map((r) => r.timestamp));
    }

    // 计算趋势数据
    const trendData = this.calculateTrendData(filteredRecords);

    // 按 provider/model 分组统计
    const statsMap = new Map<string, TokenStatistics>();

    for (const record of filteredRecords) {
      const key = `${record.provider}:${record.model}`;

      if (!statsMap.has(key)) {
        statsMap.set(key, {
          provider: record.provider,
          model: record.model,
          totalTokens: 0,
          promptTokens: 0,
          completionTokens: 0,
          requestCount: 0,
          totalCost: 0
        });
      }

      const stats = statsMap.get(key)!;
      stats.totalTokens += record.usage.total_tokens;
      stats.promptTokens += record.usage.prompt_tokens;
      stats.completionTokens += record.usage.completion_tokens;
      stats.requestCount += 1;
      stats.totalCost += record.cost || 0;
    }

    // 计算 totals
    let totalTokens = 0;
    let totalCost = 0;
    for (const stats of statsMap.values()) {
      totalTokens += stats.totalTokens;
      totalCost += stats.totalCost;
    }

    return {
      timeRange,
      startTime,
      endTime: now,
      totalTokens,
      totalCost,
      statistics: Array.from(statsMap.values()),
      trendData
    };
  }

  /**
   * 计算趋势数据（按天）
   */
  private static calculateTrendData(records: TokenUsageRecord[]): TrendDataPoint[] {
    const dailyMap = new Map<string, { tokens: number; cost: number }>();

    for (const record of records) {
      const date = new Date(record.timestamp);
      const dateKey = CommonUtils.formatDateKey(date);

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { tokens: 0, cost: 0 });
      }

      const data = dailyMap.get(dateKey)!;
      data.tokens += record.usage.total_tokens;
      data.cost += record.cost || 0;
    }

    // 转换为数组并排序
    const result: TrendDataPoint[] = [];
    for (const [date, data] of dailyMap) {
      result.push({
        date,
        totalTokens: data.tokens,
        totalCost: data.cost
      });
    }

    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  }

  /**
   * 清空所有记录
   */
  static async clearAllRecords(): Promise<void> {
    await chrome.storage.local.remove(STORAGE_KEY_TOKEN_RECORDS);
  }

  /**
   * 清空指定时间范围之前的记录
   */
  static async clearOldRecords(olderThanDays: number): Promise<void> {
    const records = await this.getAllRecords();
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    const filteredRecords = records.filter((r) => r.timestamp >= cutoffTime);

    await chrome.storage.local.set({
      [STORAGE_KEY_TOKEN_RECORDS]: filteredRecords
    });
  }

  /**
   * 导出记录为 JSON
   */
  static async exportRecords(): Promise<string> {
    const records = await this.getAllRecords();
    return JSON.stringify(records, null, 2);
  }

  /**
   * 导入记录
   */
  static async importRecords(jsonData: string): Promise<void> {
    const records = JSON.parse(jsonData) as TokenUsageRecord[];
    await chrome.storage.local.set({
      [STORAGE_KEY_TOKEN_RECORDS]: records
    });
  }

  /**
   * 格式化成本显示
   */
  static formatCost(cost: number): string {
    return CommonUtils.formatCost(cost);
  }

  /**
   * 格式化 token 数量
   */
  static formatTokenCount(count: number): string {
    return CommonUtils.formatTokenCount(count);
  }

  /**
   * 获取 Provider 显示名称
   */
  static getProviderDisplayName(provider: AiProvider): string {
    return CommonUtils.getProviderDisplayName(provider);
  }

  /**
   * 获取请求类型显示名称
   */
  static getRequestTypeName(type: RequestType): string {
    return CommonUtils.getRequestTypeName(type);
  }
}

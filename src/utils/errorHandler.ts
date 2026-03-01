/**
 * 统一错误处理和重试机制
 */

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'network',
  API = 'api',
  AUTH = 'auth',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

/**
 * 自定义错误类
 */
export class ApiError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 用户友好的错误消息映射
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: '网络连接失败，请检查网络设置',
  [ErrorType.API]: 'API 服务暂时不可用',
  [ErrorType.AUTH]: 'API 密钥无效，请检查配置',
  [ErrorType.RATE_LIMIT]: '请求过于频繁，请稍后再试',
  [ErrorType.TIMEOUT]: '请求超时，请重试',
  [ErrorType.UNKNOWN]: '发生未知错误',
};

/**
 * 重试配置
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: ErrorType[];
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: [ErrorType.NETWORK, ErrorType.RATE_LIMIT, ErrorType.TIMEOUT],
};

/**
 * 错误处理器类
 */
export class ErrorHandler {
  private retryConfig: RetryConfig;

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * 解析 API 响应错误
   */
  parseApiError(response: Response, data?: any): ApiError {
    const statusCode = response.status;

    // 网络错误
    if (!statusCode) {
      return new ApiError(ErrorType.NETWORK, '网络连接失败', undefined, true);
    }

    // 认证错误
    if (statusCode === 401 || statusCode === 403) {
      return new ApiError(
        ErrorType.AUTH,
        data?.error?.message || 'API 密钥无效',
        statusCode,
        false
      );
    }

    // 速率限制
    if (statusCode === 429) {
      return new ApiError(
        ErrorType.RATE_LIMIT,
        '请求过于频繁',
        statusCode,
        true
      );
    }

    // 服务器错误
    if (statusCode >= 500) {
      return new ApiError(
        ErrorType.API,
        '服务器错误',
        statusCode,
        true
      );
    }

    // 其他错误
    return new ApiError(
      ErrorType.API,
      data?.error?.message || `API 错误 (${statusCode})`,
      statusCode,
      false
    );
  }

  /**
   * 解析网络错误
   */
  parseNetworkError(error: Error): ApiError {
    // 超时错误
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return new ApiError(ErrorType.TIMEOUT, '请求超时', undefined, true);
    }

    // 其他网络错误
    return new ApiError(ErrorType.NETWORK, error.message, undefined, true);
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserFriendlyMessage(error: ApiError): string {
    return ERROR_MESSAGES[error.type] || error.message;
  }

  /**
   * 计算重试延迟
   */
  private calculateDelay(attempt: number): number {
    const delay = this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * 带重试的异步操作执行
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    onRetry?: (attempt: number, error: ApiError) => void
  ): Promise<T> {
    let lastError: ApiError | undefined;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const apiError = error instanceof ApiError ? error : new ApiError(
          ErrorType.UNKNOWN,
          error instanceof Error ? error.message : '未知错误'
        );

        lastError = apiError;

        // 如果不可重试或已达最大重试次数，抛出错误
        if (!this.isRetryable(apiError) || attempt >= this.retryConfig.maxRetries) {
          throw apiError;
        }

        // 通知重试
        onRetry?.(attempt + 1, apiError);

        // 等待后重试
        await this.delay(this.calculateDelay(attempt));
      }
    }

    throw lastError || new ApiError(ErrorType.UNKNOWN, '操作失败');
  }

  /**
   * 判断错误是否可重试
   */
  private isRetryable(error: ApiError): boolean {
    return error.retryable && this.retryConfig.retryableErrors.includes(error.type);
  }

  /**
   * 延迟执行
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 记录错误
   */
  logError(error: ApiError, context?: Record<string, any>): void {
    const errorLog = {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      timestamp: Date.now(),
      context,
    };

    console.error('[API Error]', errorLog);

    // 可以在这里添加错误上报逻辑
    // 例如发送到分析服务或保存到本地存储
  }
}

/**
 * 默认错误处理器实例
 */
export const errorHandler = new ErrorHandler();

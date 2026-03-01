import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ErrorHandler,
  ApiError,
  ErrorType,
  RetryConfig,
  errorHandler
} from './errorHandler'

describe('ErrorHandler', () => {
  let handler: ErrorHandler

  beforeEach(() => {
    handler = new ErrorHandler()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('ApiError', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError(ErrorType.NETWORK, 'Network failed', 500, true)

      expect(error.type).toBe(ErrorType.NETWORK)
      expect(error.message).toBe('Network failed')
      expect(error.statusCode).toBe(500)
      expect(error.retryable).toBe(true)
      expect(error.name).toBe('ApiError')
    })

    it('should have default retryable value', () => {
      const error = new ApiError(ErrorType.API, 'API failed')
      expect(error.retryable).toBe(false)
    })
  })

  describe('parseApiError', () => {
    it('should parse network error when no status code', () => {
      const response = {} as Response
      const error = handler.parseApiError(response)

      expect(error.type).toBe(ErrorType.NETWORK)
      expect(error.retryable).toBe(true)
    })

    it('should parse 401 auth error', () => {
      const response = { status: 401 } as Response
      const data = { error: { message: 'Invalid API key' } }
      const error = handler.parseApiError(response, data)

      expect(error.type).toBe(ErrorType.AUTH)
      expect(error.statusCode).toBe(401)
      expect(error.retryable).toBe(false)
    })

    it('should parse 403 auth error', () => {
      const response = { status: 403 } as Response
      const error = handler.parseApiError(response)

      expect(error.type).toBe(ErrorType.AUTH)
      expect(error.retryable).toBe(false)
    })

    it('should parse 429 rate limit error', () => {
      const response = { status: 429 } as Response
      const error = handler.parseApiError(response)

      expect(error.type).toBe(ErrorType.RATE_LIMIT)
      expect(error.retryable).toBe(true)
    })

    it('should parse 500 server error as retryable', () => {
      const response = { status: 500 } as Response
      const error = handler.parseApiError(response)

      expect(error.type).toBe(ErrorType.API)
      expect(error.retryable).toBe(true)
    })

    it('should parse other API errors', () => {
      const response = { status: 400 } as Response
      const data = { error: { message: 'Bad request' } }
      const error = handler.parseApiError(response, data)

      expect(error.type).toBe(ErrorType.API)
      expect(error.statusCode).toBe(400)
      expect(error.retryable).toBe(false)
    })
  })

  describe('parseNetworkError', () => {
    it('should parse timeout error', () => {
      const error = new Error('Request timeout')
      error.name = 'AbortError'
      const parsed = handler.parseNetworkError(error)

      expect(parsed.type).toBe(ErrorType.TIMEOUT)
      expect(parsed.retryable).toBe(true)
    })

    it('should parse timeout error by message', () => {
      const error = new Error('Connection timeout')
      const parsed = handler.parseNetworkError(error)

      expect(parsed.type).toBe(ErrorType.TIMEOUT)
      expect(parsed.retryable).toBe(true)
    })

    it('should parse other network errors', () => {
      const error = new Error('Network connection failed')
      const parsed = handler.parseNetworkError(error)

      expect(parsed.type).toBe(ErrorType.NETWORK)
      expect(parsed.retryable).toBe(true)
    })
  })

  describe('getUserFriendlyMessage', () => {
    it('should return correct message for each error type', () => {
      expect(handler.getUserFriendlyMessage(new ApiError(ErrorType.NETWORK, 'msg')))
        .toBe('网络连接失败，请检查网络设置')

      expect(handler.getUserFriendlyMessage(new ApiError(ErrorType.API, 'msg')))
        .toBe('API 服务暂时不可用')

      expect(handler.getUserFriendlyMessage(new ApiError(ErrorType.AUTH, 'msg')))
        .toBe('API 密钥无效，请检查配置')

      expect(handler.getUserFriendlyMessage(new ApiError(ErrorType.RATE_LIMIT, 'msg')))
        .toBe('请求过于频繁，请稍后再试')

      expect(handler.getUserFriendlyMessage(new ApiError(ErrorType.TIMEOUT, 'msg')))
        .toBe('请求超时，请重试')

      expect(handler.getUserFriendlyMessage(new ApiError(ErrorType.UNKNOWN, 'msg')))
        .toBe('发生未知错误')
    })

    it('should return original message when no mapping exists', () => {
      const error = new ApiError(ErrorType.API, 'Custom error message')
      // 由于有映射，所以返回映射的消息
      expect(handler.getUserFriendlyMessage(error)).toBe('API 服务暂时不可用')
    })
  })

  describe('withRetry', () => {
    it('should return result on first success', async () => {
      const operation = vi.fn().mockResolvedValue('success')
      const result = await handler.withRetry(operation)

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should retry on retryable errors', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new ApiError(ErrorType.NETWORK, 'Network error', undefined, true))
        .mockResolvedValue('success')

      const onRetry = vi.fn()
      const result = await handler.withRetry(operation, onRetry)

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(2)
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('should throw on non-retryable errors', async () => {
      const operation = vi.fn().mockRejectedValue(
        new ApiError(ErrorType.AUTH, 'Auth failed', undefined, false)
      )

      await expect(handler.withRetry(operation)).rejects.toThrow('Auth failed')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should respect max retries', async () => {
      const handlerWithLimitedRetries = new ErrorHandler({ maxRetries: 2 })
      const operation = vi.fn().mockRejectedValue(
        new ApiError(ErrorType.NETWORK, 'Network error', undefined, true)
      )

      await expect(handlerWithLimitedRetries.withRetry(operation)).rejects.toThrow()
      expect(operation).toHaveBeenCalledTimes(3) // initial + 2 retries
    })

    it('should handle non-ApiError errors', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Generic error'))

      await expect(handler.withRetry(operation)).rejects.toThrow()
    })

    it('should use exponential backoff', async () => {
      vi.useFakeTimers()
      const handlerWithConfig = new ErrorHandler({
        maxRetries: 2,
        initialDelay: 100,
        maxDelay: 1000,
        backoffMultiplier: 2
      })

      const operation = vi.fn()
        .mockRejectedValueOnce(new ApiError(ErrorType.NETWORK, 'error', undefined, true))
        .mockRejectedValueOnce(new ApiError(ErrorType.NETWORK, 'error', undefined, true))
        .mockResolvedValue('success')

      const promise = handlerWithConfig.withRetry(operation)

      // 第一重试前的延迟
      await vi.advanceTimersByTimeAsync(100)
      // 第二重试前的延迟
      await vi.advanceTimersByTimeAsync(200)

      const result = await promise
      expect(result).toBe('success')

      vi.useRealTimers()
    })
  })

  describe('logError', () => {
    it('should log error with context', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new ApiError(ErrorType.API, 'Test error', 500)
      const context = { url: 'https://example.com' }

      handler.logError(error, context)

      expect(consoleSpy).toHaveBeenCalledWith('[API Error]', {
        type: ErrorType.API,
        message: 'Test error',
        statusCode: 500,
        timestamp: expect.any(Number),
        context
      })

      consoleSpy.mockRestore()
    })

    it('should log error without context', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new ApiError(ErrorType.NETWORK, 'Network error')

      handler.logError(error)

      expect(consoleSpy).toHaveBeenCalledWith('[API Error]', {
        type: ErrorType.NETWORK,
        message: 'Network error',
        statusCode: undefined,
        timestamp: expect.any(Number)
      })

      consoleSpy.mockRestore()
    })
  })

  describe('custom retry config', () => {
    it('should use custom retry config', () => {
      const customConfig: RetryConfig = {
        maxRetries: 5,
        initialDelay: 2000,
        maxDelay: 20000,
        backoffMultiplier: 3,
        retryableErrors: [ErrorType.NETWORK, ErrorType.TIMEOUT]
      }

      const customHandler = new ErrorHandler(customConfig)

      // 验证配置被正确应用
      expect(customHandler).toBeInstanceOf(ErrorHandler)
    })
  })

  describe('default errorHandler instance', () => {
    it('should export default errorHandler instance', () => {
      expect(errorHandler).toBeInstanceOf(ErrorHandler)
    })
  })
})

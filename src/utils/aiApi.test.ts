import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  DeepSeekProvider,
  ZhipuProvider,
  VolcanoProvider,
  OpenAIProvider,
  ClaudeProvider,
  createAiProvider,
  ApiResponse
} from './aiApi'
import { Config } from '../types'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock errorHandler
vi.mock('./errorHandler', () => ({
  errorHandler: {
    withRetry: async (operation: any) => operation(),
    parseApiError: (response: any) => {
      const error: any = new Error('API Error')
      error.type = 'api'
      error.retryable = false
      error.statusCode = response.status
      return error
    },
    parseNetworkError: (error: any) => {
      const parsed: any = new Error(error.message)
      parsed.type = 'network'
      parsed.retryable = true
      return parsed
    }
  },
  ApiError: class ApiError extends Error {
    constructor(public type: string, message: string, public statusCode?: number, public retryable = false) {
      super(message)
      this.name = 'ApiError'
    }
  },
  ErrorType: {
    NETWORK: 'network',
    API: 'api',
    AUTH: 'auth',
    RATE_LIMIT: 'rate_limit',
    TIMEOUT: 'timeout',
    UNKNOWN: 'unknown'
  }
}))

describe('AI Provider Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('DeepSeekProvider', () => {
    let provider: DeepSeekProvider

    beforeEach(() => {
      provider = new DeepSeekProvider('test-api-key')
    })

    it('should have correct provider name and model', () => {
      expect(provider.getProviderName()).toBe('deepseek')
      expect(provider.getModelName()).toBe('deepseek-chat')
    })

    it('should make successful API call', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{
            message: { content: 'Test response' }
          }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15
          }
        })
      })

      const result = await provider.generateAnswer('Test question', 'Test context')

      expect(result.content).toBe('Test response')
      expect(result.usage.prompt_tokens).toBe(10)
      expect(result.usage.completion_tokens).toBe(5)
      expect(result.usage.total_tokens).toBe(15)
      expect(result.model).toBe('deepseek-chat')
    })

    it('should call correct API endpoint', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
        })
      })

      await provider.generateAnswer('Question', 'Context')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.deepseek.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key'
          })
        })
      )
    })
  })

  describe('ZhipuProvider', () => {
    let provider: ZhipuProvider

    beforeEach(() => {
      provider = new ZhipuProvider('test-api-key')
    })

    it('should have correct provider name and model', () => {
      expect(provider.getProviderName()).toBe('zhipu')
      expect(provider.getModelName()).toBe('glm-4')
    })

    it('should make successful API call', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '智谱AI 回答' } }],
          usage: { prompt_tokens: 20, completion_tokens: 10, total_tokens: 30 }
        })
      })

      const result = await provider.generateAnswer('问题', '上下文')

      expect(result.content).toBe('智谱AI 回答')
      expect(result.usage.total_tokens).toBe(30)
    })

    it('should call correct API endpoint', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
        })
      })

      await provider.generateAnswer('Question', 'Context')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        expect.any(Object)
      )
    })
  })

  describe('VolcanoProvider', () => {
    let provider: VolcanoProvider

    beforeEach(() => {
      provider = new VolcanoProvider('test-api-key')
    })

    it('should have correct provider name and model', () => {
      expect(provider.getProviderName()).toBe('volcano')
      expect(provider.getModelName()).toBe('ep-20250526153619-ux4h1')
    })

    it('should make successful translate call', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '翻译结果' } }],
          usage: { prompt_tokens: 15, completion_tokens: 8, total_tokens: 23 }
        })
      })

      const result = await provider.translate('Hello', '中文')

      expect(result.content).toBe('翻译结果')
      expect(result.usage.total_tokens).toBe(23)
    })
  })

  describe('OpenAIProvider', () => {
    let provider: OpenAIProvider

    beforeEach(() => {
      provider = new OpenAIProvider('test-api-key')
    })

    it('should have correct provider name and model', () => {
      expect(provider.getProviderName()).toBe('openai')
      expect(provider.getModelName()).toBe('gpt-3.5-turbo')
    })

    it('should make successful API call', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'OpenAI response' } }],
          usage: { prompt_tokens: 12, completion_tokens: 6, total_tokens: 18 }
        })
      })

      const result = await provider.generateAnswer('Question', 'Context')

      expect(result.content).toBe('OpenAI response')
      expect(result.usage.total_tokens).toBe(18)
    })

    it('should call correct API endpoint', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
        })
      })

      await provider.generateAnswer('Question', 'Context')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.any(Object)
      )
    })
  })

  describe('ClaudeProvider', () => {
    let provider: ClaudeProvider

    beforeEach(() => {
      provider = new ClaudeProvider('test-api-key')
    })

    it('should have correct provider name and model', () => {
      expect(provider.getProviderName()).toBe('claude')
      expect(provider.getModelName()).toBe('claude-3-sonnet-20250219')
    })

    it('should use custom headers for Claude API', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ text: 'Claude response' }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
        })
      })

      await provider.generateAnswer('Question', 'Context')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
            'anthropic-version': '2023-06-01'
          })
        })
      )
    })

    it('should parse Claude response format correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ text: 'Claude response' }],
          usage: { prompt_tokens: 8, completion_tokens: 4, total_tokens: 12 }
        })
      })

      const result = await provider.generateAnswer('Question', 'Context')

      expect(result.content).toBe('Claude response')
      expect(result.usage.total_tokens).toBe(12)
    })

    it('should include max_tokens in request body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ text: 'Response' }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
        })
      })

      await provider.generateAnswer('Question', 'Context')

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse(callArgs[1].body)

      expect(body.max_tokens).toBe(4096)
    })
  })

  describe('createAiProvider factory function', () => {
    it('should create DeepSeekProvider', () => {
      const config: Config = { aiProvider: 'deepseek', apiKey: 'key', targetLanguage: 'zh-CN' }
      const provider = createAiProvider(config)

      expect(provider.getProviderName()).toBe('deepseek')
      expect(provider.getModelName()).toBe('deepseek-chat')
    })

    it('should create ZhipuProvider', () => {
      const config: Config = { aiProvider: 'zhipu', apiKey: 'key', targetLanguage: 'zh-CN' }
      const provider = createAiProvider(config)

      expect(provider.getProviderName()).toBe('zhipu')
      expect(provider.getModelName()).toBe('glm-4')
    })

    it('should create VolcanoProvider', () => {
      const config: Config = { aiProvider: 'volcano', apiKey: 'key', targetLanguage: 'zh-CN' }
      const provider = createAiProvider(config)

      expect(provider.getProviderName()).toBe('volcano')
      expect(provider.getModelName()).toBe('ep-20250526153619-ux4h1')
    })

    it('should create OpenAIProvider', () => {
      const config: Config = { aiProvider: 'openai', apiKey: 'key', targetLanguage: 'zh-CN' }
      const provider = createAiProvider(config)

      expect(provider.getProviderName()).toBe('openai')
      expect(provider.getModelName()).toBe('gpt-3.5-turbo')
    })

    it('should create ClaudeProvider', () => {
      const config: Config = { aiProvider: 'claude', apiKey: 'key', targetLanguage: 'zh-CN' }
      const provider = createAiProvider(config)

      expect(provider.getProviderName()).toBe('claude')
      expect(provider.getModelName()).toBe('claude-3-sonnet-20250219')
    })

    it('should throw error for unsupported provider', () => {
      const config = { aiProvider: 'unknown' as any, apiKey: 'key', targetLanguage: 'zh-CN' }

      expect(() => createAiProvider(config)).toThrow('Unsupported AI provider')
    })
  })

  describe('translate method', () => {
    it('should translate text using provider', async () => {
      const provider = new DeepSeekProvider('test-key')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Translated text' } }],
          usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 }
        })
      })

      const result = await provider.translate('Hello', '中文')

      expect(result.content).toBe('Translated text')
      expect(result.usage.total_tokens).toBe(8)
    })

    it('should include translation prompt in messages', async () => {
      const provider = new DeepSeekProvider('test-key')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
        })
      })

      await provider.translate('Text', 'Japanese')

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse(callArgs[1].body)

      expect(body.messages).toHaveLength(2)
      expect(body.messages[0].role).toBe('system')
      expect(body.messages[0].content).toContain('Japanese')
      expect(body.messages[1].content).toBe('Text')
    })
  })

  describe('API error handling', () => {
    it('should handle API errors', async () => {
      const provider = new DeepSeekProvider('test-key')
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Unauthorized' } })
      })

      await expect(provider.generateAnswer('Question', 'Context')).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      const provider = new DeepSeekProvider('test-key')
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(provider.generateAnswer('Question', 'Context')).rejects.toThrow()
    })
  })

  describe('usage handling', () => {
    it('should handle missing usage data', async () => {
      const provider = new DeepSeekProvider('test-key')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }]
        })
      })

      const result = await provider.generateAnswer('Question', 'Context')

      expect(result.usage).toEqual({
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      })
    })
  })
})

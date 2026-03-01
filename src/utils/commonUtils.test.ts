import { describe, it, expect } from 'vitest'
import { CommonUtils } from './commonUtils'
import { AiProvider, RequestType } from '../types/tokenUsage'

describe('CommonUtils', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = CommonUtils.generateId()
      const id2 = CommonUtils.generateId()
      expect(id1).not.toBe(id2)
    })

    it('should generate valid ID format', () => {
      const id = CommonUtils.generateId()
      expect(id).toMatch(/^\d+-[a-z0-9]+$/)
    })
  })

  describe('formatDateKey', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-03-15T12:00:00Z')
      const key = CommonUtils.formatDateKey(date)
      expect(key).toBe('2024-03-15')
    })

    it('should handle single digit month and day', () => {
      const date = new Date('2024-01-05T12:00:00Z')
      const key = CommonUtils.formatDateKey(date)
      expect(key).toBe('2024-01-05')
    })
  })

  describe('calculateCost', () => {
    it('should calculate cost for DeepSeek', () => {
      const usage = { prompt_tokens: 1000, completion_tokens: 1000 }
      const cost = CommonUtils.calculateCost(usage, 'deepseek' as AiProvider, 'deepseek-chat')
      expect(cost).toBe(0.003) // (1000/1000)*0.001 + (1000/1000)*0.002
    })

    it('should calculate cost for Zhipu', () => {
      const usage = { prompt_tokens: 1000, completion_tokens: 1000 }
      const cost = CommonUtils.calculateCost(usage, 'zhipu' as AiProvider, 'glm-4')
      expect(cost).toBe(0.02) // (1000/1000)*0.01 + (1000/1000)*0.01
    })

    it('should calculate cost for Volcano', () => {
      const usage = { prompt_tokens: 1000, completion_tokens: 1000 }
      const cost = CommonUtils.calculateCost(usage, 'volcano' as AiProvider, 'ep-20250526153619-ux4h1')
      expect(cost).toBe(0.013) // (1000/1000)*0.004 + (1000/1000)*0.009
    })

    it('should return 0 for unknown provider/model', () => {
      const usage = { prompt_tokens: 1000, completion_tokens: 1000 }
      const cost = CommonUtils.calculateCost(usage, 'unknown' as AiProvider, 'unknown-model')
      expect(cost).toBe(0)
    })

    it('should calculate partial token usage', () => {
      const usage = { prompt_tokens: 500, completion_tokens: 250 }
      const cost = CommonUtils.calculateCost(usage, 'deepseek' as AiProvider, 'deepseek-chat')
      expect(cost).toBe(0.001) // (500/1000)*0.001 + (250/1000)*0.002
    })
  })

  describe('formatCost', () => {
    it('should format small cost in fen', () => {
      expect(CommonUtils.formatCost(0.005)).toBe('¥0.50 分')
    })

    it('should format normal cost in yuan', () => {
      expect(CommonUtils.formatCost(0.1)).toBe('¥0.1000')
    })

    it('should format large cost in yuan', () => {
      expect(CommonUtils.formatCost(10.5)).toBe('¥10.5000')
    })
  })

  describe('formatTokenCount', () => {
    it('should format small numbers', () => {
      expect(CommonUtils.formatTokenCount(500)).toBe('500')
    })

    it('should format thousands', () => {
      expect(CommonUtils.formatTokenCount(1500)).toBe('1.50K')
    })

    it('should format millions', () => {
      expect(CommonUtils.formatTokenCount(2500000)).toBe('2.50M')
    })
  })

  describe('getProviderDisplayName', () => {
    it('should return correct display names', () => {
      expect(CommonUtils.getProviderDisplayName('deepseek' as AiProvider)).toBe('DeepSeek')
      expect(CommonUtils.getProviderDisplayName('zhipu' as AiProvider)).toBe('智谱 AI')
      expect(CommonUtils.getProviderDisplayName('volcano' as AiProvider)).toBe('火山引擎')
    })

    it('should return provider name for unknown provider', () => {
      expect(CommonUtils.getProviderDisplayName('unknown' as AiProvider)).toBe('unknown')
    })
  })

  describe('getRequestTypeName', () => {
    it('should return correct type names', () => {
      expect(CommonUtils.getRequestTypeName('chat' as RequestType)).toBe('问答')
      expect(CommonUtils.getRequestTypeName('translate' as RequestType)).toBe('翻译')
    })

    it('should return type for unknown type', () => {
      expect(CommonUtils.getRequestTypeName('unknown' as RequestType)).toBe('unknown')
    })
  })
})

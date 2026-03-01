import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TokenTracker } from './tokenTracker'
import { AiProvider, RequestType } from '../types/tokenUsage'

describe('TokenTracker', () => {
  // 模拟 chrome.storage
  beforeEach(() => {
    // @ts-expect-error 模拟全局 chrome 对象
    const globalAny = global as unknown as { chrome: unknown }
    globalAny.chrome = {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({ 'token-usage-records': [] }),
          set: vi.fn().mockResolvedValue(undefined),
          remove: vi.fn().mockResolvedValue(undefined)
        },
        sync: {
          get: vi.fn(),
          set: vi.fn()
        }
      }
    } as unknown as typeof chrome
  })

  describe('recordUsage', () => {
    it('should record token usage correctly', async () => {
      // 测试记录 Token 使用
      await TokenTracker.recordUsage(
        'deepseek' as AiProvider,
        'deepseek-chat',
        'chat' as RequestType,
        {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150
        }
      )

      const records = await TokenTracker.getAllRecords()
      expect(records.length).toBe(1)
      expect(records[0].provider).toBe('deepseek')
      expect(records[0].model).toBe('deepseek-chat')
      expect(records[0].usage.total_tokens).toBe(150)
    })
  })

  describe('getSummary', () => {
    it('should calculate token summary correctly', async () => {
      // 添加一些测试数据
      await TokenTracker.recordUsage(
        'deepseek' as AiProvider,
        'deepseek-chat',
        'chat' as RequestType,
        { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 }
      )

      await TokenTracker.recordUsage(
        'zhipu' as AiProvider,
        'glm-4',
        'translate' as RequestType,
        { prompt_tokens: 200, completion_tokens: 100, total_tokens: 300 }
      )

      const summary = await TokenTracker.getSummary('all')

      expect(summary.totalTokens).toBe(450)
      expect(summary.statistics.length).toBe(2)
    })
  })

  describe('filterByTimeRange', () => {
    it('should filter records by time range', async () => {
      // 测试时间范围过滤
      const records = [
        { timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000 }, // 6 days ago
        { timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000 }, // 8 days ago
        { timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 }  // 2 days ago
      ] as unknown as Parameters<typeof TokenTracker.filterByTimeRange>[0]

      const filtered = TokenTracker.filterByTimeRange(records, 'week')
      expect(filtered.length).toBe(2)
    })
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StorageManager } from './storage'
import { Config } from '../types'

// Mock secureStorage
vi.mock('./secureStorage', () => ({
  secureStorage: {
    getApiKey: vi.fn().mockResolvedValue(null),
    setApiKey: vi.fn().mockResolvedValue(undefined)
  }
}))

describe('StorageManager', () => {
  const mockStorage = {
    sync: {
      config: undefined
    },
    local: {}
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // @ts-expect-error 模拟全局 chrome 对象
    const globalAny = global as unknown as { chrome: unknown }
    globalAny.chrome = {
      storage: {
        sync: {
          get: vi.fn().mockImplementation((key: string) => {
            return Promise.resolve({ [key]: (mockStorage.sync as Record<string, unknown>)[key] })
          }),
          set: vi.fn().mockImplementation((data: Record<string, unknown>) => {
            Object.assign(mockStorage.sync, data)
            return Promise.resolve(undefined)
          })
        },
        local: {
          get: vi.fn().mockImplementation((key: string) => {
            return Promise.resolve({ [key]: (mockStorage.local as Record<string, unknown>)[key] })
          }),
          set: vi.fn().mockImplementation((data: Record<string, unknown>) => {
            Object.assign(mockStorage.local, data)
            return Promise.resolve(undefined)
          })
        }
      }
    } as unknown as typeof chrome
  })

  describe('config management', () => {
    it('should get default config if no config is saved', async () => {
      const config = await StorageManager.getConfig()
      expect(config).toEqual({
        aiProvider: 'deepseek',
        apiKey: '',
        targetLanguage: 'zh-CN'
      })
    })

    it('should save and retrieve config', async () => {
      const testConfig: Config = {
        aiProvider: 'zhipu',
        apiKey: 'test-api-key',
        targetLanguage: 'en'
      }

      await StorageManager.saveConfig(testConfig)
      const retrievedConfig = await StorageManager.getConfig()
      expect(retrievedConfig.aiProvider).toBe('zhipu')
      expect(retrievedConfig.targetLanguage).toBe('en')
    })
  })

  describe('chat history management', () => {
    it('should get default chat history for new tab', async () => {
      const history = await StorageManager.getChatHistory(123)
      expect(history).toEqual({
        url: '',
        title: '',
        history: []
      })
    })

    it('should save and retrieve chat history', async () => {
      const testHistory = {
        url: 'https://example.com',
        title: 'Example Page',
        history: [
          {
            id: '1',
            role: 'user' as const,
            content: 'Hello',
            timestamp: Date.now()
          },
          {
            id: '2',
            role: 'assistant' as const,
            content: 'Hi there!',
            timestamp: Date.now()
          }
        ]
      }

      await StorageManager.saveChatHistory(123, testHistory)
      const retrievedHistory = await StorageManager.getChatHistory(123)
      expect(retrievedHistory.url).toBe('https://example.com')
      expect(retrievedHistory.history).toHaveLength(2)
    })
  })
})

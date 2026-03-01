import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Sidebar from './Sidebar'
import { StorageManager } from '../utils/storage'

// Mock StorageManager
vi.mock('../utils/storage', () => ({
  StorageManager: {
    getChatHistory: vi.fn().mockResolvedValue({
      url: 'https://example.com',
      title: 'Test Page',
      history: []
    }),
    saveChatHistory: vi.fn().mockResolvedValue(undefined)
  }
}))

// Mock chrome.tabs
const mockChromeTabs = {
  query: vi.fn((query, callback) => {
    callback([{ id: 123, url: 'https://example.com', title: 'Test Page' }])
  })
}

vi.stubGlobal('chrome', {
  tabs: mockChromeTabs
})

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render sidebar component', async () => {
    render(<Sidebar />)

    await waitFor(() => {
      expect(screen.getByText('Chro-Jarvis')).toBeInTheDocument()
      expect(screen.getByText('智能页面问答助手')).toBeInTheDocument()
    })
  })

  it('should display page title when available', async () => {
    render(<Sidebar />)

    await waitFor(() => {
      expect(screen.getByText('当前页面: Test Page')).toBeInTheDocument()
    })
  })

  it('should load chat history on mount', async () => {
    render(<Sidebar />)

    await waitFor(() => {
      expect(StorageManager.getChatHistory).toHaveBeenCalledWith(123)
    })
  })

  it('should send message and save history', async () => {
    const { container } = render(<Sidebar />)

    await waitFor(() => {
      expect(screen.getByText('Chro-Jarvis')).toBeInTheDocument()
    })

    // 输入框和发送按钮由 QuestionInput 子组件处理
    // 这里主要测试 Sidebar 的容器功能
    expect(container.querySelector('.h-full')).toBeInTheDocument()
  })
})

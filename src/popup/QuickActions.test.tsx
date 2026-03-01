import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import QuickActions from './QuickActions'
import { toast } from '../utils/toast'

// Mock toast
vi.mock('../utils/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    show: vi.fn()
  }
}))

// Mock chrome API
const mockTabs = {
  query: vi.fn((query, callback) => {
    if (callback) {
      callback([{ id: 123, url: 'https://example.com', title: 'Test Page' }])
    }
    return Promise.resolve([{ id: 123, url: 'https://example.com', title: 'Test Page' }])
  }),
  sendMessage: vi.fn().mockResolvedValue({ success: true })
}

const mockSidePanel = {
  open: vi.fn().mockResolvedValue(undefined)
}

vi.stubGlobal('chrome', {
  tabs: mockTabs,
  sidePanel: mockSidePanel
})

describe('QuickActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render QuickActions component', async () => {
    render(<QuickActions />)

    await waitFor(() => {
      expect(screen.getByText('快速操作')).toBeInTheDocument()
    })

    expect(screen.getByText('打开侧边栏')).toBeInTheDocument()
    expect(screen.getByText('翻译页面')).toBeInTheDocument()
    expect(screen.getByText('其他功能')).toBeInTheDocument()
    expect(screen.getByText('💡 提示：')).toBeInTheDocument()
    expect(screen.getByText('• 侧边栏提供更详细的问答功能')).toBeInTheDocument()
    expect(screen.getByText('• 翻译功能支持多种语言')).toBeInTheDocument()
    expect(screen.getByText('• 每个标签页的对话历史都是独立的')).toBeInTheDocument()
  })

  it('should open sidebar when button is clicked', async () => {
    render(<QuickActions />)

    await waitFor(() => {
      expect(screen.getByText('打开侧边栏')).toBeInTheDocument()
    })

    const openSidebarButton = screen.getByText('打开侧边栏')
    fireEvent.click(openSidebarButton)

    await waitFor(() => {
      expect(chrome.sidePanel.open).toHaveBeenCalled()
    })
  })

  it('should translate page when button is clicked', async () => {
    render(<QuickActions />)

    await waitFor(() => {
      expect(screen.getByText('翻译页面')).toBeInTheDocument()
    })

    const translateButton = screen.getByText('翻译页面')
    fireEvent.click(translateButton)

    await waitFor(() => {
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(123, { action: 'translatePage' })
      expect(toast.success).toHaveBeenCalledWith('页面已成功翻译')
    })
  })

  it('should show notification for other function', async () => {
    render(<QuickActions />)

    await waitFor(() => {
      expect(screen.getByText('其他功能')).toBeInTheDocument()
    })

    const otherFunctionButton = screen.getByText('其他功能')
    fireEvent.click(otherFunctionButton)

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('此功能正在开发中')
    })
  })

  it('should handle translation error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockTabs.sendMessage.mockResolvedValue({ success: false, error: 'Translation failed' })

    render(<QuickActions />)

    await waitFor(() => {
      expect(screen.getByText('翻译页面')).toBeInTheDocument()
    })

    const translateButton = screen.getByText('翻译页面')
    fireEvent.click(translateButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Translation failed')
    })

    consoleSpy.mockRestore()
  })

  it('should handle translation network error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockTabs.sendMessage.mockRejectedValue(new Error('Network error'))

    render(<QuickActions />)

    await waitFor(() => {
      expect(screen.getByText('翻译页面')).toBeInTheDocument()
    })

    const translateButton = screen.getByText('翻译页面')
    fireEvent.click(translateButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('翻译过程中发生错误')
    })

    consoleSpy.mockRestore()
  })
})

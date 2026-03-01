import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChatHistory from './ChatHistory'
import { Message } from '../types'

describe('ChatHistory', () => {
  it('should render empty state when no messages', () => {
    const { container } = render(<ChatHistory history={[]} />)

    expect(screen.getByText('👋 你好！')).toBeInTheDocument()
    expect(screen.getByText('在下方输入框中提问，我会为你解答。')).toBeInTheDocument()
    expect(container.querySelector('.text-center')).toBeInTheDocument()
  })

  it('should render user messages correctly', () => {
    const history: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'Hello, how are you?',
        timestamp: 1640000000000
      }
    ]

    const { container } = render(<ChatHistory history={history} />)

    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument()
    expect(container.querySelector('.ml-auto')).toBeInTheDocument()
    expect(container.querySelector('.bg-blue-500')).toBeInTheDocument()
    expect(container.querySelector('.text-white')).toBeInTheDocument()
  })

  it('should render assistant messages correctly', () => {
    const history: Message[] = [
      {
        id: '1',
        role: 'assistant',
        content: 'I am doing well, thank you!',
        timestamp: 1640000000000
      }
    ]

    const { container } = render(<ChatHistory history={history} />)

    expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument()
    expect(container.querySelector('.mr-auto')).toBeInTheDocument()
    expect(container.querySelector('.bg-gray-100')).toBeInTheDocument()
    expect(container.querySelector('.text-gray-800')).toBeInTheDocument()
  })

  it('should render multiple messages in order', () => {
    const history: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'What is the weather today?',
        timestamp: 1640000000000
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Today is sunny with a high of 25°C.',
        timestamp: 1640000100000
      },
      {
        id: '3',
        role: 'user',
        content: 'Thank you!',
        timestamp: 1640000200000
      }
    ]

    const { container } = render(<ChatHistory history={history} />)

    // 检查所有消息都被渲染
    expect(screen.getByText('What is the weather today?')).toBeInTheDocument()
    expect(screen.getByText('Today is sunny with a high of 25°C.')).toBeInTheDocument()
    expect(screen.getByText('Thank you!')).toBeInTheDocument()

    // 检查有3个消息容器
    const messageContainers = container.querySelectorAll('.mb-4')
    expect(messageContainers).toHaveLength(3)
  })

  it('should display timestamp for each message', () => {
    const timestamp = 1640000000000
    const history: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'Test message',
        timestamp
      }
    ]

    render(<ChatHistory history={history} />)

    // 检查时间戳被渲染
    const timeString = new Date(timestamp).toLocaleTimeString()
    expect(screen.getByText(timeString)).toBeInTheDocument()
  })

  it('should apply correct styling to user messages', () => {
    const history: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'User message',
        timestamp: 1640000000000
      }
    ]

    const { container } = render(<ChatHistory history={history} />)

    const messageDiv = container.querySelector('.ml-auto')
    expect(messageDiv).toBeInTheDocument()
    expect(messageDiv?.querySelector('.bg-blue-500')).toBeInTheDocument()
    expect(messageDiv?.querySelector('.text-white')).toBeInTheDocument()
  })

  it('should apply correct styling to assistant messages', () => {
    const history: Message[] = [
      {
        id: '1',
        role: 'assistant',
        content: 'Assistant message',
        timestamp: 1640000000000
      }
    ]

    const { container } = render(<ChatHistory history={history} />)

    const messageDiv = container.querySelector('.mr-auto')
    expect(messageDiv).toBeInTheDocument()
    expect(messageDiv?.querySelector('.bg-gray-100')).toBeInTheDocument()
    expect(messageDiv?.querySelector('.text-gray-800')).toBeInTheDocument()
  })

  it('should handle messages with special characters', () => {
    const history: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'Hello <world> & "friends"!',
        timestamp: 1640000000000
      }
    ]

    render(<ChatHistory history={history} />)

    // React 应该正确转义 HTML
    expect(screen.getByText('Hello <world> & "friends"!')).toBeInTheDocument()
  })

  it('should handle long messages', () => {
    const longContent = 'A'.repeat(1000)
    const history: Message[] = [
      {
        id: '1',
        role: 'assistant',
        content: longContent,
        timestamp: 1640000000000
      }
    ]

    render(<ChatHistory history={history} />)

    expect(screen.getByText(longContent)).toBeInTheDocument()
  })
})

'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, Bot } from 'lucide-react'

interface AIChatProps {
  userId: string
  isAdmin: boolean
  onClose: () => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIChat({ userId, isAdmin, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: isAdmin
        ? "Hello! I'm your AI ROI Assistant with admin access. I can analyze all user data, compare scenarios across the platform, and provide insights. How can I help you today?"
        : "Hello! I'm your AI ROI Assistant. I can analyze your scenarios, compare performance, and provide recommendations. What would you like to know?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      console.log('Sending AI chat request:', { userId, isAdmin, messageLength: userMessage.length })

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId,
          isAdmin,
          conversationHistory: messages,
        }),
      })

      console.log('AI chat response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('AI chat error response:', errorText)
        throw new Error(`Failed to get AI response (${response.status}): ${errorText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ''))
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ])
    } catch (error) {
      console.error('AI chat error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errorMessage}\n\nPlease check:\n1. OpenAI API key is configured in Admin → AI Settings\n2. Your API key has sufficient credits\n3. Try refreshing the page`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900">AI ROI Assistant</h3>
              <p className="text-sm text-neutral-600">
                {isAdmin ? 'Admin Mode - Full Platform Access' : 'Analyzing Your Data'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-neutral-600" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-brand-primary text-white'
                    : 'bg-neutral-100 text-neutral-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-neutral-100 text-neutral-900 rounded-lg p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-neutral-200">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your ROI scenarios..."
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <p className="text-xs text-neutral-500 mt-2">
            Ask questions like "What's my best performing scenario?" or "How can I improve my ROI?"
          </p>
        </div>
      </div>
    </div>
  )
}

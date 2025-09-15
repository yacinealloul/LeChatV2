"use client"

import { useState, useEffect, useRef } from "react"
import { v4 as uuidv4 } from 'uuid'
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { Sidebar } from "./chat-sidebar"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  charts?: any[]
  tools?: ToolExecution[]
}

export interface ToolExecution {
  id: string
  name: string
  description: string
  status: 'starting' | 'running' | 'completed' | 'error' | 'hidden'
  progress?: number
  message?: string
  error?: string
}


interface ChatClientProps {
  initialQuery?: string
}

export function ChatClient({ initialQuery }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTools, setCurrentTools] = useState<ToolExecution[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoadingExistingConversation, setIsLoadingExistingConversation] = useState(false)
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    setIsLoading(true)

    if (!currentConversationId && messages.length === 0) {
      setCurrentConversationId(uuidv4())
    }

    const newMessages = [...messages, { id: uuidv4(), role: "user" as const, content: message }]
    setMessages(newMessages)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, messages }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      setIsLoading(false)
      setIsStreaming(true)
      const assistantMsgId = uuidv4()
      const messagesWithEmptyAssistant = [...newMessages, { id: assistantMsgId, role: "assistant" as const, content: "", charts: [], tools: [] }]
      setMessages(messagesWithEmptyAssistant)

      let assistantContent = ""
      let assistantCharts: any[] = []
      let assistantTools: ToolExecution[] = []
      let pendingChart: any | null = null

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.done) {
                setIsStreaming(false)
                return
              }

              if (data.content) {
                assistantContent += data.content

                const updatedMessages = [
                  ...newMessages,
                  { id: assistantMsgId, role: "assistant" as const, content: assistantContent, charts: assistantCharts, tools: assistantTools }
                ]
                setMessages(updatedMessages)
              }

              if (data.tool_start) {
                const newTool: ToolExecution = {
                  id: data.tool_start.id,
                  name: data.tool_start.name,
                  description: data.tool_start.description,
                  status: 'starting'
                }
                assistantTools.push(newTool)
                pendingChart = null
                if (data.tool_start.name === 'generate_chart') {
                  assistantCharts = []
                }
                setCurrentTools([...assistantTools])

                const updatedMessages = [
                  ...newMessages,
                  { id: assistantMsgId, role: "assistant" as const, content: assistantContent, charts: assistantCharts, tools: assistantTools }
                ]
                setMessages(updatedMessages)
              }

              if (data.tool_progress) {
                const toolIndex = assistantTools.findIndex(t => t.name === data.tool_progress.name)
                if (toolIndex >= 0) {
                  assistantTools[toolIndex] = {
                    ...assistantTools[toolIndex],
                    status: 'running',
                    progress: data.tool_progress.progress,
                    message: data.tool_progress.message
                  }
                  setCurrentTools([...assistantTools])

                  const updatedMessages = [
                    ...newMessages,
                    { id: assistantMsgId, role: "assistant" as const, content: assistantContent, charts: assistantCharts, tools: assistantTools }
                  ]
                  setMessages(updatedMessages)
                }
              }

              if (data.tool_complete) {
                const toolIndex = assistantTools.findIndex(t => t.name === data.tool_complete.name)
                if (toolIndex >= 0) {
                  assistantTools[toolIndex] = {
                    ...assistantTools[toolIndex],
                    status: 'completed',
                    message: data.tool_complete.message
                  }
                  setCurrentTools([...assistantTools])

                  assistantCharts = pendingChart ? [...assistantCharts, pendingChart] : assistantCharts
                  const updatedMessages = [
                    ...newMessages,
                    { id: assistantMsgId, role: "assistant" as const, content: assistantContent, charts: assistantCharts, tools: assistantTools }
                  ]
                  setMessages(updatedMessages)
                }
              }

              if (data.tool_hide) {
                const toolIndex = assistantTools.findIndex(t => t.name === data.tool_hide.name)
                if (toolIndex >= 0) {
                  assistantTools[toolIndex] = {
                    ...assistantTools[toolIndex],
                    status: 'hidden'
                  }
                  setCurrentTools([...assistantTools])

                  const updatedMessages = [
                    ...newMessages,
                    { id: assistantMsgId, role: "assistant" as const, content: assistantContent, charts: assistantCharts, tools: assistantTools }
                  ]
                  setMessages(updatedMessages)
                }
              }

              if (data.tool_error) {
                const toolIndex = assistantTools.findIndex(t => t.name === data.tool_error.name)
                if (toolIndex >= 0) {
                  assistantTools[toolIndex] = {
                    ...assistantTools[toolIndex],
                    status: 'error',
                    error: data.tool_error.message
                  }
                  setCurrentTools([...assistantTools])

                  const updatedMessages = [
                    ...newMessages,
                    { id: assistantMsgId, role: "assistant" as const, content: assistantContent, charts: assistantCharts, tools: assistantTools }
                  ]
                  setMessages(updatedMessages)
                }
              }

              if (data.chart) {
                console.log('📊 Chart received in frontend:', data.chart)
                pendingChart = data.chart

                const chartTools = assistantTools.filter(t => t.name === 'generate_chart' && (t.status === 'starting' || t.status === 'running'))
                if (chartTools.length > 0) {
                  chartTools.forEach((tool, index) => {
                    const toolIndex = assistantTools.findIndex(t => t.id === tool.id)
                    if (toolIndex >= 0) {
                      assistantTools[toolIndex] = {
                        ...assistantTools[toolIndex],
                        status: 'completed'
                      }
                    }
                  })
                  setCurrentTools([...assistantTools])

                  setTimeout(() => {
                    const completedChartTools = assistantTools.filter(t => t.name === 'generate_chart' && t.status === 'completed')
                    completedChartTools.forEach(tool => {
                      const toolIndex = assistantTools.findIndex(t => t.id === tool.id)
                      if (toolIndex >= 0) {
                        assistantTools[toolIndex] = {
                          ...assistantTools[toolIndex],
                          status: 'hidden'
                        }
                      }
                    })
                    setCurrentTools([...assistantTools])
                  }, 500)
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, 'Line:', line)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming response:', error)
      const errorMessages = [
        ...newMessages,
        { id: uuidv4(), role: "assistant" as const, content: "Désolé, une erreur s'est produite. Veuillez réessayer." }
      ]
      setMessages(errorMessages)
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  useEffect(() => {
    if (currentConversationId) {
      const conversation = conversations.find(c => c.id === currentConversationId)
      if (conversation) {
        setIsLoadingExistingConversation(true)
        setMessages(conversation.messages)
        setTimeout(() => setIsLoadingExistingConversation(false), 100)
      }
    }
  }, [currentConversationId, conversations])

  useEffect(() => {
    if (initialQuery) {
      const newConversationId = uuidv4()
      setCurrentConversationId(newConversationId)

      const initialMessage = { id: uuidv4(), role: 'user' as const, content: initialQuery }
      setMessages([initialMessage])
      setTimeout(() => {
        handleSendMessage(initialQuery)
      }, 100)
    }
  }, [initialQuery])

  const saveConversation = () => {
    if (messages.length === 0) return

    const now = Date.now()
    const conversationData = {
      id: currentConversationId || uuidv4(),
      title: messages[0]?.content.slice(0, 50) + (messages[0]?.content.length > 50 ? '...' : ''),
      messages: messages,
      createdAt: now,
      updatedAt: now
    }

    if (typeof window !== 'undefined') {
      const storedConversations = window.localStorage.getItem('conversations')
      let conversationsList = storedConversations ? JSON.parse(storedConversations) : []

      const existingIndex = conversationsList.findIndex((c: any) => c.id === conversationData.id)

      if (existingIndex >= 0) {
        const existingConversation = conversationsList[existingIndex]
        conversationsList[existingIndex] = {
          ...conversationData,
          createdAt: existingConversation.createdAt,
          updatedAt: now
        }
      } else {
        conversationsList.push(conversationData)
        setCurrentConversationId(conversationData.id)
      }

      window.localStorage.setItem('conversations', JSON.stringify(conversationsList))
      setConversations(conversationsList)
    }
  }

  useEffect(() => {
    if (messages.length > 0 && !isLoadingExistingConversation) {
      const timeoutId = setTimeout(() => {
        saveConversation()
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [messages, isLoadingExistingConversation])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedConversations = window.localStorage.getItem('conversations')
      if (storedConversations) {
        try {
          const parsed = JSON.parse(storedConversations)
          setConversations(parsed)
        } catch (error) {
          console.error('Error parsing stored conversations:', error)
          setConversations([])
        }
      }
    }
  }, [])

  const handleNewConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
  }

  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id)
    if (conversation) {
      setMessages(conversation.messages)
      setCurrentConversationId(id)
    }
  }

  const handleDeleteConversation = (id: string) => {
    if (typeof window !== 'undefined') {
      const updatedConversations = conversations.filter(c => c.id !== id)
      setConversations(updatedConversations)
      window.localStorage.setItem('conversations', JSON.stringify(updatedConversations))

      if (currentConversationId === id) {
        setMessages([])
        setCurrentConversationId(null)
      }
    }
  }

  return (
    <div className="h-screen w-full relative">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main */}
      <div className={`h-full flex flex-col transition-all duration-300 ease-out ${sidebarOpen ? 'lg:ml-80 md:ml-72 sm:ml-64' : ''}`}>
        {/* Messages */}
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          isStreaming={isStreaming}
          sidebarOpen={sidebarOpen}
        />

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          sidebarOpen={sidebarOpen}
        />
      </div>
    </div>
  )
}
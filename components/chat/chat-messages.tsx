"use client"

import { useEffect, useRef } from "react"
import { ChatMessage } from "./chat-message"
import { Message } from "./chat-client"

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  sidebarOpen: boolean
}

export function ChatMessages({ messages, isLoading, isStreaming, sidebarOpen }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom with better performance
  useEffect(() => {
    if (messagesEndRef.current) {
      // For streaming, use immediate scroll for better UX
      if (isStreaming) {
        messagesEndRef.current.scrollIntoView({ behavior: "instant" })
      } else {
        // For non-streaming, use smooth scroll
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
      }
    }
  }, [messages, isStreaming])

  // Additional scroll for when streaming content changes
  useEffect(() => {
    if (isStreaming && messagesEndRef.current) {
      // Debounce scroll during streaming to avoid too frequent scrolls
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" })
      }, 50)

      return () => clearTimeout(timeoutId)
    }
  }, [messages[messages.length - 1]?.content, isStreaming])

  return (
    <div className="flex-1 overflow-y-auto relative">
      <div className={`max-w-4xl mx-auto px-6 py-8 space-y-6 transition-all duration-300 ${sidebarOpen ? 'lg:px-8' : 'px-6'}`}>
        
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id || `msg-${index}`}
            message={message}
            isStreaming={isStreaming && index === messages.length - 1}
            index={index}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="relative bg-black/70 border-black/50 text-white rounded-3xl px-6 py-4 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-white/60"
                  />
                ))}
              </div>
              <span className="pointer-events-none absolute inset-px rounded-[inherit] bg-gradient-to-b from-white/10 to-transparent" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
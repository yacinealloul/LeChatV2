"use client"

import { Message } from "./chat-client"
import MarkdownRenderer from './chat-markdown-renderer'
import Chart from "./chat-chart"
import ToolExecution from "./chat-tool-execution"

interface ChatMessageProps {
  message: Message
  isStreaming: boolean
  index: number
}

export function ChatMessage({ message, isStreaming, index }: ChatMessageProps) {
  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`relative ${message.role === 'user'
        ? 'max-w-[85%]'
        : message.charts && message.charts.length > 0
          ? 'max-w-[98%] w-full'
          : 'max-w-[85%]'
        } rounded-3xl px-6 py-4 text-md leading-relaxed border ${message.role === 'user' ? 'bg-black/60 border-black/40 text-white' : 'bg-black/70 border-black/50 text-white'} backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)]`}>
        {message.role === 'assistant' ? (
          <div>
            {/* Render tool executions if any */}
            {message.tools && message.tools.length > 0 && (
              <ToolExecution tools={message.tools} />
            )}

            <div className="h-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <MarkdownRenderer
                content={message.content}
                isStreaming={isStreaming}
              />
            </div>

            {/* Render charts if any - show only the latest chart */}
            {message.charts && message.charts.length > 0 && (
              <div className="mt-6">
                <Chart key={`${message.id || index}-chart-${message.charts.length - 1}`} chart={message.charts[message.charts.length - 1]} />
              </div>
            )}
          </div>
        ) : (
          <span className="block text-md">{message.content}</span>
        )}
        <span className="pointer-events-none absolute inset-px rounded-[inherit] bg-gradient-to-b from-white/10 to-transparent" />
      </div>
    </div>
  )
}
"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrowUp, Paperclip, Command } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  sidebarOpen: boolean
}

export function ChatInput({ onSendMessage, isLoading, sidebarOpen }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea with responsive heights
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight

      // Responsive min/max heights
      const isMobile = window.innerWidth < 768
      const minHeight = isMobile ? 44 : 56
      const maxHeight = isMobile ? 120 : 200

      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight))
      textarea.style.height = newHeight + "px"
    }
  }, [inputValue])

  const handleSendMessage = () => {
    const message = inputValue.trim()
    if (!message || isLoading) return

    onSendMessage(message)
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="border-t border-white/10 p-6 backdrop-blur-xl">
      <div className={`max-w-4xl mx-auto transition-all duration-300 ${sidebarOpen ? 'lg:px-2' : ''}`}>
        <div className="relative rounded-3xl border border-white/20 backdrop-blur-xl bg-white/5">
          <div className="pointer-events-none absolute inset-px rounded-[inherit] bg-gradient-to-b from-white/8 to-transparent" />
          <div className="relative p-4 md:p-6">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Write your message..."
              disabled={isLoading}
              className="min-h-[44px] md:min-h-[56px] max-h-[120px] md:max-h-[200px] resize-none bg-transparent border-0 text-white placeholder:text-white/60 pr-12 md:pr-16 pb-12 md:pb-16 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg md:text-xl leading-relaxed"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '0.01em'
              }}
            />

            {/* Send button inside textarea */}
            <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8">
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white/95 hover:bg-white text-black shadow-[0_12px_30px_rgba(0,0,0,0.3)] disabled:bg-white/20 disabled:text-white/40"
              >
                <ArrowUp className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 pb-4 text-white/50 text-sm border-t border-white/8 pt-4">
            <div className="relative group">
              <Button variant="ghost" size="sm" className="h-9 px-4 text-white/40 bg-white/5 hover:text-white/40  hover:bg-white/5 rounded-xl border border-white/10 backdrop-blur-xl cursor-not-allowed">
                <Paperclip className="h-4 w-4 mr-2" />
                <span>Attach</span>
              </Button>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white/80 whitespace-nowrap">
                  Coming Soon
                  <div className="absolute top-full right-3 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black/80"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center text-white/40">
              <Command className="h-4 w-4 mr-2" />
              <span>⌘⏎ to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Paperclip, Command, ArrowUp } from "lucide-react"

interface MainPromptInputProps {
  isMobile?: boolean
  presetValue?: string
  onSubmit?: (message: string) => void
}

export default function MainPromptInput({ isMobile = false, presetValue, onSubmit }: MainPromptInputProps) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSendPrompt = useCallback(() => {
    const msg = inputValue.trim()
    if (!msg) return
    if (onSubmit) {
      onSubmit(msg)
    } else {
      router.push(`/chat?query=${encodeURIComponent(msg)}`)
    }
  }, [inputValue, onSubmit, router])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSendPrompt()
    }
  }, [handleSendPrompt])

  // If a presetValue is provided by parent (e.g., clicking a suggestion),
  // sync it into the input and focus the textarea.
  useEffect(() => {
    if (typeof presetValue !== "string") return
    setInputValue(presetValue)
    const t = textareaRef.current
    if (t) {
      requestAnimationFrame(() => {
        t.focus()
        t.selectionStart = t.selectionEnd = presetValue.length
      })
    }
  }, [presetValue])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight
      const minHeight = isMobile ? 100 : 140
      const maxHeight = isMobile ? 200 : 300
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight))
      textarea.style.height = newHeight + "px"
    }
  }, [inputValue, isMobile])

  return (
    <div className="w-full max-w-4xl mx-auto pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 300, damping: 30 }}
        className="relative"
      >
        <div
          className={`relative backdrop-blur-3xl bg-white/[0.10] border border-white/25 ${isMobile ? "rounded-3xl" : "rounded-4xl"}
            shadow-[0_36px_72px_rgba(0,0,0,0.16)] transition-all duration-300 ease-out ${isFocused ? "ring-2 ring-white/25" : "hover:bg-white/[0.12] hover:border-white/30"
            }`}
        >
          <div className="pointer-events-none absolute inset-px rounded-[inherit] bg-gradient-to-b from-white/15 to-transparent" />
          <div className={`relative ${isMobile ? "p-5" : "p-8"}`}>
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder=""
              className={`${useMemo(() => {
                return [
                  "w-full resize-none bg-transparent border-0 text-white/90 placeholder:text-white/40",
                  "ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none focus:outline-none focus-visible:outline-none shadow-none",
                  isMobile
                    ? "min-h-[100px] text-base leading-relaxed pr-14"
                    : "min-h-[140px] text-xl sm:text-2xl md:text-2xl lg:text-3xl leading-relaxed pr-24",
                ].join(" ")
              }, [isMobile])} transition-all duration-200`}
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: "0.015em",
              }}
            />

            <AnimatePresence>
              {!inputValue && !isFocused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={`absolute ${isMobile ? "top-5" : "top-8"} ${isMobile ? "left-5" : "left-8"
                    } pointer-events-none`}
                  transition={{ duration: 0.2 }}
                >
                  <motion.span
                    className={`text-white/45 ${isMobile ? "text-base" : "text-xl sm:text-2xl md:text-2xl lg:text-3xl"}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    Write your message…
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {inputValue.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute ${isMobile ? "bottom-2 left-5" : "bottom-3 left-8"} text-white/30 text-sm tabular-nums`}
              >
                {inputValue.length} characters
              </motion.div>
            )}

            <div className={`absolute ${isMobile ? "bottom-5 right-5" : "bottom-8 right-8"}`}>
              <AnimatePresence>
                {inputValue.trim() && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -90 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 600, damping: 25 }}
                  >
                    <Button
                      onClick={handleSendPrompt}
                      className={`${isMobile ? "h-12 w-12" : "h-16 w-16"} rounded-2xl bg-white/95 hover:bg-white text-gray-900 border border-white/60 transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xl`}
                      style={{
                        boxShadow:
                          "0 12px 32px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <ArrowUp className={`${isMobile ? "h-5 w-5" : "h-7 w-7"} transition-transform duration-200`} />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className={`flex items-center justify-between ${isMobile ? "px-5 pb-5" : "px-8 pb-6"} pt-4 border-t border-white/8`}>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="h-9 px-3 text-white/55 hover:text-white/80 hover:bg-white/8 transition-all duration-200 rounded-xl">
                <Paperclip className="h-4 w-4 mr-2" />
                <span className={isMobile ? "text-sm" : "text-base"}>Attach</span>
              </Button>

              {inputValue.trim().length > 0 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-white/40 text-sm tabular-nums">
                  {inputValue
                    .trim()
                    .split(/\s+/)
                    .filter((word) => word.length > 0).length} words
                </motion.div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-white/40 text-sm">
                <Command className="h-3 w-3 mr-1.5" />
                <span>⏎ Send</span>
              </div>

              {isFocused && (
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center text-white/30 text-sm">
                  <motion.div
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2 h-2 bg-green-400 rounded-full mr-2"
                  />
                  <span>Ready</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 -z-10 rounded-4xl"
          style={{
            background:
              "radial-gradient(800px circle at 50% 50%, rgba(255, 255, 255, 0.08), transparent 70%), radial-gradient(400px circle at 30% 80%, rgba(59, 130, 246, 0.05), transparent 50%), radial-gradient(400px circle at 70% 20%, rgba(168, 85, 247, 0.05), transparent 50%)",
            filter: "blur(24px)",
            transform: "scale(1.1)",
          }}
        />
      </motion.div>
    </div>
  )
}

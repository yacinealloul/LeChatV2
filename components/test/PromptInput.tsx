"use client"

import { useState, useRef, useEffect, useMemo, memo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Paperclip, Command, ArrowUp } from "lucide-react"

interface PromptInputProps {
  isMobile?: boolean
}

// Static suggestions to avoid re-allocation on each render
const SUGGESTIONS = [
  "Write a catchy LinkedIn post",
  "Summarize this document in 5 bullets",
  "Draft a clear professional email",
  "Explain AI in simple terms",
  "Brainstorm startup ideas",
  "Create a weekly meal plan",
  "Refactor this code snippet",
  "Generate social captions",
  "Design a landing page hero",
  "Plan a weekend in Lisbon",
] as const

export default function PromptInput({ isMobile = false }: PromptInputProps) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Chat mode state and thread
  const [isChatMode, setIsChatMode] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const threadEndRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  // Rotating title/subtitle (EN, FR, ES, DE, IT)
  const phrases = useMemo(
    () => [
      "How can I help you?", // EN
      "En quoi puis‑je t’aider ?", // FR
      "¿Cómo puedo ayudarte?", // ES
      "Wie kann ich dir helfen?", // DE
      "Come posso aiutarti?", // IT
    ],
    []
  )
  const phrasesAssist = useMemo(
    () => [
      "Ask me anything, I'm here to assist", // EN
      "Demande‑moi n’importe quoi, je suis là pour t’aider", // FR
      "Pregúntame lo que quieras, estoy aquí para ayudarte", // ES
      "Frag mich alles, ich bin hier, um zu helfen", // DE
      "Chiedimi qualsiasi cosa, sono qui per aiutarti", // IT
    ],
    []
  )
  const [phraseIndex, setPhraseIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % phrases.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [phrases.length])

  // Inject marquee keyframes once for in-place suggestions ticker
  useEffect(() => {
    const id = "promptinput-marquee-keyframes"
    if (document.getElementById(id)) return
    const style = document.createElement("style")
    style.id = id
    style.textContent = `
      @keyframes promptMarqueeScroll {
        0% { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-50%, 0, 0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .prefers-reduced-motion { animation: none !important; }
      }
    `
    document.head.appendChild(style)
    return () => { document.getElementById(id)?.remove() }
  }, [])

  const handleSendPrompt = useCallback(() => {
    const msg = inputValue.trim()
    if (!msg || isLoading || isTransitioning) return

    setIsTransitioning(true)
    setIsLoading(true)
    // Create transition animation and navigate to chat
    setTimeout(() => {
      router.push(`/chat?query=${encodeURIComponent(msg)}`)
    }, 800)
  }, [inputValue, isLoading, isTransitioning, router])
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSendPrompt()
    }
  }, [handleSendPrompt])

  // Auto-resize textarea with improved sizing
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight
      const minHeight = isMobile ? 100 : 140 // Increased minimum height
      const maxHeight = isMobile ? 200 : 300 // Increased maximum height
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight))
      textarea.style.height = newHeight + "px"
    }
  }, [inputValue, isMobile])

  const suggestions = SUGGESTIONS

  return (
    <motion.div
      className="fixed inset-0 flex flex-col justify-center z-50 pointer-events-none px-4"
      animate={isTransitioning ? {
        scale: 0.9,
        opacity: 0,
        filter: "blur(10px)",
        rotateX: 15
      } : {
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        rotateX: 0
      }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        scale: { duration: 0.6 },
        opacity: { duration: 0.7 },
        filter: { duration: 0.5 }
      }}
    >
      {/* Liquid glass ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70rem 70rem at 20% 80%, rgba(120,119,198,0.10), transparent 50%)," +
              "radial-gradient(60rem 60rem at 80% 20%, rgba(255,119,198,0.08), transparent 48%)," +
              "radial-gradient(50rem 50rem at 45% 35%, rgba(168,85,247,0.06), transparent 42%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\\\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\\\")",
            backgroundSize: '256px 256px',
          }}
        />
      </div>
      {/* Simple top-centered logo (no container) */}
      <img
        src="/mistral.svg"

        onError={(e) => {
          const t = e.currentTarget as HTMLImageElement
          if (t.src.endsWith("/mistral.svg")) t.src = "/mistral.svg"
        }}
        alt="Mistral"
        className="absolute top-6 left-1/2 -translate-x-1/2 h-10 sm:h-12 md:h-14 w-auto z-50"
      />

      {/* Welcome message */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center mb-8 pointer-events-none"
      >
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl leading-tight mb-4 text-white/90 tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.span
            key={phraseIndex}
            initial={{ opacity: 0.0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "inline-block" }}
          >
            <TextScramble text={phrases[phraseIndex]} reduced={prefersReducedMotion} duration={2000} />
          </motion.span>
        </motion.h1>
        <motion.p
          className="text-white/75 text-xl sm:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <motion.span
            key={`assist-${phraseIndex}`}
            initial={{ opacity: 0.0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "inline-block" }}
          >
            <TextScramble text={phrasesAssist[phraseIndex]} reduced={prefersReducedMotion} duration={1800} />
          </motion.span>
        </motion.p>
      </motion.div>

      {/* Main input container */}
      <div className="w-full max-w-4xl mx-auto pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 300, damping: 30 }}
          className="relative"
        >
          {/* Input container with enhanced glass morphism */}
          <div
            className={`relative backdrop-blur-3xl bg-white/[0.10] border border-white/25 ${isMobile ? "rounded-3xl" : "rounded-4xl"}
              shadow-[0_36px_72px_rgba(0,0,0,0.16)] transition-all duration-300 ease-out ${isFocused ? "ring-2 ring-white/25" : "hover:bg-white/[0.12] hover:border-white/30"
              }`}
          >
            {/* Soft reflection */}
            <div className="pointer-events-none absolute inset-px rounded-[inherit] bg-gradient-to-b from-white/15 to-transparent" />
            {/* Textarea */}
            <div className={`relative ${isMobile ? "p-5" : "p-8"}`}>
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder=""
                disabled={isLoading}
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

              {/* Smooth placeholder (hidden while focused or when text exists) */}
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

              {/* Character counter when typing */}
              {inputValue.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`absolute ${isMobile ? "bottom-2 left-5" : "bottom-3 left-8"} text-white/30 text-sm tabular-nums`}
                >
                  {inputValue.length} characters
                </motion.div>
              )}

              {/* Send button */}
              <div className={`absolute ${isMobile ? "bottom-5 right-5" : "bottom-8 right-8"}`}>
                <AnimatePresence>
                  {inputValue.trim() && !isLoading && (
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

                {/* Loading state */}
                {isLoading && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`${isMobile ? "h-12 w-12" : "h-16 w-16"} rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-xl`}
                    style={{
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                          className="w-2 h-2 bg-white/80 rounded-full"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom bar with shortcuts */}
            <div className={`flex items-center justify-between ${isMobile ? "px-5 pb-5" : "px-8 pb-6"} pt-4 border-t border-white/8`}>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="h-9 px-3 text-white/55 hover:text-white/80 hover:bg-white/8 transition-all duration-200 rounded-xl">
                  <Paperclip className="h-4 w-4 mr-2" />
                  <span className={isMobile ? "text-sm" : "text-base"}>Attach</span>
                </Button>

                {/* Word count when typing */}
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

                {/* Enhanced focus indicator */}
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

          {/* Enhanced ambient glow */}
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

        {/* Suggestions marquee within the existing zone: two rows, opposite directions */}
        <AnimatePresence mode="wait">
          {!isLoading && (
            <motion.div
              key="suggestions-marquee"
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, filter: "blur(6px)", transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] } }}
              transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              className="mt-6 relative"
              style={{ willChange: "opacity, transform, filter" }}
            >
              <div
                className="relative left-1/2 -translate-x-1/2 w-[88vw] sm:w-[72vw] lg:w-[60vw] overflow-hidden"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
                  maskImage:
                    "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
                  backfaceVisibility: "hidden",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Row 1: left scroll, two identical groups for seamless loop */}
                <div className="overflow-hidden py-1">
                  <div
                    className="prefers-reduced-motion will-change-transform flex whitespace-nowrap"
                    style={{ animation: `promptMarqueeScroll ${isMobile ? 38 : 44}s linear infinite` }}
                  >
                    <div className="flex-none flex gap-3">
                      {suggestions.map((s) => (
                        <button
                          key={`r1-${s}`}
                          onClick={() => setInputValue(s)}
                          className={`${isMobile ? "px-4 py-2.5 text-sm" : "px-6 py-3 text-base"} rounded-2xl backdrop-blur-2xl bg-white/[0.06] border border-white/20 text-white/75 hover:text-white/90 hover:bg-white/[0.12] hover:border-white/30 transition-all duration-300`}
                          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.12)" }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div aria-hidden className="flex-none flex gap-3">
                      {suggestions.map((s, i) => (
                        <button
                          key={`r1dup-${i}-${s}`}
                          onClick={() => setInputValue(s)}
                          className={`${isMobile ? "px-4 py-2.5 text-sm" : "px-6 py-3 text-base"} rounded-2xl backdrop-blur-2xl bg-white/[0.06] border border-white/20 text-white/75 hover:text-white/90 hover:bg-white/[0.12] hover:border-white/30 transition-all duration-300`}
                          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.12)" }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 2: right scroll (reverse), two identical groups */}
                <div className="overflow-hidden py-1 mt-3">
                  <div
                    className="prefers-reduced-motion will-change-transform flex whitespace-nowrap"
                    style={{ animation: `promptMarqueeScroll ${isMobile ? 40 : 48}s linear infinite reverse` }}
                  >
                    <div className="flex-none flex gap-3">
                      {suggestions.map((s) => (
                        <button
                          key={`r2-${s}`}
                          onClick={() => setInputValue(s)}
                          className={`${isMobile ? "px-4 py-2.5 text-sm" : "px-6 py-3 text-base"} rounded-2xl backdrop-blur-2xl bg-white/[0.06] border border-white/20 text-white/75 hover:text-white/90 hover:bg-white/[0.12] hover:border-white/30 transition-all duration-300`}
                          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.12)" }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div aria-hidden className="flex-none flex gap-3">
                      {suggestions.map((s, i) => (
                        <button
                          key={`r2dup-${i}-${s}`}
                          onClick={() => setInputValue(s)}
                          className={`${isMobile ? "px-4 py-2.5 text-sm" : "px-6 py-3 text-base"} rounded-2xl backdrop-blur-2xl bg-white/[0.06] border border-white/20 text-white/75 hover:text-white/90 hover:bg-white/[0.12] hover:border-white/30 transition-all duration-300`}
                          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.12)" }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Lightweight text scramble component for smooth letter morphing
const TextScramble = memo(function TextScramble({ text, reduced = false, duration = 1200 }: { text: string; reduced?: boolean; duration?: number }) {
  const [output, setOutput] = useState<string>(text)
  const frameRef = useRef<number>()
  const frame = useRef(0)
  const queue = useRef<{ from: string; to: string; start: number; end: number; char?: string }[]>([])
  const prevTextRef = useRef<string>("")

  useEffect(() => {
    const from = prevTextRef.current
    const to = text
    if (reduced) {
      setOutput(to)
      prevTextRef.current = to
      return
    }

    const len = Math.max(from.length, to.length)
    // Create a left-to-right wave with gentle stagger
    const totalFrames = Math.max(24, Math.round((duration / 1000) * 60))
    const stagger = Math.max(1, Math.floor(totalFrames / Math.max(10, len)))
    const life = Math.max(10, Math.floor(totalFrames * 0.45))
    queue.current = Array.from({ length: len }).map((_, i) => ({
      from: from[i] || "",
      to: to[i] || "",
      start: i * stagger,
      end: i * stagger + life,
    }))
    cancelAnimationFrame(frameRef.current!)
    frame.current = 0
    update()
    prevTextRef.current = to
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reduced, duration])

  function randomChar() {
    // Visually pleasing glyphs for softer scramble
    const chars = "abcdef-+*/~|<>_=^"
    return chars[Math.floor(Math.random() * chars.length)]
  }

  function update() {
    let complete = 0
    let out = ""
    for (let i = 0; i < queue.current.length; i++) {
      const q = queue.current[i]
      if (frame.current >= q.end) {
        complete++
        out += q.to
      } else if (frame.current >= q.start) {
        if (!q.char || Math.random() < 0.28) q.char = randomChar()
        out += q.char
      } else {
        out += q.from
      }
    }
    setOutput(out)
    frame.current++
    if (complete === queue.current.length) return
    frameRef.current = requestAnimationFrame(update)
  }

  return <span style={{ display: "inline-block", willChange: "contents" }}>{output}</span>
})

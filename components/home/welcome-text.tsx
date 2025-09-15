"use client"

import { useState, useEffect, useMemo, memo, useRef } from "react"
import { motion } from "framer-motion"

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
  }, [text, reduced, duration])

  function randomChar() {
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

export default function WelcomeText() {
  const phrases = useMemo(
    () => [
      "How can I help you?",
      "En quoi puis‑je t'aider ?",
      "¿Cómo puedo ayudarte?",
      "Wie kann ich dir helfen?",
      "Come posso aiutarti?",
    ],
    []
  )
  const phrasesAssist = useMemo(
    () => [
      "Ask me anything, I'm here to assist",
      "Demande‑moi n'importe quoi, je suis là pour t'aider",
      "Pregúntame lo que quieras, estoy aquí para ayudarte",
      "Frag mich alles, ich bin hier, um zu helfen",
      "Chiedimi qualsiasi cosa, sono qui per aiutarti",
    ],
    []
  )
  
  const [phraseIndex, setPhraseIndex] = useState(0)
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % phrases.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [phrases.length])

  return (
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
  )
}
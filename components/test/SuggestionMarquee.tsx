"use client"

import { useEffect } from "react"

type SuggestionMarqueeProps = {
  speedSeconds?: number // total duration for one loop
}

const DEFAULT_SUGGESTIONS = [
  "Write a catchy LinkedIn post",
  "Summarize this PDF",
  "Draft a cold email",
  "Explain AI agents simply",
  "Brainstorm startup ideas",
  "Create a weekly meal plan",
  "Refactor this code snippet",
  "Generate social captions",
  "Design a landing page hero",
  "Plan a 3-day trip to Tokyo",
]

export default function SuggestionMarquee({ speedSeconds = 28 }: SuggestionMarqueeProps) {
  // Inject local keyframes once
  useEffect(() => {
    const id = "suggestion-marquee-keyframes"
    if (document.getElementById(id)) return
    const style = document.createElement("style")
    style.id = id
    style.textContent = `
      @keyframes marqueeScroll {
        0% { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-50%, 0, 0); }
      }
    `
    document.head.appendChild(style)
    return () => {
      const el = document.getElementById(id)
      if (el) el.remove()
    }
  }, [])

  // Duplicate list to ensure seamless loop
  const list = [...DEFAULT_SUGGESTIONS, ...DEFAULT_SUGGESTIONS]

  return (
    <div
      className="fixed inset-x-0 bottom-8 z-40 pointer-events-none"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div className="relative w-full overflow-hidden">
        {/* Track A */}
        <div
          className="will-change-transform flex gap-3 whitespace-nowrap"
          style={{
            animation: `marqueeScroll ${speedSeconds}s linear infinite`,
          }}
        >
          {list.map((text, i) => (
            <Chip key={`a-${i}-${text}`}>{text}</Chip>
          ))}
        </div>

        {/* Track B (offset) */}
        <div
          className="will-change-transform flex gap-3 whitespace-nowrap absolute inset-0"
          style={{
            animation: `marqueeScroll ${speedSeconds}s linear infinite`,
            animationDelay: `-${speedSeconds / 2}s`,
          }}
        >
          {list.map((text, i) => (
            <Chip key={`b-${i}-${text}`}>{text}</Chip>
          ))}
        </div>
      </div>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="pointer-events-auto select-none px-5 py-2 rounded-2xl backdrop-blur-xl bg-white/[0.08] border border-white/20 text-white/80 hover:text-white/90 hover:bg-white/[0.12] hover:border-white/30 transition-colors duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      style={{
        boxShadow:
          "0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.12)",
      }}
    >
      {children}
    </div>
  )
}


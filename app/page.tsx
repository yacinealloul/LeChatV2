"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

import HeroSection from "@/components/home/hero-section"
import WelcomeText from "@/components/home/welcome-text"
import MainPromptInput from "@/components/home/main-prompt-input"
import SuggestionsMarquee from "@/components/home/suggestions-marquee"
import HomeBackground from "@/components/home/background"
import PromoCard from "@/components/home/promo-card"


export default function Home() {
  //const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [presetValue, setPresetValue] = useState<string | undefined>(undefined)

  useEffect(() => {
    const onResize = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 768)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const handleSuggestion = useCallback((text: string) => {
    const msg = text.trim()
    if (!msg) return
    // Do NOT navigate here. Just preset the input value and focus.
    setPresetValue(msg)
  }, [])

  return (
    <main className="relative min-h-screen flex items-start sm:items-center justify-center pt-24 sm:pt-0">
      <HeroSection />

      <HomeBackground />

      <motion.div
        className="w-full px-4 sm:px-6"
        animate={
          isTransitioning
            ? { scale: 0.94, opacity: 0, filter: "blur(10px)", rotateX: 12 }
            : { scale: 1, opacity: 1, filter: "blur(0px)", rotateX: 0 }
        }
        transition={{
          duration: 0.65,
          ease: [0.25, 0.46, 0.45, 0.94],
          opacity: { duration: 0.55 },
        }}

      >
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <WelcomeText />
          <MainPromptInput isMobile={isMobile} presetValue={presetValue} />
          <SuggestionsMarquee isLoading={false} isMobile={isMobile} onSuggestionClick={handleSuggestion} />
        </div>
      </motion.div>

      <PromoCard />
    </main>
  )
}


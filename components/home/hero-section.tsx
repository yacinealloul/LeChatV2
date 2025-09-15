"use client"

export default function HeroSection() {
  return (
    <img
      src="/mistral.svg"
      onError={(e) => {
        const t = e.currentTarget as HTMLImageElement
        if (t.src.endsWith("/mistral.svg")) t.src = "/mistral.svg"
      }}
      alt="Mistral"
      className="fixed top-3 sm:top-4 md:top-8 left-1/2 -translate-x-1/2 h-8 sm:h-10 md:h-16 w-auto z-50 pointer-events-none"
    />
  )
}

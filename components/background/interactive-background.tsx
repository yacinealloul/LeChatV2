"use client"
import { Canvas } from "@react-three/fiber"
import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import GrainyGradient from "./grainy-gradient"
import { usePathname } from "next/navigation"

// Throttle utility for performance optimization
const throttle = (func: Function, limit: number) => {
  let inThrottle = false
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export default function InteractiveBackground() {
  const pathname = usePathname()
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })

  const [isInteracting, setIsInteracting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [dpr, setDpr] = useState(1)
  const rafId = useRef<number>(0)
  const lastUpdateTime = useRef(0)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        (typeof window !== "undefined" && window.innerWidth <= 768) ||
        (typeof window !== "undefined" && "ontouchstart" in window) ||
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          typeof navigator !== "undefined" ? navigator.userAgent : ""
        )
      setIsMobile(!!isMobileDevice)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Determine device pixel ratio safely on client
  useEffect(() => {
    if (typeof window === "undefined") return

    const updateDpr = () => {
      const next = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5)
      setDpr(next)
    }

    updateDpr()
    window.addEventListener("resize", updateDpr)
    window.addEventListener("orientationchange", updateDpr)
    return () => {
      window.removeEventListener("resize", updateDpr)
      window.removeEventListener("orientationchange", updateDpr)
    }
  }, [isMobile])

  // Add CSS animation for glare effect
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      @keyframes fullScreenGlare {
        0% { transform: translateX(-100vw) skewX(-25deg); opacity: 0; }
        15% { transform: translateX(-50vw) skewX(-25deg); opacity: 0.3; }
        30% { transform: translateX(100vw) skewX(-25deg); opacity: 0.3; }
        35% { transform: translateX(120vw) skewX(-25deg); opacity: 0; }
        100% { transform: translateX(120vw) skewX(-25deg); opacity: 0; }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Optimized position handler with throttling and requestAnimationFrame
  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      const now = performance.now()
      const throttleMs = isMobile ? 32 : 16 // 30fps on mobile, 60fps on desktop

      if (now - lastUpdateTime.current < throttleMs) return

      if (rafId.current) cancelAnimationFrame(rafId.current)

      rafId.current = requestAnimationFrame(() => {
        const width = window.innerWidth || 1
        const height = window.innerHeight || 1
        const x = clientX / width
        const y = 1.0 - clientY / height
        setMousePosition({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) })
        lastUpdateTime.current = now
      })
    },
    [isMobile]
  )

  // Optimized and throttled event handlers
  const throttledPointerMove = useMemo(
    () =>
      throttle((clientX: number, clientY: number) => {
        updatePosition(clientX, clientY)
        setIsInteracting(true)
      }, isMobile ? 32 : 16),
    [updatePosition, isMobile]
  )

  // Disabled mouse interaction effects
  // useEffect(() => {
  //   const onMouseMove = (e: MouseEvent) => {
  //     if (!isMobile) throttledPointerMove(e.clientX, e.clientY)
  //   }
  //   const onMouseLeave = () => {
  //     if (!isMobile) setIsInteracting(false)
  //   }
  //   const onTouchStart = (e: TouchEvent) => {
  //     if (!isMobile) return
  //     const t = e.touches[0]
  //     if (t) {
  //       setIsInteracting(true)
  //       updatePosition(t.clientX, t.clientY)
  //     }
  //   }
  //   const onTouchMove = (e: TouchEvent) => {
  //     if (!isMobile) return
  //     const t = e.touches[0]
  //     if (t) throttledPointerMove(t.clientX, t.clientY)
  //   }
  //   const onTouchEnd = () => {
  //     if (isMobile) setIsInteracting(false)
  //   }

  //   window.addEventListener("mousemove", onMouseMove, { passive: true })
  //   window.addEventListener("mouseleave", onMouseLeave, { passive: true })
  //   window.addEventListener("touchstart", onTouchStart, { passive: true })
  //   window.addEventListener("touchmove", onTouchMove, { passive: true })
  //   window.addEventListener("touchend", onTouchEnd, { passive: true })

  //   return () => {
  //     window.removeEventListener("mousemove", onMouseMove as any)
  //     window.removeEventListener("mouseleave", onMouseLeave as any)
  //     window.removeEventListener("touchstart", onTouchStart as any)
  //     window.removeEventListener("touchmove", onTouchMove as any)
  //     window.removeEventListener("touchend", onTouchEnd as any)
  //     if (rafId.current) cancelAnimationFrame(rafId.current)
  //   }
  // }, [isMobile, throttledPointerMove, updatePosition])

  return (
    <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
      {/* Full screen animated glare effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(110deg, transparent 0%, transparent 40%, rgba(255, 255, 255, 0.15) 45%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.15) 55%, transparent 60%, transparent 100%)",
          transform: "translateX(-100vw)",
          animation: "fullScreenGlare 8s ease-in-out infinite",
          mixBlendMode: "overlay",
        }}
      />

      {/* Subtle full-screen glass overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 30%, rgba(255, 255, 255, 0.02) 70%, rgba(255, 255, 255, 0.04) 100%)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Full screen Canvas - Highly optimized */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 1] }}
          gl={{
            preserveDrawingBuffer: false,
            antialias: false,
            powerPreference: "high-performance",
            stencil: false,
            depth: false,
            alpha: false,
            premultipliedAlpha: false,
            logarithmicDepthBuffer: false,
          }}
          dpr={dpr}
          frameloop={isMobile ? "demand" : "always"}
          performance={{ min: 0.2 }}
          onCreated={({ gl }) => {
            // Additional WebGL optimizations
            gl.shadowMap.enabled = false
            // @ts-expect-error legacy options depending on fiber version
            gl.physicallyCorrectLights = false
            // @ts-expect-error legacy options depending on fiber version
            gl.outputEncoding = undefined
            // @ts-expect-error legacy options depending on fiber version
            gl.toneMapping = undefined
          }}
        >
          <GrainyGradient
            mousePosition={{ x: 0.5, y: 0.5 }}
            isMobile={isMobile}
            isInteracting={false}
          />
        </Canvas>
      </div>
    </div>
  )
}

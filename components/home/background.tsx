"use client"

export default function HomeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Top vignette + subtle radial glow */}
      <div
        className="absolute inset-x-0 top-0 h-[40vh]"
        style={{
          background:
            "radial-gradient(60% 120% at 50% -10%, rgba(255,255,255,0.18), rgba(255,255,255,0.06) 40%, transparent 65%)",
          filter: "blur(30px)",
          transform: "translateZ(0)",
        }}
      />

      {/* Bottom ambient color wash (brand-ish) */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45vh]"
        style={{
          background:
            "radial-gradient(80% 120% at 50% 110%, rgba(255,138,0,0.10), rgba(255,87,51,0.10) 30%, transparent 70%)",
          filter: "blur(22px)",
          transform: "translateZ(0)",
        }}
      />

      {/* Soft noise overlay to reduce banding */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 2px)",
        }}
      />

      {/* Glass sheen at the center behind the input */}
      <div
        className="absolute left-1/2 top-[40vh] -translate-x-1/2 -translate-y-1/2 w-[72vw] sm:w-[60vw] lg:w-[48vw] h-[52vh] rounded-[40px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,0.14), rgba(255,255,255,0.08) 40%, transparent 70%)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          maskImage:
            "radial-gradient(80% 80% at 50% 50%, black, black 60%, rgba(0,0,0,0.5) 70%, transparent 100%)",
        }}
      />
    </div>
  )
}

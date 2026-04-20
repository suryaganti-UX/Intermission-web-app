import { useState, useEffect, useCallback, useRef } from 'react'

export default function AuroraBackground({ isSession }) {
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 })
  const rafRef = useRef(null)
  const pendingPos = useRef(null)

  const onMouseMove = useCallback((e) => {
    pendingPos.current = { x: e.clientX, y: e.clientY }
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingPos.current) setMousePos(pendingPos.current)
        rafRef.current = null
      })
    }
  }, [])

  useEffect(() => {
    if (isSession) return
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isSession, onMouseMove])

  return (
    <>
      <div className="aurora" aria-hidden="true">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
        <div className="aurora-orb aurora-orb-4" />
      </div>

      {/* SVG noise grain */}
      <svg
        className="aurora-noise"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="200"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%' }}
      >
        <filter id="aurora-noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#aurora-noise-filter)" />
      </svg>

      {/* Cursor-following glow (home + duration only) */}
      {!isSession && mousePos.x > -500 && (
        <div
          className="cursor-glow"
          aria-hidden="true"
          style={{ left: mousePos.x, top: mousePos.y }}
        />
      )}
    </>
  )
}

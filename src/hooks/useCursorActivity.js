import { useEffect, useRef, useCallback } from 'react'

/**
 * Monitors pointer (mouse only) activity during a session.
 * Triggers onReset when the user moves their cursor significantly
 * and continues moving within 4 seconds, indicating they're still working.
 *
 * Philosophy: one micro-movement is forgiven. Sustained movement is not.
 *
 * @param {object} options
 * @param {boolean} options.enabled - Arm/disarm the detector
 * @param {number}  options.remaining - Current remaining seconds (used for ≤15s guard)
 * @param {Function} options.onReset - Called with reset count (1-based)
 * @param {number}  options.maxResets - Max resets before giving up (default 3)
 */
export function useCursorActivity({ enabled, remaining, onReset, maxResets = 3 }) {
  const lastPos = useRef(null)
  const lastMoveTime = useRef(null)
  const inactivityTimer = useRef(null)
  const resetCount = useRef(0)
  const enabledRef = useRef(enabled)
  const remainingRef = useRef(remaining)

  // Keep refs in sync without re-subscribing listeners
  useEffect(() => { enabledRef.current = enabled }, [enabled])
  useEffect(() => { remainingRef.current = remaining }, [remaining])

  const clearInactivity = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current)
      inactivityTimer.current = null
    }
  }, [])

  const handlePointerMove = useCallback((e) => {
    if (!enabledRef.current) return
    if (e.pointerType === 'touch') return
    if (e.target.closest?.('[data-no-reset]')) return
    if (remainingRef.current <= 15) return
    if (resetCount.current >= maxResets) return

    const { clientX: x, clientY: y } = e

    if (!lastPos.current) {
      lastPos.current = { x, y }
      return
    }

    const dx = x - lastPos.current.x
    const dy = y - lastPos.current.y
    const delta = Math.hypot(dx, dy)

    if (delta < 8) return // ignore micro-jitter

    lastPos.current = { x, y }
    const now = Date.now()

    if (lastMoveTime.current && (now - lastMoveTime.current < 4000)) {
      // Moved again within grace period → trigger reset
      clearInactivity()
      lastMoveTime.current = null
      lastPos.current = null
      resetCount.current += 1
      onReset(resetCount.current)
      return
    }

    // First significant move: record time, start 4s grace window
    lastMoveTime.current = now
    clearInactivity()
    inactivityTimer.current = setTimeout(() => {
      // User stayed still for 4s — forgive the movement
      lastMoveTime.current = null
      lastPos.current = null
    }, 4000)
  }, [onReset, maxResets, clearInactivity])

  useEffect(() => {
    if (!enabled) {
      clearInactivity()
      lastPos.current = null
      lastMoveTime.current = null
      return
    }

    document.addEventListener('pointermove', handlePointerMove)
    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      clearInactivity()
    }
  }, [enabled, handlePointerMove, clearInactivity])

  // Reset the counter when a new session starts
  const resetCounter = useCallback(() => {
    resetCount.current = 0
    lastPos.current = null
    lastMoveTime.current = null
    clearInactivity()
  }, [clearInactivity])

  return { resetCounter, getResetCount: () => resetCount.current }
}

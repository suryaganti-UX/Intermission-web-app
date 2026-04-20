import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer(total) {
  const [remaining, setRemaining] = useState(total)
  const [paused, setPaused] = useState(false)
  const remainingRef = useRef(total)
  const pausedRef = useRef(false)
  const intervalRef = useRef(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startInterval = useCallback(() => {
    clearTimer()
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearTimer()
          remainingRef.current = 0
          return 0
        }
        remainingRef.current = prev - 1
        return prev - 1
      })
    }, 1000)
  }, [clearTimer])

  useEffect(() => {
    if (!paused) {
      startInterval()
    } else {
      clearTimer()
    }
    return clearTimer
  }, [paused, startInterval, clearTimer])

  const pause = useCallback(() => {
    pausedRef.current = true
    setPaused(true)
  }, [])

  const resume = useCallback(() => {
    pausedRef.current = false
    setPaused(false)
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    remainingRef.current = total
    setRemaining(total)
    if (!pausedRef.current) {
      startInterval()
    }
  }, [total, clearTimer, startInterval])

  const stop = useCallback(() => {
    clearTimer()
    pausedRef.current = true
    setPaused(true)
  }, [clearTimer])

  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  return {
    remaining,
    paused,
    pause,
    resume,
    reset,
    stop,
    isComplete: remaining === 0,
    elapsed: total - remaining,
  }
}

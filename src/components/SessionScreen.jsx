import { useState, useEffect, useRef, useCallback } from 'react'
import { BREAKS } from '../config/breaks'
import { useTimer } from '../hooks/useTimer'
import { useCursorActivity } from '../hooks/useCursorActivity'
import useSessionAudio from '../hooks/useSessionAudio'
import CursorWarning from './CursorWarning'
import ExitDrawer from './ExitDrawer'

const CIRCUMFERENCE = 2 * Math.PI * 100 // ≈ 628.3

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function SessionScreen({ breakId, duration, onComplete, onExit }) {
  const b = BREAKS[breakId]
  const { remaining, paused, pause, resume, reset, stop, isComplete, elapsed } =
    useTimer(duration)

  // ── UI state ──────────────────────────────────────────
  const [showExit, setShowExit] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [cursorResetCount, setCursorResetCount] = useState(0)
  const [orbFullGlow, setOrbFullGlow] = useState(false)
  const pausedRef = useRef(false)

  // ── Breathing orb control ─────────────────────────────
  const [breathPhase, setBreathPhase] = useState(0)    // index into phases array
  const [breathScale, setBreathScale] = useState(0.92)
  const [breathTransition, setBreathTransition] = useState('4s ease-in-out')
  const breathTimer = useRef(null)
  const breathCycleRef = useRef(0)

  // ── Beat-pulse orb effect (stretch mode) ─────────────
  const [beatPulse, setBeatPulse] = useState(false)
  const handleBeat = useCallback(() => {
    setBeatPulse(true)
    setTimeout(() => setBeatPulse(false), 180)
  }, [])

  // ── Audio engine ──────────────────────────────────────
  const { isMuted, toggleMute } = useSessionAudio(breakId, {
    paused,
    enabled: !isComplete,
    onBeat: breakId === 'stretch' ? handleBeat : undefined,
  })

  // ── Prompt rotation ───────────────────────────────────
  const [promptIdx, setPromptIdx] = useState(0)
  const [promptVisible, setPromptVisible] = useState(true)

  // ── Eye / phase tracking ──────────────────────────────
  const [currentPhase, setCurrentPhase] = useState(b.phases?.[0] ?? '')
  const [cycleCount, setCycleCount] = useState(1)

  // ──────────────────────────────────────────────────────
  // Cursor activity detection
  // ──────────────────────────────────────────────────────
  const handleCursorReset = useCallback((count) => {
    if (count >= 3) {
      // Max resets: pause indefinitely, different message
      stop()
      pausedRef.current = true
    } else {
      pause()
      pausedRef.current = true
    }
    setCursorResetCount(count)
    setShowWarning(true)
  }, [pause, stop])

  const { resetCounter } = useCursorActivity({
    enabled: !paused && !showExit && !showWarning && appState !== 'done',
    remaining,
    onReset: handleCursorReset,
    maxResets: 3,
  })

  // ──────────────────────────────────────────────────────
  // Session complete
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isComplete) return
    clearBreathTimer()
    setOrbFullGlow(true)
    setTimeout(() => {
      onComplete({ resetCount: cursorResetCount })
    }, 800)
  }, [isComplete])

  // ──────────────────────────────────────────────────────
  // Keyboard: Space = pause/resume, Escape = exit
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' && !showExit && !showWarning) {
        e.preventDefault()
        if (paused) resume(); else pause()
      }
      if (e.key === 'Escape') {
        if (showWarning) return
        if (!showExit) { pause(); setShowExit(true) }
        else setShowExit(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [paused, showExit, showWarning, pause, resume])

  // ──────────────────────────────────────────────────────
  // Prompt rotation (based on remaining)
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isComplete) return
    const elapsed = duration - remaining
    const interval = duration / b.prompts.length
    const newIdx = Math.min(Math.floor(elapsed / interval), b.prompts.length - 1)
    if (newIdx !== promptIdx) {
      setPromptVisible(false)
      setTimeout(() => {
        setPromptIdx(newIdx)
        setPromptVisible(true)
      }, 600)
    }
  }, [remaining])

  // ──────────────────────────────────────────────────────
  // Phase tracking (eye, breath)
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!b.phases || isComplete || breakId === 'breath') return
    // eye: 8s per phase cycle
    const cycleMs = b.cycleDuration
    const phaseMs = cycleMs / b.phases.length
    const elapsed = duration - remaining
    const phaseIdx = Math.floor((elapsed % cycleMs) / phaseMs) % b.phases.length
    const cycle = Math.floor(elapsed / cycleMs) + 1
    setCurrentPhase(b.phases[phaseIdx])
    setCycleCount(cycle)
  }, [remaining])

  // ──────────────────────────────────────────────────────
  // Breathing animation (breath mode only)
  // ──────────────────────────────────────────────────────
  const clearBreathTimer = () => {
    if (breathTimer.current) { clearTimeout(breathTimer.current); breathTimer.current = null }
  }

  useEffect(() => {
    if (breakId !== 'breath') return
    if (paused || isComplete) { clearBreathTimer(); return }

    const phases = [
      { label: 'Breathe in',  scale: 1.3, transition: '4s ease-in-out',  dur: 4000 },
      { label: 'Hold',        scale: 1.3, transition: '0.1s linear',      dur: 4000 },
      { label: 'Breathe out', scale: 0.92,transition: '4s ease-in-out',  dur: 4000 },
      { label: 'Hold',        scale: 0.92,transition: '0.1s linear',      dur: 4000 },
    ]

    const runPhase = (idx) => {
      const p = phases[idx % phases.length]
      setCurrentPhase(p.label)
      setBreathScale(p.scale)
      setBreathTransition(p.transition)
      if (idx % phases.length === 0) {
        breathCycleRef.current += 1
        setCycleCount(breathCycleRef.current)
      }
      breathTimer.current = setTimeout(() => runPhase(idx + 1), p.dur)
    }

    runPhase(breathPhase)
    return clearBreathTimer
  }, [breakId, paused, isComplete])

  // ──────────────────────────────────────────────────────
  // Warning dismissed → reset session
  // ──────────────────────────────────────────────────────
  const handleWarningDismiss = () => {
    setShowWarning(false)
    if (cursorResetCount >= 3) {
      // Paused indefinitely — wait for user to tap "I'm ready"
      return
    }
    reset()
    setPromptIdx(0)
    setPromptVisible(true)
    resumeAfterReset()
  }

  const resumeAfterReset = () => {
    pausedRef.current = false
    resume()
  }

  // ──────────────────────────────────────────────────────
  // Progress ring
  // ──────────────────────────────────────────────────────
  const progressOffset = CIRCUMFERENCE * (remaining / duration)
  const progress = 1 - remaining / duration

  // Orb ring color
  const accent = b.accent
  const accentRgb = b.accentRgb

  // Orb core background
  const orbBg = `radial-gradient(circle, rgba(${accentRgb},0.35) 0%, rgba(${accentRgb},0.12) 40%, var(--bg) 100%)`
  const beatBoost = beatPulse ? 24 : 0
  const orbGlow = orbFullGlow
    ? `0 0 80px rgba(${accentRgb},0.6), 0 0 40px rgba(${accentRgb},0.4)`
    : `0 0 ${40 + Math.round(progress * 40) + beatBoost}px rgba(${accentRgb},${beatPulse ? 0.55 : 0.3})`

  // Timer copy
  const timerText = remaining <= 30
    ? `Almost there — ${remaining}s`
    : `${formatTime(remaining)} remaining`

  // Max-resets message
  const isMaxReset = cursorResetCount >= 3 && paused

  return (
    <div className="screen-wrap screen-enter" style={{ gap: 24 }}>
      {/* Break label */}
      <p className="label-caps" style={{ position: 'absolute', top: 32 }}>
        {b.name}
      </p>

      {/* Central orb */}
      <div
        className="orb-wrap"
        role="img"
        aria-label={`${b.name} orb, ${currentPhase || 'active'} phase`}
        style={{ marginTop: 20 }}
      >
        {/* Concentric rings */}
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`orb-ring orb-ring-${i + 1}`}
            style={{ borderColor: `rgba(${accentRgb},0.${3 + i * 2})` }}
          />
        ))}

        {/* SVG progress ring */}
        <svg
          className="orb-progress-svg"
          viewBox="0 0 220 220"
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden="true"
        >
          <circle
            cx="110" cy="110" r="100"
            fill="none"
            stroke={accent}
            strokeOpacity={0.3}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={progressOffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        {/* Orb core */}
        <div
          className="orb-core"
          style={{
            background: orbBg,
            boxShadow: orbGlow,
            animation: breakId !== 'breath' ? 'orbPulse 6s ease-in-out infinite' : 'none',
            transform: breakId === 'breath' ? `scale(${breathScale})` : undefined,
            transition: breakId === 'breath' ? `transform ${breathTransition}` : undefined,
          }}
        >
          <div
            className="orb-core-glow"
            style={{ background: `radial-gradient(circle, rgba(${accentRgb},0.4), transparent)` }}
          />
          {currentPhase && (
            <span className="orb-phase" aria-live="polite" aria-label={`Current phase: ${currentPhase}`}>
              {currentPhase}
            </span>
          )}
          {b.id !== 'quiet' && b.id !== 'stretch' && (
            <span className="orb-cycle">
              {b.id === 'breath' ? `Cycle ${cycleCount}` : `Pass ${cycleCount}`}
            </span>
          )}
        </div>
      </div>

      {/* Rotating prompt */}
      <div
        className="prompt-wrap"
        style={{ opacity: promptVisible ? 1 : 0 }}
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="prompt-text">
          {b.prompts[promptIdx]}
        </p>
        <p className="timer-text" aria-live="polite">
          {timerText}
        </p>
      </div>

      {/* Max resets message */}
      {isMaxReset && (
        <div
          className="glass-card"
          style={{ padding: '16px 20px', textAlign: 'center', maxWidth: 360 }}
          role="status"
        >
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            It's okay — take the time you need. Timer paused until you're ready.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setCursorResetCount(0)
              resetCounter()
              reset()
              setShowWarning(false)
              pausedRef.current = false
              resume()
            }}
            data-no-reset
          >
            I'm ready
          </button>
        </div>
      )}

      {/* Controls */}
      {!isMaxReset && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            className="btn"
            aria-pressed={paused}
            onClick={() => { if (paused) resume(); else pause() }}
            data-no-reset
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={toggleMute}
            aria-pressed={isMuted}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            data-no-reset
            title={isMuted ? 'Unmute' : 'Mute'}
            style={{ padding: '10px 14px', fontSize: 16, minWidth: 44 }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            className="btn btn-ghost btn-danger"
            onClick={() => { pause(); setShowExit(true) }}
            data-no-reset
          >
            Exit
          </button>
        </div>
      )}

      {/* Cursor warning overlay */}
      {showWarning && !isMaxReset && (
        <CursorWarning
          resetCount={cursorResetCount}
          accent={accent}
          onDismiss={handleWarningDismiss}
        />
      )}

      {/* Exit drawer */}
      {showExit && (
        <ExitDrawer
          remaining={remaining}
          onKeepGoing={() => {
            setShowExit(false)
            resume()
          }}
          onExit={() => {
            stop()
            onExit()
          }}
        />
      )}
    </div>
  )
}

// This ref is used to prevent double-firing on complete. Not ideal but
// we need a way to check if we've already navigated away.
let appState = 'active'

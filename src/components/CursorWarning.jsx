import { useEffect, useRef, useState } from 'react'

const MESSAGES = [
  "Your cursor moved. The break restarted — your body needs this.",
  "Try resting your hand away from the mouse. Restarting.",
  "One more try. Place your hands in your lap. You've got this.",
]

export default function CursorWarning({ resetCount, accent, onDismiss }) {
  const [phase, setPhase] = useState('entering')
  const [progress, setProgress] = useState(0)
  const autoTimer = useRef(null)
  const progTimer = useRef(null)

  useEffect(() => {
    // Start progress bar fill (3s)
    setProgress(0)
    const start = Date.now()
    progTimer.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 3000) * 100)
      setProgress(p)
    }, 50)

    // Auto-dismiss after 3s
    autoTimer.current = setTimeout(() => {
      dismiss()
    }, 3000)

    return () => {
      clearInterval(progTimer.current)
      clearTimeout(autoTimer.current)
    }
  }, [])

  const dismiss = () => {
    clearInterval(progTimer.current)
    clearTimeout(autoTimer.current)
    setPhase('exiting')
    setTimeout(onDismiss, 320)
  }

  const msg = MESSAGES[Math.min(resetCount - 1, MESSAGES.length - 1)]

  return (
    <div
      className={`cursor-warning ${phase}`}
      role="alertdialog"
      aria-live="assertive"
      aria-label="Cursor activity detected"
      onClick={dismiss}
      style={{ cursor: 'pointer' }}
    >
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="9" stroke={accent} strokeWidth="1.5" strokeOpacity="0.8"/>
            <circle cx="10" cy="10" r="3.5" fill={accent} fillOpacity="0.6"/>
            <line x1="10" y1="1" x2="10" y2="6" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p
            className="font-display"
            style={{ fontSize: 20, fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1 }}
          >
            Still here?
          </p>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{msg}</p>

        <div className="warning-progress">
          <div
            className="warning-progress-fill"
            style={{
              width: `${progress}%`,
              background: accent,
              transition: progress === 0 ? 'none' : 'width 50ms linear',
            }}
          />
        </div>
      </div>
    </div>
  )
}

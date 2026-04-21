import { useEffect, useState } from 'react'

export default function ExitDrawer({ remaining, onKeepGoing, onExit }) {
  const [exiting, setExiting] = useState(false)

  // Skip drawer if ≤ 15s remaining
  useEffect(() => {
    if (remaining <= 15) onKeepGoing()
  }, [])

  if (remaining <= 15) return null

  const mins = Math.ceil(remaining / 60)
  const body =
    remaining > 60
      ? `You have ${mins} minute${mins !== 1 ? 's' : ''} left — it's worth finishing.`
      : 'Almost done. Stay with it for just a moment more.'

  const handleExit = () => {
    setExiting(true)
    setTimeout(onExit, 280)
  }

  const handleKeep = () => {
    setExiting(true)
    setTimeout(onKeepGoing, 280)
  }

  return (
    <div
      className={`drawer-overlay${exiting ? ' exiting' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleKeep() }}
      role="dialog"
      aria-modal="true"
      aria-label="Exit session"
    >
      <div className={`drawer-sheet${exiting ? ' exiting' : ''}`}>
        <h2
          className="font-display"
          style={{ fontSize: 26, fontWeight: 300, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.01em' }}
        >
          Leave early?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {body}
        </p>
        <div className="drawer-actions">
          <button
            className="btn btn-ghost btn-danger"
            onClick={handleExit}
            data-no-reset
            style={{ justifyContent: 'center' }}
          >
            Exit anyway
          </button>
          <button
            className="btn btn-primary"
            onClick={handleKeep}
            data-no-reset
            style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.14)' }}
            autoFocus
          >
            Keep going
          </button>
        </div>
      </div>
    </div>
  )
}

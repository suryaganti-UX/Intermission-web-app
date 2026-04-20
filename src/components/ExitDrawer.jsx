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
    setTimeout(onExit, 320)
  }

  const handleKeep = () => {
    setExiting(true)
    setTimeout(onKeepGoing, 320)
  }

  return (
    <div
      className="drawer-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) handleKeep() }}
      role="dialog"
      aria-modal="true"
      aria-label="Exit session"
    >
      <div className={`drawer-sheet${exiting ? ' exiting' : ''}`}>
        <div className="drawer-handle" aria-hidden="true" />
        <h2
          className="font-display"
          style={{ fontSize: 20, fontWeight: 300, color: 'var(--text-primary)', marginBottom: 10 }}
        >
          Leave early?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
          {body}
        </p>
        <div className="drawer-actions">
          <button
            className="btn btn-primary"
            onClick={handleKeep}
            style={{ flex: 2 }}
            data-no-reset
          >
            Keep going
          </button>
          <button
            className="btn btn-danger btn-ghost"
            onClick={handleExit}
            style={{ flex: 1 }}
            data-no-reset
          >
            Exit anyway
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useCallback } from 'react'
import { BREAKS, BREAK_ORDER } from '../config/breaks'
import StreakBar from './StreakBar'

export default function HomeScreen({ onSelect, onHistory, streakKey }) {
  // Keyboard shortcuts: 1/2/3/4
  const handleKeyDown = useCallback((e) => {
    const idx = parseInt(e.key) - 1
    if (idx >= 0 && idx < BREAK_ORDER.length) {
      onSelect(BREAK_ORDER[idx])
    }
  }, [onSelect])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="screen-wrap screen-enter">
      <div className="screen-inner" role="main">

        {/* Header */}
        <div className="stagger-item" style={{ marginBottom: 8 }}>
          <h1
            className="font-display"
            style={{ fontSize: 'clamp(36px, 8vw, 48px)', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1 }}
          >
            Intermission
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
            A pause between what was and what's next.
          </p>
        </div>

        {/* Break cards */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          role="list"
          aria-label="Break types"
        >
          {BREAK_ORDER.map((id, idx) => {
            const b = BREAKS[id]
            return (
              <BreakCard
                key={id}
                breakDef={b}
                index={idx}
                onSelect={() => onSelect(id)}
              />
            )
          })}
        </div>

        {/* Streak bar */}
        <StreakBar refreshKey={streakKey} />

        {/* History link */}
        <div className="stagger-item" style={{ textAlign: 'center' }}>
          <button
            className="btn-ghost btn"
            onClick={onHistory}
            style={{ fontSize: 12, color: 'var(--text-muted)' }}
          >
            View history
          </button>
        </div>
      </div>
    </div>
  )
}

function BreakCard({ breakDef: b, index, onSelect }) {
  const accentRgba = `rgba(${b.accentRgb},0.14)`
  const accentBorder = `rgba(${b.accentRgb},0.28)`

  return (
    <div
      className="glass-card break-card stagger-item"
      role="listitem"
      tabIndex={0}
      aria-label={`${b.name}: ${b.trigger}. ${b.durationRange}.`}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect() }}
      style={{
        '--card-glow': `0 0 40px rgba(${b.accentRgb},0.12)`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 0 40px rgba(${b.accentRgb},0.12)`
        e.currentTarget.querySelector('.break-card-arrow').style.color = b.accent
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = ''
        e.currentTarget.querySelector('.break-card-arrow').style.color = ''
      }}
    >
      <div
        className="break-card-icon"
        style={{ background: accentRgba, border: `1px solid ${accentBorder}` }}
        aria-hidden="true"
      >
        {b.emoji}
      </div>

      <div className="break-card-body">
        <div className="break-card-name">{b.name}</div>
        <div className="break-card-trigger">{b.trigger}</div>
      </div>

      <div className="break-card-meta">
        <span className="break-card-dur">{b.durationRange}</span>
        <span className="break-card-arrow" style={{ color: 'var(--text-muted)', transition: 'color 200ms ease' }}>›</span>
      </div>

      {/* Keyboard shortcut hint */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 52,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 10,
          color: 'var(--text-muted)',
          opacity: 0.5,
          letterSpacing: '0.06em',
        }}
      >
        {index + 1}
      </span>
    </div>
  )
}

import { useEffect, useCallback } from 'react'
import { BREAKS, BREAK_ORDER } from '../config/breaks'
import StreakBar from './StreakBar'

// Refined SVG line icons — same metaphor as the original emojis, editorial weight
const BREAK_ICONS = {
  quiet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  breath: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
      <path d="M12 22V12"/>
      <path d="M12 12C12 8.686 9.314 6 6 6a6 6 0 0 0 0 12c2.21 0 4-1.79 4-4"/>
      <path d="M12 12c0-3.314 2.686-6 6-6a6 6 0 0 1 0 12c-2.21 0-4-1.79-4-4"/>
    </svg>
  ),
  stretch: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
      <circle cx="12" cy="4" r="1.5"/>
      <path d="M12 7v5l-3 4"/>
      <path d="M12 12l3 4"/>
      <path d="M9 11H6"/>
      <path d="M18 11h-3"/>
    </svg>
  ),
}

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
                breakId={id}
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

function BreakCard({ breakId, breakDef: b, index, onSelect }) {
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
        style={{ background: accentRgba, border: `1px solid ${accentBorder}`, color: b.accent }}
        aria-hidden="true"
      >
        {BREAK_ICONS[breakId] ?? b.emoji}
      </div>

      <div className="break-card-body">
        <div className="break-card-name">{b.name}</div>
        <div className="break-card-trigger">{b.trigger}</div>
      </div>

      <div className="break-card-meta">
        <span className="break-card-dur">{b.durationRange}</span>
        <span className="break-card-arrow" style={{ color: 'var(--text-muted)', transition: 'color 200ms ease' }}>›</span>
      </div>

      {/* Keyboard shortcut hint removed — meta centered instead */}
    </div>
  )
}

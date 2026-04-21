import { useState, useRef, useMemo } from 'react'
import { BREAKS } from '../config/breaks'
import { getTodayBreaks } from '../utils/storage'

// ── Per-break SVG icon ────────────────────────────────────────────────────────
const BREAK_ICONS = {
  quiet: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  ),
  eye: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  breath: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
      <path d="M12 22V12"/>
      <path d="M12 12C12 8.686 9.314 6 6 6a6 6 0 0 0 0 12c2.21 0 4-1.79 4-4"/>
      <path d="M12 12c0-3.314 2.686-6 6-6a6 6 0 0 1 0 12c-2.21 0-4-1.79-4-4"/>
    </svg>
  ),
  stretch: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
      <circle cx="12" cy="4" r="1.5"/>
      <path d="M12 7v5l-3 4"/>
      <path d="M12 12l3 4"/>
      <path d="M9 11H6"/>
      <path d="M18 11h-3"/>
    </svg>
  ),
}

const MOODS = [
  { id: 'effortless', emoji: '✨', label: 'Effortless' },
  { id: 'good',       emoji: '💛', label: 'Pretty good' },
  { id: 'needed',     emoji: '😮‍💨', label: 'Needed it'  },
  { id: 'okay',       emoji: '🤍', label: 'Just okay'  },
]

function Particles({ color }) {
  const particles = useMemo(() => (
    Array.from({ length: 22 }, (_, i) => {
      const angle  = (i / 22) * Math.PI * 2
      const radius = 55 + (i % 4) * 18
      return {
        id:  i,
        tx:  `${Math.round(Math.cos(angle) * radius)}px`,
        ty:  `${Math.round(Math.sin(angle) * radius)}px`,
        sz:  `${3 + (i % 3)}px`,
        del: `${(i % 7) * 0.055}s`,
      }
    })
  ), [])
  return (
    <div className="particle-field" aria-hidden="true">
      {particles.map(p => (
        <div key={p.id} className="particle" style={{ '--tx': p.tx, '--ty': p.ty, '--sz': p.sz, '--delay': p.del, background: color }} />
      ))}
    </div>
  )
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export default function ReflectionScreen({ breakId, onSubmit, onSkip, onTryAnother }) {
  const b = BREAKS[breakId]
  const c = b.celebration

  const todayBreaks = useMemo(() => getTodayBreaks(), [])

  const [mood, setMood]           = useState(null)
  const [intention, setIntention] = useState('')
  const [showIntention, setShowIntention] = useState(false)
  const textareaRef = useRef(null)

  const accentRgba   = `rgba(${b.accentRgb},0.15)`
  const accentBorder = `rgba(${b.accentRgb},0.35)`

  const handleMoodSelect = (id) => {
    setMood(id)
    if (!showIntention) {
      setTimeout(() => {
        setShowIntention(true)
        setTimeout(() => textareaRef.current?.focus(), 320)
      }, 120)
    }
  }

  const handleReturn = () => {
    onSubmit({ mood, intention: intention.trim() })
  }

  return (
    <div className="screen-wrap screen-wrap--top screen-enter" style={{ paddingTop: 56 }}>
      <div className="screen-inner" style={{ gap: 20 }}>

        {/* ── CELEBRATION HERO ─────────────────────────── */}
        <div className="completion-hero stagger-item">
          <div className="completion-hero-glow" style={{ background: b.accent }} />
          <Particles color={b.accent} />

          <div className="completion-icon-wrap" style={{ background: accentRgba, border: `1px solid ${accentBorder}` }}>
            {BREAK_ICONS[breakId]?.(b.accent)}
          </div>

          <div className="completion-count-pill" style={{ borderColor: accentBorder, background: accentRgba, color: b.accent }}>
            {todayBreaks === 1 ? '✦ First break today' : todayBreaks >= 5 ? `🔥 ${todayBreaks} breaks today` : `✦ ${ordinal(todayBreaks)} break today`}
          </div>

          <h2 className="completion-headline">{c.headline}</h2>
          <p className="completion-subline">{c.subline}</p>
        </div>

        {/* ── MOOD CHECK ───────────────────────────────── */}
        <div className="glass-card stagger-item" style={{ padding: '18px 18px 20px' }}>
          <p className="mood-label" style={{ marginBottom: 12 }}>How was it?</p>
          <div className="mood-grid">
            {MOODS.map(m => {
              const isSelected = mood === m.id
              return (
                <button
                  key={m.id}
                  className={`mood-chip${isSelected ? ' selected' : ''}`}
                  onClick={() => handleMoodSelect(m.id)}
                  aria-pressed={isSelected}
                  style={isSelected ? { borderColor: accentBorder, background: accentRgba } : {}}
                >
                  <span className="mood-chip-emoji">{m.emoji}</span>
                  <span className="mood-chip-label">{m.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── INTENTION ZONE — revealed after mood ────── */}
        {showIntention && (
          <div className="intention-zone">
            <div className="glass-card" style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                One thing to focus on next
              </p>
              <textarea
                ref={textareaRef}
                className="reflection-textarea"
                placeholder="What matters most in the next session…"
                value={intention}
                onChange={e => setIntention(e.target.value)}
                rows={3}
                aria-label="Your intention for the next session"
                style={{ '--accent': b.accent, minHeight: 80 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              <button
                className="btn btn-full"
                onClick={handleReturn}
                style={{ background: `rgba(${b.accentRgb},0.30)`, borderColor: `rgba(${b.accentRgb},0.55)`, fontSize: 15, padding: '14px' }}
              >
                {intention.trim() ? 'Set intention & return →' : 'Return to work →'}
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-full" onClick={onTryAnother} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Try another break
                </button>
                <button className="btn btn-ghost" onClick={onSkip} style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>
                  Skip
                </button>
              </div>
            </div>

            <p className="completion-nudge" style={{ marginTop: 16 }}>{c.nudge}</p>
          </div>
        )}

        {!showIntention && (
          <div style={{ textAlign: 'center' }}>
            <button className="btn btn-ghost" onClick={onSkip} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Skip reflection →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

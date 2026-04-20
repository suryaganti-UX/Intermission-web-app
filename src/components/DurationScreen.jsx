import { useState, useEffect, useCallback } from 'react'
import { BREAKS } from '../config/breaks'

const WORK_TIMES = [
  { label: '< 30 min', recommendIdx: 0 },
  { label: '30–60 min', recommendIdx: 1 },
  { label: '1–2 hrs', recommendIdx: 2 },
  { label: '2+ hrs', recommendIdx: 3 },
]

export default function DurationScreen({ breakId, onStart, onBack }) {
  const b = BREAKS[breakId]
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [workTime, setWorkTime] = useState(null) // null = not selected yet
  const [showPicker, setShowPicker] = useState(false) // pre-break step shown

  // Recommended duration highlight based on work time
  const recommendedIdx = workTime !== null ? WORK_TIMES[workTime].recommendIdx : null

  // Keyboard: Enter confirms, Escape goes back
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onBack()
    if (e.key === 'Enter') onStart(b.durations[selectedIdx].value)
  }, [b, selectedIdx, onBack, onStart])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const accentRgba = `rgba(${b.accentRgb},0.15)`
  const accentBorder = `rgba(${b.accentRgb},0.35)`
  const accentGlow = `rgba(${b.accentRgb},0.08)`

  return (
    <div className="screen-wrap screen-enter">
      <div className="screen-inner" role="main">

        {/* Back + type badge */}
        <div className="stagger-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-ghost"
            onClick={onBack}
            style={{ padding: '8px 0', fontSize: 14 }}
            aria-label="Back to home"
          >
            ‹ Back
          </button>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${accentBorder}`,
              background: accentRgba,
              fontSize: 11,
              color: b.accent,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {b.name}
          </span>
        </div>

        {/* Title block */}
        <div className="stagger-item">
          <h2
            className="font-display"
            style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.2 }}
          >
            {b.subtitle}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
            {b.trigger}
          </p>
        </div>

        {/* Pre-break step: how long have you been working? */}
        <div className="glass-card stagger-item" style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
            How long have you been working?
          </p>
          <div className="work-chips">
            {WORK_TIMES.map((wt, i) => (
              <button
                key={i}
                className={`work-chip${workTime === i ? ' selected' : ''}`}
                style={workTime === i ? { borderColor: b.accent, background: accentRgba } : {}}
                onClick={() => {
                  setWorkTime(i)
                  setSelectedIdx(wt.recommendIdx)
                }}
              >
                {wt.label}
              </button>
            ))}
            <button
              className="work-chip"
              onClick={() => { setWorkTime(null); }}
              style={{ opacity: 0.6 }}
            >
              Skip →
            </button>
          </div>
        </div>

        {/* Duration label */}
        <p className="label-caps stagger-item">How long?</p>

        {/* Duration 2×2 grid */}
        <div className="duration-grid stagger-item" role="group" aria-label="Duration options">
          {b.durations.map((d, i) => {
            const isSelected = selectedIdx === i
            const isRecommended = recommendedIdx === i && !isSelected
            return (
              <div
                key={i}
                className="glass-card duration-card"
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => setSelectedIdx(i)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedIdx(i) }}
                style={{
                  borderColor: isSelected ? b.accent : isRecommended ? accentBorder : undefined,
                  background: isSelected ? accentRgba : isRecommended ? accentGlow : undefined,
                  boxShadow: isRecommended ? `0 0 20px ${accentGlow}` : undefined,
                  '--accent': b.accent,
                  '--accent-dim': accentRgba,
                }}
              >
                <div
                  className="duration-number"
                  style={{ color: isSelected ? b.accent : 'var(--text-primary)' }}
                >
                  {d.label}
                </div>
                <div className="duration-unit">{d.unit}</div>
                <div className="duration-desc">{d.desc}</div>
                {isRecommended && (
                  <div style={{ fontSize: 9, color: b.accent, marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Suggested
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Begin button */}
        <button
          className="btn btn-full stagger-item"
          style={{
            background: accentRgba,
            borderColor: accentBorder,
            color: 'var(--text-primary)',
            fontSize: 15,
            fontWeight: 400,
            padding: '16px',
          }}
          onClick={() => onStart(b.durations[selectedIdx].value)}
        >
          Begin → {b.durations[selectedIdx].label} {b.durations[selectedIdx].unit}
        </button>
      </div>
    </div>
  )
}

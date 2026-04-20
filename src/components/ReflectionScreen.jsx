import { useState, useRef } from 'react'
import { BREAKS } from '../config/breaks'

export default function ReflectionScreen({ breakId, sessionData, onSubmit, onSkip }) {
  const b = BREAKS[breakId]
  const [intention, setIntention] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = () => {
    onSubmit(intention.trim())
  }

  const handleKeyDown = (e) => {
    // Enter outside textarea submits
    if (e.key === 'Enter' && document.activeElement !== textareaRef.current) {
      handleSubmit()
    }
  }

  return (
    <div
      className="screen-wrap screen-enter"
      onKeyDown={handleKeyDown}
      role="main"
    >
      <div className="screen-inner">

        {/* Complete badge */}
        <div className="stagger-item">
          <span className="session-badge complete-badge">Session complete</span>
        </div>

        {/* Eyebrow + title */}
        <div className="stagger-item">
          <p className="label-caps" style={{ marginBottom: 10 }}>Before you return</p>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(24px,5vw,32px)',
              fontWeight: 300,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            What matters most in the next session?
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>
            Take one breath. Set one intention. Then return.
          </p>
        </div>

        {/* Textarea */}
        <div className="stagger-item">
          <textarea
            ref={textareaRef}
            className="reflection-textarea"
            placeholder="Type your intention here…"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            rows={4}
            aria-label="Your intention for the next session"
            style={{
              '--accent': b.accent,
            }}
          />
        </div>

        {/* Actions */}
        <div className="reflection-actions stagger-item">
          <button
            className="btn stagger-item"
            style={{
              flex: 1,
              background: `rgba(${b.accentRgb},0.15)`,
              borderColor: `rgba(${b.accentRgb},0.35)`,
              fontSize: 14,
            }}
            onClick={handleSubmit}
          >
            Set intention & return
          </button>
          <button
            className="btn btn-ghost"
            onClick={onSkip}
            style={{ flexShrink: 0 }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

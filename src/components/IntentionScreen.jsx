import { useEffect, useCallback } from 'react'

export default function IntentionScreen({ intention, onReturn }) {
  const handleKey = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') onReturn()
  }, [onReturn])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return (
    <div className="screen-wrap screen-enter" role="main">
      <div className="screen-inner" style={{ alignItems: 'center', textAlign: 'center', gap: 28 }}>

        {/* Eyebrow */}
        <p className="label-caps stagger-item" style={{ opacity: 0.7 }}>
          Carry this forward
        </p>

        {/* Intention in large display type */}
        <blockquote
          className="font-display-italic stagger-item"
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 300,
            color: 'var(--text-primary)',
            lineHeight: 1.35,
            maxWidth: '28ch',
            letterSpacing: '-0.01em',
            animation: 'screenEnter 800ms cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          {intention ? `\u201C${intention}\u201D` : 'Return with a clear head.'}
        </blockquote>

        {/* Divider */}
        <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.12)' }} className="stagger-item" />

        {/* Subtext */}
        <p className="stagger-item" style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '26ch', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
          You showed up for yourself. That's the hardest part.
        </p>

        {/* CTA */}
        <button
          className="btn stagger-item"
          onClick={onReturn}
          style={{
            marginTop: 4,
            padding: '13px 32px',
            fontSize: 14,
            background: 'rgba(255,255,255,0.07)',
            borderColor: 'rgba(255,255,255,0.14)',
          }}
          data-no-reset
        >
          Back to work →
        </button>

      </div>
    </div>
  )
}

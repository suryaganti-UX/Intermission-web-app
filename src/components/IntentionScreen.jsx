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
      <div className="screen-inner" style={{ alignItems: 'center', textAlign: 'center' }}>

        <p className="label-caps stagger-item">Your intention</p>

        <blockquote
          className="font-display-italic stagger-item"
          style={{
            fontSize: 'clamp(26px,5vw,36px)',
            fontWeight: 300,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            maxWidth: '30ch',
            animation: 'screenEnter 800ms cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          {intention
            ? `\u201C${intention}\u201D`
            : 'Return with a clear head.'}
        </blockquote>

        <button
          className="btn stagger-item"
          onClick={onReturn}
          style={{ marginTop: 16 }}
          data-no-reset
        >
          Return to work
        </button>
      </div>
    </div>
  )
}

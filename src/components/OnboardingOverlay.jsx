import { useState } from 'react'

const SCREENS = [
  {
    headline: 'Transitions are where focus is lost.',
    body: 'Intermission gives you a structured pause between work sessions — so you return with intention, not momentum.',
    cta: 'See how it works →',
  },
  {
    headline: 'Pick a break. Follow it. Return ready.',
    steps: ['Choose your reset', 'Follow the session', 'Set your intention'],
    cta: 'Start my first Intermission →',
  },
]

export default function OnboardingOverlay({ onComplete }) {
  const [page, setPage] = useState(0)
  const screen = SCREENS[page]

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="Welcome to Intermission">
      <div className="glass-card onboarding-card">
        <p className="label-caps" style={{ marginBottom: 4 }}>
          {page + 1} of {SCREENS.length}
        </p>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(26px,5vw,36px)', lineHeight: 1.15, color: 'var(--text-primary)' }}
        >
          {screen.headline}
        </h1>

        {screen.body && (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {screen.body}
          </p>
        )}

        {screen.steps && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {screen.steps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <span
                  style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(167,139,250,0.15)',
                    border: '1px solid rgba(167,139,250,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#a78bfa', fontWeight: 400, flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <button className="btn-ghost btn" onClick={onComplete} style={{ fontSize: 13, padding: '8px 0' }}>
            Skip
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (page < SCREENS.length - 1) setPage(p => p + 1)
              else onComplete()
            }}
          >
            {screen.cta}
          </button>
        </div>
      </div>
    </div>
  )
}

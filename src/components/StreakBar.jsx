import { useEffect, useMemo } from 'react'
import { getTodayBreaks, getWeekBreaks } from '../utils/storage'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function StreakBar({ refreshKey }) {
  const todayBreaks = useMemo(() => getTodayBreaks(), [refreshKey])
  const weekBreaks = useMemo(() => getWeekBreaks(), [refreshKey])

  const dots = Array.from({ length: 5 }, (_, i) => i < todayBreaks)
  const maxDay = Math.max(1, ...DAYS.map(d => weekBreaks[d] || 0))

  return (
    <div className="glass-card streak-bar stagger-item">
      <div className="streak-top">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p className="label-caps">Today</p>
          <div className="streak-dots" aria-label={`${todayBreaks} breaks today`}>
            {dots.map((filled, i) => (
              <div
                key={i}
                className="streak-dot"
                style={{
                  background: filled
                    ? 'var(--accent-quiet)'
                    : 'rgba(255,255,255,0.08)',
                }}
              />
            ))}
          </div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.4 }}>
          {todayBreaks}<br />
          <span style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {todayBreaks === 1 ? 'break' : 'breaks'}
          </span>
        </span>
      </div>

      <div className="streak-chart" aria-hidden="true">
        {DAYS.map(day => {
          const count = weekBreaks[day] || 0
          const height = maxDay > 0 ? Math.max(2, (count / maxDay) * 22) : 2
          return (
            <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div className="streak-bar-seg" style={{ height }} />
              <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                {day.charAt(0)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

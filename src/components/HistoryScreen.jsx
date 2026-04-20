import { useState, useMemo } from 'react'
import { getSessions } from '../utils/storage'
import { BREAKS, BREAK_ORDER } from '../config/breaks'

const FILTERS = ['All', 'quiet', 'eye', 'breath', 'stretch']

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

function formatDuration(secs) {
  if (secs < 60) return `${secs}s`
  return `${Math.round(secs / 60)}m`
}

export default function HistoryScreen({ onBack }) {
  const [filter, setFilter] = useState('All')
  const allSessions = useMemo(() => getSessions(), [])

  const sessions = filter === 'All'
    ? allSessions
    : allSessions.filter(s => s.type === filter)

  // Weekly summary
  const thisWeek = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
    const weekSessions = allSessions.filter(s => new Date(s.completedAt).getTime() > cutoff)
    const totalMins = Math.round(weekSessions.reduce((sum, s) => sum + s.duration, 0) / 60)
    const typeCounts = {}
    weekSessions.forEach(s => { typeCounts[s.type] = (typeCounts[s.type] || 0) + 1 })
    const mostUsed = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]
    return { count: weekSessions.length, totalMins, mostUsed: mostUsed ? BREAKS[mostUsed[0]]?.name : null }
  }, [allSessions])

  return (
    <div className="screen-wrap screen-enter">
      <div className="screen-inner screen-inner-wide" role="main">

        {/* Header */}
        <div className="stagger-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={onBack} style={{ padding: '8px 0' }}>
            ‹ Back
          </button>
          <h2
            className="font-display"
            style={{ fontSize: 22, fontWeight: 300, color: 'var(--text-primary)' }}
          >
            History
          </h2>
        </div>

        {/* Weekly summary */}
        {thisWeek.count > 0 && (
          <div className="glass-card stagger-item" style={{ padding: '14px 18px' }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              This week: <strong style={{ color: 'var(--text-primary)' }}>{thisWeek.count} breaks</strong>
              {thisWeek.totalMins > 0 && ` · ${thisWeek.totalMins} min total`}
              {thisWeek.mostUsed && ` · Most used: ${thisWeek.mostUsed}`}
            </p>
          </div>
        )}

        {/* Filter tabs */}
        <div className="history-tabs stagger-item" role="tablist" aria-label="Filter sessions">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`history-tab${filter === f ? ' active' : ''}`}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === 'All' ? 'All' : BREAKS[f]?.name ?? f}
            </button>
          ))}
        </div>

        {/* Session list */}
        {sessions.length === 0 ? (
          <div className="stagger-item" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>
              {allSessions.length === 0
                ? 'Your break history will appear here. Take your first Intermission.'
                : 'No sessions match this filter.'}
            </p>
          </div>
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            role="list"
            aria-label="Session history"
          >
            {sessions.map((s, i) => {
              const b = BREAKS[s.type]
              if (!b) return null
              return (
                <div
                  key={s.id}
                  className="history-row stagger-item"
                  role="listitem"
                  style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
                >
                  <div
                    className="history-icon"
                    style={{ background: `rgba(${b.accentRgb},0.12)`, border: `1px solid rgba(${b.accentRgb},0.2)` }}
                    aria-hidden="true"
                  >
                    {b.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 400 }}>
                      {b.name}
                    </div>
                    <div className="history-meta">
                      {formatDuration(s.duration)} · {timeAgo(s.completedAt)}
                      {s.resetCount > 0 && ` · ${s.resetCount} restart${s.resetCount > 1 ? 's' : ''}`}
                    </div>
                    {s.reflection ? (
                      <div className="history-reflection">
                        "{s.reflection.length > 40 ? s.reflection.slice(0, 40) + '…' : s.reflection}"
                      </div>
                    ) : (
                      <div className="history-reflection" style={{ fontStyle: 'normal', color: 'var(--text-muted)' }}>
                        No intention set
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

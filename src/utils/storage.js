function getToday() {
  return new Date().toLocaleDateString('en-CA') // "2026-04-20"
}

function getDayName() {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]
}

export function incrementStreak() {
  const today = getToday()
  const lastDate = localStorage.getItem('last_break_date')
  const current = lastDate === today
    ? parseInt(localStorage.getItem('today_breaks') || '0')
    : 0
  localStorage.setItem('today_breaks', String(current + 1))
  localStorage.setItem('last_break_date', today)
  const week = JSON.parse(localStorage.getItem('week_breaks') || '{}')
  const day = getDayName()
  week[day] = (week[day] || 0) + 1
  localStorage.setItem('week_breaks', JSON.stringify(week))
}

export function getTodayBreaks() {
  const today = getToday()
  const lastDate = localStorage.getItem('last_break_date')
  if (lastDate !== today) return 0
  return parseInt(localStorage.getItem('today_breaks') || '0')
}

export function getWeekBreaks() {
  return JSON.parse(localStorage.getItem('week_breaks') || '{}')
}

export function saveSession(sessionObj) {
  const sessions = JSON.parse(localStorage.getItem('sessions') || '[]')
  sessions.unshift(sessionObj)
  if (sessions.length > 50) sessions.pop()
  localStorage.setItem('sessions', JSON.stringify(sessions))
}

export function getSessions() {
  return JSON.parse(localStorage.getItem('sessions') || '[]')
}

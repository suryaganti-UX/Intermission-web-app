import { useState, useCallback } from 'react'
import './index.css'
import AuroraBackground from './components/AuroraBackground'
import PrivacyBanner from './components/PrivacyBanner'
import OnboardingOverlay from './components/OnboardingOverlay'
import HomeScreen from './components/HomeScreen'
import DurationScreen from './components/DurationScreen'
import SessionScreen from './components/SessionScreen'
import ReflectionScreen from './components/ReflectionScreen'
import IntentionScreen from './components/IntentionScreen'
import HistoryScreen from './components/HistoryScreen'
import { incrementStreak, saveSession } from './utils/storage'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [selectedBreak, setSelectedBreak] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [sessionData, setSessionData] = useState(null)
  const [intention, setIntention] = useState('')
  const [streakKey, setStreakKey] = useState(0) // bump to refresh streak bar
  const [showOnboarding, setShowOnboarding] = useState(
    !localStorage.getItem('onboarded')
  )

  const isSession = screen === 'session'

  // ── Navigation ────────────────────────────────────────
  const goHome = useCallback(() => {
    setScreen('home')
    setStreakKey(k => k + 1)
  }, [])

  const selectBreak = useCallback((breakId) => {
    setSelectedBreak(breakId)
    setScreen('duration')
  }, [])

  const startSession = useCallback((duration) => {
    setSelectedDuration(duration)
    setScreen('session')
  }, [])

  const sessionComplete = useCallback((data) => {
    // Increment streak immediately on session end
    incrementStreak()
    setSessionData(data)
    setScreen('reflect')
  }, [])

  const submitReflection = useCallback((text) => {
    setIntention(text)
    // Save to localStorage
    saveSession({
      id: Date.now(),
      type: selectedBreak,
      duration: selectedDuration,
      completedAt: new Date().toISOString(),
      reflection: text,
      completed: true,
      resetCount: sessionData?.resetCount ?? 0,
    })
    setScreen('intention')
  }, [selectedBreak, selectedDuration, sessionData])

  const skipReflection = useCallback(() => {
    saveSession({
      id: Date.now(),
      type: selectedBreak,
      duration: selectedDuration,
      completedAt: new Date().toISOString(),
      reflection: '',
      completed: true,
      resetCount: sessionData?.resetCount ?? 0,
    })
    goHome()
  }, [selectedBreak, selectedDuration, sessionData, goHome])

  // ── Screen render ─────────────────────────────────────
  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            onSelect={selectBreak}
            onHistory={() => setScreen('history')}
            streakKey={streakKey}
          />
        )
      case 'duration':
        return (
          <DurationScreen
            breakId={selectedBreak}
            onStart={startSession}
            onBack={goHome}
          />
        )
      case 'session':
        return (
          <SessionScreen
            breakId={selectedBreak}
            duration={selectedDuration}
            onComplete={sessionComplete}
            onExit={goHome}
          />
        )
      case 'reflect':
        return (
          <ReflectionScreen
            breakId={selectedBreak}
            sessionData={sessionData}
            onSubmit={submitReflection}
            onSkip={skipReflection}
          />
        )
      case 'intention':
        return (
          <IntentionScreen
            intention={intention}
            onReturn={goHome}
          />
        )
      case 'history':
        return <HistoryScreen onBack={goHome} />
      default:
        return null
    }
  }

  return (
    <>
      <AuroraBackground isSession={isSession} />
      <PrivacyBanner />
      {showOnboarding && (
        <OnboardingOverlay
          onComplete={() => {
            localStorage.setItem('onboarded', 'true')
            setShowOnboarding(false)
          }}
        />
      )}
      <div id="screen-root">
        {renderScreen()}
      </div>
    </>
  )
}

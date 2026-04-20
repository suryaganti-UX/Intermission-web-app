import { useState, useEffect } from 'react'

export default function PrivacyBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('privacy_dismissed')
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem('privacy_dismissed', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="privacy-banner" role="banner">
      <span>🔒 Your data never leaves this device. No account. No server. Ever.</span>
      <button
        className="privacy-dismiss"
        onClick={dismiss}
        aria-label="Dismiss privacy notice"
      >
        ×
      </button>
    </div>
  )
}

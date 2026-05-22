import { useState, useEffect } from 'react'

const BASE = import.meta.env.VITE_API_URL || 'https://debugmind-kj6e.onrender.com'

export default function Header() {
  const [time, setTime] = useState(new Date())
  const [status, setStatus] = useState('checking')

useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    fetch(`https://debugmind-kj6e.onrender.com/api/health`)
      .then(r => r.json())
      .then(() => setStatus('online'))
      .catch(() => setStatus('offline'))
    return () => clearInterval(t)
  }, [])

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--bg2)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--accent)',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse-glow 3s ease-in-out infinite',
          }}>
            <span style={{ fontSize: 14, color: 'var(--bg)', fontWeight: 700 }}>D</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', color: 'var(--text)' }}>
              Debug<span style={{ color: 'var(--accent)' }}>Mind</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              AI Root Cause Agent
            </div>
          </div>
        </div>

        <div style={{ color: 'var(--text3)', fontSize: 11, display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ color: 'var(--border2)' }}>›</span>
          <span>v1.0.0</span>
          <span style={{ color: 'var(--border2)' }}>›</span>
          <span style={{ color: 'var(--accent2)' }}>llama-3.3-70b</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: status === 'online' ? 'var(--accent3)' : status === 'offline' ? 'var(--danger)' : 'var(--warn)',
            animation: status === 'online' ? 'pulse-glow 2s infinite' : 'none',
          }} />
          <span style={{ color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {status === 'online' ? 'Groq Connected' : status === 'offline' ? 'Backend Offline' : 'Connecting...'}
          </span>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: '0.05em' }}>
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>
    </header>
  )
}
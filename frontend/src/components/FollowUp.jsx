import { useState, useRef, useEffect } from 'react'

export default function FollowUp({ result, inputData }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const q = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q }])
    setLoading(true)

    const context = `
Bug Summary: ${result.summary}
Root Cause: ${result.rootCause?.title} — ${result.rootCause?.explanation}
Severity: ${result.severity}
Original Error: ${inputData?.error || 'N/A'}
Fix (immediate): ${result.fix?.immediate}
Fix (short-term): ${result.fix?.shortTerm}
`.trim()

    try {
      const res = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, context }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', text: data.answer }])
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', text: 'Error: ' + err.message }])
    }
    setLoading(false)
  }

  const suggestions = [
    'How do I test the fix?',
    'What monitoring should I add?',
    'Can this happen again?',
    'Write a git commit message',
  ]

  return (
    <div style={{
      marginTop: 1,
      background: 'var(--panel)',
      border: '1px solid var(--accent)',
      borderTop: 'none',
      borderRadius: '0 0 8px 8px',
      overflow: 'hidden',
      animation: 'slide-in 0.3s ease',
    }}>
      {/* Suggestion chips */}
      {messages.length === 0 && (
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', alignSelf: 'center', marginRight: 4 }}>Quick ask:</span>
          {suggestions.map(s => (
            <button key={s} onClick={() => { setInput(s); }} style={{
              padding: '5px 12px', borderRadius: 4,
              background: 'transparent', border: '1px solid var(--border2)',
              color: 'var(--text2)', fontSize: 11, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.color = 'var(--text2)' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12,
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              animation: 'slide-in 0.3s ease',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: m.role === 'user' ? 'var(--accent2)' : 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: 'var(--bg)', fontWeight: 700,
              }}>
                {m.role === 'user' ? 'U' : 'D'}
              </div>
              <div style={{
                maxWidth: '80%', padding: '10px 14px',
                background: m.role === 'user' ? 'rgba(255,107,53,0.1)' : 'var(--bg)',
                border: `1px solid ${m.role === 'user' ? 'rgba(255,107,53,0.3)' : 'var(--border)'}`,
                borderRadius: 8, fontSize: 13, lineHeight: 1.7,
                color: 'var(--text)',
                whiteSpace: 'pre-wrap',
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 12, animation: 'fade-in 0.3s ease' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: 'var(--bg)', fontWeight: 700,
              }}>D</div>
              <div style={{
                padding: '10px 14px', background: 'var(--bg)',
                border: '1px solid var(--border)', borderRadius: 8,
                display: 'flex', gap: 6, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
                    animation: `blink 1.2s infinite ${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: messages.length > 0 ? '1px solid var(--border)' : 'none',
        display: 'flex', gap: 10,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask anything about this bug..."
          style={{
            flex: 1, padding: '10px 14px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text)', fontSize: 13, outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button onClick={send} disabled={!input.trim() || loading} style={{
          padding: '10px 20px', background: 'var(--accent)',
          border: 'none', borderRadius: 6, color: 'var(--bg)',
          fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
          opacity: (!input.trim() || loading) ? 0.5 : 1,
        }}>
          Send
        </button>
      </div>
    </div>
  )
}

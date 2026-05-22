import { useState } from 'react'

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Ruby', 'PHP', 'Other']

const EXAMPLES = [
  {
    label: 'Node.js Crash',
    error: 'TypeError: Cannot read properties of undefined (reading \'id\')',
    stack: `TypeError: Cannot read properties of undefined (reading 'id')
    at getUserData (/app/services/user.js:47:23)
    at async processRequest (/app/middleware/auth.js:112:18)
    at async Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)`,
    logs: `[2024-01-15 14:23:11] INFO: Request received GET /api/users/profile
[2024-01-15 14:23:11] DEBUG: Auth token validated for user_id: null
[2024-01-15 14:23:11] ERROR: Unhandled exception in getUserData
[2024-01-15 14:23:11] INFO: Database query returned 0 rows for undefined`,
    language: 'JavaScript',
    services: 'API Gateway, Auth Service, User Service, PostgreSQL',
  },
  {
    label: 'Python OOM',
    error: 'MemoryError: Unable to allocate 8.50 GiB for an array',
    stack: `Traceback (most recent call last):
  File "/app/pipeline/processor.py", line 234, in run_batch
    features = np.zeros((batch_size, embedding_dim), dtype=np.float32)
  File "/usr/local/lib/python3.11/site-packages/numpy/core/multiarray.py", line 1
MemoryError: Unable to allocate 8.50 GiB for an array with shape (2000000, 1148) and data type float32`,
    logs: `[INFO] Starting batch processing job batch_id=b_9182
[INFO] Loading dataset: 2.1M records from S3
[INFO] Memory usage before: 2.1 GB / 16 GB
[WARNING] Batch size set to 2000000 — no chunking configured
[ERROR] Process killed by OOM killer`,
    language: 'Python',
    services: 'ML Pipeline, S3, Redis Queue',
  },
]

export default function DebugInput({ onSubmit }) {
  const [form, setForm] = useState({
    error: '', stack: '', logs: '', language: 'JavaScript', services: '', context: ''
  })
  const [activeTab, setActiveTab] = useState('error')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const loadExample = (ex) => {
    setForm({ error: ex.error, stack: ex.stack, logs: ex.logs, language: ex.language, services: ex.services, context: '' })
  }

  const handleSubmit = () => {
    if (!form.error && !form.logs && !form.stack) return
    onSubmit(form)
  }

  const tabs = [
    { id: 'error', label: 'Error Message' },
    { id: 'stack', label: 'Stack Trace' },
    { id: 'logs', label: 'Logs' },
    { id: 'context', label: 'Context' },
  ]

  const filled = (k) => form[k]?.trim().length > 0

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      {/* Hero */}
      <div style={{ marginBottom: 40, animation: 'slide-in 0.5s ease' }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
          ▸ Abductive Reasoning Engine
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 42,
          letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16,
        }}>
          Paste your bug.<br />
          <span style={{ color: 'var(--accent)' }}>Get the root cause.</span>
        </h1>
        <p style={{ color: 'var(--text2)', maxWidth: 500, lineHeight: 1.7, fontSize: 13 }}>
          DebugMind thinks like your most senior engineer — generating hypotheses,
          ranking evidence, and finding exactly why your system broke.
        </p>
      </div>

      {/* Quick Load Examples */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Try example:</span>
        {EXAMPLES.map(ex => (
          <button key={ex.label} onClick={() => loadExample(ex)} style={{
            padding: '5px 12px', borderRadius: 4, border: '1px solid var(--border2)',
            background: 'transparent', color: 'var(--accent2)', fontSize: 11,
            letterSpacing: '0.05em', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.background = 'rgba(255,107,53,0.1)'; e.target.style.borderColor = 'var(--accent2)' }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'var(--border2)' }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Main Panel */}
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--border)',
        borderRadius: 8, overflow: 'hidden',
        boxShadow: '0 0 40px rgba(0,0,0,0.4)',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '12px 20px', border: 'none',
              background: activeTab === tab.id ? 'var(--panel)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text3)',
              fontSize: 12, letterSpacing: '0.05em',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
            }}>
              {tab.label}
              {filled(tab.id) && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--accent3)', display: 'inline-block'
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: 24 }}>
          {activeTab === 'error' && (
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: 'var(--text2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Error Message / Exception *
              </label>
              <textarea
                value={form.error}
                onChange={e => set('error', e.target.value)}
                placeholder="TypeError: Cannot read properties of undefined..."
                rows={5}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 6, color: 'var(--text)', fontSize: 13,
                  resize: 'vertical', outline: 'none', lineHeight: 1.7,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          )}

          {activeTab === 'stack' && (
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: 'var(--text2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Stack Trace
              </label>
              <textarea
                value={form.stack}
                onChange={e => set('stack', e.target.value)}
                placeholder="at getUserData (/app/services/user.js:47:23)..."
                rows={10}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 6, color: 'var(--accent3)', fontSize: 12,
                  resize: 'vertical', outline: 'none', lineHeight: 1.8,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: 'var(--text2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Application Logs
              </label>
              <textarea
                value={form.logs}
                onChange={e => set('logs', e.target.value)}
                placeholder="[2024-01-15 14:23:11] ERROR: ..."
                rows={10}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 6, color: 'var(--text)', fontSize: 12,
                  resize: 'vertical', outline: 'none', lineHeight: 1.8,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          )}

          {activeTab === 'context' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: 'var(--text2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Language / Framework
                </label>
                <select
                  value={form.language}
                  onChange={e => set('language', e.target.value)}
                  style={{
                    padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 6, color: 'var(--text)', fontSize: 13, outline: 'none', width: 200,
                  }}
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: 'var(--text2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Services Involved
                </label>
                <input
                  value={form.services}
                  onChange={e => set('services', e.target.value)}
                  placeholder="e.g. API Gateway, Auth Service, PostgreSQL, Redis..."
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 6, color: 'var(--text)', fontSize: 13, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: 'var(--text2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Additional Context
                </label>
                <textarea
                  value={form.context}
                  onChange={e => set('context', e.target.value)}
                  placeholder="Recent deployments, config changes, when it started..."
                  rows={5}
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 6, color: 'var(--text)', fontSize: 13,
                    resize: 'vertical', outline: 'none', lineHeight: 1.7,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--bg2)',
        }}>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text3)' }}>
            <span style={{ color: filled('error') ? 'var(--accent3)' : 'var(--border2)' }}>● Error</span>
            <span style={{ color: filled('stack') ? 'var(--accent3)' : 'var(--border2)' }}>● Stack</span>
            <span style={{ color: filled('logs') ? 'var(--accent3)' : 'var(--border2)' }}>● Logs</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!form.error && !form.logs && !form.stack}
            style={{
              padding: '12px 28px', background: 'var(--accent)',
              border: 'none', borderRadius: 6, color: 'var(--bg)',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
              letterSpacing: '0.05em', transition: 'all 0.2s',
              opacity: (!form.error && !form.logs && !form.stack) ? 0.4 : 1,
              cursor: (!form.error && !form.logs && !form.stack) ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (form.error || form.logs || form.stack) e.target.style.background = '#00b8d9' }}
            onMouseLeave={e => e.target.style.background = 'var(--accent)'}
          >
            ▸ Analyze Bug
          </button>
        </div>
      </div>

      {/* Bottom hint */}
      <div style={{ marginTop: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 11 }}>
        Powered by Groq · llama-3.3-70b-versatile · Abductive Reasoning
      </div>
    </div>
  )
}

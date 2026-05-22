import { useState } from 'react'
import FollowUp from '../components/FollowUp.jsx'

const SEV_COLOR = { critical: '#ff3333', high: '#ff6b35', medium: '#ffd60a', low: '#39ff14' }
const SEV_BG = { critical: 'rgba(255,51,51,0.1)', high: 'rgba(255,107,53,0.1)', medium: 'rgba(255,214,10,0.1)', low: 'rgba(57,255,20,0.1)' }

function LoadingState({ streamText }) {
  const steps = [
    'Parsing error signature...',
    'Building causal graph...',
    'Generating hypotheses...',
    'Ranking by probability...',
    'Synthesizing root cause...',
  ]
  const progress = Math.min(Math.floor((streamText.length / 800) * steps.length), steps.length - 1)

  return (
    <div style={{ maxWidth: 700, margin: '80px auto', padding: '0 24px', animation: 'fade-in 0.4s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          width: 64, height: 64, margin: '0 auto 24px',
          border: '2px solid var(--border)',
          borderTop: '2px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Analyzing<span style={{ animation: 'blink 1s infinite' }}>_</span>
        </div>
        <div style={{ color: 'var(--text3)', fontSize: 12 }}>DebugMind is reasoning about your bug</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            background: i <= progress ? 'rgba(0,212,255,0.05)' : 'var(--panel)',
            border: `1px solid ${i <= progress ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 6,
            transition: 'all 0.4s ease',
            opacity: i <= progress ? 1 : 0.4,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: i < progress ? 'var(--accent3)' : i === progress ? 'var(--accent)' : 'var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: 'var(--bg)',
              animation: i === progress ? 'pulse-glow 1s infinite' : 'none',
            }}>
              {i < progress ? '✓' : i === progress ? '◉' : '○'}
            </div>
            <span style={{ fontSize: 12, color: i <= progress ? 'var(--text)' : 'var(--text3)' }}>{step}</span>
          </div>
        ))}
      </div>

      {streamText.length > 10 && (
        <div style={{
          marginTop: 24, padding: '12px 16px',
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 6, fontSize: 11, color: 'var(--text3)',
          maxHeight: 100, overflow: 'hidden',
          maskImage: 'linear-gradient(to bottom, black 60%, transparent)',
        }}>
          <span style={{ color: 'var(--accent)' }}>{'>'} </span>
          {streamText.slice(-300)}
        </div>
      )}
    </div>
  )
}

function SeverityBadge({ severity }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 3,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.15em',
      textTransform: 'uppercase',
      color: SEV_COLOR[severity] || 'var(--text)',
      background: SEV_BG[severity] || 'var(--border)',
      border: `1px solid ${SEV_COLOR[severity] || 'var(--border)'}`,
    }}>
      {severity}
    </span>
  )
}

function Panel({ title, accent, children, badge }) {
  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 8, overflow: 'hidden',
      animation: 'slide-in 0.4s ease',
    }}>
      <div style={{
        padding: '12px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 3, height: 14, background: accent || 'var(--accent)', borderRadius: 2 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>{title}</span>
        </div>
        {badge}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  )
}

function CodeBlock({ code, language, label, color }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: color || 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {label} · {language}
        </span>
        <button onClick={copy} style={{
          padding: '3px 10px', background: 'transparent',
          border: '1px solid var(--border)', borderRadius: 3,
          color: copied ? 'var(--accent3)' : 'var(--text3)', fontSize: 10,
          transition: 'all 0.2s',
        }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{
        background: 'var(--bg)', padding: '14px 16px', borderRadius: 6,
        border: `1px solid ${color ? color + '33' : 'var(--border)'}`,
        fontSize: 12, lineHeight: 1.7, overflowX: 'auto',
        color: color || 'var(--text)',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {code}
      </pre>
    </div>
  )
}

export default function DebugResult({ result, loading, streamText, inputData, onReset }) {
  const [activeSection, setActiveSection] = useState('overview')
  const [showFollowUp, setShowFollowUp] = useState(false)

  if (loading) return <LoadingState streamText={streamText} />

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'hypotheses', label: `Hypotheses (${result?.hypotheses?.length || 0})` },
    { id: 'causal', label: 'Causal Chain' },
    { id: 'fix', label: 'Fix Plan' },
    { id: 'code', label: 'Code Diff' },
    { id: 'postmortem', label: 'Post-Mortem' },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 80px' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 28, animation: 'slide-in 0.3s ease',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <SeverityBadge severity={result.severity} />
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
              ◷ Est. resolution: <span style={{ color: 'var(--accent2)' }}>{result.timeToResolve}</span>
            </span>
            {result.affectedServices?.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                ◈ {result.affectedServices.length} service{result.affectedServices.length > 1 ? 's' : ''} affected
              </span>
            )}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
            letterSpacing: '-0.02em', lineHeight: 1.3, maxWidth: 700,
          }}>
            {result.summary}
          </h2>
        </div>
        <button onClick={onReset} style={{
          padding: '10px 18px', background: 'transparent',
          border: '1px solid var(--border)', borderRadius: 6,
          color: 'var(--text2)', fontSize: 12, transition: 'all 0.2s', flexShrink: 0,
        }}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text2)' }}
        >
          ← New Debug
        </button>
      </div>

      {/* Section nav */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24,
        borderBottom: '1px solid var(--border)', paddingBottom: 0,
        overflowX: 'auto',
      }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            padding: '10px 16px', background: 'transparent', border: 'none',
            color: activeSection === s.id ? 'var(--accent)' : 'var(--text3)',
            borderBottom: `2px solid ${activeSection === s.id ? 'var(--accent)' : 'transparent'}`,
            fontSize: 12, whiteSpace: 'nowrap', transition: 'all 0.2s',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* OVERVIEW */}
        {activeSection === 'overview' && (
          <>
            {/* Root Cause */}
            <Panel title="Root Cause" accent="var(--danger)" badge={
              <span style={{ fontSize: 11, color: 'var(--accent)', background: 'rgba(0,212,255,0.1)', padding: '3px 10px', borderRadius: 3 }}>
                {result.rootCause?.confidence}% confidence
              </span>
            }>
              <div style={{ fontSize: 15, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 10, color: 'var(--danger)' }}>
                {result.rootCause?.title}
              </div>
              <div style={{ color: 'var(--text2)', lineHeight: 1.8, fontSize: 13 }}>
                {result.rootCause?.explanation}
              </div>
            </Panel>

            {/* Affected Services */}
            {result.affectedServices?.length > 0 && (
              <Panel title="Affected Services" accent="var(--warn)">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {result.affectedServices.map((s, i) => (
                    <span key={i} style={{
                      padding: '6px 14px', borderRadius: 4,
                      background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.3)',
                      color: 'var(--warn)', fontSize: 12,
                    }}>
                      ◈ {s}
                    </span>
                  ))}
                </div>
              </Panel>
            )}

            {/* Debug Commands */}
            {result.debugCommands?.length > 0 && (
              <Panel title="Diagnostic Commands" accent="var(--accent3)">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.debugCommands.map((cmd, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', background: 'var(--bg)',
                      border: '1px solid var(--border)', borderRadius: 6,
                    }}>
                      <span style={{ color: 'var(--accent3)', fontSize: 13 }}>$</span>
                      <code style={{ fontSize: 12, color: 'var(--accent3)', flex: 1 }}>{cmd}</code>
                      <button onClick={() => navigator.clipboard.writeText(cmd)} style={{
                        padding: '2px 8px', background: 'transparent',
                        border: '1px solid var(--border)', borderRadius: 3,
                        color: 'var(--text3)', fontSize: 10,
                      }}>copy</button>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* Similar Bugs */}
            {result.similarBugs?.length > 0 && (
              <Panel title="Similar Bug Patterns" accent="var(--text3)">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.similarBugs.map((bug, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--accent)', marginTop: 2 }}>▸</span>
                      <span style={{ color: 'var(--text2)', fontSize: 13 }}>{bug}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </>
        )}

        {/* HYPOTHESES */}
        {activeSection === 'hypotheses' && (
          <Panel title="Ranked Hypotheses" accent="var(--accent)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {result.hypotheses?.map((h, i) => {
                const statusColor = h.status === 'likely' ? 'var(--danger)' : h.status === 'possible' ? 'var(--warn)' : 'var(--text3)'
                return (
                  <div key={i} style={{
                    padding: '16px 20px',
                    background: 'var(--bg)',
                    border: `1px solid ${h.status === 'likely' ? 'rgba(255,51,51,0.3)' : 'var(--border)'}`,
                    borderRadius: 8,
                    borderLeft: `3px solid ${statusColor}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>#{h.id}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>{h.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 3,
                          color: statusColor, border: `1px solid ${statusColor}`,
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                        }}>{h.status}</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: statusColor }}>{h.probability}%</span>
                      </div>
                    </div>

                    {/* Probability bar */}
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginBottom: 12 }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        width: `${h.probability}%`,
                        background: statusColor,
                        transition: 'width 0.8s ease',
                      }} />
                    </div>

                    <div style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 10, lineHeight: 1.7 }}>
                      {h.description}
                    </div>
                    <div style={{
                      padding: '8px 12px', background: 'rgba(0,212,255,0.05)',
                      border: '1px solid rgba(0,212,255,0.15)', borderRadius: 4,
                      fontSize: 12, color: 'var(--text3)',
                    }}>
                      <span style={{ color: 'var(--accent)', marginRight: 6 }}>Evidence:</span>
                      {h.evidence}
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        )}

        {/* CAUSAL CHAIN */}
        {activeSection === 'causal' && (
          <Panel title="Causal Chain Reconstruction" accent="var(--accent2)">
            <div style={{ position: 'relative', paddingLeft: 32 }}>
              {/* Vertical line */}
              <div style={{
                position: 'absolute', left: 10, top: 10, bottom: 10,
                width: 1, background: 'var(--border)',
              }} />

              {result.causalChain?.map((c, i) => {
                const typeColor = c.type === 'trigger' ? 'var(--danger)' : c.type === 'symptom' ? 'var(--warn)' : 'var(--accent)'
                return (
                  <div key={i} style={{ position: 'relative', marginBottom: 24, animation: `slide-in 0.3s ease ${i * 0.1}s both` }}>
                    {/* Dot */}
                    <div style={{
                      position: 'absolute', left: -26, top: 14,
                      width: 12, height: 12, borderRadius: '50%',
                      background: typeColor, border: '2px solid var(--bg)',
                    }} />

                    <div style={{
                      padding: '14px 18px',
                      background: 'var(--bg)',
                      border: `1px solid ${typeColor}33`,
                      borderRadius: 8,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 3,
                          color: typeColor, border: `1px solid ${typeColor}`,
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                        }}>{c.type}</span>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>Step {c.step}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{c.event}</div>
                    </div>

                    {i < result.causalChain.length - 1 && (
                      <div style={{ color: 'var(--text3)', fontSize: 16, position: 'absolute', left: -22, bottom: -20 }}>↓</div>
                    )}
                  </div>
                )
              })}
            </div>
          </Panel>
        )}

        {/* FIX PLAN */}
        {activeSection === 'fix' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'immediate', label: '🚨 Immediate Action', color: 'var(--danger)', desc: 'Do this RIGHT NOW to stop the bleeding' },
              { key: 'shortTerm', label: '🔧 Short-term Fix', color: 'var(--warn)', desc: 'Proper fix within hours or days' },
              { key: 'longTerm', label: '🏗️ Long-term Improvement', color: 'var(--accent3)', desc: 'Architectural change to prevent recurrence' },
            ].map(({ key, label, color, desc }) => (
              <Panel key={key} title={label} accent={color}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{desc}</div>
                <div style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 13 }}>{result.fix?.[key]}</div>
              </Panel>
            ))}
          </div>
        )}

        {/* CODE DIFF */}
        {activeSection === 'code' && (
          <Panel title="Code Fix" accent="var(--accent)">
            {result.codeSnippet?.broken && (
              <CodeBlock
                code={result.codeSnippet.broken}
                language={result.codeSnippet.language}
                label="❌ Broken"
                color="var(--danger)"
              />
            )}
            {result.codeSnippet?.fixed && (
              <CodeBlock
                code={result.codeSnippet.fixed}
                language={result.codeSnippet.language}
                label="✅ Fixed"
                color="var(--accent3)"
              />
            )}
          </Panel>
        )}

        {/* POST MORTEM */}
        {activeSection === 'postmortem' && (
          <Panel title="Auto-Generated Post-Mortem Draft" accent="var(--text2)">
            <div style={{
              color: 'var(--text2)', lineHeight: 2, fontSize: 13,
              whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)',
            }}>
              {result.postMortemDraft}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(result.postMortemDraft)}
              style={{
                marginTop: 16, padding: '10px 20px',
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 6, color: 'var(--text2)', fontSize: 12,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text2)' }}
            >
              Copy Post-Mortem
            </button>
          </Panel>
        )}

      </div>

      {/* Follow-up Chat */}
      <div style={{ marginTop: 32 }}>
        <button
          onClick={() => setShowFollowUp(v => !v)}
          style={{
            width: '100%', padding: '14px',
            background: showFollowUp ? 'rgba(0,212,255,0.08)' : 'var(--panel)',
            border: `1px solid ${showFollowUp ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 8, color: showFollowUp ? 'var(--accent)' : 'var(--text2)',
            fontSize: 13, transition: 'all 0.2s',
          }}
        >
          {showFollowUp ? '▾' : '▸'} Ask a follow-up question about this bug
        </button>
        {showFollowUp && (
          <FollowUp result={result} inputData={inputData} />
        )}
      </div>
    </div>
  )
}

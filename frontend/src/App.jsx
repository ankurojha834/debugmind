import { useState } from 'react'
import DebugInput from './pages/DebugInput.jsx'
import DebugResult from './pages/DebugResult.jsx'
import Header from './components/Header.jsx'

const BASE = import.meta.env.VITE_API_URL || 'https://debugmind-kj6e.onrender.com'

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [inputData, setInputData] = useState(null)
  const [streamText, setStreamText] = useState('')

  const handleDebug = async (formData) => {
    setLoading(true)
    setResult(null)
    setStreamText('')
    setInputData(formData)

    try {
      const res = await fetch(`${BASE}/api/debug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.delta) {
              fullText += data.delta
              setStreamText(fullText)
            }
            if (data.done && data.full) {
              const cleaned = data.full.replace(/```json\n?|```\n?/g, '').trim()
              const parsed = JSON.parse(cleaned)
              setResult(parsed)
              setLoading(false)
            }
          } catch (_) {}
        }
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
      alert('Backend error: ' + err.message)
    }
  }

  const handleReset = () => {
    setResult(null)
    setStreamText('')
    setInputData(null)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {!result && !loading && (
          <DebugInput onSubmit={handleDebug} />
        )}
        {(loading || result) && (
          <DebugResult
            result={result}
            loading={loading}
            streamText={streamText}
            inputData={inputData}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  )
}
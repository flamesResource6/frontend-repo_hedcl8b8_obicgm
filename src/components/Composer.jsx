import React, { useState } from 'react'

export default function Composer({ onParsed }) {
  const [message, setMessage] = useState('Mordo. Jasne.\n\nCode snippet\n\ngraph TD\n    A[TONY HK LTD]\n    B[TONY US LLC]\n    C[TWOJE US LLC]\n    D[TWOJA HK AGENCY]\n    A -- "KONTRAKT #1: PERFORMANCE" --> C\n    B -- "KONTRAKT #2: STRATEGIA" --> D\n    C -.->|Płatność kartą| FB[Facebook/Google Ads]\n    A -.->|Płatność| SUP[Dostawca Towaru]')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleParse = async () => {
    setError('')
    setLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const res = await fetch(`${baseUrl}/api/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.detail || 'Błąd parsowania')
      }
      const data = await res.json()
      onParsed?.(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (title) => {
    setError('')
    setLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const res = await fetch(`${baseUrl}/api/blueprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message })
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.detail || 'Błąd zapisu')
      }
      const id = await res.json()
      alert(`Zapisano blueprint: ${id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-blue-200 text-sm">Wklej rozmowę zaczynając od słowa „mordo”</label>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="w-full h-56 bg-slate-900/60 border border-blue-500/30 rounded-xl p-3 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {error && <div className="text-red-300 text-sm">{error}</div>}
      <div className="flex gap-3">
        <button
          onClick={handleParse}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
        >{loading ? 'Parsuję...' : 'Parsuj do grafu'}</button>
        <button
          onClick={() => {
            const t = prompt('Tytuł blueprintu:')
            if (t) handleSave(t)
          }}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
        >Zapisz jako blueprint</button>
      </div>
    </div>
  )
}

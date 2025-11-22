import React, { useEffect, useState } from 'react'

export default function BlueprintList({ onSelect }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
        const res = await fetch(`${baseUrl}/api/blueprints`)
        if (!res.ok) throw new Error('Nie mogę pobrać listy')
        const data = await res.json()
        setItems(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  if (loading) return <div className="text-blue-200/80 text-sm">Ładowanie...</div>
  if (error) return <div className="text-red-300 text-sm">{error}</div>

  return (
    <div className="space-y-2">
      <div className="text-blue-200 text-sm">Zapisane blueprinty</div>
      <div className="grid gap-2">
        {items.map((it, idx) => (
          <button key={idx} onClick={() => onSelect?.(it)} className="text-left p-3 rounded-lg bg-slate-900/60 border border-blue-500/30 hover:border-blue-400 transition">
            <div className="text-white font-semibold">{it.title}</div>
            <div className="text-blue-300/70 text-xs line-clamp-2">{it.raw_text.slice(0, 120)}...</div>
          </button>
        ))}
        {!items.length && <div className="text-blue-200/60 text-sm">Brak zapisanych blueprintów</div>}
      </div>
    </div>
  )
}

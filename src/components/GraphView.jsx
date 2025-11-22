import React from 'react'

// Simple radial layout and SVG renderer
export default function GraphView({ nodes = [], edges = [] }) {
  if (!nodes.length) return (
    <div className="text-blue-200/80 text-sm">Brak danych do wizualizacji</div>
  )

  const size = 560
  const cx = size / 2
  const cy = size / 2
  const radius = Math.min(cx, cy) - 80

  // Map nodes to positions on a circle
  const positioned = nodes.map((n, idx) => {
    const angle = (2 * Math.PI * idx) / nodes.length
    return {
      ...n,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })

  const posById = Object.fromEntries(positioned.map(n => [n.id, n]))

  return (
    <div className="w-full overflow-auto">
      <svg width={size} height={size} className="drop-shadow">
        {/* edges */}
        {edges.map((e, i) => {
          const s = posById[e.source]
          const t = posById[e.target]
          if (!s || !t) return null
          const midX = (s.x + t.x) / 2
          const midY = (s.y + t.y) / 2
          return (
            <g key={i}>
              <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={e.style === 'dashed' ? '#60a5fa' : '#93c5fd'} strokeWidth={2} strokeDasharray={e.style === 'dashed' ? '6 6' : '0'} />
              {e.label && (
                <text x={midX} y={midY} className="fill-blue-200 text-xs" textAnchor="middle" dy={-6}>
                  {e.label}
                </text>
              )}
              {/* arrowhead */}
              <circle cx={t.x} cy={t.y} r={4} fill="#60a5fa" />
            </g>
          )
        })}

        {/* nodes */}
        {positioned.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={28} fill="#0ea5e9" opacity={0.2} />
            <circle cx={n.x} cy={n.y} r={26} fill="#0ea5e9" opacity={0.35} />
            <circle cx={n.x} cy={n.y} r={24} fill="#38bdf8" />
            <text x={n.x} y={n.y} className="fill-white text-sm font-semibold" textAnchor="middle" dominantBaseline="middle">
              {n.label || n.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

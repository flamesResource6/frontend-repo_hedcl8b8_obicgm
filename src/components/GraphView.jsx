import React, { useEffect, useMemo, useRef, useState } from 'react'

// Enhanced force-directed SVG graph with zoom/pan, arrowheads, curved edges and hover highlights
export default function GraphView({ nodes = [], edges = [] }) {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ width: 800, height: 560 })
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 })
  const [hover, setHover] = useState({ node: null, edgeIdx: null })

  // Resize observer for responsive SVG
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const cr = e.contentRect
        setSize({ width: Math.max(600, cr.width), height: Math.max(420, 0.66 * cr.width) })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Prepare graph: unique ids, simple force layout
  const layout = useMemo(() => {
    if (!nodes.length) return { positioned: [], posById: {}, simEdges: [] }

    // Clone nodes with initial positions on a circle
    const W = size.width
    const H = size.height
    const cx = W / 2
    const cy = H / 2
    const radius = Math.min(cx, cy) - 80

    const positioned = nodes.map((n, i) => ({
      ...n,
      x: cx + radius * Math.cos((2 * Math.PI * i) / nodes.length),
      y: cy + radius * Math.sin((2 * Math.PI * i) / nodes.length),
      vx: 0,
      vy: 0,
    }))

    const byId = Object.fromEntries(positioned.map(n => [n.id, n]))

    const simEdges = edges
      .filter(e => byId[e.source] && byId[e.target])
      .map(e => ({ ...e }))

    // Simple force simulation (Coulomb repulsion + Hooke springs)
    const ITER = 220
    const repulsion = 2600 // higher = more spread
    const linkLength = 140
    const stiffness = 0.02
    const damping = 0.85
    const centerPull = 0.02

    for (let it = 0; it < ITER; it++) {
      // Repulsion
      for (let i = 0; i < positioned.length; i++) {
        const a = positioned[i]
        for (let j = i + 1; j < positioned.length; j++) {
          const b = positioned[j]
          let dx = a.x - b.x
          let dy = a.y - b.y
          let dist2 = dx * dx + dy * dy + 0.01
          let force = repulsion / dist2
          let invDist = 1 / Math.sqrt(dist2)
          let fx = force * dx * invDist
          let fy = force * dy * invDist
          a.vx += fx
          a.vy += fy
          b.vx -= fx
          b.vy -= fy
        }
      }
      // Springs
      for (const e of simEdges) {
        const s = byId[e.source]
        const t = byId[e.target]
        const dx = t.x - s.x
        const dy = t.y - s.y
        const dist = Math.max(1, Math.hypot(dx, dy))
        const diff = dist - linkLength
        const f = stiffness * diff
        const fx = (f * dx) / dist
        const fy = (f * dy) / dist
        s.vx += fx
        s.vy += fy
        t.vx -= fx
        t.vy -= fy
      }
      // Pull to center and integrate
      for (const n of positioned) {
        n.vx += (cx - n.x) * centerPull
        n.vy += (cy - n.y) * centerPull
        n.x += n.vx * 0.02
        n.y += n.vy * 0.02
        n.vx *= damping
        n.vy *= damping
      }
    }

    return { positioned, posById: byId, simEdges }
  }, [nodes, edges, size.width, size.height])

  // Zoom & pan handlers
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let isPanning = false
    let last = { x: 0, y: 0 }

    const onWheel = (e) => {
      e.preventDefault()
      const { offsetX, offsetY, deltaY } = e
      const k = Math.min(3, Math.max(0.4, transform.k * (deltaY > 0 ? 0.9 : 1.1)))
      // zoom towards cursor
      const dx = offsetX - transform.x
      const dy = offsetY - transform.y
      const scale = k / transform.k
      const x = offsetX - dx * scale
      const y = offsetY - dy * scale
      setTransform({ k, x, y })
    }

    const onDown = (e) => {
      isPanning = true
      last = { x: e.clientX, y: e.clientY }
    }
    const onMove = (e) => {
      if (!isPanning) return
      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      last = { x: e.clientX, y: e.clientY }
      setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }))
    }
    const onUp = () => { isPanning = false }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [transform])

  if (!nodes.length) return (
    <div className="text-blue-200/80 text-sm">Brak danych do wizualizacji</div>
  )

  const { positioned, posById } = layout

  // Helpers for styles
  const nodeColor = (n) => {
    switch ((n.group || '').toLowerCase()) {
      case 'hk':
      case 'hong kong':
        return ['#0ea5e9', '#022c3a']
      case 'us':
      case 'usa':
        return ['#22c55e', '#062d1f']
      case 'eu':
      case 'pl':
        return ['#a78bfa', '#2a1f45']
      default:
        return ['#38bdf8', '#0b2130']
    }
  }

  return (
    <div ref={containerRef} className="w-full h-[600px] bg-slate-950/40 rounded-xl border border-blue-500/30 overflow-hidden">
      <svg width={size.width} height={size.height} className="block">
        <defs>
          <marker id="arrow-solid" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L12,6 L0,12 z" fill="#7dd3fc" />
          </marker>
          <marker id="arrow-dashed" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L12,6 L0,12 z" fill="#60a5fa" />
          </marker>
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* edges */}
          {edges.map((e, i) => {
            const s = posById[e.source]
            const t = posById[e.target]
            if (!s || !t) return null
            const mx = (s.x + t.x) / 2
            const my = (s.y + t.y) / 2
            const nx = t.y - s.y
            const ny = -(t.x - s.x)
            const len = Math.max(1, Math.hypot(nx, ny))
            const bend = 30 // curvature
            const cx1 = mx + (nx / len) * bend
            const cy1 = my + (ny / len) * bend
            const pathId = `edge-path-${i}`
            const isHovered = hover.edgeIdx === i || hover.node === e.source || hover.node === e.target
            const stroke = e.style === 'dashed' ? '#60a5fa' : '#93c5fd'
            const opacity = isHovered ? 0.95 : 0.5

            const d = `M ${s.x} ${s.y} Q ${cx1} ${cy1} ${t.x} ${t.y}`
            return (
              <g key={i} onMouseEnter={() => setHover({ node: null, edgeIdx: i })} onMouseLeave={() => setHover({ node: null, edgeIdx: null })}>
                <path id={pathId} d={d} fill="none" stroke={stroke} strokeOpacity={opacity} strokeWidth={2.2} strokeDasharray={e.style === 'dashed' ? '6 6' : '0'} markerEnd={`url(#${e.style === 'dashed' ? 'arrow-dashed' : 'arrow-solid'})`} />
                {e.label && (
                  <text className="fill-blue-200 text-[12px]">
                    <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">{e.label}</textPath>
                  </text>
                )}
              </g>
            )
          })}

          {/* nodes */}
          {positioned.map((n) => {
            const [fg, bg] = nodeColor(n)
            const isHovered = hover.node === n.id
            const w = 170
            const h = 44
            const rx = 12
            return (
              <g key={n.id} transform={`translate(${n.x - w / 2}, ${n.y - h / 2})`} onMouseEnter={() => setHover({ node: n.id, edgeIdx: null })} onMouseLeave={() => setHover({ node: null, edgeIdx: null })}>
                <rect width={w} height={h} rx={rx} fill={bg} stroke={fg} strokeOpacity={0.6} strokeWidth={isHovered ? 2.4 : 1.6} filter={isHovered ? 'url(#soft-glow)' : undefined} />
                <rect x={6} y={6} width={8} height={h - 12} rx={4} fill={fg} opacity={0.9} />
                <text x={24} y={h / 2} className="fill-white text-[13px] font-semibold" dominantBaseline="middle">{n.label || n.id}</text>
                {n.group && (
                  <g transform={`translate(${w - 56}, 8)`}>
                    <rect width={48} height={20} rx={6} fill={fg} opacity={0.15} stroke={fg} strokeOpacity={0.35} />
                    <text x={24} y={10} textAnchor="middle" dominantBaseline="middle" className="fill-blue-100 text-[11px]">{(n.group || '').toUpperCase()}</text>
                  </g>
                )}
              </g>
            )
          })}
        </g>

        {/* Legend / hint */}
        <g transform="translate(16, 16)">
          <rect width="220" height="62" rx="12" fill="#0b2130" opacity="0.7" stroke="#1e3a8a" strokeOpacity="0.4" />
          <text x="12" y="20" className="fill-blue-100 text-[12px]">Sterowanie:</text>
          <text x="12" y="36" className="fill-blue-300 text-[11px]">• Scroll – zoom • Przeciągnij – przesuwanie</text>
          <text x="12" y="52" className="fill-blue-300 text-[11px]">• Najedź, aby podświetlić powiązania</text>
        </g>
      </svg>
    </div>
  )
}

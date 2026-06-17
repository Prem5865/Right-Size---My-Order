import { useState, useEffect, useRef, useCallback } from 'react'
import { monthlyUsage, customer } from '../data/sampleData'

// ─── Chart geometry ──────────────────────────────────────────────────────────
const M        = { top: 48, right: 46, bottom: 46, left: 54 }
const SVG_W    = 720
const SVG_H    = 276
const CW       = SVG_W - M.left - M.right   // 620
const CH       = SVG_H - M.top  - M.bottom  // 182
const MAX_GAL  = 22
const Y_TICKS  = [0, 5, 10, 15, 20]

const CLR = {
  delivered: '#D4CEC6',
  consumed:  '#3B82F6',
  planLine:  '#FDE68A',
}

function yp(val) {
  return CH - (val / MAX_GAL) * CH
}

// ─── Tooltip (rendered inside SVG <g> space) ─────────────────────────────────
function ChartTooltip({ tip }) {
  if (!tip) return null
  const tx         = Math.max(76, Math.min(tip.cx, CW - 76))
  const waste      = +(tip.delivered - tip.consumed).toFixed(1)
  const wasteCost  = Math.round(waste * tip.ppg)
  return (
    <g transform={`translate(${tx},8)`} style={{ pointerEvents: 'none' }}>
      <rect
        x={-76} y={0} width={152} height={80} rx={10}
        fill="white"
        stroke="#EDE8E3"
        strokeWidth={1}
        filter="drop-shadow(0 2px 8px rgba(0,0,0,0.10))"
      />
      <text
        x={0} y={17}
        textAnchor="middle" fontSize={13} fontWeight={600}
        fill="#1C1917" fontFamily="Inter,sans-serif"
      >
        {tip.month}
      </text>
      <text
        x={0} y={34}
        textAnchor="middle" fontSize={11}
        fill="#A8A29E" fontFamily="Inter,sans-serif"
      >
        Delivered: {tip.delivered} gal
      </text>
      <text
        x={0} y={50}
        textAnchor="middle" fontSize={11}
        fill="#3B82F6" fontFamily="Inter,sans-serif"
      >
        Consumed: {tip.consumed} gal
      </text>
      <text
        x={0} y={66}
        textAnchor="middle" fontSize={11}
        fill="#EF4444" fontFamily="Inter,sans-serif"
      >
        Unused: {waste} gal · ${wasteCost}
      </text>
    </g>
  )
}

export default function UsageBarChart() {
  const [range,    setRange]    = useState(12)
  const [tip,      setTip]      = useState(null)
  const [progress, setProgress] = useState(0)

  const rafRef   = useRef(null)
  const startRef = useRef(null)

  // Smooth ease-out-cubic bar-grow animation via requestAnimationFrame
  const animate = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setProgress(0)
    startRef.current = null

    function step(ts) {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const raw = Math.min(elapsed / 750, 1)
      const p   = 1 - Math.pow(1 - raw, 3)   // ease-out cubic
      setProgress(p)
      if (raw < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    animate()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [range, animate])

  const data   = monthlyUsage.slice(-range)
  const groupW = CW / data.length
  const barW   = Math.max(7, groupW * 0.30)
  const gap    = Math.max(2, groupW * 0.06)

  // Only show every Nth x-axis label to prevent crowding
  const labelEvery = range >= 24 ? 3 : range >= 12 ? 2 : 1

  const handleRange = (r) => {
    setTip(null)
    setRange(r)
  }

  return (
    <section
      className="section"
      style={{
        background:   'var(--card)',
        border:       '1px solid var(--border)',
        borderRadius: 20,
        padding:      'clamp(20px, 3vw, 32px)',
        marginBottom: 24,
        boxShadow:    '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Header row ── */}
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 12,
          justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: 18,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 3 }}>
            Delivered vs. Consumed
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {range}-month history · {data[0]?.label} – {data[data.length - 1]?.label}
          </p>
        </div>

        {/* Range buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[6, 12, 24].map((r) => (
            <button
              key={r}
              onClick={() => handleRange(r)}
              style={{
                padding:     '5px 14px',
                borderRadius: 999,
                border:      `1px solid ${range === r ? 'var(--amber)' : 'var(--border)'}`,
                background:   range === r ? 'var(--amber-bg)' : 'transparent',
                color:        range === r ? 'var(--amber)'    : 'var(--text-2)',
                fontSize:     13,
                fontWeight:   range === r ? 600 : 400,
                transition:   'all 0.15s',
              }}
            >
              {r}mo
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex', gap: 18, marginBottom: 6,
          paddingLeft: M.left,
        }}
      >
        {[['Delivered', CLR.delivered], ['Consumed', CLR.consumed]].map(([lbl, clr]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: clr }} />
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{lbl}</span>
          </div>
        ))}
      </div>

      {/* ── SVG chart ── */}
      <div style={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width: '100%', height: 'auto', overflow: 'visible' }}
          aria-label="Bar chart: gallons delivered vs consumed per month"
        >
          <g transform={`translate(${M.left},${M.top})`}>

            {/* Y-axis grid + labels */}
            {Y_TICKS.map((v) => (
              <g key={v}>
                <line
                  x1={0} y1={yp(v)} x2={CW} y2={yp(v)}
                  stroke={v === 15 ? '#FBBF24' : '#EDE8E3'}
                  strokeWidth={v === 15 ? 1.5 : 1}
                  strokeDasharray={v === 15 ? '5,4' : undefined}
                />
                <text
                  x={-8} y={yp(v) + 4}
                  textAnchor="end" fontSize={11}
                  fill={v === 15 ? '#D97706' : '#B8B0A8'}
                  fontWeight={v === 15 ? 600 : 400}
                  fontFamily="Inter,sans-serif"
                >
                  {v}
                </text>
              </g>
            ))}

            {/* "plan" label on the 15-gal dashed line */}
            <text
              x={CW + 5} y={yp(15) + 4}
              fontSize={10} fill="#D97706" fontWeight={600}
              fontFamily="Inter,sans-serif"
            >
              plan
            </text>

            {/* Bars */}
            {data.map((d, i) => {
              const cx      = i * groupW + groupW / 2
              const delivH  = (d.delivered / MAX_GAL) * CH * progress
              const consH   = (d.consumed  / MAX_GAL) * CH * progress
              return (
                <g key={`${d.month}-${d.year}`}>
                  {/* Delivered bar */}
                  <rect
                    x={cx - barW - gap / 2}
                    y={CH - delivH}
                    width={barW}
                    height={delivH}
                    fill={CLR.delivered}
                    rx={3}
                    onMouseEnter={() => setTip({ cx, month: d.label ?? d.month, delivered: d.delivered, consumed: d.consumed, ppg: customer.pricePerGallon })}
                    onMouseLeave={() => setTip(null)}
                  />
                  {/* Consumed bar */}
                  <rect
                    x={cx + gap / 2}
                    y={CH - consH}
                    width={barW}
                    height={consH}
                    fill={CLR.consumed}
                    rx={3}
                    onMouseEnter={() => setTip({ cx, month: d.label ?? d.month, delivered: d.delivered, consumed: d.consumed, ppg: customer.pricePerGallon })}
                    onMouseLeave={() => setTip(null)}
                  />
                  {/* X-axis month label */}
                  {i % labelEvery === 0 && (
                    <text
                      x={cx} y={CH + 20}
                      textAnchor="middle" fontSize={range >= 24 ? 9 : 11}
                      fill="#B8B0A8" fontFamily="Inter,sans-serif"
                    >
                      {d.label}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Tooltip */}
            <ChartTooltip tip={tip} />
          </g>
        </svg>
      </div>

      {/* ── Season highlights strip (below chart, no overlap) ── */}
    </section>
  )
}

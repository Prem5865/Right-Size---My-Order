import { peerHouseholds } from '../data/sampleData'

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ values, color }) {
  const W = 108, H = 38, PAD = 3
  if (!values?.length) return null

  const min   = Math.min(...values)
  const max   = Math.max(...values)
  const range = max - min || 0.1

  const pts = values
    .map((v, i) => {
      const x = PAD + (i / (values.length - 1)) * (W - PAD * 2)
      const y = PAD + ((max - v) / range) * (H - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  // Last point dot
  const lastV = values[values.length - 1]
  const lx = W - PAD
  const ly = PAD + ((max - lastV) / range) * (H - PAD * 2)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: W, height: H, overflow: 'visible' }}
      aria-hidden="true"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lx} cy={ly} r={3} fill={color} />
    </svg>
  )
}

// ─── Utilisation bar ─────────────────────────────────────────────────────────
function UtilBar({ pct }) {
  const clr =
    pct >= 90 ? 'var(--green-mid)' :
    pct >= 70 ? '#D97706' :
                '#EF4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
      <div
        style={{
          width: 76, height: 6,
          background: 'var(--border)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(pct, 100)}%`,
            background: clr,
            borderRadius: 999,
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-2)', minWidth: 32 }}>{pct}%</span>
    </div>
  )
}

// ─── Pre-compute insight ──────────────────────────────────────────────────────
const you         = peerHouseholds.find((h) => h.isYou)
const youAvg      = you.values.reduce((a, b) => a + b, 0) / you.values.length
const youUtil     = Math.round((youAvg / you.plan) * 100)
const higherCount = peerHouseholds.filter((h) => {
  if (h.isYou) return false
  const avg = h.values.reduce((a, b) => a + b, 0) / h.values.length
  return avg > youAvg
}).length

export default function PeerComparison() {
  const cols = ['Household', 'Plan', '12-mo trend', 'Avg used', 'Utilisation']

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
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 3 }}>
          Peer Comparison
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
          Anonymous households on similar plans in your area
        </p>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}
          aria-label="Peer household comparison"
        >
          <thead>
            <tr>
              {cols.map((h, ci) => (
                <th
                  key={h}
                  style={{
                    padding:       '8px 12px',
                    textAlign:     ci === 0 ? 'left' : 'center',
                    fontSize:      11,
                    fontWeight:    600,
                    color:         'var(--text-3)',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    borderBottom:  '1px solid var(--border)',
                    fontFamily:    'Inter, sans-serif',
                    whiteSpace:    'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {peerHouseholds.map((hh, ri) => {
              const avg     = hh.values.reduce((a, b) => a + b, 0) / hh.values.length
              const util    = Math.round((avg / hh.plan) * 100)
              const isLast  = ri === peerHouseholds.length - 1
              const rowBg   = hh.isYou ? 'var(--blue-bg)' : 'transparent'
              const bdColor = isLast ? 'transparent' : 'var(--border)'
              const spkClr  = hh.isYou ? 'var(--blue-light)' : '#B8B0A8'

              return (
                <tr key={hh.id} style={{ background: rowBg }}>
                  {/* Household label */}
                  <td style={{ padding: '11px 12px', borderBottom: `1px solid ${bdColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {hh.isYou && (
                        <div
                          style={{
                            width: 20, height: 20,
                            borderRadius: '50%',
                            background: 'var(--blue)',
                            color: 'white',
                            fontSize: 10, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          ✓
                        </div>
                      )}
                      <span
                        style={{
                          fontWeight: hh.isYou ? 600 : 400,
                          fontSize:   14,
                          color:      hh.isYou ? 'var(--blue)' : 'var(--text-1)',
                        }}
                      >
                        {hh.label}
                      </span>
                      {hh.isYou && (
                        <span
                          style={{
                            fontSize:   11,
                            color:      'var(--blue)',
                            background: 'var(--blue-border)',
                            padding:    '1px 8px',
                            borderRadius: 999,
                            fontWeight: 500,
                          }}
                        >
                          you
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Plan */}
                  <td
                    style={{
                      padding: '11px 12px', textAlign: 'center',
                      borderBottom: `1px solid ${bdColor}`,
                      fontSize: 14, color: 'var(--text-2)',
                    }}
                  >
                    {hh.plan} gal
                  </td>

                  {/* Sparkline */}
                  <td
                    style={{
                      padding: '6px 12px', textAlign: 'center',
                      borderBottom: `1px solid ${bdColor}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Sparkline values={hh.values} color={spkClr} />
                    </div>
                  </td>

                  {/* Avg */}
                  <td
                    style={{
                      padding: '11px 12px', textAlign: 'center',
                      borderBottom: `1px solid ${bdColor}`,
                      fontSize: 14,
                      fontWeight: hh.isYou ? 600 : 400,
                      color: hh.isYou ? 'var(--blue)' : 'var(--text-1)',
                    }}
                  >
                    {avg.toFixed(1)} gal
                  </td>

                  {/* Utilisation */}
                  <td
                    style={{
                      padding: '11px 12px',
                      borderBottom: `1px solid ${bdColor}`,
                    }}
                  >
                    <UtilBar pct={util} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Insight callout */}
      <div
        style={{
          marginTop: 16,
          padding:   '12px 16px',
          background: 'var(--amber-bg)',
          border:     '1px solid var(--amber-border)',
          borderRadius: 12,
          fontSize: 13,
          color: 'var(--amber)',
          fontWeight: 500,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <span style={{ flexShrink: 0 }}>💡</span>
        <span>
          You're consuming less than {higherCount} of {peerHouseholds.length - 1} similar households.
          Your {youUtil}% utilisation suggests there's comfortable headroom to step down your plan.
        </span>
      </div>
    </section>
  )
}

import { customer, monthlyUsage } from '../data/sampleData'

// Pre-compute stats from the full 12-month history
const avg12        = monthlyUsage.reduce((s, m) => s + m.consumed, 0) / monthlyUsage.length
const recent3      = monthlyUsage.slice(-3).reduce((s, m) => s + m.consumed, 0) / 3
const surplus      = customer.currentPlan - avg12
const totalWasteGal = monthlyUsage.reduce((s, m) => s + (m.delivered - m.consumed), 0)
const unusedAnnual = Math.round(totalWasteGal * customer.pricePerGallon)
const bill         = customer.currentPlan * customer.pricePerGallon
const annualBill   = bill * 12
const trendDown    = recent3 < avg12 - 0.1   // meaningful downward trend

const stats = [
  {
    label: 'Avg. consumed',
    value: `${avg12.toFixed(1)} gal`,
    sub: 'per month (12-mo avg)',
    highlight: false,
  },
  {
    label: 'Wasted this year',
    value: `$${unusedAnnual}`,
    sub: `${totalWasteGal.toFixed(0)} unused gal over 12 mo`,
    highlight: true,
  },
  {
    label: 'Annual bill',
    value: `$${annualBill.toLocaleString()}`,
    sub: `$${bill}/month`,
    highlight: false,
  },
]

export default function HeroHeader() {
  return (
    <header
      className="section"
      style={{ marginBottom: 28 }}
    >
      {/* Brand bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 24 }}>💧</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
          }}
        >
          ClearFlow Water
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 12,
            color: 'var(--text-3)',
          }}
        >
          Member since {customer.memberSince}
        </span>
      </div>

      {/* Main card */}
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          padding: 'clamp(24px, 3vw, 36px)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 32,
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: plan text */}
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-3)',
                marginBottom: 8,
              }}
            >
              Your active plan
            </p>
            <h1
              style={{
                fontSize: 'clamp(24px, 3.5vw, 34px)',
                fontWeight: 400,
                color: 'var(--text-1)',
                marginBottom: 8,
              }}
            >
              {customer.currentPlan}-gallon{' '}
              <span style={{ color: 'var(--text-2)', fontStyle: 'italic' }}>monthly</span> plan
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
              ${bill}/month · ${customer.pricePerGallon}/gal · ${annualBill.toLocaleString()}/year delivered
            </p>
          </div>

          {/* Right: stat chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  background: s.highlight ? 'var(--amber-bg)' : 'var(--bg)',
                  border: `1px solid ${s.highlight ? 'var(--amber-border)' : 'var(--border)'}`,
                  borderRadius: 14,
                  padding: '14px 18px',
                  minWidth: 108,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: s.highlight ? 'var(--amber)' : 'var(--text-3)',
                    marginBottom: 4,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: 22,
                    fontWeight: 500,
                    color: s.highlight ? 'var(--amber)' : 'var(--text-1)',
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subtle progress bar showing plan fill */}
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              fontSize:       11,
              color:          'var(--text-3)',
              marginBottom:   6,
              alignItems:     'center',
            }}
          >
            <span>Plan utilisation (12-mo avg)</span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{
                fontSize:   11,
                fontWeight: 500,
                color:      trendDown ? 'var(--green)' : 'var(--amber)',
              }}>
                {trendDown ? '↓' : '↑'} {Math.abs(avg12 - recent3).toFixed(1)} gal/mo trend
              </span>
              <span style={{ fontWeight: 600, color: 'var(--amber)' }}>
                {Math.round((avg12 / customer.currentPlan) * 100)}%
              </span>
            </div>
          </div>
          <div
            style={{
              height: 6,
              background: 'var(--border)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.round((avg12 / customer.currentPlan) * 100)}%`,
                background: 'linear-gradient(90deg, var(--amber-mid), var(--amber))',
                borderRadius: 999,
                transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

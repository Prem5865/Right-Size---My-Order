import { useState, useEffect } from 'react'
import { complete, parseJsonObject } from '../lib/claude'
import { customer, monthlyUsage } from '../data/sampleData'

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_PLAN = 8
const MAX_PLAN = 20

// ─── Derived stats (computed once at module level) ────────────────────────────
const _all          = monthlyUsage
const _avg12        = _all.reduce((s, m) => s + m.consumed, 0) / _all.length
const _recent3      = _all.slice(-3).reduce((s, m) => s + m.consumed, 0) / 3
const _peakLast6    = Math.max(..._all.slice(-6).map(m => m.consumed))
// Weighted blend: 60% recent trend + 40% full-year avg, then +15% safety buffer
const _blended      = 0.6 * _recent3 + 0.4 * _avg12
export const RECOMMENDED = Math.min(MAX_PLAN, Math.max(MIN_PLAN,
  Math.round(Math.max(_blended * 1.15, _peakLast6 + 0.5))))
// Total dollars paid for unused water over the past 12 months
const TOTAL_WASTE_12 = Math.round(
  _all.reduce((s, m) => s + (m.delivered - m.consumed), 0) * customer.pricePerGallon)
const MONTHLY_SAVING = (customer.currentPlan - RECOMMENDED) * customer.pricePerGallon
const ANNUAL_SAVING  = MONTHLY_SAVING * 12

const FALLBACK = {
  headline: `A ${RECOMMENDED}-gallon plan matches your actual usage`,
  body: `Over 12 months you've used ~${_avg12.toFixed(1)} gal while receiving 15 — paying ~$${TOTAL_WASTE_12} for water that went unused. Switching to ${RECOMMENDED} gal saves $${MONTHLY_SAVING}/month ($${ANNUAL_SAVING}/year).`,
  isFallback: true,
}

// ─── Prompt builder ───────────────────────────────────────────────────────────
function buildPrompt() {
  const ppg     = customer.pricePerGallon
  const current = customer.currentPlan
  const surplus = current - _avg12

  return `You are writing a recommendation card for a bottled-water subscription service.

Customer facts (use only these numbers — do not invent any figures):
- Current plan: ${current} gal/month ($${current * ppg}/mo at $${ppg}/gal)
- 12-month average consumption: ${_avg12.toFixed(1)} gal/month
- Recent 3-month average: ${_recent3.toFixed(1)} gal/month
- Monthly unused surplus: ~${surplus.toFixed(1)} gal (~$${Math.round(surplus * ppg)}/mo)
- Total paid for unused water over 12 months: ~$${TOTAL_WASTE_12}
- Data-driven recommended plan: ${RECOMMENDED} gal/month
- Monthly saving at recommended plan: $${MONTHLY_SAVING}/mo ($${ANNUAL_SAVING}/yr)

Write a warm, confident, non-pushy recommendation to adjust the plan down to ${RECOMMENDED} gallons.
Rules:
- No exclamation marks
- Tone: a thoughtful friend who happens to know the numbers, not a sales bot
- headline: ≤ 8 words, present tense, conversational, no punctuation at the end
- body: ≤ 55 words, warm and helpful, references at least one real figure from above

Return ONLY the following JSON (no markdown fences, no prose outside the object):
{"headline":"...","body":"..."}`
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti({ show }) {
  if (!show) return null

  const COLORS = [
    '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#EF4444', '#FBBF24', '#34D399',
  ]
  const pieces = Array.from({ length: 44 }, (_, i) => ({
    key:   i,
    color: COLORS[i % COLORS.length],
    left:  `${2 + (i / 43) * 96}%`,
    delay: `${(i * 0.035).toFixed(2)}s`,
    size:  `${6 + (i % 6) * 1.5}px`,
    round: i % 3 === 0,
  }))

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        overflow: 'hidden', pointerEvents: 'none', zIndex: 10,
      }}
    >
      {pieces.map((p) => (
        <div
          key={p.key}
          style={{
            position:     'absolute',
            top:          0,
            left:         p.left,
            width:        p.size,
            height:       p.size,
            background:   p.color,
            borderRadius: p.round ? '50%' : '2px',
            animation:    `confettiFall 1.6s ease-out ${p.delay} both`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <div className="skeleton" style={{ height: 24, width: 140 }} />
      </div>
      <div className="skeleton" style={{ height: 28, width: '65%', marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 15, width: '92%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 15, width: '80%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 15, width: '55%', marginBottom: 28 }} />
      <div className="skeleton" style={{ height: 120, width: '100%', borderRadius: 12 }} />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SmartRecommendation() {
  const [content,      setContent]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [isAI,         setIsAI]         = useState(false)
  const [plan,         setPlan]         = useState(RECOMMENDED)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confirmed,    setConfirmed]    = useState(false)
  const [showToast,    setShowToast]    = useState(false)

  // Derived savings
  const savings       = (customer.currentPlan - plan) * customer.pricePerGallon
  const annualSavings = savings * 12
  const newCost       = plan * customer.pricePerGallon
  const annualNewCost = newCost * 12
  const sliderClr     = plan < customer.currentPlan ? 'var(--green-mid)'
                      : plan > customer.currentPlan ? '#DC2626'
                      : 'var(--amber-mid)'
  const fillPct       = ((plan - MIN_PLAN) / (MAX_PLAN - MIN_PLAN)) * 100
  const recPct        = ((RECOMMENDED - MIN_PLAN) / (MAX_PLAN - MIN_PLAN)) * 100

  // ── Fetch AI recommendation on mount ──
  useEffect(() => {
    let alive = true
    setLoading(true)

    complete([{ role: 'user', content: buildPrompt() }])
      .then((text) => {
        if (!alive) return
        const parsed = parseJsonObject(text)
        if (parsed?.headline && parsed?.body) {
          setContent(parsed)
          setIsAI(true)
        } else {
          setContent(FALLBACK)
          setIsAI(false)
        }
      })
      .catch(() => {
        if (alive) {
          setContent(FALLBACK)
          setIsAI(false)
        }
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => { alive = false }
  }, [])

  // ── Actions ──
  const handleAdjust = () => {
    setShowConfetti(true)
    setConfirmed(true)
    setTimeout(() => setShowConfetti(false), 2400)
  }

  const handleRemind = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3600)
  }

  const handleKeep = () => {
    // Intentionally a no-op — the customer chose to keep their current plan.
    // In production this would log the decision.
  }

  // ── Colour of card surface changes on confirmation ──
  const cardBg     = confirmed ? 'var(--green-bg)'     : 'var(--amber-bg)'
  const cardBorder = confirmed ? 'var(--green-border)'  : 'var(--amber-border)'

  return (
    <section
      className="section"
      style={{
        position:     'relative',
        background:   cardBg,
        border:       `1px solid ${cardBorder}`,
        borderRadius: 20,
        padding:      'clamp(20px, 3vw, 32px)',
        marginBottom: 24,
        overflow:     'hidden',
        transition:   'background 0.5s ease, border-color 0.5s ease',
      }}
    >
      <Confetti show={showConfetti} />

      {/* ── Toast ── */}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position:    'fixed',
            bottom:      28,
            left:        '50%',
            background:  '#1C1917',
            color:       'white',
            padding:     '13px 26px',
            borderRadius: 999,
            fontSize:    14,
            fontWeight:  500,
            zIndex:      1000,
            whiteSpace:  'nowrap',
            boxShadow:   '0 4px 18px rgba(0,0,0,0.22)',
            animation:   'toastIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
            // The CSS animation handles the translateX(-50%) too
            transform:   'translateX(-50%)',
          }}
        >
          🔔&nbsp; We'll remind you in one month
        </div>
      )}

      {/* ── Loading state ── */}
      {loading && <Skeleton />}

      {/* ── Confirmed / success state ── */}
      {!loading && confirmed && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
          <h2
            style={{
              fontFamily:  'Fraunces, serif',
              fontSize:    24,
              fontWeight:  400,
              color:       'var(--green)',
              marginBottom: 10,
            }}
          >
            Plan adjusted to {plan} gal/month
          </h2>
          <p style={{ fontSize: 14, color: 'var(--green)', maxWidth: 380, margin: '0 auto' }}>
            Your next delivery will reflect the change.{' '}
            You'll save <strong>{`$${Math.abs(savings)}/month`}</strong> — that's{' '}
            <strong>{`$${Math.abs(annualSavings)}/year`}</strong> back in your pocket.{' '}
            Your new annual bill drops to <strong>{`$${annualNewCost.toLocaleString()}/year`}</strong>.
          </p>
          <button
            onClick={() => setConfirmed(false)}
            style={{
              marginTop:   20,
              background:  'transparent',
              border:      '1px solid var(--green-border)',
              borderRadius: 999,
              padding:     '8px 20px',
              fontSize:    13,
              color:       'var(--green)',
              fontWeight:  500,
            }}
          >
            Review again
          </button>
        </div>
      )}

      {/* ── Main recommendation content ── */}
      {!loading && !confirmed && (
        <>
          {/* Badge */}
          <div style={{ marginBottom: 14 }}>
            {isAI ? (
              <span
                style={{
                  display:      'inline-flex',
                  alignItems:   'center',
                  gap:          6,
                  background:   'white',
                  border:       '1px solid var(--amber-border)',
                  borderRadius: 999,
                  padding:      '4px 13px',
                  fontSize:     12,
                  fontWeight:   600,
                  color:        'var(--amber)',
                  letterSpacing: '0.04em',
                }}
              >
                <span aria-hidden="true">✦</span> AI Recommendation
              </span>
            ) : (
              <span
                style={{
                  display:      'inline-flex',
                  alignItems:   'center',
                  gap:          6,
                  background:   'white',
                  border:       '1px solid var(--border)',
                  borderRadius: 999,
                  padding:      '4px 13px',
                  fontSize:     12,
                  fontWeight:   500,
                  color:        'var(--text-2)',
                }}
              >
                Smart Recommendation
              </span>
            )}
          </div>

          {/* Headline */}
          <h2
            style={{
              fontFamily:  'Fraunces, serif',
              fontSize:    'clamp(18px, 2.8vw, 24px)',
              fontWeight:  400,
              color:       'var(--amber)',
              marginBottom: 10,
              lineHeight:  1.25,
            }}
          >
            {content?.headline}
          </h2>

          {/* Body */}
          <p
            style={{
              fontSize:    15,
              color:       'var(--text-1)',
              lineHeight:  1.7,
              marginBottom: 24,
              maxWidth:    560,
            }}
          >
            {content?.body}
          </p>

          {/* ── Plan slider card ── */}
          <div
            style={{
              background:   'white',
              borderRadius: 16,
              padding:      '22px 24px',
              marginBottom: 20,
              border:       '1px solid rgba(0,0,0,0.06)',
              boxShadow:    '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {/* Label + live readout */}
            <div
              style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'baseline',
                marginBottom:   14,
              }}
            >
              <label
                htmlFor="plan-slider"
                style={{
                  fontSize:   14,
                  fontWeight: 600,
                  color:      'var(--text-1)',
                }}
              >
                Adjust plan size
              </label>
              <span
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize:   24,
                  color:      sliderClr,
                  transition: 'color 0.2s',
                }}
              >
                {plan}
                <span style={{ fontSize: 14, color: 'var(--text-2)', fontFamily: 'Inter, sans-serif' }}>
                  {' '}gal/mo
                </span>
              </span>
            </div>

            {/* Range input with filled track */}
            <input
              id="plan-slider"
              type="range"
              min={MIN_PLAN}
              max={MAX_PLAN}
              step={1}
              value={plan}
              onChange={(e) => setPlan(Number(e.target.value))}
              style={{
                color:      sliderClr,
                background: `linear-gradient(to right, ${sliderClr} ${fillPct}%, var(--border) ${fillPct}%)`,
              }}
            />

            {/* Recommended marker + axis labels */}
            <div style={{ position: 'relative', marginTop: 4 }}>
              {/* Recommended tick at RECOMMENDED gal */}
              <div style={{
                position:      'absolute',
                left:          `${recPct}%`,
                transform:     'translateX(-50%)',
                display:       'flex',
                flexDirection: 'column',
                alignItems:    'center',
                pointerEvents: 'none',
                top:           0,
              }}>
                <div style={{ width: 1, height: 8, background: 'var(--green-mid)' }} />
                <span style={{
                  fontSize:      9,
                  fontWeight:    700,
                  color:         'var(--green)',
                  background:    'var(--green-bg)',
                  border:        '1px solid var(--green-border)',
                  borderRadius:  4,
                  padding:       '1px 5px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  whiteSpace:    'nowrap',
                  marginTop:     2,
                }}>
                  ✓ {RECOMMENDED} gal
                </span>
              </div>

              {/* Axis labels */}
              <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                fontSize:       11,
                color:          'var(--text-3)',
                paddingTop:     28,
                userSelect:     'none',
              }}>
                <span>{MIN_PLAN} gal</span>
                <span style={{ color: 'var(--amber-mid)', fontWeight: 600 }}>
                  current: {customer.currentPlan} gal
                </span>
                <span>{MAX_PLAN} gal</span>
              </div>
            </div>

            {/* Savings + new-cost tiles */}
            <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
              {/* Savings tile */}
              <div
                style={{
                  flex:         '1 1 120px',
                  padding:      '14px 16px',
                  borderRadius: 12,
                  background:
                    savings > 0 ? 'var(--green-bg)' :
                    savings < 0 ? '#FFF1F2' :
                                  'var(--bg)',
                  border: `1px solid ${
                    savings > 0 ? 'var(--green-border)' :
                    savings < 0 ? '#FECDD3' :
                                  'var(--border)'
                  }`,
                  transition: 'background 0.25s, border-color 0.25s',
                }}
              >
                <div
                  style={{
                    fontSize:      10,
                    fontWeight:    600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color:
                      savings > 0 ? 'var(--green)' :
                      savings < 0 ? '#BE123C' :
                                    'var(--text-3)',
                    marginBottom: 4,
                  }}
                >
                  {savings > 0 ? 'Monthly savings' : savings < 0 ? 'Monthly increase' : 'No change'}
                </div>
                <div
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize:   26,
                    lineHeight: 1,
                    color:
                      savings > 0 ? 'var(--green)' :
                      savings < 0 ? '#BE123C' :
                                    'var(--text-3)',
                    transition: 'color 0.25s',
                  }}
                >
                  {savings > 0 ? `+$${savings}` : savings < 0 ? `-$${Math.abs(savings)}` : '$0'}
                </div>
                {savings !== 0 && (
                  <div style={{
                    fontSize:   11,
                    marginTop:  5,
                    fontWeight: 500,
                    color:      savings > 0 ? 'var(--green)' : '#BE123C',
                    opacity:    0.8,
                  }}>
                    {savings > 0
                      ? `$${annualSavings}/year saved`
                      : `$${Math.abs(annualSavings)}/year more`}
                  </div>
                )}
              </div>

              {/* New cost tile */}
              <div
                style={{
                  flex:         '1 1 120px',
                  padding:      '14px 16px',
                  borderRadius: 12,
                  background:   'var(--bg)',
                  border:       '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    fontSize:      10,
                    fontWeight:    600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color:         'var(--text-3)',
                    marginBottom:  4,
                  }}
                >
                  New monthly bill
                </div>
                <div
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize:   26,
                    lineHeight: 1,
                    color:      'var(--text-1)',
                    transition: 'color 0.2s',
                  }}
                >
                  ${newCost}
                  <span
                    style={{
                      fontSize:   13,
                      color:      'var(--text-3)',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {' '}/mo
                  </span>
                </div>
                <div style={{ fontSize: 11, marginTop: 5, color: 'var(--text-3)' }}>
                  {`$${annualNewCost.toLocaleString()}/year`}
                </div>
              </div>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {/* Primary CTA */}
            <button
              onClick={handleAdjust}
              style={{
                background:   plan <= customer.currentPlan ? 'var(--green-mid)' : 'var(--amber-mid)',
                color:        'white',
                border:       'none',
                borderRadius: 12,
                padding:      '12px 24px',
                fontSize:     14,
                fontWeight:   600,
                transition:   'opacity 0.15s, transform 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.86' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              onMouseDown={(e)  => { e.currentTarget.style.transform = 'scale(0.97)' }}
              onMouseUp={(e)    => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              Adjust to {plan} gal
            </button>

            {/* Remind */}
            <button
              onClick={handleRemind}
              style={{
                background:   'white',
                color:        'var(--text-1)',
                border:       '1px solid var(--border)',
                borderRadius: 12,
                padding:      '12px 22px',
                fontSize:     14,
                fontWeight:   500,
                transition:   'border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              Remind Me in a Month
            </button>

            {/* Keep current */}
            <button
              onClick={handleKeep}
              style={{
                background:       'transparent',
                color:            'var(--text-2)',
                border:           'none',
                padding:          '12px 16px',
                fontSize:         14,
                textDecoration:   'underline',
                textUnderlineOffset: '3px',
                textDecorationColor: 'var(--border-strong)',
              }}
            >
              Keep Current Plan
            </button>
          </div>
        </>
      )}
    </section>
  )
}

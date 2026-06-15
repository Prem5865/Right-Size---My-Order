const STEPS = [
  {
    num: 1,
    icon: '👁',
    title: 'Observe',
    body: 'We quietly track your monthly delivery versus actual consumption over time — no alerts, no interruptions.',
    done: true,
    active: false,
  },
  {
    num: 2,
    icon: '💡',
    title: 'Suggest',
    body: 'When a clear pattern emerges, we surface the data and offer a tailored recommendation. You see exactly why.',
    done: false,
    active: true,
  },
  {
    num: 3,
    icon: '🎯',
    title: 'You decide',
    body: 'Adjust, keep, or snooze — always your call. We never auto-change anything without your explicit consent.',
    done: false,
    active: false,
  },
]

export default function TrustTimeline() {
  return (
    <section className="section" style={{ padding: '4px 0 40px' }}>
      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 20,
            fontWeight: 400,
            color: 'var(--text-2)',
            marginBottom: 6,
          }}
        >
          How Right-Sizing works
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
          Transparent, unhurried — always in your control
        </p>
      </div>

      {/* Steps row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 0,
        }}
      >
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            style={{ display: 'flex', alignItems: 'flex-start' }}
          >
            {/* Card */}
            <div
              style={{
                position: 'relative',
                width: 'clamp(160px, 22vw, 220px)',
                textAlign: 'center',
                padding: '24px 18px 20px',
                background: step.active
                  ? 'var(--amber-bg)'
                  : step.done
                  ? '#FAFAF9'
                  : 'var(--card)',
                border: `1px solid ${step.active ? 'var(--amber-border)' : 'var(--border)'}`,
                borderRadius: 18,
              }}
            >
              {/* "You are here" badge */}
              {step.active && (
                <div
                  style={{
                    position: 'absolute',
                    top: -11,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--amber)',
                    color: 'white',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '3px 11px',
                    borderRadius: 999,
                    whiteSpace: 'nowrap',
                  }}
                >
                  You are here
                </div>
              )}

              {/* Step number bubble */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 10,
                  background: step.done
                    ? 'var(--green-mid)'
                    : step.active
                    ? 'var(--amber)'
                    : 'var(--border)',
                  color: step.done || step.active ? 'white' : 'var(--text-3)',
                }}
              >
                {step.done ? '✓' : step.num}
              </div>

              {/* Icon */}
              <div style={{ fontSize: 30, marginBottom: 10 }}>{step.icon}</div>

              {/* Title */}
              <div
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: 17,
                  fontWeight: 400,
                  color: step.active ? 'var(--amber)' : 'var(--text-1)',
                  marginBottom: 8,
                }}
              >
                {step.title}
              </div>

              {/* Body */}
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-2)',
                  lineHeight: 1.55,
                }}
              >
                {step.body}
              </p>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 100,
                  padding: '0 10px',
                  color: 'var(--border-strong)',
                  fontSize: 18,
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Privacy note */}
      <p
        style={{
          textAlign: 'center',
          marginTop: 28,
          fontSize: 12,
          color: 'var(--text-3)',
          maxWidth: 460,
          margin: '28px auto 0',
        }}
      >
        Your data is never shared. Peer comparisons are anonymised and aggregated across similar households.
      </p>
    </section>
  )
}

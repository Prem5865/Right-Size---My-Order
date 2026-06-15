import HeroHeader from './components/HeroHeader'
import UsageBarChart from './components/UsageBarChart'
import PeerComparison from './components/PeerComparison'
import SmartRecommendation from './components/SmartRecommendation'
import TrustTimeline from './components/TrustTimeline'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 36px)',
        }}
      >
        <HeroHeader />
        <UsageBarChart />
        <PeerComparison />
        <SmartRecommendation />
        <TrustTimeline />

        <footer
          style={{
            textAlign: 'center',
            padding: '28px 0 8px',
            fontSize: 12,
            color: 'var(--text-3)',
            borderTop: '1px solid var(--border)',
            marginTop: 8,
          }}
        >
          Right-Size MyOrder · ClearFlow Water · Usage data is illustrative
        </footer>
      </div>
    </div>
  )
}

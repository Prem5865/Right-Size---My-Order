# Right-Size MyOrder

An AI-powered subscription right-sizing feature for a bottled-water delivery service. Built with React 19 + Vite 8, hand-built SVG charts, and Claude for warm, data-grounded recommendations.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Anthropic API key

Create a `.env.local` file in the project root:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

> **Security note:** The key is injected by the Vite dev-server middleware at request time and **never** reaches the browser bundle. The `/api/anthropic/*` route is only available during `npm run dev`. In production, replace the proxy with a proper backend endpoint.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## What happens without an API key?

The Smart Recommendation card gracefully falls back to high-quality static copy — the rest of the UI is fully functional.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS 4 (configured) · inline styles · global CSS |
| Fonts | Fraunces (headings) · Inter (body) via Google Fonts |
| Charts | Hand-built SVG + RAF animations — no chart libraries |
| AI | Anthropic `claude-sonnet-4-6` via server-side proxy |

## Project structure

```
src/
  lib/claude.js          # complete() + parseJsonObject()
  data/sampleData.js     # 12-month usage data & peer households
  components/
    HeroHeader.jsx
    UsageBarChart.jsx    # Delivered vs consumed, 3/6/12-mo range, tooltips
    PeerComparison.jsx   # Sparklines + utilisation bars
    SmartRecommendation.jsx  # AI card, slider, confetti, toast
    TrustTimeline.jsx    # Observe → Suggest → You decide
  App.jsx
  main.jsx
  index.css
vite.config.js           # Anthropic proxy middleware + Tailwind plugin
```

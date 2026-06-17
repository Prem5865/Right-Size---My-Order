/** Customer profile */
export const customer = {
  name: 'Alex',
  currentPlan: 15,       // gallons / month
  pricePerGallon: 8,     // $ / gallon
  memberSince: 'Mar 2023',
}

/**
 * 25 months of delivery history (Jun 2024 → Jun 2026).
 *
 * Seasonal pattern (realistic):
 *  - Summer (Jun–Aug): consumption spikes +20–30% — heat, guests, outdoor use
 *  - Winter (Dec–Feb): consumption drops ~20–25% — less activity, holiday travel
 *  - Spring/Fall: near-baseline with slight variation
 *
 * Delivered quantities use 5-gal bottle multiples (10, 15, 20 gal).
 * Each month has unique noise to look real.
 * Jun 2026 is a partial month (data through Jun 17).
 */
export const monthlyUsage = [
  // ─── 2024 ─────────────────────────────────────────────────────────────────
  { month: 'Jun', year: 2024, label: "Jun '24", delivered: 15, consumed: 13.2 },
  { month: 'Jul', year: 2024, label: "Jul '24", delivered: 20, consumed: 14.7 }, // peak summer, stocked up
  { month: 'Aug', year: 2024, label: "Aug '24", delivered: 20, consumed: 13.9 }, // late summer guests
  { month: 'Sep', year: 2024, label: "Sep '24", delivered: 15, consumed: 12.1 }, // fall cooldown
  { month: 'Oct', year: 2024, label: "Oct '24", delivered: 15, consumed: 11.4 },
  { month: 'Nov', year: 2024, label: "Nov '24", delivered: 15, consumed: 10.8 }, // pre-holiday dip
  { month: 'Dec', year: 2024, label: "Dec '24", delivered: 10, consumed:  9.3 }, // holiday travel, skipped one
  // ─── 2025 ─────────────────────────────────────────────────────────────────
  { month: 'Jan', year: 2025, label: "Jan '25", delivered: 10, consumed:  8.9 }, // winter low
  { month: 'Feb', year: 2025, label: "Feb '25", delivered: 10, consumed:  8.4 }, // coldest, short month
  { month: 'Mar', year: 2025, label: "Mar '25", delivered: 15, consumed: 10.6 }, // spring rebound
  { month: 'Apr', year: 2025, label: "Apr '25", delivered: 15, consumed: 11.3 },
  { month: 'May', year: 2025, label: "May '25", delivered: 15, consumed: 11.9 }, // warming up
  { month: 'Jun', year: 2025, label: "Jun '25", delivered: 20, consumed: 13.5 }, // summer starts, extra order
  { month: 'Jul', year: 2025, label: "Jul '25", delivered: 20, consumed: 14.2 }, // hottest month
  { month: 'Aug', year: 2025, label: "Aug '25", delivered: 15, consumed: 12.8 }, // late summer wind-down
  { month: 'Sep', year: 2025, label: "Sep '25", delivered: 15, consumed: 11.6 }, // fall transition
  { month: 'Oct', year: 2025, label: "Oct '25", delivered: 15, consumed: 10.9 },
  { month: 'Nov', year: 2025, label: "Nov '25", delivered: 10, consumed:  9.7 }, // Thanksgiving skip
  { month: 'Dec', year: 2025, label: "Dec '25", delivered: 10, consumed:  8.8 }, // winter holidays
  // ─── 2026 ─────────────────────────────────────────────────────────────────
  { month: 'Jan', year: 2026, label: "Jan '26", delivered: 10, consumed:  8.5 }, // new year, cold
  { month: 'Feb', year: 2026, label: "Feb '26", delivered: 10, consumed:  8.2 }, // away for 2 weeks
  { month: 'Mar', year: 2026, label: "Mar '26", delivered: 15, consumed: 10.1 }, // spring
  { month: 'Apr', year: 2026, label: "Apr '26", delivered: 15, consumed: 11.0 },
  { month: 'May', year: 2026, label: "May '26", delivered: 15, consumed: 10.7 },
  { month: 'Jun', year: 2026, label: "Jun '26", delivered: 15, consumed: 12.3 }, // partial (through Jun 17)
]

/**
 * Anonymised peer households on similar plans in the same area.
 * All values are gallons consumed per month over the same 12-month window.
 * Each household has a distinct plan size, trend, and usage pattern.
 */
export const peerHouseholds = [
  {
    id: 'you',
    label: 'You',
    plan: 15,
    isYou: true,
    values: [13.5, 14.2, 12.8, 11.6, 10.9, 9.7, 8.8, 8.5, 8.2, 10.1, 11.0, 12.3],
  },
  {
    // Heavy user — consistently near-maxing their 15-gal plan
    id: 'h2841',
    label: 'H#2841',
    plan: 15,
    isYou: false,
    values: [14.1, 14.8, 13.7, 13.2, 12.9, 13.4, 12.6, 13.0, 12.5, 13.3, 14.0, 13.8],
  },
  {
    // Downsized to 10-gal, uses it efficiently
    id: 'h3019',
    label: 'H#3019',
    plan: 10,
    isYou: false,
    values: [9.6, 9.9, 9.1, 8.8, 8.5, 7.9, 7.4, 7.6, 8.0, 9.2, 9.5, 9.8],
  },
  {
    // 20-gal plan, growing family, trending upward
    id: 'h4423',
    label: 'H#4423',
    plan: 20,
    isYou: false,
    values: [16.2, 17.5, 16.8, 17.1, 17.4, 16.9, 15.8, 16.3, 16.7, 17.8, 18.2, 18.6],
  },
  {
    // 12-gal plan, stable, well-matched
    id: 'h5710',
    label: 'H#5710',
    plan: 12,
    isYou: false,
    values: [11.4, 11.8, 11.1, 10.9, 10.6, 10.2, 9.8, 10.1, 10.4, 11.0, 11.3, 11.6],
  },
  {
    // 8-gal plan, solo household, often under
    id: 'h6284',
    label: 'H#6284',
    plan: 8,
    isYou: false,
    values: [6.8, 7.3, 6.5, 5.9, 5.4, 6.1, 5.7, 5.3, 5.8, 6.4, 6.9, 7.1],
  },
]

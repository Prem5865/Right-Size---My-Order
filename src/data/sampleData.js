/** Customer profile */
export const customer = {
  name: 'Alex',
  currentPlan: 15,       // gallons / month
  pricePerGallon: 8,     // $ / gallon
  memberSince: 'Mar 2023',
}

/**
 * 12 months of delivery history (Jul 2025 → Jun 2026).
 * Consumption trends steadily downward on a fixed 15-gal plan,
 * signalling that the household has outgrown the plan size.
 */
export const monthlyUsage = [
  { month: 'Jul', delivered: 15, consumed: 12.8 },
  { month: 'Aug', delivered: 15, consumed: 12.1 },
  { month: 'Sep', delivered: 15, consumed: 11.9 },
  { month: 'Oct', delivered: 15, consumed: 11.6 },
  { month: 'Nov', delivered: 15, consumed: 11.3 },
  { month: 'Dec', delivered: 15, consumed: 11.0 },
  { month: 'Jan', delivered: 15, consumed: 10.8 },
  { month: 'Feb', delivered: 15, consumed: 10.6 },
  { month: 'Mar', delivered: 15, consumed: 10.5 },
  { month: 'Apr', delivered: 15, consumed: 10.3 },
  { month: 'May', delivered: 15, consumed: 10.1 },
  { month: 'Jun', delivered: 15, consumed: 11.0 },
]

/**
 * Anonymised peer households on similar plans in the same area.
 * All values are gallons consumed per month over the same 12-month window.
 */
export const peerHouseholds = [
  {
    id: 'you',
    label: 'You',
    plan: 15,
    isYou: true,
    values: [12.8, 12.1, 11.9, 11.6, 11.3, 11.0, 10.8, 10.6, 10.5, 10.3, 10.1, 11.0],
  },
  {
    id: 'h2841',
    label: 'H#2841',
    plan: 15,
    isYou: false,
    values: [14.2, 13.8, 14.1, 13.5, 13.7, 13.2, 12.9, 13.4, 12.8, 13.1, 12.7, 13.0],
  },
  {
    id: 'h3019',
    label: 'H#3019',
    plan: 10,
    isYou: false,
    values: [9.5, 9.2, 9.0, 8.8, 8.5, 8.3, 8.0, 7.8, 7.5, 7.3, 7.0, 7.5],
  },
  {
    id: 'h4423',
    label: 'H#4423',
    plan: 15,
    isYou: false,
    values: [13.0, 12.5, 12.3, 12.1, 11.8, 11.5, 11.2, 11.0, 10.8, 10.5, 10.2, 10.8],
  },
]

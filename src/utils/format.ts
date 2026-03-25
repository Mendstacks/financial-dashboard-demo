import type { Allocation } from '../types/portfolio'

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCompactCurrency(value: number, currency: string = 'USD'): string {
  const symbol = currency === 'SGD' ? 'S$' : currency === 'HKD' ? 'HK$' : '$'
  if (Math.abs(value) >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(2)}M`
  if (Math.abs(value) >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`
  return `${symbol}${value.toFixed(2)}`
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toFixed(0)
}

export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: '#131926',
  border: '1px solid #1e2a3a',
  borderRadius: '4px',
  color: '#e1e7ef',
  fontSize: '11px',
  padding: '6px 10px',
}

/**
 * Largest-remainder rounding — ensures stocks + bonds + cash = exactly 100%.
 */
export function roundAllocation(equityWeight: number, bondWeight: number, cashWeight: number): Allocation {
  const raw = [
    { key: 'stocks' as const, val: equityWeight * 100 },
    { key: 'bonds' as const, val: bondWeight * 100 },
    { key: 'cash' as const, val: cashWeight * 100 },
  ]
  const floored = raw.map((r) => ({
    ...r,
    floor: Math.floor(r.val),
    remainder: r.val - Math.floor(r.val),
  }))
  let sum = floored.reduce((s, r) => s + r.floor, 0)
  floored.sort((a, b) => b.remainder - a.remainder)
  for (const item of floored) {
    if (sum >= 100) break
    item.floor++
    sum++
  }
  return {
    stocks: floored.find((r) => r.key === 'stocks')!.floor,
    bonds: floored.find((r) => r.key === 'bonds')!.floor,
    cash: floored.find((r) => r.key === 'cash')!.floor,
  }
}

import type { Allocation, Holding } from '../types/portfolio'

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
  backgroundColor: 'rgba(0, 0, 0, 0.95)',
  border: '1px solid #3a3f4b',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '11px',
  padding: '6px 10px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
}

/**
 * Single source of truth for portfolio-level aggregates from holdings.
 */
export function computePortfolioAggregates(holdings: Holding[]) {
  const totalValue = holdings.reduce((sum, h) => sum + h.position, 0)
  const todayGainLoss = holdings.filter((h) => h.assetClass !== 'Cash').reduce((sum, h) => sum + h.pnl, 0)
  const todayGainLossPercent = totalValue > 0 ? (todayGainLoss / (totalValue - todayGainLoss)) * 100 : 0

  const equityWeight = holdings.filter((h) => h.assetClass === 'Equity').reduce((s, h) => s + h.weight, 0)
  const bondWeight = holdings.filter((h) => h.assetClass === 'Fixed Income').reduce((s, h) => s + h.weight, 0)
  const cashWeight = holdings.filter((h) => h.assetClass === 'Cash').reduce((s, h) => s + h.weight, 0)

  return {
    totalValue: Math.round(totalValue * 100) / 100,
    todayGainLoss: Math.round(todayGainLoss * 100) / 100,
    todayGainLossPercent: Math.round(todayGainLossPercent * 10000) / 10000,
    allocation: roundAllocation(equityWeight, bondWeight, cashWeight),
  }
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

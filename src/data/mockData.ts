import type { Portfolio, PerformancePoint } from '../types/portfolio'

function generatePerformanceData(baseValue: number, days: number): PerformancePoint[] {
  const data: PerformancePoint[] = []
  let value = baseValue * 0.92
  const today = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const change = (Math.random() - 0.45) * baseValue * 0.008
    value = Math.max(value + change, baseValue * 0.85)
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
    })
  }

  return data
}

export const mockPortfolios: Portfolio[] = [
  {
    id: 'portfolio-1',
    name: 'Global Equity Fund',
    summary: {
      totalValue: 12575000.0,
      todayGainLoss: 18750.5,
      todayGainLossPercent: 0.15,
      performanceData: generatePerformanceData(12575000, 30),
    },
    allocation: {
      stocks: 70,
      bonds: 20,
      cash: 10,
    },
    news: [
      {
        id: 'n1',
        headline: 'Fed holds interest rates steady, signals two cuts later this year',
        source: 'Financial Times',
        timestamp: '2026-03-14T09:30:00Z',
      },
      {
        id: 'n2',
        headline: 'Tech sector surges on AI earnings optimism across major indices',
        source: 'WSJ',
        timestamp: '2026-03-14T09:15:00Z',
      },
      {
        id: 'n3',
        headline: 'European markets rally as ECB signals dovish stance on rates',
        source: 'Reuters',
        timestamp: '2026-03-14T08:45:00Z',
      },
      {
        id: 'n4',
        headline: 'Oil prices climb 2.3% amid Middle East supply concerns',
        source: 'Bloomberg',
        timestamp: '2026-03-14T08:20:00Z',
      },
      {
        id: 'n5',
        headline: 'US Treasury yields fall to 3-month low on dovish Fed outlook',
        source: 'CNBC',
        timestamp: '2026-03-14T07:50:00Z',
      },
    ],
  },
  {
    id: 'portfolio-2',
    name: 'Fixed Income Plus',
    summary: {
      totalValue: 5432000.0,
      todayGainLoss: -3200.25,
      todayGainLossPercent: -0.06,
      performanceData: generatePerformanceData(5432000, 30),
    },
    allocation: {
      stocks: 15,
      bonds: 65,
      cash: 20,
    },
    news: [
      {
        id: 'n6',
        headline: 'Corporate bond spreads tighten as default rates hit 5-year low',
        source: 'Financial Times',
        timestamp: '2026-03-14T09:25:00Z',
      },
      {
        id: 'n7',
        headline: 'High-yield bond funds see $2.1B inflows this week',
        source: 'Barrons',
        timestamp: '2026-03-14T09:00:00Z',
      },
      {
        id: 'n8',
        headline: 'Municipal bonds outperform as tax season drives demand',
        source: 'WSJ',
        timestamp: '2026-03-14T08:30:00Z',
      },
      {
        id: 'n9',
        headline: 'Emerging market debt rallies on weaker dollar outlook',
        source: 'Reuters',
        timestamp: '2026-03-14T08:10:00Z',
      },
    ],
  },
]

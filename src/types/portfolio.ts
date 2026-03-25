export interface Portfolio {
  id: string
  portfolioId: number
  name: string
  description: string
  currency: string
  cash: number
  summary: PortfolioSummary
  holdings: Holding[]
  allocation: Allocation
  news: NewsItem[]
}

export interface Holding {
  recordId: number
  productId: number
  productName: string
  currency: string
  assetClass: 'Equity' | 'Fixed Income' | 'Cash'
  region: string
  sector: string
  productType: 'Stock' | 'Bond' | 'Cash'
  exchangeName: string | null
  contract: number
  position: number
  weight: number
  averagePrice: number
  lastPrice: number
  pnl: number
  pnlPercent: number
  lastCob: string
}

export interface PortfolioSummary {
  totalValue: number
  todayGainLoss: number
  todayGainLossPercent: number
  performanceData: PerformancePoint[]
}

export interface PerformancePoint {
  date: string
  value: number
  normalizedNav: number
  dtdChange: number
  mtdChange: number
  qtdChange: number
  ytdChange: number
}

export interface Allocation {
  stocks: number
  bonds: number
  cash: number
}

export interface NewsItem {
  id: string
  headline: string
  source: string
  timestamp: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

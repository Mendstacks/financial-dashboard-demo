export interface Portfolio {
  id: string
  name: string
  summary: PortfolioSummary
  allocation: Allocation
  news: NewsItem[]
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
}

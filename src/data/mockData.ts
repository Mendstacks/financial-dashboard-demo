import type { Portfolio, Holding, NewsItem, PerformancePoint } from '../types/portfolio'
import { portfolios, portfolioHoldings, portfolioNews, portfolioPerformance } from './clientMockData'
import { roundAllocation } from '../utils/format'

function transformToPortfolios(): Portfolio[] {
  return portfolios.map((raw) => {
    const holdings: Holding[] = portfolioHoldings
      .filter((h) => h.portfolioId === raw.portfolioId)
      .map((h) => {
        const pnl = (h.lastPrice - h.averagePrice) * h.contract
        const pnlPercent = h.averagePrice !== 0 ? (h.lastPrice - h.averagePrice) / h.averagePrice : 0
        return {
          recordId: h.recordId,
          productId: h.productId,
          productName: h.productName,
          currency: h.currency,
          assetClass: h.assetClass as Holding['assetClass'],
          region: h.region,
          sector: h.sector,
          productType: h.productType as Holding['productType'],
          exchangeName: h.exchangeName ?? null,
          contract: h.contract,
          position: h.position,
          weight: h.weight,
          averagePrice: h.averagePrice,
          lastPrice: h.lastPrice,
          pnl: Math.round(pnl * 100) / 100,
          pnlPercent: Math.round(pnlPercent * 10000) / 10000,
          lastCob: h.lastCob,
        }
      })

    const totalValue = holdings.reduce((sum, h) => sum + h.position, 0)
    const todayGainLoss = holdings.filter((h) => h.assetClass !== 'Cash').reduce((sum, h) => sum + h.pnl, 0)
    const todayGainLossPercent = totalValue > 0 ? (todayGainLoss / (totalValue - todayGainLoss)) * 100 : 0

    // Derive allocation from holdings by assetClass
    const equityWeight = holdings.filter((h) => h.assetClass === 'Equity').reduce((s, h) => s + h.weight, 0)
    const bondWeight = holdings.filter((h) => h.assetClass === 'Fixed Income').reduce((s, h) => s + h.weight, 0)
    const cashWeight = holdings.filter((h) => h.assetClass === 'Cash').reduce((s, h) => s + h.weight, 0)

    const news: NewsItem[] = portfolioNews
      .filter((n) => n.portfolioId === raw.portfolioId)
      .map((n) => ({
        id: String(n.id),
        headline: n.headline,
        source: n.source,
        timestamp: n.timestamp,
        sentiment: n.sentiment as NewsItem['sentiment'],
      }))

    const performanceData: PerformancePoint[] = portfolioPerformance
      .filter((p) => p.portfolioId === raw.portfolioId)
      .map((p) => ({
        date: p.cobDate,
        value: p.nav,
        normalizedNav: p.normalizedNav,
        dtdChange: p.dtdChange,
        mtdChange: p.mtdChange,
        qtdChange: p.qtdChange,
        ytdChange: p.ytdChange,
      }))

    return {
      id: String(raw.portfolioId),
      portfolioId: raw.portfolioId,
      name: raw.portfolioName,
      description: raw.portfolioDesc,
      currency: raw.currency,
      cash: raw.cash,
      summary: {
        totalValue: Math.round(totalValue * 100) / 100,
        todayGainLoss: Math.round(todayGainLoss * 100) / 100,
        todayGainLossPercent: Math.round(todayGainLossPercent * 10000) / 10000,
        performanceData,
      },
      holdings,
      allocation: roundAllocation(equityWeight, bondWeight, cashWeight),
      news,
    }
  })
}

export const mockPortfolios: Portfolio[] = transformToPortfolios()

export const extraNewsPool: { headline: string; source: string; sentiment: NewsItem['sentiment'] }[] = [
  { headline: 'S&P 500 hits new all-time high on broad market rally', source: 'Bloomberg', sentiment: 'positive' },
  { headline: 'China GDP growth exceeds expectations at 5.2% for Q1', source: 'Reuters', sentiment: 'positive' },
  { headline: 'Goldman Sachs raises year-end target for global equities', source: 'CNBC', sentiment: 'positive' },
  { headline: 'Semiconductor stocks lead Nasdaq higher on AI chip demand', source: 'WSJ', sentiment: 'positive' },
  {
    headline: 'Bank of Japan maintains ultra-loose monetary policy stance',
    source: 'Financial Times',
    sentiment: 'neutral',
  },
  { headline: 'US jobless claims fall to lowest level since February', source: 'Bloomberg', sentiment: 'positive' },
  { headline: 'Copper prices surge 4% on renewed infrastructure spending', source: 'Reuters', sentiment: 'positive' },
  { headline: 'ESG fund inflows reach record $3.8B in single week', source: 'Barrons', sentiment: 'positive' },
  { headline: 'Dollar weakens against major currencies on rate cut bets', source: 'CNBC', sentiment: 'negative' },
  {
    headline: 'Private equity deals hit 6-month high across APAC region',
    source: 'Financial Times',
    sentiment: 'positive',
  },
  { headline: 'Natural gas futures drop 8% on warmer weather forecasts', source: 'Bloomberg', sentiment: 'negative' },
  { headline: 'India central bank holds rates, signals growth optimism', source: 'Reuters', sentiment: 'neutral' },
  { headline: 'Crypto markets stabilize as institutional inflows resume', source: 'WSJ', sentiment: 'neutral' },
  { headline: 'Australian dollar rallies on strong employment data', source: 'CNBC', sentiment: 'positive' },
  {
    headline: 'EU regulators approve new green bond framework standards',
    source: 'Financial Times',
    sentiment: 'neutral',
  },
]

import { useEffect, useRef } from 'react'
import { usePortfolioStore } from '../store/usePortfolioStore'
import { extraNewsPool } from '../data/mockData'

let newsCounter = 100

export function useMockRealtime(intervalMs: number = 7000) {
  const updatePortfolios = usePortfolioStore((s) => s.updatePortfolios)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)
  const newsIndexRef = useRef(0)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const portfolios = usePortfolioStore.getState().portfolios

      const updated = portfolios.map((portfolio) => {
        // Update individual holding prices
        const updatedHoldings = portfolio.holdings.map((h) => {
          if (h.assetClass === 'Cash') return h
          const priceChange = h.lastPrice * (Math.random() - 0.5) * 0.002
          const newPrice = Math.round((h.lastPrice + priceChange) * 100) / 100
          const newPosition = Math.round(h.contract * newPrice * 100) / 100
          const newPnl = Math.round((newPrice - h.averagePrice) * h.contract * 100) / 100
          const newPnlPercent = h.averagePrice !== 0
            ? Math.round(((newPrice - h.averagePrice) / h.averagePrice) * 10000) / 10000
            : 0
          return { ...h, lastPrice: newPrice, position: newPosition, pnl: newPnl, pnlPercent: newPnlPercent }
        })

        // Recompute portfolio-level values
        const totalValue = updatedHoldings.reduce((sum, h) => sum + h.position, 0)
        const todayGainLoss = updatedHoldings
          .filter((h) => h.assetClass !== 'Cash')
          .reduce((sum, h) => sum + h.pnl, 0)
        const todayGainLossPercent = totalValue > 0
          ? (todayGainLoss / (totalValue - todayGainLoss)) * 100
          : 0

        // Recompute weights
        const holdingsWithWeights = updatedHoldings.map((h) => ({
          ...h,
          weight: totalValue > 0 ? h.position / totalValue : 0,
        }))

        // Recompute allocation
        const equityWeight = holdingsWithWeights.filter((h) => h.assetClass === 'Equity').reduce((s, h) => s + h.weight, 0)
        const bondWeight = holdingsWithWeights.filter((h) => h.assetClass === 'Fixed Income').reduce((s, h) => s + h.weight, 0)
        const cashWeight = holdingsWithWeights.filter((h) => h.assetClass === 'Cash').reduce((s, h) => s + h.weight, 0)

        // Rotate news (30% chance)
        let news = [...portfolio.news]
        if (Math.random() < 0.3 && extraNewsPool.length > 0) {
          const poolItem = extraNewsPool[newsIndexRef.current % extraNewsPool.length]
          newsIndexRef.current++
          newsCounter++
          news = [
            {
              id: `live-${newsCounter}`,
              headline: poolItem.headline,
              source: poolItem.source,
              timestamp: new Date().toISOString(),
              sentiment: poolItem.sentiment,
            },
            ...news.slice(0, 4),
          ]
        }

        return {
          ...portfolio,
          holdings: holdingsWithWeights,
          summary: {
            ...portfolio.summary,
            totalValue: Math.round(totalValue * 100) / 100,
            todayGainLoss: Math.round(todayGainLoss * 100) / 100,
            todayGainLossPercent: Math.round(todayGainLossPercent * 10000) / 10000,
          },
          allocation: {
            stocks: Math.round(equityWeight * 100),
            bonds: Math.round(bondWeight * 100),
            cash: Math.round(cashWeight * 100),
          },
          news,
        }
      })

      updatePortfolios(updated)
    }, intervalMs)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [intervalMs, updatePortfolios])
}

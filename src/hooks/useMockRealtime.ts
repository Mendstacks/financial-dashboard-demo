import { useEffect, useRef } from 'react'
import { usePortfolioStore } from '../store/usePortfolioStore'
import { extraNewsPool } from '../data/mockData'
import { computePortfolioAggregates } from '../utils/format'

export function useMockRealtime(intervalMs: number = 7000) {
  const updatePortfolios = usePortfolioStore((s) => s.updatePortfolios)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)
  const newsIndexRef = useRef(0)
  const newsCounterRef = useRef(100)

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
          const newPnlPercent =
            h.averagePrice !== 0 ? Math.round(((newPrice - h.averagePrice) / h.averagePrice) * 10000) / 10000 : 0
          return { ...h, lastPrice: newPrice, position: newPosition, pnl: newPnl, pnlPercent: newPnlPercent }
        })

        // Recompute weights
        const totalValue = updatedHoldings.reduce((sum, h) => sum + h.position, 0)
        const holdingsWithWeights = updatedHoldings.map((h) => ({
          ...h,
          weight: totalValue > 0 ? h.position / totalValue : 0,
        }))

        // Recompute portfolio-level aggregates
        const aggregates = computePortfolioAggregates(holdingsWithWeights)

        // Rotate news (30% chance)
        let news = [...portfolio.news]
        if (Math.random() < 0.3 && extraNewsPool.length > 0) {
          const poolItem = extraNewsPool[newsIndexRef.current % extraNewsPool.length]
          newsIndexRef.current++
          newsCounterRef.current++
          news = [
            {
              id: `live-${newsCounterRef.current}`,
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
            totalValue: aggregates.totalValue,
            todayGainLoss: aggregates.todayGainLoss,
            todayGainLossPercent: aggregates.todayGainLossPercent,
          },
          allocation: aggregates.allocation,
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

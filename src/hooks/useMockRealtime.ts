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
        // Update portfolio values
        const changePercent = (Math.random() - 0.5) * 0.002
        const newValue = portfolio.summary.totalValue * (1 + changePercent)
        const newGainLoss = portfolio.summary.todayGainLoss + (newValue - portfolio.summary.totalValue)
        const newGainLossPercent = (newGainLoss / (newValue - newGainLoss)) * 100

        // Rotate news: 30% chance each tick to add a new headline
        let news = [...portfolio.news]
        if (Math.random() < 0.3 && extraNewsPool.length > 0) {
          const poolItem = extraNewsPool[newsIndexRef.current % extraNewsPool.length]
          newsIndexRef.current++
          newsCounter++

          const newItem = {
            id: `live-${newsCounter}`,
            headline: poolItem.headline,
            source: poolItem.source,
            timestamp: new Date().toISOString(),
          }

          news = [newItem, ...news.slice(0, 4)]
        }

        return {
          ...portfolio,
          summary: {
            ...portfolio.summary,
            totalValue: Math.round(newValue * 100) / 100,
            todayGainLoss: Math.round(newGainLoss * 100) / 100,
            todayGainLossPercent: Math.round(newGainLossPercent * 10000) / 10000,
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

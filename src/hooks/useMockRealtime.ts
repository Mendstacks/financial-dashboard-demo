import { useEffect, useRef } from 'react'
import { usePortfolioStore } from '../store/usePortfolioStore'

export function useMockRealtime(intervalMs: number = 7000) {
  const updatePortfolios = usePortfolioStore((s) => s.updatePortfolios)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const portfolios = usePortfolioStore.getState().portfolios

      const updated = portfolios.map((portfolio) => {
        const changePercent = (Math.random() - 0.5) * 0.002
        const newValue = portfolio.summary.totalValue * (1 + changePercent)
        const newGainLoss = portfolio.summary.todayGainLoss + (newValue - portfolio.summary.totalValue)
        const newGainLossPercent = (newGainLoss / (newValue - newGainLoss)) * 100

        return {
          ...portfolio,
          summary: {
            ...portfolio.summary,
            totalValue: Math.round(newValue * 100) / 100,
            todayGainLoss: Math.round(newGainLoss * 100) / 100,
            todayGainLossPercent: Math.round(newGainLossPercent * 10000) / 10000,
          },
        }
      })

      updatePortfolios(updated)
    }, intervalMs)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [intervalMs, updatePortfolios])
}

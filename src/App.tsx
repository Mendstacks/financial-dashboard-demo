import { PortfolioSelector } from './components/PortfolioSelector'
import { Dashboard } from './components/layout/Dashboard'
import { useMockRealtime } from './hooks/useMockRealtime'
import { usePortfolioStore } from './store/usePortfolioStore'

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

function App() {
  useMockRealtime()

  const portfolios = usePortfolioStore((s) => s.portfolios)
  const selectedId = usePortfolioStore((s) => s.selectedPortfolioId)
  const portfolio = portfolios.find((p) => p.id === selectedId)

  const isPositive = portfolio ? portfolio.summary.todayGainLoss >= 0 : true

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 border-b border-terminal-border bg-terminal-surface/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
            <h1 className="text-xs font-bold tracking-widest uppercase text-terminal-muted">
              HedgeSPA
            </h1>
          </div>
          <div className="w-px h-5 bg-terminal-border" />
          <PortfolioSelector />
          {portfolio && (
            <>
              <div className="w-px h-5 bg-terminal-border" />
              <div className="flex items-center gap-3 text-xs tabular-nums font-mono">
                <span className="text-terminal-muted">NAV</span>
                <span className="text-terminal-text font-medium">
                  {formatCompactCurrency(portfolio.summary.totalValue)}
                </span>
                <span
                  className={`font-medium ${isPositive ? 'text-terminal-green' : 'text-terminal-red'}`}
                >
                  {isPositive ? '▲' : '▼'}{' '}
                  {isPositive ? '+' : ''}
                  {portfolio.summary.todayGainLossPercent.toFixed(2)}%
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-terminal-muted tabular-nums font-mono">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <div className="w-2 h-2 rounded-full bg-terminal-green" title="Market Open" />
        </div>
      </header>

      <main className="flex-1 p-1.5">
        <Dashboard />
      </main>

      <footer className="flex items-center justify-between px-4 py-1 border-t border-terminal-border text-[10px] text-terminal-muted tabular-nums font-mono bg-terminal-surface/30">
        <span>Real-time simulation active</span>
        <span>Last update: {new Date().toLocaleTimeString()}</span>
      </footer>
    </div>
  )
}

export default App

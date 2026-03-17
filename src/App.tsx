import { PortfolioSelector } from './components/PortfolioSelector'
import { Dashboard } from './components/layout/Dashboard'
import { useMockRealtime } from './hooks/useMockRealtime'

function App() {
  useMockRealtime()

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-terminal-border">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold tracking-wide uppercase text-terminal-muted">
            Portfolio Dashboard
          </h1>
          <PortfolioSelector />
        </div>
        <div className="text-xs text-terminal-muted tabular-nums font-mono">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </header>

      <main className="flex-1 p-2">
        <Dashboard />
      </main>
    </div>
  )
}

export default App

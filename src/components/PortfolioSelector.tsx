import { usePortfolioStore } from '../store/usePortfolioStore'

export function PortfolioSelector() {
  const portfolios = usePortfolioStore((s) => s.portfolios)
  const selectedId = usePortfolioStore((s) => s.selectedPortfolioId)
  const selectPortfolio = usePortfolioStore((s) => s.selectPortfolio)

  return (
    <div className="flex gap-1">
      {portfolios.map((p) => (
        <button
          key={p.id}
          onClick={() => selectPortfolio(p.id)}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            selectedId === p.id
              ? 'bg-terminal-blue/20 text-terminal-blue border border-terminal-blue/40'
              : 'text-terminal-muted hover:text-terminal-text border border-transparent hover:border-terminal-border'
          }`}
        >
          {p.name}
        </button>
      ))}
    </div>
  )
}

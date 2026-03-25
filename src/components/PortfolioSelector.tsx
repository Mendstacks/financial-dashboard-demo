import { usePortfolioStore } from '../store/usePortfolioStore'

export function PortfolioSelector() {
  const portfolios = usePortfolioStore((s) => s.portfolios)
  const selectedId = usePortfolioStore((s) => s.selectedPortfolioId)
  const selectPortfolio = usePortfolioStore((s) => s.selectPortfolio)

  return (
    <select
      value={selectedId}
      onChange={(e) => selectPortfolio(e.target.value)}
      className="bg-terminal-surface text-terminal-text border border-terminal-border rounded px-3 py-1 text-xs font-medium cursor-pointer outline-none focus:border-terminal-blue"
    >
      {portfolios.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  )
}

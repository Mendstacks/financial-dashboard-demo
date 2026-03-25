import { memo } from 'react'
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import type { PortfolioSummary, Holding } from '../../types/portfolio'
import { formatCurrency, formatPercent, formatCompact, TOOLTIP_STYLE } from '../../utils/format'

interface SummaryWidgetProps {
  summary: PortfolioSummary
  holdings: Holding[]
  currency: string
}

export const SummaryWidget = memo(function SummaryWidget({ summary, holdings, currency }: SummaryWidgetProps) {
  const isPositive = summary.todayGainLoss >= 0
  const hasPerformance = summary.performanceData.length > 0

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-terminal-muted text-[10px] uppercase tracking-wider mb-0.5">Total Value</div>
          <div className="text-xl font-semibold tabular-nums font-mono">
            {formatCurrency(summary.totalValue, currency)}
          </div>
        </div>
        <div
          className={`text-xs font-bold px-2 py-0.5 rounded ${
            isPositive
              ? 'bg-terminal-green/10 text-terminal-green'
              : 'bg-terminal-red/10 text-terminal-red'
          }`}
        >
          {isPositive ? '▲' : '▼'} {formatPercent(summary.todayGainLossPercent)}
        </div>
      </div>

      <div className="flex gap-6">
        <div>
          <div className="text-terminal-muted text-[10px] uppercase tracking-wider">P&L</div>
          <div
            className={`text-sm font-medium tabular-nums font-mono ${
              isPositive ? 'text-terminal-green' : 'text-terminal-red'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(summary.todayGainLoss, currency)}
          </div>
        </div>
      </div>

      {hasPerformance ? (
        <div className="min-h-[80px] flex-shrink-0 -mx-1">
          <ResponsiveContainer width="100%" height={80} minWidth={0} minHeight={0}>
            <LineChart data={summary.performanceData}>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => [formatCurrency(Number(value), currency), 'NAV']}
                labelFormatter={(label) => `${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={isPositive ? '#00d26a' : '#ff3b3b'}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: isPositive ? '#00d26a' : '#ff3b3b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="min-h-[40px] flex items-center justify-center text-[10px] text-terminal-muted border border-dashed border-terminal-border rounded">
          No performance data available
        </div>
      )}

      {holdings.length > 0 && (
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full text-[10px] tabular-nums font-mono">
            <thead>
              <tr className="text-terminal-muted uppercase tracking-wider border-b border-terminal-border">
                <th className="text-left py-1 pr-2 font-medium">Asset</th>
                <th className="text-left py-1 pr-2 font-medium">Class</th>
                <th className="text-right py-1 pr-2 font-medium">Position</th>
                <th className="text-right py-1 pr-2 font-medium">Weight</th>
                <th className="text-right py-1 font-medium">P&L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.recordId} className="border-b border-terminal-border/30 hover:bg-terminal-border/10">
                  <td className="py-1 pr-2 text-terminal-text font-sans text-[10px]">{h.productName}</td>
                  <td className="py-1 pr-2 text-terminal-muted">{h.assetClass}</td>
                  <td className="py-1 pr-2 text-right text-terminal-text">{formatCompact(h.position)}</td>
                  <td className="py-1 pr-2 text-right text-terminal-text">{(h.weight * 100).toFixed(0)}%</td>
                  <td className={`py-1 text-right ${h.pnl >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                    {h.assetClass === 'Cash' ? '-' : formatCompact(h.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
})

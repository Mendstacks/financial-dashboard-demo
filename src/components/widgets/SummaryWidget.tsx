import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import type { PortfolioSummary } from '../../types/portfolio'

interface SummaryWidgetProps {
  summary: PortfolioSummary
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(4)}%`
}

export function SummaryWidget({ summary }: SummaryWidgetProps) {
  const isPositive = summary.todayGainLoss >= 0

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-terminal-muted text-[10px] uppercase tracking-wider mb-0.5">Total Value</div>
          <div className="text-xl font-semibold tabular-nums font-mono">
            {formatCurrency(summary.totalValue)}
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
            {formatCurrency(summary.todayGainLoss)}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[120px] -mx-1">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={summary.performanceData}>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Tooltip
              contentStyle={{
                backgroundColor: '#131926',
                border: '1px solid #1e2a3a',
                borderRadius: '4px',
                color: '#e1e7ef',
                fontSize: '11px',
                padding: '6px 10px',
              }}
              formatter={(value) => [formatCurrency(Number(value)), 'Value']}
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
    </div>
  )
}

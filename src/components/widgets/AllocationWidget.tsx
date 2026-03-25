import { memo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { Allocation } from '../../types/portfolio'
import { TOOLTIP_STYLE } from '../../utils/format'

interface AllocationWidgetProps {
  allocation: Allocation
}

const SEGMENTS = [
  { key: 'stocks' as const, label: 'Stocks', color: '#0068ff' },
  { key: 'bonds' as const, label: 'Bonds', color: '#f39f41' },
  { key: 'cash' as const, label: 'Cash', color: '#4af6c3' },
]

export const AllocationWidget = memo(function AllocationWidget({ allocation }: AllocationWidgetProps) {
  const data = SEGMENTS.map((s) => ({
    name: s.label,
    value: allocation[s.key],
    color: s.color,
  })).filter((d) => d.value > 0)

  return (
    <div className="h-full flex flex-col min-h-[180px]">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="45%"
              outerRadius="75%"
              dataKey="value"
              stroke="#000000"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={{ color: '#ffffff' }}
              formatter={(value, name) => [`${value}%`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 pt-1">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-terminal-muted">{item.name}</span>
            <span className="text-[10px] font-medium tabular-nums font-mono text-terminal-text">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
})

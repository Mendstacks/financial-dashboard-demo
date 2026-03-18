import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { Allocation } from '../../types/portfolio'

interface AllocationWidgetProps {
  allocation: Allocation
}

const COLORS: Record<string, string> = {
  Stocks: '#3b82f6',
  Bonds: '#f59e0b',
  Cash: '#00d26a',
}

export function AllocationWidget({ allocation }: AllocationWidgetProps) {
  const data = [
    { name: 'Stocks', value: allocation.stocks },
    { name: 'Bonds', value: allocation.bonds },
    { name: 'Cash', value: allocation.cash },
  ]

  return (
    <div className="h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="40%"
            outerRadius="70%"
            dataKey="value"
            stroke="#0a0e17"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#131926',
              border: '1px solid #1e2a3a',
              borderRadius: '4px',
              color: '#e1e7ef',
              fontSize: '12px',
            }}
            formatter={(value) => [`${value}%`, '']}
          />
          <Legend
            verticalAlign="bottom"
            height={30}
            formatter={(value: string) => (
              <span className="text-xs text-terminal-text">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

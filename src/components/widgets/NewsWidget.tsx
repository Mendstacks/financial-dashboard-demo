import type { NewsItem } from '../../types/portfolio'

interface NewsWidgetProps {
  news: NewsItem[]
}

function timeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d`
  if (diffHours > 0) return `${diffHours}h`
  if (diffMins > 0) return `${diffMins}m`
  return 'now'
}

export function NewsWidget({ news }: NewsWidgetProps) {
  return (
    <div className="flex flex-col h-full">
      {news.map((item, index) => (
        <div
          key={item.id}
          className={`py-1.5 px-1 flex gap-2 hover:bg-terminal-border/20 rounded cursor-default ${
            index < news.length - 1 ? 'border-b border-terminal-border/50' : ''
          }`}
        >
          <div
            className={`w-1 rounded-full shrink-0 mt-1 ${
              item.sentiment === 'positive'
                ? 'bg-terminal-green'
                : item.sentiment === 'negative'
                  ? 'bg-terminal-red'
                  : 'bg-terminal-muted'
            }`}
            style={{ height: '12px' }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-terminal-text leading-snug">{item.headline}</div>
            <div className="flex items-center gap-1.5 text-[10px] text-terminal-muted mt-0.5">
              <span className="font-medium text-terminal-orange">{item.source}</span>
              <span className="text-terminal-border">|</span>
              <span className="tabular-nums">{timeAgo(item.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

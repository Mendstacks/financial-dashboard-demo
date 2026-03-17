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

  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'just now'
}

export function NewsWidget({ news }: NewsWidgetProps) {
  return (
    <div className="flex flex-col gap-0.5 h-full">
      {news.map((item, index) => (
        <div
          key={item.id}
          className={`py-2 px-1 ${
            index < news.length - 1 ? 'border-b border-terminal-border' : ''
          }`}
        >
          <div className="text-sm text-terminal-text leading-snug mb-1">
            {item.headline}
          </div>
          <div className="flex items-center gap-2 text-xs text-terminal-muted">
            <span className="font-medium text-terminal-orange">{item.source}</span>
            <span>·</span>
            <span>{timeAgo(item.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

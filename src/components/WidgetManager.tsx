import { useState, useRef, useEffect } from 'react'
import { usePortfolioStore } from '../store/usePortfolioStore'

const ALL_WIDGETS = [
  { id: 'summary', label: 'Portfolio Summary' },
  { id: 'news', label: 'Market News' },
  { id: 'allocation', label: 'Asset Allocation' },
]

export function WidgetManager() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const visibleWidgets = usePortfolioStore((s) => s.visibleWidgets)
  const toggleWidget = usePortfolioStore((s) => s.toggleWidget)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-terminal-text hover:text-terminal-orange border border-terminal-border rounded hover:bg-terminal-surface transition-colors"
      >
        <span>+</span>
        <span>Widgets</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-terminal-surface border border-terminal-border rounded shadow-lg z-50 min-w-[180px]">
          {ALL_WIDGETS.map((widget) => {
            const isVisible = visibleWidgets.includes(widget.id)
            return (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-terminal-border/30 text-left"
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isVisible ? 'bg-terminal-blue border-terminal-blue' : 'border-terminal-border'}`}
                >
                  {isVisible && <span className="text-white text-[9px]">✓</span>}
                </div>
                <span className={isVisible ? 'text-terminal-text' : 'text-terminal-muted'}>{widget.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

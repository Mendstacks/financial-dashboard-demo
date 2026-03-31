import { useState, useRef, useEffect } from 'react'
import { usePortfolioStore } from '../store/usePortfolioStore'
import { widgetRegistry } from '../widgets/registry'

export function WidgetManager() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const addWidgetInstance = usePortfolioStore((s) => s.addWidgetInstance)

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
        <div className="absolute top-full left-0 mt-1 bg-terminal-surface border border-terminal-border rounded shadow-lg z-50 min-w-45">
          {Object.entries(widgetRegistry).map(([type, entry]) => (
            <button
              key={type}
              onClick={() => addWidgetInstance(type)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-terminal-border/30 text-left"
            >
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.accent }} />
              <span className="flex-1 text-terminal-text">{entry.defaultTitle}</span>
              <span className="text-terminal-muted text-[10px]">+</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

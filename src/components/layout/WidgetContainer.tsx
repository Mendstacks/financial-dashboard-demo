import type { ReactNode } from 'react'

interface WidgetContainerProps {
  title: string
  accentColor?: string
  children: ReactNode
  onPopOut?: () => void
}

export function WidgetContainer({ title, accentColor = '#0068ff', children, onPopOut }: WidgetContainerProps) {
  return (
    <div className="bg-terminal-surface border border-terminal-border rounded h-full flex flex-col overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
      <div className="drag-handle flex items-center justify-between px-3 py-1.5 border-b border-terminal-border cursor-move select-none">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-[11px] font-bold uppercase tracking-wider text-terminal-text">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="text-terminal-muted hover:text-terminal-orange text-xs w-5 h-5 flex items-center justify-center rounded hover:bg-terminal-border/50"
            title="Pop out window"
            onClick={(e) => {
              e.stopPropagation()
              onPopOut?.()
            }}
          >
            ⧉
          </button>
        </div>
      </div>
      <div className="flex-1 p-2.5 overflow-auto">
        {children}
      </div>
    </div>
  )
}

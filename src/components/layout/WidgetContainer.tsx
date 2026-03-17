import type { ReactNode } from 'react'

interface WidgetContainerProps {
  title: string
  children: ReactNode
}

export function WidgetContainer({ title, children }: WidgetContainerProps) {
  return (
    <div className="bg-terminal-surface border border-terminal-border rounded-md h-full flex flex-col overflow-hidden">
      <div className="drag-handle flex items-center justify-between px-3 py-2 border-b border-terminal-border cursor-move select-none">
        <span className="text-xs font-semibold uppercase tracking-wider text-terminal-muted">
          {title}
        </span>
        <button
          className="text-terminal-muted hover:text-terminal-text text-xs px-1.5 py-0.5 rounded hover:bg-terminal-border/50"
          title="Pop out"
          onClick={(e) => {
            e.stopPropagation()
            // Tear-out window functionality — future implementation
          }}
        >
          ⧉
        </button>
      </div>
      <div className="flex-1 p-3 overflow-auto">
        {children}
      </div>
    </div>
  )
}

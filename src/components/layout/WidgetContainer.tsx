import { useState, useRef, useEffect, type ReactNode } from 'react'
import { PopOutIcon, MoreIcon, DuplicateIcon, RemoveIcon } from '../ui/Icons'

interface WidgetContainerProps {
  title: string
  accentColor?: string
  children: ReactNode
  onPopOut?: () => void
  onRemove?: () => void
  onDuplicate?: () => void
}

export function WidgetContainer({
  title,
  accentColor = '#0068ff',
  children,
  onPopOut,
  onRemove,
  onDuplicate,
}: WidgetContainerProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div className="bg-terminal-surface border border-terminal-border rounded h-full flex flex-col overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
      <div className="drag-handle flex items-center justify-between px-3 py-1.5 border-b border-terminal-border cursor-move select-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
          <span className="text-[11px] font-bold uppercase tracking-wider text-terminal-text truncate">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1 relative z-10" ref={menuRef}>
          <button
            className="text-terminal-muted hover:text-terminal-orange w-5 h-5 flex items-center justify-center rounded hover:bg-terminal-border/50"
            title="Pop out window"
            onClick={(e) => {
              e.stopPropagation()
              onPopOut?.()
            }}
          >
            <PopOutIcon className="w-3 h-3" />
          </button>
          <button
            className="text-terminal-muted hover:text-terminal-orange w-5 h-5 flex items-center justify-center rounded hover:bg-terminal-border/50"
            title="More options"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
          >
            <MoreIcon className="w-3 h-3" />
          </button>

          {menuOpen && (
            <div className="absolute top-full right-0 mt-1 bg-terminal-surface border border-terminal-border rounded shadow-lg z-50 min-w-36 py-1">
              {onDuplicate && (
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-terminal-text hover:bg-terminal-border/30 text-left"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    onDuplicate()
                  }}
                >
                  <DuplicateIcon className="w-3 h-3 text-terminal-muted" />
                  Duplicate
                </button>
              )}
              {onRemove && (
                <>
                  <div className="border-t border-terminal-border my-1" />
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-400 hover:bg-terminal-border/30 text-left"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpen(false)
                      onRemove()
                    }}
                  >
                    <RemoveIcon className="w-3 h-3" />
                    Remove
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 p-2.5 overflow-auto">{children}</div>
    </div>
  )
}

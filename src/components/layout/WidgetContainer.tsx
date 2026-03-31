import { useState, useRef, useEffect, type ReactNode } from 'react'
import { PopOutIcon, MoreIcon, RenameIcon, DuplicateIcon, RemoveIcon } from '../ui/Icons'

interface WidgetContainerProps {
  title: string
  accentColor?: string
  children: ReactNode
  onPopOut?: () => void
  onRemove?: () => void
  onRename?: (newTitle: string) => void
  onDuplicate?: () => void
}

export function WidgetContainer({
  title,
  accentColor = '#0068ff',
  children,
  onPopOut,
  onRemove,
  onRename,
  onDuplicate,
}: WidgetContainerProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const menuRef = useRef<HTMLDivElement>(null)

  // Sync editTitle when title prop changes externally
  useEffect(() => {
    setEditTitle(title)
  }, [title])

  // Close menu on click outside
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

  function commitRename() {
    onRename?.(editTitle)
    setIsRenaming(false)
  }

  function cancelRename() {
    setEditTitle(title)
    setIsRenaming(false)
  }

  return (
    <div className="bg-terminal-surface border border-terminal-border rounded h-full flex flex-col overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
      <div className="drag-handle flex items-center justify-between px-3 py-1.5 border-b border-terminal-border cursor-move select-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
          {isRenaming ? (
            <input
              className="text-[11px] font-bold uppercase tracking-wider text-terminal-text bg-terminal-bg border border-terminal-border rounded px-1.5 py-0.5 outline-none focus:border-terminal-blue w-full min-w-0"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') cancelRename()
              }}
              onBlur={commitRename}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-wider text-terminal-text truncate">
              {title}
            </span>
          )}
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
              {onRename && (
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-terminal-text hover:bg-terminal-border/30 text-left"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    setIsRenaming(true)
                  }}
                >
                  <RenameIcon className="w-3 h-3 text-terminal-muted" />
                  Rename
                </button>
              )}
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

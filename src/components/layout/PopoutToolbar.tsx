import { useState, useRef, useEffect } from 'react'
import { PopInIcon, MoreIcon, DuplicateIcon, RemoveIcon } from '../ui/Icons'

interface PopoutToolbarProps {
  accentColor: string
  onPopIn: () => void
  onRemove: () => void
  onDuplicate: () => void
}

export function PopoutToolbar({ accentColor, onPopIn, onRemove, onDuplicate }: PopoutToolbarProps) {
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
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-terminal-border/40 bg-terminal-surface/50">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
      </div>
      <div className="flex items-center gap-1 relative" ref={menuRef}>
        <button
          className="text-terminal-muted hover:text-terminal-orange w-5 h-5 flex items-center justify-center rounded hover:bg-terminal-border/50"
          title="Return to grid"
          onClick={onPopIn}
        >
          <PopInIcon className="w-3 h-3" />
        </button>
        <button
          className="text-terminal-muted hover:text-terminal-orange w-5 h-5 flex items-center justify-center rounded hover:bg-terminal-border/50"
          title="More options"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MoreIcon className="w-3 h-3" />
        </button>

        {menuOpen && (
          <div className="absolute top-full right-0 mt-1 bg-terminal-surface border border-terminal-border rounded shadow-lg z-50 min-w-36 py-1">
            <button
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-terminal-text hover:bg-terminal-border/30 text-left"
              onClick={() => {
                setMenuOpen(false)
                onDuplicate()
              }}
            >
              <DuplicateIcon className="w-3 h-3 text-terminal-muted" />
              Duplicate
            </button>
            <div className="border-t border-terminal-border my-1" />
            <button
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-400 hover:bg-terminal-border/30 text-left"
              onClick={() => {
                setMenuOpen(false)
                onRemove()
              }}
            >
              <RemoveIcon className="w-3 h-3" />
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

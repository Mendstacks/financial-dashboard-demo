import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface PopoutWindowProps {
  title: string
  children: ReactNode
  onClose: () => void
  width?: number
  height?: number
}

export function PopoutWindow({ title, children, onClose, width = 600, height = 450 }: PopoutWindowProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [blocked, setBlocked] = useState(false)
  const windowRef = useRef<Window | null>(null)
  const unmountedRef = useRef(false)
  const onCloseStable = useEffectEvent(onClose)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (windowRef.current && !windowRef.current.closed) return

    unmountedRef.current = false

    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      'about:blank',
      `popout-${title.replace(/\s+/g, '-')}-${Date.now()}`,
      `width=${width},height=${height},left=${left},top=${top}`,
    )

    if (!popup) {
      // Defer state update to avoid synchronous setState in effect
      queueMicrotask(() => setBlocked(true))
      return
    }

    windowRef.current = popup

    const doc = popup.document
    doc.title = title

    const style = doc.createElement('style')
    style.textContent =
      'body { margin: 0; background: #000000; color: #e6e8eb; font-family: "Inter", system-ui, sans-serif; }'
    doc.head.appendChild(style)

    document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      doc.head.appendChild(node.cloneNode(true))
    })

    const div = doc.createElement('div')
    div.id = 'popout-root'
    doc.body.appendChild(div)

    // Defer state update to avoid synchronous setState in effect
    queueMicrotask(() => setContainer(div))

    const pollInterval = setInterval(() => {
      if (popup.closed && !unmountedRef.current) {
        unmountedRef.current = true
        clearInterval(pollInterval)
        windowRef.current = null
        onCloseStable()
      }
    }, 500)

    cleanupRef.current = () => clearInterval(pollInterval)

    return () => {
      unmountedRef.current = true
      cleanupRef.current?.()
      if (windowRef.current && !windowRef.current.closed) {
        windowRef.current.close()
      }
      windowRef.current = null
      setContainer(null)
    }
  }, [title, width, height])

  if (blocked) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-terminal-surface border border-terminal-border rounded-lg p-5 max-w-sm mx-4 shadow-xl">
          <div className="text-terminal-yellow text-lg mb-2">Popup Blocked</div>
          <p className="text-terminal-text text-sm mb-3">
            Your browser blocked the pop-out window. Please allow popups for this site:
          </p>
          <ol className="text-terminal-muted text-xs space-y-1 mb-4 list-decimal list-inside">
            <li>Click the popup-blocked icon in the address bar</li>
            <li>Select &quot;Always allow popups from this site&quot;</li>
            <li>Try the pop-out again</li>
          </ol>
          <button
            onClick={() => {
              setBlocked(false)
              onClose()
            }}
            className="w-full py-1.5 text-xs font-medium bg-terminal-blue/20 text-terminal-blue border border-terminal-blue/40 rounded hover:bg-terminal-blue/30"
          >
            OK, Got It
          </button>
        </div>
      </div>
    )
  }

  if (!container) return null

  return createPortal(
    <div className="h-screen bg-terminal-bg text-terminal-text flex flex-col border border-terminal-border">
      <div className="flex items-center justify-between px-3 py-2 bg-terminal-surface border-b border-terminal-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-terminal-text">{title}</span>
      </div>
      <div className="flex-1 p-3 overflow-auto">{children}</div>
    </div>,
    container,
  )
}

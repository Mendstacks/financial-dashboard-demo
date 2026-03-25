import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

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
      setBlocked(true)
      return
    }

    windowRef.current = popup

    popup.document.open()
    popup.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>body { margin: 0; background: #0a0e17; color: #e1e7ef; font-family: 'Inter', system-ui, sans-serif; }</style>
        </head>
        <body><div id="popout-root"></div></body>
      </html>
    `)
    popup.document.close()

    const parentStyles = document.querySelectorAll('link[rel="stylesheet"], style')
    parentStyles.forEach((node) => {
      popup.document.head.appendChild(node.cloneNode(true))
    })

    const div = popup.document.getElementById('popout-root') as HTMLDivElement
    setContainer(div)

    const pollInterval = setInterval(() => {
      if (popup.closed && !unmountedRef.current) {
        unmountedRef.current = true
        clearInterval(pollInterval)
        windowRef.current = null
        onCloseRef.current()
      }
    }, 500)

    return () => {
      unmountedRef.current = true
      clearInterval(pollInterval)
      if (windowRef.current && !windowRef.current.closed) {
        windowRef.current.close()
      }
      windowRef.current = null
      setContainer(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

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
            <li>Select "Always allow popups from this site"</li>
            <li>Try the pop-out again</li>
          </ol>
          <button
            onClick={() => {
              setBlocked(false)
              onCloseRef.current()
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
    <div className="p-3 h-screen bg-terminal-bg text-terminal-text overflow-auto">
      {children}
    </div>,
    container,
  )
}

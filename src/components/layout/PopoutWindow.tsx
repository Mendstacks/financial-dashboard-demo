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
  const windowRef = useRef<Window | null>(null)
  const unmountedRef = useRef(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    // Already have a window open — don't recreate
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
      onCloseRef.current()
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
  // Only recreate window if title changes — not on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

  if (!container) return null

  return createPortal(
    <div className="p-3 h-screen bg-terminal-bg text-terminal-text overflow-auto">
      {children}
    </div>,
    container,
  )
}

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

  useEffect(() => {
    unmountedRef.current = false

    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      'about:blank',
      `popout-${title.replace(/\s+/g, '-')}-${Date.now()}`,
      `width=${width},height=${height},left=${left},top=${top}`,
    )

    if (!popup) {
      onClose()
      return
    }

    windowRef.current = popup

    // Write a basic HTML document to the popup to prevent navigation issues
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

    // Copy stylesheets from parent window
    const parentStyles = document.querySelectorAll('link[rel="stylesheet"], style')
    parentStyles.forEach((node) => {
      popup.document.head.appendChild(node.cloneNode(true))
    })

    const div = popup.document.getElementById('popout-root') as HTMLDivElement
    setContainer(div)

    // Use interval to detect window close — more reliable than beforeunload
    const pollInterval = setInterval(() => {
      if (popup.closed && !unmountedRef.current) {
        unmountedRef.current = true
        clearInterval(pollInterval)
        onClose()
      }
    }, 500)

    return () => {
      unmountedRef.current = true
      clearInterval(pollInterval)
      if (windowRef.current && !windowRef.current.closed) {
        windowRef.current.close()
      }
      setContainer(null)
    }
  }, [title, width, height, onClose])

  if (!container) return null

  return createPortal(
    <div className="p-3 h-screen bg-terminal-bg text-terminal-text overflow-auto">
      {children}
    </div>,
    container,
  )
}

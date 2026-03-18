import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface PopoutWindowProps {
  title: string
  children: ReactNode
  onClose: () => void
  width?: number
  height?: number
}

export function PopoutWindow({ title, children, onClose, width = 600, height = 450 }: PopoutWindowProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const windowRef = useRef<Window | null>(null)

  useEffect(() => {
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      '',
      title.replace(/\s+/g, '-'),
      `width=${width},height=${height},left=${left},top=${top}`,
    )

    if (!popup) {
      onClose()
      return
    }

    windowRef.current = popup

    popup.document.title = title

    const container = popup.document.createElement('div')
    container.id = 'popout-root'
    popup.document.body.appendChild(container)
    containerRef.current = container

    popup.document.body.style.margin = '0'
    popup.document.body.style.backgroundColor = '#0a0e17'
    popup.document.body.style.color = '#e1e7ef'
    popup.document.body.style.fontFamily = "'Inter', system-ui, sans-serif"

    // Copy stylesheets from parent window
    const parentStyles = document.querySelectorAll('link[rel="stylesheet"], style')
    parentStyles.forEach((style) => {
      popup.document.head.appendChild(style.cloneNode(true))
    })

    // Force a re-render once container is ready
    containerRef.current = container

    const handleClose = () => onClose()
    popup.addEventListener('beforeunload', handleClose)

    return () => {
      popup.removeEventListener('beforeunload', handleClose)
      popup.close()
    }
  }, [title, width, height, onClose])

  if (!containerRef.current) return null

  return createPortal(
    <div className="p-3 h-screen bg-terminal-bg text-terminal-text overflow-auto">
      {children}
    </div>,
    containerRef.current,
  )
}

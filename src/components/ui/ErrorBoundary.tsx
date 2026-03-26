import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import type { ReactNode } from 'react'

interface WidgetErrorBoundaryProps {
  children: ReactNode
  fallbackTitle?: string
}

function ErrorFallback({
  error,
  resetErrorBoundary,
  fallbackTitle,
}: {
  error: unknown
  resetErrorBoundary: () => void
  fallbackTitle: string
}) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-terminal-muted">
      <div className="text-terminal-red text-lg">⚠</div>
      <div className="text-xs">{fallbackTitle}</div>
      <div className="text-[10px] text-terminal-muted/60 max-w-50 text-center truncate">{message}</div>
      <button
        onClick={resetErrorBoundary}
        className="cursor-pointer text-[10px] px-2 py-0.5 rounded border border-terminal-border hover:bg-terminal-border/30"
      >
        Retry
      </button>
    </div>
  )
}

export function WidgetErrorBoundary({ children, fallbackTitle = 'Widget failed to load' }: WidgetErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} fallbackTitle={fallbackTitle} />
      )}
      onError={(error, info) => {
        console.error('[Widget Error]', error, info)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

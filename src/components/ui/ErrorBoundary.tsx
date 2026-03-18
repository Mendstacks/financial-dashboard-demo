import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Widget Error]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-2 text-terminal-muted">
          <div className="text-terminal-red text-lg">⚠</div>
          <div className="text-xs">{this.props.fallbackTitle || 'Widget failed to load'}</div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-[10px] px-2 py-0.5 rounded border border-terminal-border hover:bg-terminal-border/30"
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

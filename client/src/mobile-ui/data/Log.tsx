import React, { PropsWithChildren } from 'react'

const Log = {
  panic(...params: any[]) {
    console.error('Loc.panic:', ...params)
    try {
      // Try to use JSON.stringify on params.
      throw new Error(`Log.panic: ${JSON.stringify(params)}`)
    } catch (_) {
      // Fall back to toString() if JSON.stringify throws on e.g circular structure
      throw new Error(`Log.panic: ${params.map(val => val.toString())}`)
    }
  },
  assert(mustBeTruthy: any, ...params: any[]) {
    if (!mustBeTruthy) {
      this.panic(...params)
    }
  },
}

type ErrorBoundaryInfo = {
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

type ErrorBoundaryProps = PropsWithChildren<{
  fallback: string
}>
export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state: ErrorBoundaryInfo

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div>
          <h2>{this.props.fallback}</h2>
          <details style={{ whiteSpace: 'pre-wrap' }} open>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      )
    }
    // Normally, just render children
    return this.props.children
  }
}

export default Log

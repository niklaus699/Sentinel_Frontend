import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; isForbidden?: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { 
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    // Check if this is a 403 Forbidden error
    const errorWithStatus = error as Error & { statusCode?: number }
    const isForbidden = error.name === 'ForbiddenError' || errorWithStatus.statusCode === 403
    return { hasError: true, error, isForbidden }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('UI Error:', error, errorInfo)
    
    // Report to Sentry if available
    if (typeof window !== 'undefined') {
      const windowAny = window as { __SENTRY__?: { captureException?: (error: Error, context?: unknown) => void } }
      if (windowAny.__SENTRY__?.captureException) {
        windowAny.__SENTRY__.captureException(error, { contexts: { react: errorInfo } })
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isForbidden) {
        return (
          <div className="p-4 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded">
            <h3 className="font-bold mb-2">🔒 Permission Denied</h3>
            <p className="text-sm">
              You do not have permission to access this resource. 
              {this.state.error?.message && ` ${this.state.error.message}`}
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-3 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            >
              Go to Dashboard
            </button>
          </div>
        )
      }
      
      return this.props.fallback || (
        <div className="p-4 text-red-600">
          <h3 className="font-bold mb-2">Something went wrong</h3>
          <p className="text-sm">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
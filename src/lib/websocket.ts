/**
 * Validate and get the WebSocket base URL from environment.
 * Ensures the URL is properly configured and raises error if missing.
 */
export function getWsUrl(): string {
  const wsUrl = import.meta.env.VITE_WS_URL
  
  if (!wsUrl) {
    const error = 'VITE_WS_URL environment variable is not set. This must be configured for real-time updates.'
    console.error(error)
    throw new Error(error)
  }

  // Warn if using WS (plaintext) in production
  if (import.meta.env.PROD && !wsUrl.startsWith('wss')) {
    console.warn(
      `⚠️  WebSocket URL is not WSS in production: ${wsUrl}. This is a security risk. ` +
      `Authentication tokens will be transmitted in plaintext.`
    )
  }

  return wsUrl
}

/**
 * WebSocket client with automatic reconnection and exponential backoff.
 * Supports token refresh on reconnection to handle expired tokens.
 */

type MessageHandler = (event: MessageEvent) => void
type StatusHandler = (connected: boolean) => void

interface SentinelWSOptions {
  onMessage: MessageHandler
  onStatusChange?: StatusHandler
  maxRetries?: number
}

export class SentinelWebSocket {
  private ws: WebSocket | null = null
  private retryCount = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private intentionallyClosed = false

  private token: string  // Changed from readonly to allow token updates
  private readonly url: string
  private readonly onMessage: MessageHandler
  private readonly onStatusChange: StatusHandler
  private readonly maxRetries: number

  constructor(token: string, options: SentinelWSOptions) {
    const wsBase = getWsUrl().replace(/\/+$/, '')
    this.token = token
    this.url = `${wsBase}/ws/dashboard/`
    this.onMessage = options.onMessage
    this.onStatusChange = options.onStatusChange ?? (() => {})
    this.maxRetries = options.maxRetries ?? 10
  }

  /**
   * Update the token (called when JWT is refreshed).
   * On next reconnection, the fresh token will be used.
   */
  updateToken(newToken: string): void {
    this.token = newToken
    console.debug('🔄 WebSocket token updated for next reconnection')
  }

  connect(): void {
    this.intentionallyClosed = false
    this._createConnection()
  }

  disconnect(): void {
    this.intentionallyClosed = true
    this._stopHeartbeat()
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.ws?.close(1000, 'Client disconnected intentionally')
    this.ws = null
  }

  private _createConnection(): void {
    this.ws = new WebSocket(this.url, ['bearer', this.token])

    this.ws.onopen = () => {
      this.retryCount = 0
      console.debug('✓ WebSocket connected')
      this.onStatusChange(true)
      this._startHeartbeat()
    }

    this.ws.onmessage = this.onMessage

    this.ws.onclose = () => {
      this._stopHeartbeat()
      console.debug('✗ WebSocket disconnected')
      this.onStatusChange(false)
      if (!this.intentionallyClosed && this.retryCount < this.maxRetries) {
        this._scheduleReconnect()
      }
    }

    this.ws.onerror = (event) => {
      console.error('WebSocket error:', event)
      // The close handler drives reconnect behavior.
    }
  }

  private _scheduleReconnect(): void {
    const delay = Math.min(1000 * 2 ** this.retryCount, 30_000)
    this.retryCount += 1
    console.debug(`↻ Reconnecting in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`)
    this.retryTimer = setTimeout(() => this._createConnection(), delay)
  }

  private _startHeartbeat(): void {
    this._stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      } else {
        this._stopHeartbeat()
      }
    }, 25_000)
  }

  private _stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * Validate that all required environment variables are set.
 * This runs before the app starts to catch configuration errors early.
 */
function validateEnvironment() {
  const required = ['VITE_API_URL', 'VITE_WS_URL']
  const missing = required.filter((varName) => !import.meta.env[varName as string])

  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}\n\n` +
      `Please check your .env file and ensure all required variables are set.`
    console.error(error)
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: #fee;
        font-family: system-ui, sans-serif;
        padding: 20px;
      ">
        <div style="max-width: 600px; text-align: center;">
          <h1 style="color: #c00; margin: 0 0 10px 0;">Configuration Error</h1>
          <p style="color: #333; white-space: pre-wrap; text-align: left; background: #f5f5f5; padding: 10px; border-radius: 4px;">
${error}
          </p>
        </div>
      </div>
    `
    throw new Error(error)
  }

  // Warn about plaintext transmission in production
  const apiUrl = import.meta.env.VITE_API_URL as string
  const wsUrl = import.meta.env.VITE_WS_URL as string

  if (import.meta.env.PROD) {
    if (!apiUrl.startsWith('https')) {
      console.warn(
        `⚠️  SECURITY WARNING: API URL is not HTTPS: ${apiUrl}. ` +
        `Authentication tokens will be transmitted in plaintext. ` +
        `This is a critical security risk in production.`
      )
    }
    if (!wsUrl.startsWith('wss')) {
      console.warn(
        `⚠️  SECURITY WARNING: WebSocket URL is not WSS: ${wsUrl}. ` +
        `Authentication tokens will be transmitted in plaintext. ` +
        `This is a critical security risk in production.`
      )
    }
  }
}

/**
 * Initialize Sentry error tracking (optional, requires VITE_SENTRY_DSN env var)
 */
function initializeSentry() {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string
  if (!sentryDsn) {
    console.debug('Sentry DSN not configured; error tracking disabled')
    return
  }

  // Dynamic import to avoid adding Sentry to bundle if not configured
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.PROD ? 'production' : 'development',
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      integrations: [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    })
  }).catch((error) => {
    console.error('Failed to initialize Sentry:', error)
  })
}

// Validate environment before rendering
try {
  validateEnvironment()
  initializeSentry()
} catch (error) {
  console.error('Failed to initialize app:', error)
  // App will show error message
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

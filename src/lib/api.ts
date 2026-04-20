import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'

/**
 * Validate and get the API base URL from environment.
 * Ensures the URL is properly configured and raises error if missing in production.
 */
export function getApiUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL
  
  if (!apiUrl) {
    const error = 'VITE_API_URL environment variable is not set. This must be configured for the app to function.'
    console.error(error)
    throw new Error(error)
  }

  // Warn if using HTTP in production
  if (import.meta.env.PROD && !apiUrl.startsWith('https')) {
    console.warn(
      `⚠️  API URL is not HTTPS in production: ${apiUrl}. This is a security risk. ` +
      `Tokens will be transmitted in plaintext.`
    )
  }

  return apiUrl
}

export const api = axios.create({
  baseURL: getApiUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

function getPersistedAuthState() {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem('sentinel-auth')
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    return parsed?.state ?? parsed
  } catch {
    return null
  }
}

function getStoredToken() {
  const state = getPersistedAuthState()
  return state?.accessToken ?? null
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken ?? getStoredToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Handle 403 Forbidden - Permission denied
    if (error.response?.status === 403) {
      const responseData = error.response?.data
      const message = (typeof responseData === 'object' && responseData !== null && 'detail' in responseData)
        ? (responseData as { detail: string }).detail
        : 'You do not have permission to access this resource.'
      console.error('🔒 Permission Denied (403):', message)
      
      // Create a custom error with permission context
      const forbiddenError = new Error(message) as Error & { statusCode?: number; response?: unknown }
      forbiddenError.name = 'ForbiddenError'
      forbiddenError.statusCode = 403
      forbiddenError.response = error.response
      
      return Promise.reject(forbiddenError)
    }

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = useAuthStore.getState().refreshToken
      if (!refreshToken) {
        useAuthStore.getState().logout()
        window.location.assign('/login')
        return Promise.reject(error)
      }

      try {
        const apiUrl = getApiUrl()
        const { data } = await axios.post(
          `${apiUrl}/api/auth/refresh/`,
          { refresh: refreshToken }
        )

        useAuthStore.getState().setTokens(data.access, data.refresh ?? refreshToken)
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return api(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        window.location.assign('/login')
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

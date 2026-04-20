import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface OrgInfo {
  id: string
  name: string
  slug: string
  plan_tier: string
}

interface AuthUser {
  id: string
  email: string
  role: string
  organization: OrgInfo
}

type TokenUpdateListener = (newToken: string) => void

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  setTokens: (access: string, refresh: string | null) => void
  setUser: (user: AuthUser) => void
  logout: () => void
  // WebSocket token update support
  subscribeToTokenUpdates: (listener: TokenUpdateListener) => () => void
}

// Global listeners for token updates (used by WebSocket and other real-time services)
let tokenUpdateListeners: TokenUpdateListener[] = []

function notifyTokenUpdateListeners(newToken: string) {
  tokenUpdateListeners.forEach((listener) => {
    try {
      listener(newToken)
    } catch (error) {
      console.error('Error in token update listener:', error)
    }
  })
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (access, refresh) => {
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: Boolean(access),
        })
        // Notify listeners (e.g., WebSocket) about token refresh
        if (access) {
          notifyTokenUpdateListeners(access)
        }
      },

      setUser: (user) => set({ user, isAuthenticated: true }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),

      subscribeToTokenUpdates: (listener) => {
        tokenUpdateListeners.push(listener)
        // Return unsubscribe function
        return () => {
          tokenUpdateListeners = tokenUpdateListeners.filter((l) => l !== listener)
        }
      },
    }),
    {
      name: 'sentinel-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

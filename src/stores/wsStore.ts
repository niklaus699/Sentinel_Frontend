import { create } from 'zustand'
import { useAuthStore } from './authStore'
import { useQueryClient } from '@tanstack/react-query'
import { SentinelWebSocket } from '@/lib/websocket'

interface AssetRiskUpdate {
  asset_id: string
  asset_name: string
  risk_score: number
  critical_count: number
  high_count: number
  timestamp: string
}

interface WSState {
  connected: boolean
  lastUpdate: AssetRiskUpdate | null
  client: SentinelWebSocket | null
  connect: (queryClient: ReturnType<typeof useQueryClient>) => void
  disconnect: () => void
}

export const useWSStore = create<WSState>((set, get) => ({
  connected: false,
  lastUpdate: null,
  client: null,

  connect: (queryClient) => {
    const { accessToken } = useAuthStore.getState()
    if (!accessToken || get().client) return

    const client = new SentinelWebSocket(accessToken, {
      onStatusChange: (connected) => set({ connected }),

      onMessage: (event) => {
        try {
          const message = JSON.parse(event.data)

          if (message.type === 'asset.risk_updated') {
            const update: AssetRiskUpdate = message.data

            set({ lastUpdate: update })

            // Surgically invalidate only the affected asset's queries.
            // This triggers TanStack Query to refetch in the background
            // without blowing away the entire cache.
            queryClient.invalidateQueries({ queryKey: ['assets'] })
            queryClient.invalidateQueries({ queryKey: ['assets', update.asset_id] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })

          }
        } catch {
          // Malformed message — ignore silently
        }
      },
    })

    client.connect()
    set({ client })
  },

  disconnect: () => {
    get().client?.disconnect()
    set({ client: null, connected: false })
  },
}))
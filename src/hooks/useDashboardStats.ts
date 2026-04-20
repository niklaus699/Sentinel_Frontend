import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface DashboardStats {
  total_assets: number
  total_open_findings: number
  critical_findings: number
  high_findings: number
  avg_risk_score: number
  most_critical_asset: {
    id: string
    name: string
    risk_score: number
    environment: string
  } | null
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard/stats/')
      return data
    },
    staleTime: 30_000,      // Consider fresh for 30s — WS updates handle real-time
    refetchInterval: 60_000, // Fallback poll if WebSocket drops
  })
}
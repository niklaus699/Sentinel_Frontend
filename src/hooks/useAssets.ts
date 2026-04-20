import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Asset {
  id: string
  name: string
  asset_type: string
  hostname: string
  ip_address: string | null
  environment: 'production' | 'staging' | 'development'
  risk_score: number
  last_scanned: string | null
  open_findings_count: number
  critical_count: number
  high_count: number
}

export interface AssetDetail extends Asset {
  packages: Array<{ id: string; name: string; version: string; ecosystem: string }>
  findings: Array<{
    id: string
    vulnerability_id: string
    vulnerability_summary: string
    severity: string
    cvss_score: number | null
    package_name: string | null
    package_version: string | null
    status: string
    risk_score: number
    first_seen: string
  }>
}

interface AssetListParams {
  environment?: string
  type?: string
  page?: number
}

export function useAssets(params: AssetListParams = {}) {
  return useQuery<{ results: Asset[]; count: number }>({
    queryKey: ['assets', params],
    queryFn: async () => {
      const { data } = await api.get('/api/assets/', { params })
      return data
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev, // Keep old data visible while refetching
  })
}

export function useAsset(id: string) {
  return useQuery<AssetDetail>({
    queryKey: ['assets', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/assets/${id}/`)
      return data
    },
    enabled: Boolean(id),
  })
}

export function useAssetRiskHistory(id: string, days = 30) {
  return useQuery({
    queryKey: ['assets', id, 'risk-history', days],
    queryFn: async () => {
      const { data } = await api.get(`/api/assets/${id}/risk-history/`, {
        params: { days },
      })
      return data as Array<{
        risk_score: number
        critical_count: number
        high_count: number
        recorded_at: string
      }>
    },
    enabled: Boolean(id),
  })
}

export function useTriggerScan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (assetId: string) => {
      const { data } = await api.post(`/api/assets/${assetId}/scan/`)
      return data
    },
    onSuccess: (_, assetId) => {
      queryClient.invalidateQueries({ queryKey: ['assets', assetId] })
    },
  })
}
// Add to existing src/hooks/useAssets.ts

export function useAssetDetail(id: string) {
  return useQuery<AssetDetail>({
    queryKey: ['assets', id, 'detail'],
    queryFn: async () => {
      const { data } = await api.get(`/api/assets/${id}/`)
      return data
    },
    enabled: Boolean(id),
    staleTime: 20_000,
  })
}
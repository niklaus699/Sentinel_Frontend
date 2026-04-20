import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Vulnerability {
  id: string
  source: string
  summary: string
  severity: string
  cvss_score: number | null
  references: string[]
  published_at: string
  ingested_at: string
}

interface VulnFilters {
  severity?: string
  q?: string
  page?: number
}

export function useVulnerabilities(filters: VulnFilters = {}) {
  return useQuery<{ results: Vulnerability[]; count: number }>({
    queryKey: ['vulnerabilities', filters],
    queryFn: async () => {
      const { data } = await api.get('/api/vulnerabilities/', { params: filters })
      return data
    },
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  })
}
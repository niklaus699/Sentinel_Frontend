import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Finding {
  id: string
  vulnerability: {
    id: string
    summary: string
    severity: string
    cvss_score: number | null
    references: string[]
    published_at: string
  }
  asset_name: string
  asset_environment: string
  package_name: string | null
  package_version: string | null
  status: string
  risk_score: number
  first_seen: string
  resolved_at: string | null
}

interface FindingFilters {
  status?: string
  severity?: string
  environment?: string
  asset_id?: string
  min_risk_score?: number
  page?: number
}

export function useFindings(filters: FindingFilters = {}) {
  return useQuery<{ results: Finding[]; count: number }>({
    queryKey: ['findings', filters],
    queryFn: async () => {
      const { data } = await api.get('/api/findings/', { params: filters })
      return data
    },
    staleTime: 20_000,
    placeholderData: (prev) => prev,
  })
}

export function useUpdateFindingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/api/findings/${id}/status/`, { status })
      return data
    },
    // Optimistic update — the table row changes instantly,
    // before the server confirms. Rolls back on error.
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['findings'] })
      const snapshots = queryClient.getQueriesData({ queryKey: ['findings'] })

      queryClient.setQueriesData(
        { queryKey: ['findings'] },
        (old: { results: Finding[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            results: old.results.map((f) =>
              f.id === id ? { ...f, status } : f
            ),
          }
        }
      )

      return { snapshots } // context for rollback
    },
    onError: (_err, _vars, context) => {
      // Roll back to the snapshot state on failure
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] })
    },
  })
}
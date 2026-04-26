import { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import { useFindings } from '@/hooks/useFindings'
import { useUpdateFindingStatus } from '@/hooks/useFindings'
import { SeverityBadge } from '@/components/ui/Badge'
import { RiskScore } from '@/components/ui/RiskScore'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { Severity } from '@/lib/utils'

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'accepted', 'false_positive']
const SEVERITY_OPTIONS = ['critical', 'high', 'medium', 'low']

const STATUS_LABEL: Record<string, string> = {
  open:          'Open',
  in_progress:   'In progress',
  resolved:      'Resolved',
  accepted:      'Accepted',
  false_positive:'False positive',
}

export function FindingsTable() {
  const [filters, setFilters] = useState<{
    status?: string
    severity?: string
    environment?: string
  }>({})

  const { data, isLoading } = useFindings(filters)
  const updateStatus = useUpdateFindingStatus()

  const findings = data?.results ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Findings</CardTitle>

        {/* Desktop: single row. Mobile: title is above (CardHeader handles that),
            filters stack into a wrap row */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={13} className="text-slate-500 flex-shrink-0" />

          <select
            className="text-xs bg-surface-overlay border border-surface-border rounded px-1.5 py-1 text-slate-300 min-w-0"
            value={filters.severity ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value || undefined }))}
          >
            <option value="">All severities</option>
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            className="text-xs bg-surface-overlay border border-surface-border rounded px-1.5 py-1 text-slate-300 min-w-0"
            value={filters.status ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>

          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </CardHeader>

      <div className="overflow-x-auto rounded border border-surface-border md:overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-overlay border-b border-surface-border">
              {['CVE ID', 'Asset', 'Package', 'Severity', 'Risk', 'Status', 'Found'].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-xs text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-border">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-3 py-2">
                        <div className="h-3 bg-surface-overlay rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : findings.map((finding, i) => (
                  <motion.tr
                    key={finding.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.025 }}
                    className="border-b border-surface-border hover:bg-surface-overlay transition-colors"
                  >
                    <td className="px-3 py-2 font-mono text-xs text-slate-300">
                      {finding.vulnerability.id}
                    </td>

                    <td className="px-3 py-2">
                      <div>
                        <p className="text-slate-200 text-xs">{finding.asset_name}</p>
                        <p className="text-slate-600 text-xs">{finding.asset_environment}</p>
                      </div>
                    </td>

                    <td className="px-3 py-2 font-mono text-xs text-slate-400">
                      {finding.package_name
                        ? `${finding.package_name}@${finding.package_version}`
                        : '—'}
                    </td>

                    <td className="px-3 py-2">
                      <SeverityBadge severity={finding.vulnerability.severity as Severity} />
                    </td>

                    <td className="px-3 py-2">
                      <RiskScore score={finding.risk_score} size="sm" />
                    </td>

                    <td className="px-3 py-2">
                      <select
                        className={cn(
                          'text-xs bg-transparent border border-surface-border rounded px-1.5 py-0.5',
                          'text-slate-300 hover:border-slate-500 transition-colors cursor-pointer',
                          'focus:outline-none focus:ring-1 focus:ring-accent'
                        )}
                        value={finding.status}
                        onChange={(e) =>
                          updateStatus.mutate({ id: finding.id, status: e.target.value })
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-surface-overlay">
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-2 text-xs text-slate-500">
                      {formatRelativeTime(finding.first_seen)}
                    </td>
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        {data?.count ?? 0} findings total
      </div>
    </Card>
  )
}
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { SeverityBadge } from '@/components/ui/Badge'
import { RiskScore } from '@/components/ui/RiskScore'
import { useUpdateFindingStatus } from '@/hooks/useFindings'
import { formatRelativeTime, cn } from '@/lib/utils'
import type { Severity } from '@/lib/utils'
import type { AssetDetail } from '@/hooks/useAssets'

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'accepted', 'false_positive']
const STATUS_LABEL: Record<string, string> = {
  open:           'Open',
  in_progress:    'In progress',
  resolved:       'Resolved',
  accepted:       'Accepted',
  false_positive: 'False positive',
}

interface Props { findings: AssetDetail['findings'] }

export function AssetFindingsPanel({ findings }: Props) {
  const updateStatus = useUpdateFindingStatus()

  if (findings.length === 0) {
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-sm text-slate-500">No open findings</p>
          <p className="text-xs text-slate-600 mt-1">This asset has no active vulnerabilities</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open findings ({findings.length})</CardTitle>
      </CardHeader>

      <div className="space-y-2">
        {findings.map((finding, i) => (
          <motion.div
            key={finding.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 rounded-lg bg-surface-overlay border border-surface-border hover:border-slate-600 transition-colors"
          >
            {/* Top row on mobile: severity badge + score on left, status select on right */}
            {/* On desktop this becomes the left-side severity column */}
            <div className="flex sm:flex-col items-center justify-between sm:justify-start sm:gap-1.5 sm:flex-shrink-0 sm:pt-0.5">
              {/* Left side of mobile top row */}
              <div className="flex sm:flex-col items-center gap-2 sm:gap-1.5">
                <SeverityBadge severity={finding.severity as Severity} />
                <RiskScore score={finding.risk_score} size="sm" />
              </div>

              {/* Status select — visible only on mobile here, hidden on desktop */}
              <div className="sm:hidden">
                <select
                  className={cn(
                    'text-xs bg-surface-base border border-surface-border rounded',
                    'px-1.5 py-1 text-slate-300 hover:border-slate-500',
                    'focus:outline-none focus:ring-1 focus:ring-accent',
                    'transition-colors cursor-pointer'
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
              </div>
            </div>

            {/* Content — always full width on mobile, flex-1 on desktop */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-x-2 gap-y-0.5">
                <span className="font-mono text-xs text-slate-400 break-all">
                  {finding.vulnerability_id}
                </span>
                {finding.cvss_score !== null && (
                  <span className="text-xs text-slate-600 flex-shrink-0">
                    CVSS {finding.cvss_score.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
                {finding.vulnerability_summary}
              </p>
              {finding.package_name && (
                <p className="text-xs text-slate-600 font-mono mt-1 break-all">
                  {finding.package_name}@{finding.package_version}
                </p>
              )}
              <p className="text-xs text-slate-600 mt-1">
                First seen {formatRelativeTime(finding.first_seen)}
              </p>
            </div>

            {/* Status select — desktop only, hidden on mobile (rendered above instead) */}
            <div className="hidden sm:block flex-shrink-0">
              <select
                className={cn(
                  'text-xs bg-surface-base border border-surface-border rounded',
                  'px-1.5 py-1 text-slate-300 hover:border-slate-500',
                  'focus:outline-none focus:ring-1 focus:ring-accent',
                  'transition-colors cursor-pointer'
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
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
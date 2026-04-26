import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, RefreshCw } from 'lucide-react'
import { useAssets } from '@/hooks/useAssets'
import { useTriggerScan } from '@/hooks/useAssets'
import { useWSStore } from '@/stores/wsStore'
import { RiskScore } from '@/components/ui/RiskScore'
import { cn, formatRelativeTime } from '@/lib/utils'

const ENV_BADGE: Record<string, string> = {
  production: 'bg-red-950 text-red-400 border border-red-900',
  staging:    'bg-amber-950 text-amber-400 border border-amber-900',
  development:'bg-slate-800 text-slate-400 border border-slate-700',
}

export function AssetTable() {
  const navigate = useNavigate()
  const { data, isLoading } = useAssets()
  const triggerScan = useTriggerScan()
  const lastWSUpdate = useWSStore((s) => s.lastUpdate)
  const wsConnected = useWSStore((s) => s.connected)

  const assets = data?.results ?? []

  return (
    <div>
      {/* Connection indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn(
            'inline-block w-1.5 h-1.5 rounded-full',
            wsConnected ? 'bg-green-400' : 'bg-red-400'
          )}
        />
        <span className="text-xs text-slate-500">
          {wsConnected ? 'Live updates active' : 'Reconnecting…'}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-surface-border md:overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-overlay border-b border-surface-border">
              {['Asset', 'Environment', 'Risk score', 'Findings', 'Last scanned', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence initial={false}>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-surface-border">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-surface-overlay rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : assets.map((asset) => {
                    const isJustUpdated = lastWSUpdate?.asset_id === asset.id

                    return (
                      <motion.tr
                        key={asset.id}
                        layout
                        initial={{ backgroundColor: 'transparent' }}
                        animate={{
                          backgroundColor: isJustUpdated
                            ? ['rgba(99,102,241,0.15)', 'transparent']
                            : 'transparent',
                        }}
                        transition={{ duration: 1.5 }}
                        className={cn(
                          'border-b border-surface-border cursor-pointer',
                          'hover:bg-surface-overlay transition-colors'
                        )}
                        onClick={() => navigate(`/assets/${asset.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-200">{asset.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{asset.hostname}</p>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded font-mono',
                            ENV_BADGE[asset.environment]
                          )}>
                            {asset.environment}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <RiskScore score={asset.risk_score} animated={isJustUpdated} />
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-xs">
                            {asset.critical_count > 0 && (
                              <span className="text-red-400 font-mono">
                                {asset.critical_count}C
                              </span>
                            )}
                            {asset.high_count > 0 && (
                              <span className="text-orange-400 font-mono">
                                {asset.high_count}H
                              </span>
                            )}
                            <span className="text-slate-500">
                              {asset.open_findings_count} open
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-xs text-slate-500">
                          {asset.last_scanned
                            ? formatRelativeTime(asset.last_scanned)
                            : 'Never'}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                triggerScan.mutate(asset.id)
                              }}
                              className={cn(
                                'p-1 rounded text-slate-500 hover:text-slate-300',
                                'hover:bg-surface-overlay transition-colors',
                                triggerScan.isPending && 'animate-spin text-accent'
                              )}
                              title="Trigger re-scan"
                            >
                              <RefreshCw size={13} />
                            </button>
                            <ChevronRight size={13} className="text-slate-600" />
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}
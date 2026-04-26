import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, Server, Database, Box, Globe } from 'lucide-react'
import { RiskScore } from '@/components/ui/RiskScore'
import { useTriggerScan } from '@/hooks/useAssets'
import { useWSStore } from '@/stores/wsStore'
import { cn } from '@/lib/utils'
import type { AssetDetail } from '@/hooks/useAssets'

const ASSET_ICONS: Record<string, React.ReactNode> = {
  server:    <Server size={16} />,
  database:  <Database size={16} />,
  container: <Box size={16} />,
  endpoint:  <Globe size={16} />,
}

const ENV_COLORS: Record<string, string> = {
  production:  'text-red-400  bg-red-950  border-red-900',
  staging:     'text-amber-400 bg-amber-950 border-amber-900',
  development: 'text-slate-400 bg-slate-800 border-slate-700',
}

interface Props { asset: AssetDetail }

export function AssetDetailHeader({ asset }: Props) {
  const navigate = useNavigate()
  const triggerScan = useTriggerScan()
  const lastUpdate = useWSStore((s) => s.lastUpdate)
  const isUpdating = lastUpdate?.asset_id === asset.id

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button
        onClick={() => navigate('/assets')}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4"
      >
        <ArrowLeft size={12} /> Back to assets
      </button>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-surface-overlay border border-surface-border text-slate-400 mt-0.5">
            {ASSET_ICONS[asset.asset_type] ?? <Server size={16} />}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">{asset.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={cn(
                'text-xs px-2 py-0.5 rounded font-mono border',
                ENV_COLORS[asset.environment]
              )}>
                {asset.environment}
              </span>
              {asset.hostname && (
                <span className="text-xs text-slate-500 font-mono">{asset.hostname}</span>
              )}
              {asset.ip_address && (
                <span className="text-xs text-slate-600 font-mono">{asset.ip_address}</span>
              )}
            </div>
          </div>
        </div>

<div className="flex flex-col items-end gap-2 flex-shrink-0">
  <div className="text-right">
    <p className="text-xs text-slate-500 mb-0.5">Risk score</p>
    <RiskScore score={asset.risk_score} size="lg" animated={isUpdating} />
  </div>
  <button
    onClick={() => triggerScan.mutate(asset.id)}
    disabled={triggerScan.isPending}
    className={cn(
      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs',
      'border border-surface-border bg-surface-overlay text-slate-400',
      'hover:text-slate-200 hover:border-slate-500 transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    )}
  >
    <RefreshCw size={12} className={triggerScan.isPending ? 'animate-spin' : ''} />
    {triggerScan.isPending ? 'Queued…' : 'Re-scan'}
  </button>
</div>
      </div>
    </motion.div>
  )
}
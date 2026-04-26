import { Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AssetDetailHeader } from '@/features/assets/AssetDetailHeader'
import { AssetFindingsPanel } from '@/features/assets/AssetsFindingsPanel'
import { PackageInventory } from '@/features/assets/PackageInventory'
import { RiskTrendChart } from '@/features/overview/RiskTrendChart'
import { useAssetDetail } from '@/hooks/useAssets'
import { Card } from '@/components/ui/Card'

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const assetId = id ?? ''
  const { data: asset, isLoading, isError } = useAssetDetail(assetId)

  if (!id) return <Navigate to="/assets" replace />

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-20 animate-pulse rounded-lg bg-surface-overlay" />
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-64 animate-pulse rounded-lg bg-surface-overlay" />
          <div className="h-64 animate-pulse rounded-lg bg-surface-overlay" />
        </div>
      </div>
    )
  }

  if (isError || !asset) {
    return (
      <div className="p-6">
        <Card className="py-16 text-center">
          <p className="text-slate-400">Asset not found or access denied.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <AssetDetailHeader asset={asset} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { label: 'Open findings', value: asset.findings.length },
          { label: 'Packages scanned', value: asset.packages.length },
          {
            label: 'Last scanned',
            value: asset.last_scanned
              ? new Date(asset.last_scanned).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })
              : 'Never',
          },
        ].map(({ label, value }) => (
          <Card key={label}>
            <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">{label}</p>
            <p className="text-lg font-semibold tabular-nums text-slate-100">{value}</p>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <RiskTrendChart assetId={assetId} assetName={asset.name} />
        </div>

        <PackageInventory packages={asset.packages} />
      </div>

      <AssetFindingsPanel findings={asset.findings} />
    </div>
  )
}

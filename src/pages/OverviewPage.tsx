import { motion } from 'framer-motion'
import { StatsCards } from '@/features/overview/StatsCards'
import { AssetTable } from '@/features/assets/AssetTable'
import { RiskTrendChart } from '@/features/overview/RiskTrendChart'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useDiscoveryScan } from '@/hooks/useDiscoveryScan'

export function OverviewPage() {
  const { data: stats } = useDashboardStats()
  const { triggerScan, isScanning } = useDiscoveryScan()

  return (
    <div className="space-y-8 px-4 py-6">
      {/* Header Section */}
      <div className="py-2 border-b border-surface-border">
        <h1 className="text-2xl font-semibold text-slate-100">Security Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time threat landscape for your organization.
        </p>
      </div>

      {/* Top Layer: Stats */}
      <StatsCards/>

      {/* Middle Layer: Charts & High-Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trend (Takes 2 columns) */}
        {stats?.most_critical_asset ? (
          <RiskTrendChart 
            assetId={stats.most_critical_asset.id} 
            assetName={stats.most_critical_asset.name} 
          />
        ) : (
          <div className="col-span-2 h-[300px] rounded-lg border border-dashed border-surface-border flex items-center justify-center text-slate-500">
            No critical assets identified yet.
          </div>
        )}

        {/* Quick Actions / Status Card (Takes 1 column) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface-raised border border-surface-border rounded-lg p-6 flex flex-col justify-center"
        >
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">
            Sentinel Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Scanner Engine</span>
              <span className="text-xs px-2 py-0.5 rounded bg-green-950 text-green-400 border border-green-900">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Database RLS</span>
              <span className="text-xs px-2 py-0.5 rounded bg-green-950 text-green-400 border border-green-900">Enforced</span>
            </div>
            <div className="pt-4 border-t border-surface-border">
              <button 
                onClick={triggerScan}
                disabled={isScanning}
                className={`w-full py-2 text-white rounded text-xs font-bold transition-colors ${
                  isScanning 
                    ? 'bg-slate-700 cursor-not-allowed' 
                    : 'bg-accent hover:bg-indigo-600'
                }`}
              >
                {isScanning ? 'Scan in Progress...' : 'Run Discovery Scan'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Layer: Asset Table */}
      <div className="space-y-4 py-2 border-t border-surface-border">
        <h2 className="text-lg font-medium text-slate-200">Protected Assets</h2>
        <AssetTable />
      </div>
    </div>
  )
}
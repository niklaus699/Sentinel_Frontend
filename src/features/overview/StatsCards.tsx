import { motion } from 'framer-motion'
import { ShieldAlert, AlertTriangle, Server, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useDashboardStats } from '@/hooks/useDashboardStats'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  sub?: string
  index: number
}

function StatCard({ label, value, icon, sub, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
    >
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">{label}</p>
            <p className="text-2xl font-semibold tabular-nums text-slate-100">{value}</p>
            {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
          </div>
          <div className="rounded-md bg-surface-overlay p-2 text-slate-400">
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export function StatsCards() {
  const { data, isLoading } = useDashboardStats()

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-24 animate-pulse bg-surface-overlay">
            <div className="h-full" />
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      label: 'Total assets',
      value: data.total_assets,
      icon: <Server size={16} />,
      sub: data.most_critical_asset
        ? `Most critical: ${data.most_critical_asset.name}`
        : undefined,
    },
    {
      label: 'Open findings',
      value: data.total_open_findings,
      icon: <AlertTriangle size={16} />,
      sub: `${data.critical_findings} critical`,
    },
    {
      label: 'Critical findings',
      value: data.critical_findings,
      icon: <ShieldAlert size={16} className="text-red-400" />,
      sub: `${data.high_findings} high severity`,
    },
    {
      label: 'Avg risk score',
      value: data.avg_risk_score.toFixed(1),
      icon: <TrendingUp size={16} />,
      sub: 'Across all assets',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card, index) => (
        <StatCard key={card.label} {...card} index={index} />
      ))}
    </div>
  )
}

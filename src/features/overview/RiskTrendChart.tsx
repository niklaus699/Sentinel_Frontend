import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAssetRiskHistory } from '@/hooks/useAssets'

interface Props {
  assetId: string
  assetName: string
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-surface-overlay border border-surface-border rounded-lg p-3 text-xs">
      <p className="text-slate-400 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="text-slate-200 font-mono">{entry.value}</span>
          <span className="text-slate-500">{entry.name}</span>
        </div>
      ))}
    </div>
  )
}

export function RiskTrendChart({ assetId, assetName }: Props) {
  const { data, isLoading } = useAssetRiskHistory(assetId, 30)

  const chartData = data?.map((snap) => ({
    date: format(parseISO(snap.recorded_at), 'MMM d'),
    risk: snap.risk_score,
    critical: snap.critical_count,
    high: snap.high_count,
  })) ?? []

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Risk trend — {assetName}</CardTitle>
        <span className="text-xs text-slate-500">30 days</span>
      </CardHeader>

      {isLoading ? (
        <div className="h-48 animate-pulse bg-surface-overlay rounded" />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#262B35" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="risk"
              name="risk score"
              stroke="#6366F1"
              strokeWidth={1.5}
              fill="url(#riskGrad)"
              dot={false}
              activeDot={{ r: 3, fill: '#6366F1' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
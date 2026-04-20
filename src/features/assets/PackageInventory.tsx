import { useState } from 'react'
import { Package, Search } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { AssetDetail } from '@/hooks/useAssets'

const ECO_COLORS: Record<string, string> = {
  PyPI:     'text-blue-400  bg-blue-950  border-blue-900',
  npm:      'text-red-400   bg-red-950   border-red-900',
  Go:       'text-cyan-400  bg-cyan-950  border-cyan-900',
  Maven:    'text-orange-400 bg-orange-950 border-orange-900',
  RubyGems: 'text-pink-400  bg-pink-950  border-pink-900',
}

interface Props {
  packages: AssetDetail['packages']
}

export function PackageInventory({ packages }: Props) {
  const [search, setSearch] = useState('')

  const filtered = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-1.5">
            <Package size={13} />
            Packages
            <span className="text-slate-600 font-normal normal-case ml-1">
              ({packages.length})
            </span>
          </span>
        </CardTitle>
      </CardHeader>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Filter packages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'w-full bg-surface-overlay border border-surface-border rounded-lg',
            'pl-7 pr-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-600',
            'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent/50'
          )}
        />
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-600 py-4 text-center">
            No packages match "{search}"
          </p>
        ) : (
          filtered.map((pkg) => (
            <div
              key={pkg.id}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-surface-overlay transition-colors"
            >
              <div className="min-w-0">
                <span className="text-xs text-slate-300 font-mono truncate block">
                  {pkg.name}
                </span>
                <span className="text-xs text-slate-600 font-mono">{pkg.version}</span>
              </div>
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded border font-mono flex-shrink-0 ml-2',
                ECO_COLORS[pkg.ecosystem] ?? 'text-slate-400 bg-slate-800 border-slate-700'
              )}>
                {pkg.ecosystem}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
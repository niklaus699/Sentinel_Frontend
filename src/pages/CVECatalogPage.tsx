import { useDeferredValue, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react'
import { useVulnerabilities, type Vulnerability } from '@/hooks/useVulnerabilities'
import { SeverityBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { Severity } from '@/lib/utils'

const SEVERITIES = ['critical', 'high', 'medium', 'low']

function CVERow({ vuln }: { vuln: Vulnerability }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr
        onClick={() => setExpanded((value) => !value)}
        className="cursor-pointer border-b border-surface-border transition-colors hover:bg-surface-overlay"
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded
              ? <ChevronDown size={12} className="flex-shrink-0 text-slate-500" />
              : <ChevronRight size={12} className="flex-shrink-0 text-slate-600" />}
            <span className="font-mono text-xs text-slate-300">{vuln.id}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <SeverityBadge severity={vuln.severity as Severity} />
        </td>
        <td className="max-w-xs px-4 py-3 text-xs text-slate-400">
          <span className="line-clamp-1">{vuln.summary || 'No summary available'}</span>
        </td>
        <td className="px-4 py-3 font-mono text-xs text-slate-500">
          {vuln.cvss_score !== null ? vuln.cvss_score.toFixed(1) : '—'}
        </td>
        <td className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">
          {vuln.source}
        </td>
        <td className="px-4 py-3 text-xs text-slate-600">
          {formatRelativeTime(vuln.published_at)}
        </td>
      </tr>

      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={6} className="px-0 py-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-b border-surface-border bg-surface-overlay px-10 py-4">
                  {vuln.summary && (
                    <p className="mb-3 text-xs leading-relaxed text-slate-300">
                      {vuln.summary}
                    </p>
                  )}

                  {vuln.references.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                        References
                      </p>
                      <div className="space-y-1">
                        {vuln.references.slice(0, 5).map((ref) => (
                          <a
                            key={ref}
                            href={ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="flex items-center gap-1.5 truncate text-xs text-accent transition-colors hover:text-indigo-300"
                          >
                            <ExternalLink size={10} className="flex-shrink-0" />
                            {ref}
                          </a>
                        ))}
                        {vuln.references.length > 5 && (
                          <p className="text-xs text-slate-600">
                            +{vuln.references.length - 5} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-4 border-t border-surface-border pt-3 text-xs text-slate-600">
                    <span>
                      Published:{' '}
                      {new Date(vuln.published_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span>Ingested: {formatRelativeTime(vuln.ingested_at)}</span>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  )
}

export function CVECatalogPage() {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState<string>('')
  const [page, setPage] = useState(1)

  const deferredSearch = useDeferredValue(search.trim())
  const { data, isLoading, isFetching } = useVulnerabilities({
    q: deferredSearch || undefined,
    severity: severity || undefined,
    page,
  })

  const vulns = data?.results ?? []
  const total = data?.count ?? 0
  const PAGE_SIZE = 50
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="text-xl font-semibold text-slate-100">CVE Catalog</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Global vulnerability database — {total.toLocaleString()} entries
        </p>
      </motion.div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-48 flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search CVE ID or summary…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              className={cn(
                'w-full rounded-lg border border-surface-border bg-surface-overlay',
                'py-2 pl-8 pr-3 text-sm text-slate-300 placeholder:text-slate-600',
                'focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent'
              )}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {SEVERITIES.map((value) => (
              <button
                key={value}
                onClick={() => {
                  setSeverity(value === severity ? '' : value)
                  setPage(1)
                }}
                className={cn(
                  'rounded-md border px-2.5 py-1 font-mono text-xs capitalize transition-colors',
                  severity === value
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-surface-border text-slate-500 hover:border-slate-600 hover:text-slate-300'
                )}
              >
                {value}
              </button>
            ))}
            {severity && (
              <button
                onClick={() => {
                  setSeverity('')
                  setPage(1)
                }}
                className="ml-1 text-xs text-slate-600 transition-colors hover:text-slate-400"
              >
                Clear
              </button>
            )}
          </div>

          {isFetching && !isLoading && (
            <span className="ml-auto text-xs text-slate-600">Updating…</span>
          )}
        </div>
      </Card>

      <div className="overflow-hidden rounded-lg border border-surface-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-overlay">
              {['CVE ID', 'Severity', 'Summary', 'CVSS', 'Source', 'Published'].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index} className="border-b border-surface-border">
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3">
                        <div className="h-3 animate-pulse rounded bg-surface-overlay" />
                      </td>
                    ))}
                  </tr>
                ))
              : vulns.length === 0
                ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center text-sm text-slate-600">
                        No vulnerabilities match your filters.
                      </td>
                    </tr>
                  )
                : vulns.map((vuln) => <CVERow key={vuln.id} vuln={vuln} />)
            }
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded border border-surface-border px-2.5 py-1 transition-colors hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Prev
            </button>
            <span className="px-3 py-1 font-mono">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded border border-surface-border px-2.5 py-1 transition-colors hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

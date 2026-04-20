import { motion } from 'framer-motion'
import { FindingsTable } from '@/features/findings/FindingsTable'
import { useFindings } from '@/hooks/useFindings'

export function FindingsPage() {
  const { data } = useFindings({ status: 'open' })
  const openCount = data?.count ?? 0

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold text-slate-100">Findings</h1>
          {openCount > 0 && (
            <span className="text-xs font-mono bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded-full">
              {openCount} open
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          Triage and track vulnerabilities across your infrastructure
        </p>
      </motion.div>

      <FindingsTable />
    </div>
  )
}
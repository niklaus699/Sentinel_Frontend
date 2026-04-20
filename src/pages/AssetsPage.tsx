import { useState } from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { AssetTable } from '@/features/assets/AssetTable'
import { SyncAssetModal } from '@/features/ingestion/SyncAssetModal'

export function AssetsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Assets</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            All monitored infrastructure — sorted by risk score
          </p>
        </div>
                <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent hover:bg-indigo-400 text-white text-sm font-medium transition-colors"
        >
          <Plus size={14} />
          Sync asset
        </button>
      </motion.div>

      <AssetTable />
      <SyncAssetModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
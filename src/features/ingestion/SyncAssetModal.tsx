import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload, Terminal, Cpu, X, FileText,
    CheckCircle, AlertCircle, Loader2, ChevronRight
} from 'lucide-react'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

type Tab = 'upload' | 'agent' | 'ci'

const SUPPORTED_FILES = [
    'requirements.txt', 'package.json', 'package-lock.json',
    'go.mod', 'pom.xml', 'Gemfile.lock', 'Pipfile.lock', 'pyproject.toml'
]

interface SyncResult {
    asset_name: string
    packages_found: number
    packages_new: number
    status: string
}

interface Props {
    open: boolean
    onClose: () => void
}

export function SyncAssetModal({ open, onClose }: Props) {
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [tab, setTab] = useState<Tab>('upload')
    const [dragOver, setDragOver] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [assetName, setAssetName] = useState('')
    const [environment, setEnv] = useState('production')
    const [assetType, setAssetType] = useState('server')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<SyncResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [unpinnedCount, setUnpinnedCount] = useState<number>(0)

    function reset() {
        setFile(null)
        setAssetName('')
        setResult(null)
        setError(null)
        setLoading(false)
    }

    function handleClose() {
        reset()
        onClose()
    }

    function handleFile(f: File) {
        setFile(f)
        setError(null)
        // Auto-fill asset name from filename if blank
        if (!assetName) {
            setAssetName(f.name.split('.')[0].replace(/[-_]/g, ' '))
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragOver(false)
        const dropped = e.dataTransfer.files[0]
        if (dropped) handleFile(dropped)
    }

    async function handleSubmit() {
        if (!assetName.trim()) {
            setError('Asset name is required.')
            return
        }
        if (tab === 'upload' && !file) {
            setError('Please select a manifest file.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const form = new FormData()
            form.append('asset_name', assetName.trim())
            form.append('environment', environment)
            form.append('asset_type', assetType)
            if (file) form.append('manifest', file)

            const { data } = await api.post('/api/ingestion/sync/', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            setResult(data)
            setUnpinnedCount(data.unpinned_count || 0)
            // Invalidate so the asset table refreshes
            queryClient.invalidateQueries({ queryKey: ['assets'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { detail?: string } } })
                    ?.response?.data?.detail ?? 'Sync failed. Please try again.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-lg bg-surface-raised border border-surface-border rounded-xl shadow-2xl z-10"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">Sync asset</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Add packages to scan for vulnerabilities
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-surface-overlay transition-colors"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Success state */}
                <AnimatePresence mode="wait">
                    {result ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-5 py-8 text-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-green-950 border border-green-800 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={22} className="text-green-400" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-100 mb-1">
                                Scan queued for {result.asset_name}
                            </h3>
                            <p className="text-sm text-slate-400 mb-1">
                                {result.packages_found} packages found
                                {result.packages_new > 0 && ` · ${result.packages_new} new`}
                            </p>
                            {unpinnedCount > 0 && (
                                <div className="flex items-start gap-2 mt-3 p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg text-left">
                                    <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-xs text-amber-300">
                                        <span className="font-medium">{unpinnedCount} package{unpinnedCount !== 1 ? 's' : ''}</span> skipped — version not pinned.
                                        <span className="block text-amber-400/80 mt-0.5">
                                            Use a lock file (e.g. package-lock.json, Pipfile.lock) or pin versions with == for accurate vulnerability scanning.
                                        </span>
                                    </div>
                                </div>
                            )}
                            <p className="text-xs text-slate-500 mb-6">
                                Vulnerability results will appear on your dashboard via live update.
                            </p>
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => { reset(); setTab('upload') }}
                                    className="text-sm px-4 py-2 rounded-lg border border-surface-border text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
                                >
                                    Sync another
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="text-sm px-4 py-2 rounded-lg bg-accent hover:bg-indigo-400 text-white transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="form" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
                            {/* Tabs */}
                            <div className="flex border-b border-surface-border px-5">
                                {([
                                    { id: 'upload', label: 'Upload manifest', icon: Upload },
                                    { id: 'agent', label: 'Agent install', icon: Cpu },
                                    { id: 'ci', label: 'CI/CD', icon: Terminal },
                                ] as { id: Tab; label: string; icon: React.FC<{ size: number }> }[]).map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => setTab(id)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-3 text-xs border-b-2 transition-colors',
                                            tab === id
                                                ? 'border-accent text-accent'
                                                : 'border-transparent text-slate-500 hover:text-slate-300'
                                        )}
                                    >
                                        <Icon size={13} />
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div className="px-5 py-5 space-y-4">
                                {/* Upload tab */}
                                {tab === 'upload' && (
                                    <>
                                        {/* Drop zone */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            onDrop={handleDrop}
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                            onDragLeave={() => setDragOver(false)}
                                            className={cn(
                                                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                                                dragOver
                                                    ? 'border-accent bg-accent/5'
                                                    : file
                                                        ? 'border-green-700 bg-green-950/30'
                                                        : 'border-surface-border hover:border-slate-600 hover:bg-surface-overlay'
                                            )}
                                        >
                                            {file ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <FileText size={16} className="text-green-400" />
                                                    <span className="text-sm text-green-400 font-medium">{file.name}</span>
                                                    <span className="text-xs text-slate-500">
                                                        ({(file.size / 1024).toFixed(1)} KB)
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload size={20} className="mx-auto text-slate-500 mb-2" />
                                                    <p className="text-sm text-slate-400">
                                                        Drop your manifest here or{' '}
                                                        <span className="text-accent underline underline-offset-2">browse</span>
                                                    </p>
                                                    <p className="text-xs text-slate-600 mt-1">
                                                        {SUPPORTED_FILES.join(', ')}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            accept=".txt,.json,.mod,.xml,.lock,.toml"
                                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                        />
                                    </>
                                )}

                                {/* Agent tab */}
                                {tab === 'agent' && (
                                    <div className="space-y-3">
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Run this on your server. The agent will detect installed packages
                                            and push them to Sentinel automatically.
                                        </p>
                                        <div className="bg-surface-base rounded-lg border border-surface-border p-3">
                                            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Linux / Ubuntu</p>
                                            <code className="text-xs text-green-400 font-mono block leading-relaxed">
                                                curl -sSL https://your-sentinel-domain.dev/agent/install.sh \<br />
                                                {'  '}| sudo bash -s -- \<br />
                                                {'  '}--api-key=YOUR_API_KEY \<br />
                                                {'  '}--asset="Web Server 01"
                                            </code>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            The agent runs as a systemd service and syncs every 6 hours.
                                            Generate an API key in Settings → API Keys.
                                        </p>
                                    </div>
                                )}

                                {/* CI tab */}
                                {tab === 'ci' && (
                                    <div className="space-y-3">
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Add this step to your pipeline. Sentinel will scan on every deploy.
                                        </p>
                                        <div className="bg-surface-base rounded-lg border border-surface-border p-3">
                                            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">GitHub Actions</p>
                                            <code className="text-xs text-green-400 font-mono block leading-relaxed whitespace-pre">
                                                {`- name: Sentinel security scan
  uses: sentinel-security/scan-action@v1
  with:
    api-key: \${{ secrets.SENTINEL_API_KEY }}
    asset-name: \${{ github.repository }}
    manifest: requirements.txt`}
                                            </code>
                                        </div>
                                        <div className="bg-surface-base rounded-lg border border-surface-border p-3">
                                            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">GitLab CI</p>
                                            <code className="text-xs text-green-400 font-mono block leading-relaxed whitespace-pre">
                                                {`sentinel-scan:
  stage: test
  script:
    - pip install sentinel-cli
    - sentinel scan
        --api-key=$SENTINEL_API_KEY
        --asset="$CI_PROJECT_NAME"`}
                                            </code>
                                        </div>
                                    </div>
                                )}

                                {/* Asset config — shown on upload and agent tabs */}
                                {tab !== 'ci' && (
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <div className="col-span-2">
                                            <label className="block text-xs text-slate-400 mb-1.5">
                                                Asset name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={assetName}
                                                onChange={(e) => setAssetName(e.target.value)}
                                                placeholder="e.g. Web Server 01"
                                                className={cn(
                                                    'w-full bg-surface-overlay border rounded-lg px-3 py-2',
                                                    'text-sm text-slate-200 placeholder:text-slate-600',
                                                    'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent/50',
                                                    'border-surface-border transition-colors'
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1.5">Environment</label>
                                            <select
                                                value={environment}
                                                onChange={(e) => setEnv(e.target.value)}
                                                className="w-full bg-surface-overlay border border-surface-border rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-accent"
                                            >
                                                <option value="production">Production</option>
                                                <option value="staging">Staging</option>
                                                <option value="development">Development</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1.5">Asset type</label>
                                            <select
                                                value={assetType}
                                                onChange={(e) => setAssetType(e.target.value)}
                                                className="w-full bg-surface-overlay border border-surface-border rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-accent"
                                            >
                                                <option value="server">Server</option>
                                                <option value="container">Container</option>
                                                <option value="database">Database</option>
                                                <option value="endpoint">Endpoint</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Error */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-start gap-2 text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2"
                                        >
                                            <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer */}
                            {tab !== 'ci' && (
                                <div className="px-5 pb-5">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !assetName.trim() || (tab === 'upload' && !file)}
                                        className={cn(
                                            'w-full flex items-center justify-center gap-2',
                                            'bg-accent hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed',
                                            'text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors'
                                        )}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />
                                                Uploading and scanning…
                                            </>
                                        ) : (
                                            <>
                                                {tab === 'upload' ? 'Upload and scan' : 'Register agent'}
                                                <ChevronRight size={14} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
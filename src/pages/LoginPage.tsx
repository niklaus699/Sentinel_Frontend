import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Eye, EyeOff, Loader2,} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, setTokens, setUser } = useAuthStore()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  if (isAuthenticated) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data } = await api.post('/api/auth/login/', { email, password })
      setTokens(data.access, data.refresh)
      setUser(data.user)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string; non_field_errors?: string[] } } })
          ?.response?.data?.non_field_errors?.[0] ??
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Invalid credentials. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#6366F1 1px, transparent 1px), linear-gradient(90deg, #6366F1 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        {/* Logo mark */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
            <ShieldCheck size={16} className="text-accent" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-100">Sentinel</span>
        </div>

        <div className="bg-surface-raised border border-surface-border rounded-xl p-6">
          <h1 className="text-base font-semibold text-slate-100 mb-1">Sign in</h1>
          <p className="text-sm text-slate-500 mb-6">
            Enter your organization credentials
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={cn(
                  'w-full bg-surface-overlay border rounded-lg px-3 py-2',
                  'text-sm text-slate-200 placeholder:text-slate-600',
                  'focus:outline-none focus:ring-1 transition-colors',
                  error
                    ? 'border-red-800 focus:ring-red-700'
                    : 'border-surface-border focus:ring-accent focus:border-accent/50'
                )}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full bg-surface-overlay border rounded-lg px-3 py-2 pr-9',
                    'text-sm text-slate-200 placeholder:text-slate-600',
                    'focus:outline-none focus:ring-1 transition-colors',
                    error
                      ? 'border-red-800 focus:ring-red-700'
                      : 'border-surface-border focus:ring-accent focus:border-accent/50'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'bg-accent hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed',
                'text-white text-sm font-medium rounded-lg px-4 py-2.5',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                'focus:ring-offset-surface-raised'
              )}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

    {/* Footer Section */}
    <footer className="mt-8 text-center">
      <div className="flex items-center justify-center gap-x-3 text-sm">
        <span className="text-slate-500">Don't have an account?</span>
        <Link
          to="/register"
          className={cn(
            "font-medium text-accent hover:text-indigo-400",
            "transition-all duration-200 underline-offset-4 hover:underline",
            "flex items-center gap-1" // Added for a tiny bit of extra visual "pop"
          )}
        >
          Create a workspace
        </Link>
      </div>

      {/* Subtle secondary links for a truly professional feel */}
      <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-surface-border/50">
        <a href="#" className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">
          Privacy Policy
        </a>
        <div className="w-1 h-1 rounded-full bg-slate-800" />
        <a href="#" className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">
          Terms of Service
        </a>
      </div>
    </footer>
      </motion.div>
    </div>
  )
}
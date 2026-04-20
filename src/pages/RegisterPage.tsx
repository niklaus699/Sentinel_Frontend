import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

// Password strength — simple, visual, honest
function getPasswordStrength(pw: string): {
  score: number      // 0–4
  label: string
  color: string
} {
  if (!pw) return { score: 0, label: '', color: '' }

  let score = 0
  if (pw.length >= 8)                    score++
  if (pw.length >= 12)                   score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw))                  score++
  if (/[^A-Za-z0-9]/.test(pw))          score++

  // Clamp to 4
  score = Math.min(score, 4)

  const map = [
    { label: '',          color: '' },
    { label: 'Weak',      color: 'bg-red-500' },
    { label: 'Fair',      color: 'bg-orange-500' },
    { label: 'Good',      color: 'bg-amber-400' },
    { label: 'Strong',    color: 'bg-green-400' },
  ]

  return { score, ...map[score] }
}

interface FieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-400 mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated, setTokens, setUser } = useAuthStore()

  const [orgName,   setOrgName]   = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Field-level errors from the API
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const strength = getPasswordStrength(password)
  const passwordsMatch = confirm.length > 0 && password === confirm

  if (isAuthenticated) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGlobalError(null)
    setFieldErrors({})

    // Client-side guard — the API enforces these too
    if (password !== confirm) {
      setFieldErrors({ confirm_password: 'Passwords do not match.' })
      return
    }
    if (strength.score < 2) {
      setFieldErrors({ password: 'Please choose a stronger password.' })
      return
    }

    setLoading(true)

    try {
      const { data } = await api.post('/api/auth/register/', {
        organization_name: orgName.trim(),
        email: email.toLowerCase().trim(),
        password,
        confirm_password: confirm,
      })

      setTokens(data.access, data.refresh)
      setUser(data.user)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const errData = (err as {
        response?: { data?: Record<string, string | string[]> }
      })?.response?.data

      if (errData) {
        // Map DRF field errors to our fieldErrors state
        const mapped: Record<string, string> = {}
        let hasFieldError = false

        for (const [key, val] of Object.entries(errData)) {
          if (key === 'non_field_errors' || key === 'detail') {
            setGlobalError(Array.isArray(val) ? val[0] : String(val))
          } else {
            mapped[key] = Array.isArray(val) ? val[0] : String(val)
            hasFieldError = true
          }
        }

        if (hasFieldError) setFieldErrors(mapped)
        if (!hasFieldError && !errData['non_field_errors'] && !errData['detail']) {
          setGlobalError('Registration failed. Please check your details.')
        }
      } else {
        setGlobalError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4 py-12">
      {/* Subtle grid */}
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
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
            <ShieldCheck size={16} className="text-accent" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-100">
            Sentinel
          </span>
        </div>

        <div className="bg-surface-raised border border-surface-border rounded-xl p-6">
          <h1 className="text-base font-semibold text-slate-100 mb-1">
            Create your workspace
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            You'll be the owner and can invite your team later.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Organization name */}
            <Field
              label="Organization name"
              error={fieldErrors['organization_name']}
            >
              <input
                type="text"
                autoComplete="organization"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Acme Security"
                className={cn(
                  'w-full bg-surface-overlay border rounded-lg px-3 py-2',
                  'text-sm text-slate-200 placeholder:text-slate-600',
                  'focus:outline-none focus:ring-1 transition-colors',
                  fieldErrors['organization_name']
                    ? 'border-red-800 focus:ring-red-700'
                    : 'border-surface-border focus:ring-accent focus:border-accent/50'
                )}
              />
            </Field>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-surface-border" />
              <span className="text-xs text-slate-600">Your account</span>
              <div className="flex-1 h-px bg-surface-border" />
            </div>

            {/* Email */}
            <Field label="Work email" error={fieldErrors['email']}>
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
                  fieldErrors['email']
                    ? 'border-red-800 focus:ring-red-700'
                    : 'border-surface-border focus:ring-accent focus:border-accent/50'
                )}
              />
            </Field>

            {/* Password */}
            <Field label="Password" error={fieldErrors['password']}>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className={cn(
                    'w-full bg-surface-overlay border rounded-lg px-3 py-2 pr-9',
                    'text-sm text-slate-200 placeholder:text-slate-600',
                    'focus:outline-none focus:ring-1 transition-colors',
                    fieldErrors['password']
                      ? 'border-red-800 focus:ring-red-700'
                      : 'border-surface-border focus:ring-accent focus:border-accent/50'
                  )}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Password strength bar */}
              {password && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2"
                >
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-0.5 flex-1 rounded-full transition-all duration-300',
                          i < strength.score
                            ? strength.color
                            : 'bg-surface-border'
                        )}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs text-slate-500">
                      Strength:{' '}
                      <span className={cn(
                        strength.score <= 1 ? 'text-red-400' :
                        strength.score === 2 ? 'text-orange-400' :
                        strength.score === 3 ? 'text-amber-400' :
                        'text-green-400'
                      )}>
                        {strength.label}
                      </span>
                    </p>
                  )}
                </motion.div>
              )}
            </Field>

            {/* Confirm password */}
            <Field
              label="Confirm password"
              error={fieldErrors['confirm_password']}
            >
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className={cn(
                    'w-full bg-surface-overlay border rounded-lg px-3 py-2 pr-9',
                    'text-sm text-slate-200 placeholder:text-slate-600',
                    'focus:outline-none focus:ring-1 transition-colors',
                    fieldErrors['confirm_password']
                      ? 'border-red-800 focus:ring-red-700'
                      : passwordsMatch
                        ? 'border-green-800 focus:ring-green-700'
                        : 'border-surface-border focus:ring-accent focus:border-accent/50'
                  )}
                />
                {/* Live match indicator */}
                <AnimatePresence>
                  {passwordsMatch && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    >
                      <Check size={14} className="text-green-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Field>

            {/* Global error */}
            <AnimatePresence>
              {globalError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-400 bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2"
                >
                  {globalError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !orgName || !email || !password || !confirm}
              className={cn(
                'w-full flex items-center justify-center gap-2 mt-2',
                'bg-accent hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed',
                'text-white text-sm font-medium rounded-lg px-4 py-2.5',
                'transition-colors focus:outline-none focus:ring-2',
                'focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-raised'
              )}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating workspace…
                </>
              ) : (
                'Create workspace'
              )}
            </button>
          </form>
        </div>

        {/* Sign in link */}
        <p className="mt-4 text-center text-xs text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-slate-400 hover:text-slate-200 transition-colors underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
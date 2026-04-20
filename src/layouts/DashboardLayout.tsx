import { useEffect, useState } from 'react'
import { Outlet, Navigate, NavLink } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Server,
  ShieldAlert,
  BookOpen,
  Wifi,
  WifiOff,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useWSStore } from '@/stores/wsStore'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/assets', label: 'Assets', icon: Server },
  { to: '/findings', label: 'Findings', icon: ShieldAlert },
  { to: '/cves', label: 'CVE catalog', icon: BookOpen },
]

interface SidebarUser {
  email: string
  organization?: {
    name?: string
  }
}

interface SidebarContentProps {
  user: SidebarUser | null
  connected: boolean
  logout: () => void
  isMobile?: boolean
  onNavigate?: () => void
}

export function DashboardLayout() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { connect, disconnect, connected } = useWSStore()
  const queryClient = useQueryClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      disconnect()
      return
    }

    connect(queryClient)
    return () => disconnect()
  }, [connect, disconnect, isAuthenticated, queryClient])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen overflow-hidden bg-surface-base text-slate-200">
      <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-surface-border bg-surface-raised lg:flex">
        <SidebarContent user={user} connected={connected} logout={logout} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-surface-border bg-surface-raised/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2">
            <span className="text-accent text-lg">▲</span>
            <span className="font-semibold tracking-tight text-slate-200">Sentinel</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="-mr-2 p-2 text-slate-400 transition-colors hover:text-white"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-surface-border bg-surface-raised shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-surface-border/50 p-5">
                <div className="flex items-center gap-2">
                  <span className="text-accent text-lg">▲</span>
                  <span className="font-bold uppercase tracking-tighter text-slate-100">Sentinel</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={22} className="text-slate-500 transition-colors hover:text-slate-200" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <SidebarContent
                  user={user}
                  connected={connected}
                  logout={logout}
                  isMobile
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function SidebarContent({ user, connected, logout, isMobile = false, onNavigate }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      {!isMobile && (
        <div className="border-b border-surface-border px-4 py-5">
          <span className="text-sm font-semibold tracking-tight text-slate-200">
            <span className="text-accent">▲</span> Sentinel
          </span>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {user?.organization?.name || 'Workspace'}
          </p>
        </div>
      )}

      <nav className={cn('flex-1 space-y-0.5 px-2 py-4', isMobile && 'px-4 py-6')}>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all',
                isActive
                  ? 'bg-accent/10 font-medium text-accent'
                  : 'text-slate-400 hover:bg-surface-overlay hover:text-slate-200'
              )
            }
          >
            <Icon size={isMobile ? 18 : 15} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className={cn('border-t border-surface-border px-4 py-4', isMobile && 'p-6')}>
        <div className="mb-3 flex items-center gap-2">
          {connected
            ? <Wifi size={12} className="text-green-400" />
            : <WifiOff size={12} className="text-red-400" />}
          <span className="text-xs text-slate-500">
            {connected ? 'System Live' : 'Reconnecting...'}
          </span>
        </div>

        <p className="mb-1 truncate text-xs font-medium text-slate-400">{user?.email}</p>

        <button
          onClick={logout}
          className="flex items-center gap-2 py-1 text-xs text-slate-500 transition-colors hover:text-red-400"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </div>
  )
}

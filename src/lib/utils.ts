import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Shadcn/ui's cn() helper — merges Tailwind classes safely
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Severity helpers used across multiple components
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'none'

export function severityColor(severity: Severity): string {
  const map: Record<Severity, string> = {
    critical: 'text-red-400',
    high:     'text-orange-400',
    medium:   'text-amber-400',
    low:      'text-green-400',
    none:     'text-gray-500',
  }
  return map[severity] ?? map.none
}

export function severityBadgeClass(severity: Severity): string {
  const map: Record<Severity, string> = {
    critical: 'bg-severity-critical text-red-300   border-red-800',
    high:     'bg-severity-high     text-orange-300 border-orange-800',
    medium:   'bg-severity-medium   text-amber-300  border-amber-800',
    low:      'bg-severity-low      text-green-300  border-green-800',
    none:     'bg-gray-900          text-gray-400   border-gray-700',
  }
  return map[severity] ?? map.none
}

export function riskScoreColor(score: number): string {
  if (score >= 90) return 'text-red-400'
  if (score >= 70) return 'text-orange-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-green-400'
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffHours < 1)  return 'just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30)  return `${diffDays}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
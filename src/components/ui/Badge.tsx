import { cn, severityBadgeClass, type Severity } from '@/lib/utils'

interface BadgeProps {
  severity: Severity
  className?: string
}

export function SeverityBadge({ severity, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono',
        'border uppercase tracking-wider',
        severityBadgeClass(severity),
        className
      )}
    >
      {severity}
    </span>
  )
}
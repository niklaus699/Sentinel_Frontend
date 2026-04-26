import { cn } from '@/lib/utils'

interface CardProps {
  children?: React.ReactNode
  className?: string
  glow?: boolean
}

export function Card({ children, className, glow = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-surface-border bg-surface-raised p-4',
        glow && 'shadow-[0_0_0_1px_rgba(99,102,241,0.3)]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4',
      className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-medium uppercase tracking-wider text-slate-400">
      {children}
    </h3>
  )
}

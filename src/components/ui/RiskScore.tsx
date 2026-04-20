import { cn, riskScoreColor } from '@/lib/utils'
import { motion } from 'framer-motion'

interface RiskScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export function RiskScore({ score, size = 'md', animated = false }: RiskScoreProps) {
  const color = riskScoreColor(score)

  const sizeClass = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-3xl',
  }[size]

  const content = (
    <span className={cn('font-mono font-medium tabular-nums', color, sizeClass)}>
      {score}
    </span>
  )

  if (!animated) return content

  return (
    <motion.span
      key={score}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {content}
    </motion.span>
  )
}
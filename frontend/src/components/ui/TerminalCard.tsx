import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  glow?: boolean
  hover?: boolean
  animate?: boolean
  delay?: number
}

export function TerminalCard({ children, className = '', glow = false, hover = false, animate = true, delay = 0 }: Props) {
  const baseClass = `terminal-card p-6 ${glow ? 'glow-cyan' : ''} ${hover ? 'terminal-card-hover' : ''} ${className}`

  if (!animate) {
    return <div className={baseClass}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={baseClass}
    >
      {children}
    </motion.div>
  )
}

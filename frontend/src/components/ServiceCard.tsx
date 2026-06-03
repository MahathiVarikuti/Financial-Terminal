import { motion } from 'framer-motion'
import { useState, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { TerminalCard } from './ui/TerminalCard'

interface ServiceCardProps {
  title: string
  description: string
  href: string
  icon: ReactNode
  categoryText: string
  categoryColor: 'cyan' | 'blue' | 'amber' | 'red'
  delay?: number
}

const catColors = {
  cyan:  'text-cyan-400 border-cyan-400/30',
  blue:  'text-blue-400 border-blue-400/30',
  amber: 'text-amber-400 border-amber-400/30',
  red:   'text-rose-400 border-rose-400/30',
}

export function ServiceCard({ title, description, href, icon, categoryText, categoryColor, delay = 0 }: ServiceCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div 
      className="relative w-full h-64 perspective-1000 group cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <Link to={href} className="absolute inset-0 backface-hidden w-full h-full">
          <TerminalCard className="w-full h-full flex flex-col justify-between" glow={false} hover={false} delay={delay}>
            <div className="flex justify-between items-start">
              <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wider border ${catColors[categoryColor]}`}>
                {categoryText}
              </span>
              <span className="text-cyan-500 font-mono text-2xl">
                {icon}
              </span>
            </div>
            
            <div className="mt-auto">
              <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
                {title}
              </h3>
              <p className="text-cyan-600 text-xs mt-1 font-semibold tracking-wider flex items-center gap-1">
                hover to view details <span className="animate-pulse">_</span>
              </p>
            </div>
          </TerminalCard>
        </Link>

        {/* Back */}
        <Link to={href} className="absolute inset-0 backface-hidden w-full h-full" style={{ transform: 'rotateY(180deg)' }}>
          <TerminalCard className="w-full h-full border-cyan-500 bg-cyan-900/10" glow={true} animate={false}>
            <div className="flex flex-col h-full justify-center">
              <h4 className="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-2 border-b border-cyan-500/30 pb-2">
                DESCRIPTION
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                {description}
              </p>
              <div className="mt-auto flex items-center justify-end">
                <span className="text-cyan-500 font-bold uppercase text-xs tracking-widest hover:text-cyan-400">
                  Execute {'>'}
                </span>
              </div>
            </div>
          </TerminalCard>
        </Link>

      </motion.div>
    </div>
  )
}

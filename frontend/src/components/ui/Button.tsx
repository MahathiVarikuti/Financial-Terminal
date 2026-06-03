import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  fullWidth?: boolean
}

const variants = {
  primary:   'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:bg-cyan-400',
  secondary: 'bg-transparent text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10 hover:border-cyan-400',
  danger:    'bg-transparent text-rose-500 border border-rose-500/50 hover:bg-rose-500/10 hover:border-rose-400 hover:text-rose-400',
  ghost:     'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-none',
  md: 'px-5 py-2.5 text-sm rounded-none tracking-wide',
  lg: 'px-7 py-3 text-base rounded-none tracking-widest font-bold',
}

export function Button({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, onClick, type = 'button', className = '', fullWidth = false,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={`
        ${variants[variant]} ${sizes[size]}
        font-medium transition-all duration-200 inline-flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      )}
      {children}
    </motion.button>
  )
}

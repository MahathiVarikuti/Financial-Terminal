import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Activity, Cpu, PieChart, Zap, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/',             label: 'Dashboard',   icon: Zap        },
  { path: '/economics',    label: 'Economics',   icon: TrendingUp },
  { path: '/monte-carlo',  label: 'Monte Carlo', icon: Activity   },
  { path: '/optimizer',    label: 'Optimizer',   icon: Cpu        },
  { path: '/capital',      label: 'Capital',     icon: PieChart   },
]

export default function NavBar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 terminal-card border-x-0 border-t-0 border-b border-cyan-500/30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="font-bold text-slate-100 tracking-widest uppercase">
            fin<span className="text-cyan-500">term</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-widest font-bold transition-all duration-200 border
                  ${active
                    ? 'bg-cyan-900/20 text-cyan-400 border-cyan-500/50'
                    : 'border-transparent text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-900/10'}
                `}
              >
                {label}
              </Link>
            )
          })}
        </nav>



        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-900/20 transition-all border border-transparent hover:border-cyan-500/30"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden md:hidden border-t border-cyan-500/30 bg-[#020205]"
          >
            <nav className="px-4 py-3 flex flex-col gap-1">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const active = pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 text-xs uppercase tracking-widest font-bold transition-all border
                      ${active ? 'bg-cyan-900/20 text-cyan-400 border-cyan-500/50' : 'border-transparent text-slate-500 hover:text-cyan-400'}
                    `}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

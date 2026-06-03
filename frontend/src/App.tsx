import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import NavBar from './components/NavBar'
import Dashboard  from './pages/Dashboard'
import Economics  from './pages/Economics'
import MonteCarlo from './pages/MonteCarlo'
import Optimizer  from './pages/Optimizer'
import Capital    from './pages/Capital'

const pageVariants = {
  initial: { opacity: 0, x: 30  },
  animate: { opacity: 1, x: 0   },
  exit:    { opacity: 0, x: -30 },
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.22, ease: 'easeInOut' }}
      >
        <Routes location={location}>
          <Route path="/"             element={<Dashboard  />} />
          <Route path="/economics"    element={<Economics  />} />
          <Route path="/monte-carlo"  element={<MonteCarlo />} />
          <Route path="/optimizer"    element={<Optimizer  />} />
          <Route path="/capital"      element={<Capital    />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen" style={{ background: '#07070f' }}>
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <AnimatedRoutes />
        </main>
      </div>
    </HashRouter>
  )
}

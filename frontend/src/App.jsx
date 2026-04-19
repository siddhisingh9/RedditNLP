import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Overview     from './pages/Overview.jsx'
import Classifier   from './pages/Classifier.jsx'
import WordExplorer from './pages/WordExplorer.jsx'
import EDADashboard from './pages/EDADashboard.jsx'

const NAV = [
  { to: '/',             label: 'Overview'      },
  { to: '/classifier',   label: 'Classifier'    },
  { to: '/word-explorer',label: 'Word Explorer' },
  { to: '/eda',          label: 'EDA Dashboard' },
]

function Nav() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1e1e1e',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2.5rem', height: '56px',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem',
        color: 'var(--accent)', letterSpacing: '-0.02em'
      }}>
        r/nlp
      </span>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {NAV.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
            fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 500,
            padding: '0.4rem 0.9rem', borderRadius: '6px', textDecoration: 'none',
            transition: 'all 0.2s',
            background: isActive ? 'var(--accent)' : 'transparent',
            color: isActive ? 'white' : 'var(--muted)',
            border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
          })}>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        style={{ paddingTop: '56px', minHeight: '100vh' }}
      >
        <Routes location={location}>
          <Route path="/"              element={<Overview />}     />
          <Route path="/classifier"    element={<Classifier />}   />
          <Route path="/word-explorer" element={<WordExplorer />} />
          <Route path="/eda"           element={<EDADashboard />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

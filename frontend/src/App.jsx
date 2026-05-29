import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home'
import Join from './pages/Join'
import CalendarPage from './pages/CalendarPage'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
}

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

function RequireTeam({ children }) {
  const teamCode = JSON.parse(localStorage.getItem('team_code'))
  if (!teamCode) return <Navigate to="/" />
  return children
}

function RequireMember({ children }) {
  const teamCode = JSON.parse(localStorage.getItem('team_code'))
  const memberId = JSON.parse(localStorage.getItem('member_id'))
  if (!teamCode) return <Navigate to="/" />
  if (!memberId) return <Navigate to="/join" />
  return children
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/join" element={<RequireTeam><PageWrapper><Join /></PageWrapper></RequireTeam>} />
        <Route path="/calendar" element={<RequireMember><PageWrapper><CalendarPage /></PageWrapper></RequireMember>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

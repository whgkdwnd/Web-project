import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Join from './pages/Join'
import CalendarPage from './pages/CalendarPage'

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<RequireTeam><Join /></RequireTeam>} />
        <Route path="/calendar" element={<RequireMember><CalendarPage /></RequireMember>} />
      </Routes>
    </BrowserRouter>
  )
}

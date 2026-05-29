import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { AnimatePresence, motion } from 'framer-motion'
import MonthlyView from '../components/MonthlyView'
import WeeklyView from '../components/WeeklyView'
import EventPanel from '../components/EventPanel'
import { eventApi, memberApi } from '../api/client'
import { useLocalStorage, useSessionStorage } from '../hooks/useStorage'

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 20 : -20 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -20 : 20 }),
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const ls = useLocalStorage()
  const ss = useSessionStorage()
  const teamCode = ls.get('team_code')

  const [view, setView] = useState(ss.get('current_view') || 'monthly')
  const [direction, setDirection] = useState(0)
  const [current, setCurrent] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState(
    ss.get('selected_date') ? dayjs(ss.get('selected_date')) : dayjs()
  )
  const [events, setEvents] = useState([])
  const [members, setMembers] = useState([])
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(teamCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleLeave() {
    ls.remove('team_code')
    ls.remove('member_id')
    ls.remove('member_name')
    ls.remove('member_color')
    navigate('/', { replace: true })
  }

  useEffect(() => {
    memberApi.list(teamCode).then(res => setMembers(res.data))
  }, [teamCode])

  useEffect(() => {
    eventApi.list(teamCode, current.year(), current.month() + 1)
      .then(res => setEvents(res.data))
  }, [teamCode, current])

  function handleViewChange(v) {
    setDirection(v === 'weekly' ? 1 : -1)
    setView(v)
    ss.set('current_view', v)
  }

  function handleSelectDate(date) {
    setSelectedDate(date)
    ss.set('selected_date', date.format('YYYY-MM-DD'))
  }

  async function handleEventSaved() {
    const res = await eventApi.list(teamCode, current.year(), current.month() + 1)
    setEvents(res.data)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold text-[#1d1d1f] tracking-[-0.374px]">팀 캘린더</h1>
        <div className="flex gap-1 bg-[#f5f5f7] p-0.5 rounded-full">
          {['monthly', 'weekly'].map(v => (
            <motion.button key={v} onClick={() => handleViewChange(v)}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                ${view === v ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#6e6e73]'}`}>
              {v === 'monthly' ? '월간' : '주간'}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <motion.button
          onClick={handleCopy}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5f5f7] border border-[#e0e0e0] text-sm text-[#6e6e73] hover:bg-white transition-colors">
          <span className="font-mono font-medium text-[#1d1d1f] tracking-widest">{teamCode}</span>
          <span className="text-xs">{copied ? '✓ 복사됨' : '복사'}</span>
        </motion.button>
        <motion.button
          onClick={handleLeave}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="text-xs text-[#6e6e73] px-3 py-1.5 rounded-full hover:bg-[#f5f5f7] transition-colors">
          팀 변경
        </motion.button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          onClick={() => setCurrent(c => c.subtract(1, view === 'monthly' ? 'month' : 'week'))}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e0e0e0] text-[#1d1d1f] transition-colors">
          ‹
        </motion.button>
        <span className="font-semibold text-[#1d1d1f] tracking-[-0.374px] flex-1 text-center">
          {view === 'monthly'
            ? current.format('YYYY년 MM월')
            : `${current.startOf('week').format('MM/DD')} ~ ${current.endOf('week').format('MM/DD')}`}
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          onClick={() => setCurrent(c => c.add(1, view === 'monthly' ? 'month' : 'week'))}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e0e0e0] text-[#1d1d1f] transition-colors">
          ›
        </motion.button>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {view === 'monthly' ? (
          <motion.div key="monthly" custom={direction}
            variants={slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}>
            <MonthlyView current={current} events={events} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
          </motion.div>
        ) : (
          <motion.div key="weekly" custom={direction}
            variants={slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}>
            <WeeklyView current={current} events={events} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex gap-3 flex-wrap">
        {members.map(m => (
          <span key={m.id} className="flex items-center gap-1.5 text-sm text-[#1d1d1f]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
            {m.name}
          </span>
        ))}
      </div>

      <EventPanel
        teamCode={teamCode}
        selectedDate={selectedDate}
        events={events.filter(e => dayjs(e.start_at).format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD'))}
        memberId={ls.get('member_id')}
        memberColor={ls.get('member_color')}
        onSaved={handleEventSaved}
      />
    </div>
  )
}

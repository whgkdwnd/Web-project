import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import MonthlyView from '../components/MonthlyView'
import WeeklyView from '../components/WeeklyView'
import EventPanel from '../components/EventPanel'
import { eventApi, memberApi } from '../api/client'
import { useLocalStorage, useSessionStorage } from '../hooks/useStorage'

export default function CalendarPage() {
  const ls = useLocalStorage()
  const ss = useSessionStorage()
  const teamCode = ls.get('team_code')

  const [view, setView] = useState(ss.get('current_view') || 'monthly')
  const [current, setCurrent] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState(
    ss.get('selected_date') ? dayjs(ss.get('selected_date')) : dayjs()
  )
  const [events, setEvents] = useState([])
  const [members, setMembers] = useState([])

  useEffect(() => {
    memberApi.list(teamCode).then(res => setMembers(res.data))
  }, [teamCode])

  useEffect(() => {
    eventApi.list(teamCode, current.year(), current.month() + 1)
      .then(res => setEvents(res.data))
  }, [teamCode, current])

  function handleViewChange(v) {
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">팀 캘린더</h1>
        <div className="flex gap-2">
          {['monthly', 'weekly'].map(v => (
            <button key={v} onClick={() => handleViewChange(v)}
              className={`px-3 py-1 rounded text-sm ${view === v ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
              {v === 'monthly' ? '월간' : '주간'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setCurrent(c => c.subtract(1, view === 'monthly' ? 'month' : 'week'))}
          className="px-2 py-1 text-gray-600">{'<'}</button>
        <span className="font-semibold">
          {view === 'monthly' ? current.format('YYYY년 MM월') : `${current.startOf('week').format('MM/DD')} ~ ${current.endOf('week').format('MM/DD')}`}
        </span>
        <button onClick={() => setCurrent(c => c.add(1, view === 'monthly' ? 'month' : 'week'))}
          className="px-2 py-1 text-gray-600">{'>'}</button>
      </div>
      {view === 'monthly'
        ? <MonthlyView current={current} events={events} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
        : <WeeklyView current={current} events={events} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
      }
      <div className="mt-4 flex gap-2 flex-wrap">
        {members.map(m => (
          <span key={m.id} className="flex items-center gap-1 text-sm">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: m.color }} />
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

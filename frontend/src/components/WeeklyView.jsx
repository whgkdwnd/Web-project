import dayjs from 'dayjs'

export default function WeeklyView({ current, events, selectedDate, onSelectDate }) {
  const weekStart = current.startOf('week')
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'))

  function getDayEvents(date) {
    return events.filter(e => dayjs(e.start_at).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'))
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="grid grid-cols-7">
        {days.map(date => {
          const dayEvents = getDayEvents(date)
          const isSelected = date.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
          const isToday = date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
          return (
            <div key={date.format()} onClick={() => onSelectDate(date)}
              className={`p-2 border-r min-h-[100px] cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
              <div className="text-xs text-gray-500 mb-1">{['일','월','화','수','목','금','토'][date.day()]}</div>
              <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full
                ${isToday ? 'bg-blue-500 text-white' : 'text-gray-700'}`}>
                {date.date()}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.map(e => (
                  <div key={e.id} className="text-xs truncate rounded px-1 py-0.5"
                    style={{ backgroundColor: e.member.color + '33', borderLeft: `2px solid ${e.member.color}` }}>
                    {e.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

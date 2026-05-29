import dayjs from 'dayjs'

export default function MonthlyView({ current, events, selectedDate, onSelectDate }) {
  const start = current.startOf('month')
  const days = []

  for (let i = 0; i < start.day(); i++) {
    days.push(null)
  }
  for (let i = 1; i <= current.daysInMonth(); i++) {
    days.push(current.date(i))
  }

  function getDayEvents(date) {
    if (!date) return []
    return events.filter(e => dayjs(e.start_at).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'))
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="grid grid-cols-7 bg-gray-100">
        {['일','월','화','수','목','금','토'].map(d => (
          <div key={d} className="text-center text-xs py-2 text-gray-500 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          const dayEvents = getDayEvents(date)
          const isSelected = date && date.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
          const isToday = date && date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
          return (
            <div key={i} onClick={() => date && onSelectDate(date)}
              className={`min-h-[60px] p-1 border-t border-r cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
              {date && (
                <>
                  <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full mx-auto
                    ${isToday ? 'bg-blue-500 text-white' : 'text-gray-700'}`}>
                    {date.date()}
                  </span>
                  <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                    {dayEvents.slice(0, 3).map(e => (
                      <span key={e.id} className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: e.member.color }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

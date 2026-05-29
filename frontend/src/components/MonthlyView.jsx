import dayjs from 'dayjs'

export default function MonthlyView({ current, events, selectedDate, onSelectDate }) {
  const start = current.startOf('month')
  const days = []

  for (let i = 0; i < start.day(); i++) days.push(null)
  for (let i = 1; i <= current.daysInMonth(); i++) days.push(current.date(i))

  function getDayEvents(date) {
    if (!date) return []
    return events.filter(e => dayjs(e.start_at).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'))
  }

  return (
    <div className="bg-white rounded-[18px] border border-[#e0e0e0] overflow-hidden">
      <div className="grid grid-cols-7 border-b border-[#f0f0f0]">
        {['일','월','화','수','목','금','토'].map((d, i) => (
          <div key={d} className={`text-center text-xs py-2.5 font-medium
            ${i === 0 ? 'text-red-400' : i === 6 ? 'text-[#0066cc]' : 'text-[#6e6e73]'}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          const dayEvents = getDayEvents(date)
          const isSelected = date && date.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
          const isToday = date && date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
          const isSun = date && date.day() === 0
          const isSat = date && date.day() === 6
          return (
            <div key={i} onClick={() => date && onSelectDate(date)}
              className={`min-h-[60px] p-1 cursor-pointer transition-colors
                ${isSelected ? 'bg-[#f0f6ff]' : 'hover:bg-[#fafafa]'}
                ${i % 7 !== 6 ? 'border-r border-[#f0f0f0]' : ''}
                ${i >= 7 ? 'border-t border-[#f0f0f0]' : ''}`}>
              {date && (
                <>
                  <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full mx-auto font-medium
                    ${isToday ? 'bg-[#0066cc] text-white' : isSun ? 'text-red-400' : isSat ? 'text-[#0066cc]' : 'text-[#1d1d1f]'}`}>
                    {date.date()}
                  </span>
                  <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                    {dayEvents.slice(0, 3).map(e => (
                      <span key={e.id} className="w-1.5 h-1.5 rounded-full"
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

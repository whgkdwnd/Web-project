import dayjs from 'dayjs'

export default function WeeklyView({ current, events, selectedDate, onSelectDate }) {
  const weekStart = current.startOf('week')
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'))

  function getDayEvents(date) {
    return events.filter(e => dayjs(e.start_at).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'))
  }

  return (
    <div className="bg-white rounded-[18px] border border-[#e0e0e0] overflow-hidden">
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          const dayEvents = getDayEvents(date)
          const isSelected = date.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
          const isToday = date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
          const isSun = date.day() === 0
          const isSat = date.day() === 6
          return (
            <div key={date.format()} onClick={() => onSelectDate(date)}
              className={`p-2 min-h-[110px] cursor-pointer transition-colors
                ${isSelected ? 'bg-[#f0f6ff]' : 'hover:bg-[#fafafa]'}
                ${i < 6 ? 'border-r border-[#f0f0f0]' : ''}`}>
              <div className={`text-xs mb-1 font-medium
                ${isSun ? 'text-red-400' : isSat ? 'text-[#0066cc]' : 'text-[#6e6e73]'}`}>
                {['일','월','화','수','목','금','토'][date.day()]}
              </div>
              <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium
                ${isToday ? 'bg-[#0066cc] text-white' : 'text-[#1d1d1f]'}`}>
                {date.date()}
              </span>
              <div className="mt-1.5 space-y-0.5">
                {dayEvents.map(e => (
                  <div key={e.id} className="text-xs truncate rounded-md px-1.5 py-0.5 font-medium"
                    style={{
                      backgroundColor: e.member.color + '22',
                      color: e.member.color,
                      borderLeft: `2px solid ${e.member.color}`
                    }}>
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

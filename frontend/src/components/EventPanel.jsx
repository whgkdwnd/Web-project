import { useState } from 'react'
import dayjs from 'dayjs'
import { eventApi } from '../api/client'

export default function EventPanel({ teamCode, selectedDate, events, memberId, memberColor, onSaved }) {
  const [form, setForm] = useState(null)

  function openCreate() {
    const base = selectedDate.format('YYYY-MM-DDT09:00')
    setForm({ mode: 'create', data: { title: '', start_at: base, end_at: selectedDate.format('YYYY-MM-DDT10:00'), memo: '' } })
  }

  function openEdit(e) {
    setForm({ mode: 'edit', eventId: e.id, data: {
      title: e.title,
      start_at: dayjs(e.start_at).format('YYYY-MM-DDTHH:mm'),
      end_at: dayjs(e.end_at).format('YYYY-MM-DDTHH:mm'),
      memo: e.memo || ''
    }})
  }

  async function handleSubmit() {
    if (!form.data.title.trim()) return
    const payload = {
      ...form.data,
      member_id: memberId,
      start_at: new Date(form.data.start_at).toISOString(),
      end_at: new Date(form.data.end_at).toISOString(),
    }
    if (form.mode === 'create') {
      await eventApi.create(teamCode, payload)
    } else {
      await eventApi.update(teamCode, form.eventId, payload)
    }
    setForm(null)
    onSaved()
  }

  async function handleDelete(id) {
    await eventApi.delete(teamCode, id)
    onSaved()
  }

  return (
    <div className="mt-4 border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">{selectedDate.format('M월 D일')}</h3>
        <button onClick={openCreate}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg">
          + 추가
        </button>
      </div>
      {events.length === 0 && !form && (
        <p className="text-sm text-gray-400 text-center py-4">일정이 없습니다</p>
      )}
      <div className="space-y-2">
        {events.map(e => (
          <div key={e.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50">
            <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: e.member.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{e.title}</p>
              <p className="text-xs text-gray-400">
                {dayjs(e.start_at).format('HH:mm')} ~ {dayjs(e.end_at).format('HH:mm')} · {e.member.name}
              </p>
              {e.memo && <p className="text-xs text-gray-500 mt-0.5">{e.memo}</p>}
            </div>
            {e.member.id === memberId && (
              <div className="flex gap-1">
                <button onClick={() => openEdit(e)} className="text-xs text-blue-400">수정</button>
                <button onClick={() => handleDelete(e.id)} className="text-xs text-red-400">삭제</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {form && (
        <div className="mt-3 border-t pt-3 space-y-2">
          <input value={form.data.title} onChange={e => setForm(f => ({ ...f, data: { ...f.data, title: e.target.value } }))}
            placeholder="제목" className="w-full border rounded px-2 py-1 text-sm" />
          <div className="flex gap-2">
            <input type="datetime-local" value={form.data.start_at}
              onChange={e => setForm(f => ({ ...f, data: { ...f.data, start_at: e.target.value } }))}
              className="flex-1 border rounded px-2 py-1 text-sm" />
            <input type="datetime-local" value={form.data.end_at}
              onChange={e => setForm(f => ({ ...f, data: { ...f.data, end_at: e.target.value } }))}
              className="flex-1 border rounded px-2 py-1 text-sm" />
          </div>
          <textarea value={form.data.memo} onChange={e => setForm(f => ({ ...f, data: { ...f.data, memo: e.target.value } }))}
            placeholder="메모 (선택)" rows={2}
            className="w-full border rounded px-2 py-1 text-sm resize-none" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setForm(null)} className="text-sm text-gray-500">취소</button>
            <button onClick={handleSubmit} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">
              {form.mode === 'create' ? '등록' : '저장'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

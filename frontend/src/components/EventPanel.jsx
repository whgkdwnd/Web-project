import { useState } from 'react'
import dayjs from 'dayjs'
import { AnimatePresence, motion } from 'framer-motion'
import { eventApi } from '../api/client'

const btn = { whileTap: { scale: 0.95 }, transition: { type: 'spring', stiffness: 400, damping: 17 } }

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
    <div className="mt-4 bg-white rounded-[18px] border border-[#e0e0e0] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#1d1d1f] tracking-[-0.374px]">
          {selectedDate.format('M월 D일')}
        </h3>
        <motion.button onClick={openCreate} {...btn}
          className="text-sm bg-[#0066cc] text-white px-4 py-1.5 rounded-full font-medium">
          + 추가
        </motion.button>
      </div>

      {events.length === 0 && !form && (
        <p className="text-sm text-[#6e6e73] text-center py-6">일정이 없습니다</p>
      )}

      <AnimatePresence>
        {events.map((e, i) => (
          <motion.div key={e.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-[#fafafa] transition-colors mb-1">
            <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: e.member.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-medium truncate text-[#1d1d1f]">{e.title}</p>
              <p className="text-xs text-[#6e6e73] mt-0.5">
                {dayjs(e.start_at).format('HH:mm')} ~ {dayjs(e.end_at).format('HH:mm')} · {e.member.name}
              </p>
              {e.memo && <p className="text-xs text-[#6e6e73] mt-0.5">{e.memo}</p>}
            </div>
            {e.member.id === memberId && (
              <div className="flex gap-2">
                <motion.button onClick={() => openEdit(e)} {...btn}
                  className="text-xs text-[#0066cc] font-medium">수정</motion.button>
                <motion.button onClick={() => handleDelete(e.id)} {...btn}
                  className="text-xs text-red-400 font-medium">삭제</motion.button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {form && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="border-t border-[#f0f0f0] pt-3 mt-2 space-y-2">
            <input value={form.data.title}
              onChange={e => setForm(f => ({ ...f, data: { ...f.data, title: e.target.value } }))}
              placeholder="제목"
              className="w-full border border-[#e0e0e0] rounded-xl px-3 py-2 text-[15px] text-[#1d1d1f] outline-none focus:border-[#0066cc] transition-colors" />
            <div className="flex gap-2">
              <input type="datetime-local" value={form.data.start_at}
                onChange={e => setForm(f => ({ ...f, data: { ...f.data, start_at: e.target.value } }))}
                className="flex-1 border border-[#e0e0e0] rounded-xl px-2 py-2 text-sm text-[#1d1d1f] outline-none focus:border-[#0066cc] transition-colors" />
              <input type="datetime-local" value={form.data.end_at}
                onChange={e => setForm(f => ({ ...f, data: { ...f.data, end_at: e.target.value } }))}
                className="flex-1 border border-[#e0e0e0] rounded-xl px-2 py-2 text-sm text-[#1d1d1f] outline-none focus:border-[#0066cc] transition-colors" />
            </div>
            <textarea value={form.data.memo}
              onChange={e => setForm(f => ({ ...f, data: { ...f.data, memo: e.target.value } }))}
              placeholder="메모 (선택)" rows={2}
              className="w-full border border-[#e0e0e0] rounded-xl px-3 py-2 text-[15px] text-[#1d1d1f] outline-none focus:border-[#0066cc] resize-none transition-colors" />
            <div className="flex gap-2 justify-end pt-1">
              <motion.button onClick={() => setForm(null)} {...btn}
                className="text-sm text-[#6e6e73] px-4 py-1.5 rounded-full hover:bg-[#f5f5f7] transition-colors">
                취소
              </motion.button>
              <motion.button onClick={handleSubmit} {...btn}
                whileHover={{ scale: 1.02 }}
                className="text-sm bg-[#0066cc] text-white px-4 py-1.5 rounded-full font-medium">
                {form.mode === 'create' ? '등록' : '저장'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

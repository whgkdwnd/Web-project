import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { memberApi } from '../api/client'
import { useLocalStorage } from '../hooks/useStorage'

const COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#F7DC6F']
const btn = { whileTap: { scale: 0.95 }, transition: { type: 'spring', stiffness: 400, damping: 17 } }

export default function Join() {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [usedColors, setUsedColors] = useState([])
  const navigate = useNavigate()
  const ls = useLocalStorage()

  useEffect(() => {
    const code = ls.get('team_code')
    memberApi.list(code).then(res => setUsedColors(res.data.map(m => m.color)))
  }, [])

  async function handleSubmit() {
    if (!name.trim()) return
    const code = ls.get('team_code')
    const res = await memberApi.create(code, name, color)
    ls.set('member_id', res.data.id)
    ls.set('member_name', res.data.name)
    ls.set('member_color', res.data.color)
    navigate('/calendar')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
      <div className="bg-white p-8 rounded-[18px] border border-[#e0e0e0] w-80">
        <h2 className="text-xl font-semibold mb-6 text-center text-[#1d1d1f] tracking-[-0.374px]">
          내 정보 설정
        </h2>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="이름 입력"
          className="w-full border border-[#e0e0e0] rounded-xl px-4 py-2.5 mb-5 text-[15px] text-[#1d1d1f] placeholder-[#6e6e73] outline-none focus:border-[#0066cc] transition-colors" />
        <p className="text-sm text-[#6e6e73] mb-3">색상 선택</p>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {COLORS.map(c => (
            <motion.button key={c} onClick={() => !usedColors.includes(c) && setColor(c)}
              {...btn}
              disabled={usedColors.includes(c)}
              style={{ backgroundColor: c }}
              className={`h-10 rounded-xl transition-all
                ${color === c ? 'ring-2 ring-offset-2 ring-[#0066cc]' : ''}
                ${usedColors.includes(c) ? 'opacity-25 cursor-not-allowed' : ''}`} />
          ))}
        </div>
        <motion.button onClick={handleSubmit} {...btn}
          whileHover={{ scale: 1.02 }}
          className="w-full bg-[#0066cc] text-white py-2.5 rounded-full font-medium text-[15px]">
          시작하기
        </motion.button>
      </div>
    </div>
  )
}

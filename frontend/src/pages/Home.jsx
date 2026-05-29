import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { teamApi } from '../api/client'
import { useLocalStorage } from '../hooks/useStorage'

const btn = { whileTap: { scale: 0.95 }, transition: { type: 'spring', stiffness: 400, damping: 17 } }

export default function Home() {
  const [code, setCode] = useState('')
  const [teamName, setTeamName] = useState('')
  const [mode, setMode] = useState('join')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const ls = useLocalStorage()

  useEffect(() => {
    const teamCode = ls.get('team_code')
    const memberId = ls.get('member_id')
    if (teamCode && memberId) navigate('/calendar', { replace: true })
    else if (teamCode) navigate('/join', { replace: true })
  }, [])

  async function handleJoin() {
    try {
      const res = await teamApi.get(code.toUpperCase())
      ls.set('team_code', res.data.code)
      ls.remove('member_id')
      ls.remove('member_name')
      ls.remove('member_color')
      const memberId = ls.get('member_id')
      navigate(memberId ? '/calendar' : '/join')
    } catch {
      setError('팀을 찾을 수 없습니다.')
    }
  }

  async function handleCreate() {
    try {
      const res = await teamApi.create(teamName)
      ls.set('team_code', res.data.code)
      ls.remove('member_id')
      navigate('/join')
    } catch {
      setError('팀 생성에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
      <div className="bg-white p-8 rounded-[18px] border border-[#e0e0e0] w-80">
        <h1 className="text-2xl font-semibold text-center mb-6 text-[#1d1d1f] tracking-[-0.374px]">
          팀 캘린더
        </h1>
        <div className="flex gap-2 mb-6 bg-[#f5f5f7] p-1 rounded-full">
          {['join', 'create'].map(m => (
            <motion.button key={m} onClick={() => setMode(m)} {...btn}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors
                ${mode === m ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#6e6e73]'}`}>
              {m === 'join' ? '팀 참여' : '팀 만들기'}
            </motion.button>
          ))}
        </div>
        {mode === 'join' ? (
          <>
            <input value={code} onChange={e => setCode(e.target.value)}
              placeholder="팀 코드 입력 (예: AB3K9XZ2)"
              className="w-full border border-[#e0e0e0] rounded-xl px-4 py-2.5 mb-3 text-[15px] text-[#1d1d1f] placeholder-[#6e6e73] outline-none focus:border-[#0066cc] transition-colors" />
            <motion.button onClick={handleJoin} {...btn}
              whileHover={{ scale: 1.02 }}
              className="w-full bg-[#0066cc] text-white py-2.5 rounded-full font-medium text-[15px]">
              참여하기
            </motion.button>
          </>
        ) : (
          <>
            <input value={teamName} onChange={e => setTeamName(e.target.value)}
              placeholder="팀 이름 입력"
              className="w-full border border-[#e0e0e0] rounded-xl px-4 py-2.5 mb-3 text-[15px] text-[#1d1d1f] placeholder-[#6e6e73] outline-none focus:border-[#0066cc] transition-colors" />
            <motion.button onClick={handleCreate} {...btn}
              whileHover={{ scale: 1.02 }}
              className="w-full bg-[#0066cc] text-white py-2.5 rounded-full font-medium text-[15px]">
              만들기
            </motion.button>
          </>
        )}
        {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
      </div>
    </div>
  )
}

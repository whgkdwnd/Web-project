import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { teamApi } from '../api/client'
import { useLocalStorage } from '../hooks/useStorage'

export default function Home() {
  const [code, setCode] = useState('')
  const [teamName, setTeamName] = useState('')
  const [mode, setMode] = useState('join')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const ls = useLocalStorage()

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-80">
        <h1 className="text-2xl font-bold text-center mb-6">팀 캘린더</h1>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setMode('join')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === 'join' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
            팀 참여
          </button>
          <button onClick={() => setMode('create')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
            팀 만들기
          </button>
        </div>
        {mode === 'join' ? (
          <>
            <input value={code} onChange={e => setCode(e.target.value)}
              placeholder="팀 코드 입력 (예: AB3K9XZ2)"
              className="w-full border rounded-lg px-3 py-2 mb-3 text-sm" />
            <button onClick={handleJoin}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium">
              참여하기
            </button>
          </>
        ) : (
          <>
            <input value={teamName} onChange={e => setTeamName(e.target.value)}
              placeholder="팀 이름 입력"
              className="w-full border rounded-lg px-3 py-2 mb-3 text-sm" />
            <button onClick={handleCreate}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium">
              만들기
            </button>
          </>
        )}
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { memberApi } from '../api/client'
import { useLocalStorage } from '../hooks/useStorage'

const COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#F7DC6F']

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-80">
        <h2 className="text-xl font-bold mb-6 text-center">내 정보 설정</h2>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="이름 입력"
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm" />
        <p className="text-sm text-gray-600 mb-2">색상 선택</p>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              disabled={usedColors.includes(c)}
              style={{ backgroundColor: c }}
              className={`h-10 rounded-lg ${color === c ? 'ring-2 ring-offset-2 ring-gray-800' : ''} ${usedColors.includes(c) ? 'opacity-30 cursor-not-allowed' : ''}`} />
          ))}
        </div>
        <button onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium">
          시작하기
        </button>
      </div>
    </div>
  )
}

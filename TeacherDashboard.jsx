import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function TeacherDashboard() {
  const [students, setStudents] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('students').select('*').order('name')
      setStudents(data ?? [])
    }
    load()
  }, [])

  async function createInvite() {
    const { data } = await supabase.rpc('create_invite')
    if (data?.code) {
      const link = `${window.location.origin}/join/${data.code}`
      navigator.clipboard.writeText(link)
      alert(`Enlace copiado: ${link}`)
    }
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-4xl text-ball tracking-wide">Tu equipo</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={createInvite}
            className="text-sm bg-court-900 border border-court-700 rounded-full px-4 py-2 text-court-line/80 hover:border-ball transition"
          >
            + Invitar alumno
          </motion.button>
        </div>
        <div className="net-divider mb-6" />

        {students.length === 0 && (
          <p className="text-court-line/50 text-sm">
            Aún no tienes alumnos. Invita al primero con el enlace de arriba.
          </p>
        )}

        <div className="space-y-3">
          {students.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/profesor/grabar/${s.id}`)}
              className="w-full flex items-center justify-between bg-court-900 border border-court-700 rounded-xl px-5 py-4 hover:border-ball transition text-left"
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-ball font-display text-lg tracking-wide">GRABAR →</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

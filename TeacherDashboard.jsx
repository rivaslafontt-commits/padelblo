import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function TeacherDashboard() {
  const [students, setStudents] = useState([])
  const [inviteLink, setInviteLink] = useState(null)
  const [debugInfo, setDebugInfo] = useState('(sin pulsar aún)')
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('students').select('*').order('name')
      setStudents(data ?? [])
    }
    load()
  }, [])

  async function createInvite() {
    setDebugInfo('pulsado, esperando respuesta...')
    const { data, error } = await supabase.rpc('create_invite')
    if (error) {
      setDebugInfo('ERROR: ' + JSON.stringify(error))
      return
    }
    setDebugInfo('respuesta recibida: ' + JSON.stringify(data))
    if (data) {
      const link = `${window.location.origin}/join/${data}`
      setInviteLink(link)
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

        {/* LÍNEA TEMPORAL DE DEPURACIÓN — la quitamos en cuanto lo resolvamos */}
        <p className="text-[10px] text-clay font-mono mb-4 break-all">DEBUG: {debugInfo}</p>

        {inviteLink && (
          <div className="mb-6 bg-court-900 border border-ball/40 rounded-xl p-4">
            <p className="text-court-line/50 text-xs mb-2">Enlace de invitación:</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteLink}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-court-950 border border-court-700 rounded-lg px-3 py-2 text-xs text-ball font-mono"
              />
              <button
                onClick={() => navigator.clipboard.writeText(inviteLink)}
                className="text-xs bg-ball text-court-950 font-semibold rounded-lg px-3 py-2 shrink-0"
              >
                Copiar
              </button>
            </div>
          </div>
        )}

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
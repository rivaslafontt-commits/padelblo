import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function TeacherDashboard() {
  const [students, setStudents] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [inviteLink, setInviteLink] = useState(null)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('students').select('*').order('name')
      setStudents(data ?? [])

      const { count } = await supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending_review')
      setPendingCount(count ?? 0)
    }
    load()
  }, [])

  async function createInvite() {
    const { data, error } = await supabase.rpc('create_invite')
    if (error) {
      console.error(error)
      return
    }
    if (data) {
      const link = `${window.location.origin}/join/${data}`
      setInviteLink(link)
      setCopied(false)
      try {
        await navigator.clipboard.writeText(link)
        setCopied(true)
      } catch {
        // Si el navegador bloquea el copiado automático, no pasa nada:
        // el enlace ya se muestra en pantalla para copiarlo a mano.
      }
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

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/profesor/pendientes')}
          className="w-full flex items-center justify-between bg-court-900 border border-ball/40 rounded-xl px-5 py-4 mb-6"
        >
          <span className="font-medium">Pendientes de revisar</span>
          <span className="font-display text-2xl text-ball">{pendingCount}</span>
        </motion.button>

        {inviteLink && (
          <div className="mb-6 bg-court-900 border border-ball/40 rounded-xl p-4">
            <p className="text-court-line/50 text-xs mb-2">
              {copied ? 'Enlace copiado — mándaselo a tu alumno:' : 'Enlace de invitación (cópialo a mano):'}
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteLink}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-court-950 border border-court-700 rounded-lg px-3 py-2 text-xs text-ball font-mono"
              />
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(inviteLink)
                  setCopied(true)
                }}
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
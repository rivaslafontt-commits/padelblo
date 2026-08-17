import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

export default function StudentDashboard() {
  const [name, setName] = useState('')
  const [sessions, setSessions] = useState([])
  const sessionRefs = useRef({})

  useEffect(() => {
    async function load() {
      const { data: user } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('students')
        .select('name')
        .eq('user_id', user?.user?.id)
        .single()
      setName(profile?.name ?? '')

      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('status', 'ready')
        .order('created_at', { ascending: false })
      setSessions(data ?? [])
    }
    load()
  }, [])

  const unread = sessions.find((s) => !s.read)

  async function goToNewSession() {
    if (!unread) return
    sessionRefs.current[unread.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    await supabase.from('sessions').update({ read: true }).eq('id', unread.id)
    setSessions((prev) => prev.map((s) => (s.id === unread.id ? { ...s, read: true } : s)))
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-display text-4xl text-ball tracking-wide">{name || 'Tu progreso'}</h1>
          <AnimatePresence>
            {unread && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileTap={{ scale: 0.85 }}
                onClick={goToNewSession}
                aria-label="Ver entrenamiento nuevo"
                className="relative w-3.5 h-3.5 rounded-full bg-clay mt-1"
              >
                <motion.span
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-clay"
                />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <p className="text-court-line/50 text-sm mb-8">Este es tu progreso</p>

        <div className="net-divider mb-6" />

        <div className="space-y-3">
          {sessions.map((s, i) => (
            <motion.a
              key={s.id}
              ref={(el) => (sessionRefs.current[s.id] = el)}
              href={s.pdf_url}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                if (!s.read) {
                  supabase.from('sessions').update({ read: true }).eq('id', s.id)
                  setSessions((prev) => prev.map((x) => (x.id === s.id ? { ...x, read: true } : x)))
                }
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex items-center justify-between bg-court-900 border border-court-700 rounded-xl px-5 py-4 hover:border-ball transition"
            >
              {!s.read && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-clay" />}
              <div>
                <p className="font-medium">{s.template?.nombre_entrenamiento || 'Entrenamiento'}</p>
                <p className="text-court-line/40 text-xs font-mono mt-0.5">
                  {new Date(s.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
              <span className="text-ball text-sm">Ver →</span>
            </motion.a>
          ))}

          {sessions.length === 0 && (
            <p className="text-court-line/50 text-sm">Aún no hay entrenamientos por aquí.</p>
          )}
        </div>
      </div>
    </div>
  )
}

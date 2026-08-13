import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import ScoreTrend from '../components/ScoreTrend.jsx'

const CATEGORIAS = ['Volea', 'Saque', 'Recepción', 'Ataque', 'Defensa']

export default function StudentDashboard() {
  const [name, setName] = useState('')
  const [sessions, setSessions] = useState([])
  const [filter, setFilter] = useState('Todos')
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

      // select('*') ya trae el campo `read`, usado por el indicador de notificación
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('status', 'ready')
        .order('created_at', { ascending: true })
      setSessions(data ?? [])
    }
    load()
  }, [])

  // Agrupa las notas por categoría para alimentar los marcadores de evolución
  const historyByCategory = CATEGORIAS.reduce((acc, cat) => {
    acc[cat] = sessions
      .filter((s) => s.training_type === cat)
      .map((s) => ({ score: s.score ?? 0, date: s.created_at }))
    return acc
  }, {})

  const filtered = filter === 'Todos' ? sessions : sessions.filter((s) => s.training_type === filter)

  // La más reciente sin leer es la que activa el punto rojo
  const unread = sessions.filter((s) => !s.read).slice(-1)[0]

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
        <p className="text-court-line/50 text-sm mb-6">Evolución por categoría</p>

        {/* Marcadores de evolución — el diferencial de valor de padelblo */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {CATEGORIAS.filter((c) => historyByCategory[c].length > 0).map((c) => (
            <ScoreTrend key={c} category={c} history={historyByCategory[c]} />
          ))}
        </div>

        <div className="net-divider mb-6" />

        <h2 className="font-display text-2xl text-court-line mb-4">Historial</h2>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {['Todos', ...CATEGORIAS].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`whitespace-nowrap text-sm rounded-full px-4 py-1.5 border transition
                ${filter === c ? 'bg-ball text-court-950 border-ball' : 'border-court-700 text-court-line/60'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered
            .slice()
            .reverse()
            .map((s, i) => (
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
                  <p className="font-medium">{s.training_type}</p>
                  <p className="text-court-line/40 text-xs font-mono">
                    {new Date(s.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <span className="font-display text-2xl text-ball">{s.score?.toFixed(1)}</span>
              </motion.a>
            ))}
          {filtered.length === 0 && (
            <p className="text-court-line/50 text-sm">Aún no hay entrenamientos en esta categoría.</p>
          )}
        </div>
      </div>
    </div>
  )
}

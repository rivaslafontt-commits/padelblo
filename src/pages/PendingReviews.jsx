import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function PendingReviews() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('sessions')
      .select('*, students(name)')
      .in('status', ['processing', 'pending_review'])
      .order('created_at', { ascending: false })
    setSessions(data ?? [])
    setLoading(false)
  }

  async function sendToStudent(id) {
    const { error } = await supabase.from('sessions').update({ status: 'ready' }).eq('id', id)
    if (error) {
      console.error('Error al enviar:', error)
      alert('No se pudo enviar: ' + error.message)
      return
    }
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate('/profesor')} className="text-court-line/50 text-sm mb-6">
          ← Volver al equipo
        </button>

        <h1 className="font-display text-4xl text-ball tracking-wide mb-1">Pendientes de revisar</h1>
        <p className="text-court-line/50 text-sm mb-6">
          Repasa cada ficha antes de que le llegue al alumno.
        </p>
        <div className="net-divider mb-6" />

        {loading && <p className="text-court-line/50 text-sm">Cargando…</p>}

        {!loading && sessions.length === 0 && (
          <p className="text-court-line/50 text-sm">No tienes nada pendiente ahora mismo.</p>
        )}

        <div className="space-y-4">
          {sessions.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-court-900 border border-court-700 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{s.students?.name ?? 'Alumno'}</span>
                <span className="text-court-line/40 text-xs font-mono">
                  {new Date(s.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {s.status === 'processing' && (
                <p className="text-court-line/50 text-sm">La IA todavía está preparando esta ficha…</p>
              )}

              {s.status === 'error' && (
                <p className="text-clay text-sm">Hubo un problema procesando este audio.</p>
              )}

              {s.status === 'pending_review' && (
                <>
                  <p className="text-ball font-display text-lg mb-3">
                    {s.template?.nombre_entrenamiento || 'Entrenamiento'}
                  </p>
                  <div className="flex gap-2">
                    
                      href={s.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center text-sm border border-court-700 rounded-lg py-2 hover:border-ball transition"
                    >
                      Ver PDF
                    </a>
                    <button
                      onClick={() => sendToStudent(s.id)}
                      className="flex-1 text-sm bg-ball text-court-950 font-semibold rounded-lg py-2"
                    >
                      Confirmar y enviar
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        <button onClick={load} className="text-court-line/40 text-xs mt-6 underline underline-offset-2">
          Actualizar lista
        </button>
      </div>
    </div>
  )
}
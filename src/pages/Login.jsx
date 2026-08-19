import { motion } from 'framer-motion'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const { inviteCode } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [studentName, setStudentName] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    async function routeAfterLogin(session) {
      if (!session) return

      if (inviteCode) {
        const nameFromUrl = searchParams.get('name')
        try {
          await supabase.rpc('accept_invite', { p_code: inviteCode, p_name: nameFromUrl })
        } catch (e) {
          console.warn('Invitación ya usada o no válida', e)
        }
        navigate('/alumno', { replace: true })
        return
      }

      const { data: teacher } = await supabase.from('teachers').select('id').maybeSingle()
      navigate(teacher ? '/profesor' : '/alumno', { replace: true })
    }

    supabase.auth.getSession().then(({ data: { session } }) => routeAfterLogin(session))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      routeAfterLogin(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [navigate, inviteCode, searchParams])

  async function handleLogin(e) {
    e.preventDefault()
    const nameParam = studentName.trim() ? `?name=${encodeURIComponent(studentName.trim())}` : ''
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${inviteCode ? `/join/${inviteCode}${nameParam}` : ''}`,
      },
    })
    if (!error) setSent(true)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <h1 className="font-display text-6xl tracking-wide text-ball text-center mb-1">
          padelblo
        </h1>
        <p className="text-center text-court-line/60 text-sm mb-8">
          {inviteCode ? 'Te han invitado a un equipo' : 'Tu progreso, entrenamiento a entrenamiento'}
        </p>

        <div className="net-divider mb-8" />

        {sent ? (
          <p className="text-center text-court-line/80">
            Te hemos enviado un enlace mágico a <span className="text-ball">{email}</span>. Ábrelo desde este móvil.
          </p>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              required
              placeholder="Tu nombre"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-court-900 border border-court-700 rounded-xl px-4 py-3 text-court-line placeholder:text-court-line/30 focus:outline-none focus:ring-2 focus:ring-ball transition"
            />
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-court-900 border border-court-700 rounded-xl px-4 py-3 text-court-line placeholder:text-court-line/30 focus:outline-none focus:ring-2 focus:ring-ball transition"
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-ball text-court-950 font-semibold rounded-xl px-4 py-3 transition hover:bg-ball-dim"
            >
              Entrar
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
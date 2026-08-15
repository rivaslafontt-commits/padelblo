import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const { inviteCode } = useParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    // Si ya hay sesión (venimos de abrir el enlace mágico, o ya habíamos
    // entrado antes), no nos quedamos en el login: vamos al panel.
    // De momento todo el mundo va a /profesor; más adelante esto
    // comprobará si el usuario es profesor o alumno y le llevará a cada uno.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/profesor', { replace: true })
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate('/profesor', { replace: true })
    })

    return () => listener.subscription.unsubscribe()
  }, [navigate])

  async function handleLogin(e) {
    e.preventDefault()
    // El inviteCode (si existe) vincula al alumno con el equipo del profesor
    // tras el primer login, vía una función RPC en Supabase.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${inviteCode ? `/join/${inviteCode}` : ''}`,
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
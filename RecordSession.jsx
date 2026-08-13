import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import AudioRecorder from '../components/AudioRecorder.jsx'
import { supabase } from '../lib/supabaseClient'

const TIPOS = ['Volea', 'Saque', 'Recepción', 'Ataque', 'Defensa']

export default function RecordSession() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [tipo, setTipo] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleAudio(blob) {
    setUploading(true)
    const fileName = `${studentId}/${Date.now()}.webm`

    const { error: uploadError } = await supabase.storage
      .from('session-audio')
      .upload(fileName, blob)

    if (!uploadError) {
      // Esto dispara la Edge Function process-session (via Storage webhook o
      // llamada directa) que transcribe, rellena la plantilla y genera el PDF.
      await supabase.from('sessions').insert({
        student_id: studentId,
        training_type: tipo,
        audio_path: fileName,
        status: 'processing',
      })
      setDone(true)
    }
    setUploading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate(-1)} className="text-court-line/50 text-sm mb-8">
          ← Volver
        </button>

        {!tipo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-display text-3xl text-ball mb-1">Tipo de entrenamiento</h2>
            <p className="text-court-line/50 text-sm mb-6">¿Sobre qué ha girado la clase?</p>
            <div className="grid grid-cols-2 gap-3">
              {TIPOS.map((t) => (
                <motion.button
                  key={t}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setTipo(t)}
                  className="bg-court-900 border border-court-700 rounded-xl py-4 text-court-line font-medium hover:border-ball transition"
                >
                  {t}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {tipo && !done && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <h2 className="font-display text-3xl text-ball mb-1">{tipo}</h2>
            <p className="text-court-line/50 text-sm mb-8">
              Cuenta cómo ha ido: fallos, ejercicios, puntos a mejorar.
            </p>
            <AudioRecorder onFinish={handleAudio} />
            {uploading && <p className="text-center text-court-line/50 text-sm mt-6">Subiendo audio…</p>}
          </motion.div>
        )}

        {done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-12">
            <p className="font-display text-4xl text-ball mb-2">Listo</p>
            <p className="text-court-line/60 text-sm mb-8">
              La IA está preparando la ficha de {tipo.toLowerCase()}. Podrás revisar la nota antes de que
              se publique.
            </p>
            <button
              onClick={() => navigate('/profesor')}
              className="bg-ball text-court-950 font-semibold rounded-xl px-6 py-3"
            >
              Volver al equipo
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

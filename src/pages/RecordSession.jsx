import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import AudioRecorder from '../components/AudioRecorder.jsx'
import { supabase } from '../lib/supabaseClient'

export default function RecordSession() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleAudio(blob) {
    setUploading(true)
    const fileName = `${studentId}/${Date.now()}.webm`

    const { error: uploadError } = await supabase.storage
      .from('session-audio')
      .upload(fileName, blob)

    if (uploadError) {
      console.error('Error subiendo audio:', uploadError)
      alert('No se pudo subir el audio: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { error: insertError } = await supabase.from('sessions').insert({
      student_id: studentId,
      audio_path: fileName,
      status: 'processing',
    })

    if (insertError) {
      console.error('Error creando la sesión:', insertError)
      alert('No se pudo guardar la sesión: ' + insertError.message)
      setUploading(false)
      return
    }

    setDone(true)
    setUploading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate(-1)} className="text-court-line/50 text-sm mb-8">
          ← Volver
        </button>

        {!done && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="font-display text-3xl text-ball mb-1">Grabar clase</h2>
            <p className="text-court-line/50 text-sm mb-8">
              Cuenta cómo ha ido: qué habéis trabajado, qué ha hecho bien y qué debe mejorar.
            </p>
            <AudioRecorder onFinish={handleAudio} />
            {uploading && <p className="text-center text-court-line/50 text-sm mt-6">Subiendo audio…</p>}
          </motion.div>
        )}

        {done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-12">
            <p className="font-display text-4xl text-ball mb-2">Listo</p>
            <p className="text-court-line/60 text-sm mb-8">
              La IA está preparando la ficha. En unos segundos la tendrás lista para revisar y
              enviar desde "Pendientes de revisar" en tu panel.
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
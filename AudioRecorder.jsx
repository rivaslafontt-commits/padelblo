import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Graba audio directamente en el navegador (móvil incluido) sin salir de la web.
// onFinish recibe un Blob de audio listo para subir a Supabase Storage.
export default function AudioRecorder({ onFinish }) {
  const [status, setStatus] = useState('idle') // idle | recording | recorded
  const [seconds, setSeconds] = useState(0)
  const mediaRecorder = useRef(null)
  const chunks = useRef([])
  const timerRef = useRef(null)
  const [audioUrl, setAudioUrl] = useState(null)

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    chunks.current = []
    const recorder = new MediaRecorder(stream)
    recorder.ondataavailable = (e) => chunks.current.push(e.data)
    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' })
      setAudioUrl(URL.createObjectURL(blob))
      onFinish?.(blob)
      stream.getTracks().forEach((t) => t.stop())
    }
    recorder.start()
    mediaRecorder.current = recorder
    setStatus('recording')
    setSeconds(0)
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  function stopRecording() {
    mediaRecorder.current?.stop()
    clearInterval(timerRef.current)
    setStatus('recorded')
  }

  function reset() {
    setStatus('idle')
    setAudioUrl(null)
    setSeconds(0)
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <AnimatePresence>
          {status === 'recording' && (
            <motion.span
              key="pulse"
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-clay/40"
            />
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={status === 'recording' ? stopRecording : startRecording}
          disabled={status === 'recorded'}
          className={`relative w-28 h-28 rounded-full flex items-center justify-center font-display text-2xl tracking-wide transition
            ${status === 'recording' ? 'bg-clay text-court-950' : 'bg-ball text-court-950'}
            ${status === 'recorded' ? 'opacity-40' : ''}`}
        >
          {status === 'idle' && 'GRABAR'}
          {status === 'recording' && 'PARAR'}
          {status === 'recorded' && '✓'}
        </motion.button>
      </div>

      <div className="font-mono text-court-line/70 text-lg">
        {status === 'recording' ? `${mm}:${ss}` : status === 'recorded' ? 'Audio listo' : 'Toca para empezar'}
      </div>

      {status === 'recorded' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 w-full">
          <audio src={audioUrl} controls className="w-full max-w-xs" />
          <button onClick={reset} className="text-sm text-court-line/50 underline underline-offset-2">
            Repetir grabación
          </button>
        </motion.div>
      )}
    </div>
  )
}

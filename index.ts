// Supabase Edge Function — se dispara cuando se crea una fila en `sessions`
// (via Database Webhook apuntando a esta función).
//
// Pipeline: audio -> Whisper (transcripción) -> Claude (plantilla + nota) -> PDF -> Storage

import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const PLANTILLA_PROMPT = `
Eres un asistente que convierte el audio de un profesor de pádel sobre la clase
de un alumno en una ficha estructurada. Devuelve SOLO un JSON con esta forma:

{
  "fecha": "YYYY-MM-DD",
  "tipo_entrenamiento": "string",
  "fallos": "string",
  "ejercicios_realizados_y_fallos": "string",
  "puntos_a_mejorar": "string",
  "nota": number // 0-10, tu estimación de nivel en esta sesión según lo que cuenta el profesor
}

No inventes datos que no estén implícitos en el audio. Si el profesor no da
un dato, usa una cadena vacía. La nota debe ser coherente con el tono
(más fallos y crítica -> nota más baja; progreso y elogio -> nota más alta).
`.trim()

serve(async (req) => {
  const { record } = await req.json() // fila insertada en `sessions`

  try {
    // 1. Descargar el audio de Storage
    const { data: audioBlob } = await supabase.storage
      .from('session-audio')
      .download(record.audio_path)

    // 2. Transcripción con Whisper (OpenAI API)
    const form = new FormData()
    form.append('file', audioBlob, 'audio.webm')
    form.append('model', 'whisper-1')
    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
      body: form,
    })
    const { text: transcript } = await whisperRes.json()

    // 3. Estructurar la plantilla + nota con Claude
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: PLANTILLA_PROMPT,
        messages: [{ role: 'user', content: transcript }],
      }),
    })
    const claudeData = await claudeRes.json()
    const template = JSON.parse(claudeData.content[0].text)

    // 4. Generar el PDF (ver nota abajo) y subirlo
    const pdfBytes = await buildPdf(template)
    const pdfPath = `${record.student_id}/${record.id}.pdf`
    await supabase.storage.from('session-pdfs').upload(pdfPath, pdfBytes, {
      contentType: 'application/pdf',
    })
    const { data: pdfUrl } = supabase.storage.from('session-pdfs').getPublicUrl(pdfPath)

    // 5. Actualizar la sesión: queda pendiente de que el profesor confirme la nota
    await supabase
      .from('sessions')
      .update({
        transcript,
        template,
        score: template.nota,
        pdf_url: pdfUrl.publicUrl,
        status: 'pending_review', // el profesor la revisa antes de pasar a 'ready'
      })
      .eq('id', record.id)
  } catch (err) {
    await supabase.from('sessions').update({ status: 'error' }).eq('id', record.id)
    console.error(err)
  }

  return new Response('ok')
})

// Construye el PDF con la plantilla ya rellena. Usar una librería como
// `pdf-lib` (funciona en Deno) para maquetar fecha, tipo, fallos, ejercicios,
// puntos a mejorar y nota siguiendo el diseño de marca de padelblo.
async function buildPdf(template: Record<string, unknown>): Promise<Uint8Array> {
  // TODO: maquetación real con pdf-lib
  throw new Error('not implemented')
}

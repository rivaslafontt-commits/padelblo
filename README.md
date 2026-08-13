# padelblo

Web para profesores de pádel: el profesor graba un audio por alumno tras la clase,
la IA lo convierte en una ficha de entrenamiento estructurada + nota por categoría,
y el alumno ve su evolución a lo largo del tiempo.

## Identidad visual

Pista de pádel nocturna: fondo azul petróleo (`#0A1628`), acento verde-lima de
pelota de pádel (`#CFEA3F`), tipografía `Bebas Neue` condensada para titulares
(efecto "marcador") + `Inter` para el cuerpo. El elemento firma es el **marcador
de evolución** (`ScoreTrend.jsx`): nota grande tipo scoreboard + mini-gráfico de
tendencia + delta frente a la sesión anterior, por categoría (volea, saque,
recepción, ataque, defensa).

## Stack

- React + Vite + Tailwind + Framer Motion (animaciones) + Recharts (gráficos)
- Supabase: auth (magic link), Postgres, Storage, Edge Functions
- Whisper (transcripción) + Claude (estructuración de la plantilla + nota)

## Puesta en marcha

1. `npm install`
2. Crea un proyecto en supabase.com, copia `.env.example` a `.env` y rellena
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
3. Ejecuta `supabase/schema.sql` en el SQL editor de tu proyecto.
4. Crea dos buckets de Storage: `session-audio` y `session-pdfs`.
5. Despliega la función `supabase/functions/process-session` con
   `supabase functions deploy process-session` y configura sus variables de
   entorno (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
6. Crea un Database Webhook: al insertar en `sessions` → llama a la función.
7. `npm run dev`

## Pendiente de completar (a propósito, para decidir contigo)

- **`buildPdf()`** en la Edge Function: falta la maquetación real del PDF con
  `pdf-lib` siguiendo tu plantilla exacta.
- **Flujo de revisión del profesor**: la sesión pasa a `pending_review` tras la
  IA; falta la pantalla donde el profesor ve la nota propuesta, la ajusta y
  confirma (pasa a `ready`, visible para el alumno).
- **RPC `create_invite`**: falta la función SQL que genera el código y la
  vinculación del alumno al equipo al aceptar la invitación.
- Rutas protegidas por rol (hoy `/profesor` y `/alumno` no comprueban sesión).

## Coste estimado (uso de un profesor individual)

- Whisper: ~0,006 €/min de audio
- Claude (estructurar plantilla): céntimos por sesión
- Supabase + Vercel: gratis en este rango de uso
- Total aproximado: **5–15 €/mes**

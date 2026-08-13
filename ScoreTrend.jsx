import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { motion } from 'framer-motion'

// El "marcador": nota actual grande estilo scoreboard + mini-tendencia +
// delta frente a la sesión anterior. Es el elemento firma de padelblo.
export default function ScoreTrend({ category, history }) {
  const current = history.at(-1)?.score ?? 0
  const previous = history.at(-2)?.score ?? current
  const delta = +(current - previous).toFixed(1)

  return (
    <div className="bg-court-900 border border-court-700 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-court-line/50 text-xs uppercase tracking-widest mb-1">{category}</p>
          <div className="flex items-baseline gap-2">
            <motion.span
              key={current}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl text-ball tabular-nums"
            >
              {current.toFixed(1)}
            </motion.span>
            {delta !== 0 && (
              <span className={`font-mono text-sm ${delta > 0 ? 'text-ball' : 'text-clay'}`}>
                {delta > 0 ? '+' : ''}
                {delta}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <YAxis hide domain={[0, 10]} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#CFEA3F"
              strokeWidth={2}
              dot={false}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

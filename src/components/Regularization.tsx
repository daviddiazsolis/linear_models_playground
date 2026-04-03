// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'
import { useLanguage } from '../context/LanguageContext'
import { linspace } from '../utils/linearAlgebra'

const tooltipStyle = {
  contentStyle: {
    background: '#18181b',
    border: '1px solid #3f3f46',
    color: '#e4e4e7',
    fontSize: 11,
  },
}

// Synthetic initial coefficients (4 features)
const BETA_INIT = [2.5, -1.8, 3.1, -0.9]
const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#f43f5e']

type Mode = 'ridge' | 'lasso'

function buildPath(mode: Mode, lambdas: number[]) {
  return lambdas.map(lam => {
    const logLam = Math.log10(lam)
    const entry: Record<string, number> = { logLam }
    BETA_INIT.forEach((b, i) => {
      if (mode === 'ridge') {
        entry[`β${i + 1}`] = b / (1 + lam)
      } else {
        // Lasso: soft thresholding
        const shrink = lam / 4
        entry[`β${i + 1}`] = Math.sign(b) * Math.max(0, Math.abs(b) - shrink)
      }
    })
    return entry
  })
}

export default function Regularization() {
  const { t } = useLanguage()
  const [mode, setMode] = useState<Mode>('ridge')
  const [lambda, setLambda] = useState(1)

  const lambdas = useMemo(() => linspace(0.001, 100, 200), [])
  const pathData = useMemo(() => buildPath(mode, lambdas), [mode, lambdas])

  // Current coefficients at selected lambda
  const currentCoeffs = useMemo(() => {
    return BETA_INIT.map((b, _i) => {
      if (mode === 'ridge') return b / (1 + lambda)
      const shrink = lambda / 4
      return Math.sign(b) * Math.max(0, Math.abs(b) - shrink)
    })
  }, [mode, lambda])

  return (
    <section
      id="regularization"
      className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-zinc-100 mb-1">{t('regTitle')}</h2>
        <p className="text-zinc-400 mb-6">{t('regSubtitle')}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col gap-5">
            {/* Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-zinc-700">
              {(['ridge', 'lasso'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === m ? 'bg-blue-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900'}`}
                >
                  {m === 'ridge' ? t('regRidge') : t('regLasso')}
                </button>
              ))}
            </div>

            <div>
              <label className="text-zinc-300 text-sm font-medium flex justify-between mb-2">
                <span>{t('regLambda')}</span>
                <span className="text-blue-400 font-mono">{lambda.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min={0.1}
                max={20}
                step={0.1}
                value={lambda}
                onChange={e => setLambda(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Current coefficients */}
            <div>
              <p className="text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wide">{t('regCoefficients')}</p>
              <div className="space-y-2">
                {currentCoeffs.map((val, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <span className="text-xs font-mono" style={{ color: COLORS[i] }}>β{i + 1}</span>
                    <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{
                          width: `${Math.min(100, Math.abs(val / BETA_INIT[i]) * 100)}%`,
                          background: COLORS[i],
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-zinc-300 w-12 text-right">{val.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-4">
              <p className="text-blue-300 text-xs font-semibold mb-2 uppercase tracking-wide">
                {mode === 'ridge' ? 'Ridge Penalty' : 'Lasso Penalty'}
              </p>
              <p className="text-zinc-300 text-sm font-mono mb-1">
                {mode === 'ridge' ? 'L(β) + λ Σ βᵢ²' : 'L(β) + λ Σ |βᵢ|'}
              </p>
              <p className="text-zinc-500 text-xs leading-relaxed mt-2">
                {mode === 'ridge'
                  ? 'Ridge (L2) shrinks all coefficients toward zero but never exactly to zero.'
                  : 'Lasso (L1) can set coefficients exactly to zero — automatic feature selection.'}
              </p>
            </div>

            <p className="text-zinc-500 text-xs italic">{t('regHint')}</p>
          </div>

          {/* Shrinkage path chart */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-zinc-400 text-xs mb-4">{t('regShrinkage')} — {mode === 'ridge' ? t('regRidge') : t('regLasso')}</p>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={pathData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis
                  dataKey="logLam"
                  type="number"
                  domain={['auto', 'auto']}
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  label={{ value: 'log₁₀(λ)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 11 }}
                  tickFormatter={v => v.toFixed(1)}
                />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => v.toFixed(1)} />
                <Tooltip
                  {...tooltipStyle}
                  labelFormatter={v => `log₁₀(λ) = ${Number(v).toFixed(2)}`}
                  formatter={(v: number, name: string) => [v.toFixed(4), name]}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
                <ReferenceLine x={Math.log10(lambda)} stroke="#3b82f6" strokeDasharray="4 2" opacity={0.6} />
                {BETA_INIT.map((_, i) => (
                  <Line
                    key={i}
                    type="monotone"
                    dataKey={`β${i + 1}`}
                    stroke={COLORS[i]}
                    dot={false}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

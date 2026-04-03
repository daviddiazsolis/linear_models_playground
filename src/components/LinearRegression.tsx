// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
  Legend,
} from 'recharts'
import { useLanguage } from '../context/LanguageContext'
import {
  generateLinearData,
  fitOLS,
  linspace,
  mse,
  rSquared,
} from '../utils/linearAlgebra'

const TRUE_SLOPE = 2
const TRUE_INTERCEPT = 1
const N = 30
const SEED = 42

const tooltipStyle = {
  contentStyle: {
    background: '#18181b',
    border: '1px solid #3f3f46',
    color: '#e4e4e7',
    fontSize: 11,
  },
}

export default function LinearRegression() {
  const { t } = useLanguage()
  const [noise, setNoise] = useState(1)

  const { data, fit, metrics, linePoints } = useMemo(() => {
    const data = generateLinearData(N, TRUE_SLOPE, TRUE_INTERCEPT, noise, SEED)
    const fit = fitOLS(data)
    const yTrue = data.map(d => d.y)
    const yPred = data.map(d => fit.slope * d.x + fit.intercept)
    const metrics = {
      mse: mse(yTrue, yPred),
      r2: rSquared(yTrue, yPred),
    }
    const xs = linspace(-3, 3, 60)
    const linePoints = xs.map(x => ({ x, y: fit.slope * x + fit.intercept }))
    return { data, fit, metrics, linePoints }
  }, [noise])

  return (
    <section
      id="linear"
      className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-zinc-100 mb-1">{t('linTitle')}</h2>
        <p className="text-zinc-400 mb-6">{t('linSubtitle')}</p>

        {/* Metrics badges */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: t('linSlope'), value: fit.slope.toFixed(3) },
            { label: t('linIntercept'), value: fit.intercept.toFixed(3) },
            { label: t('linMSE'), value: metrics.mse.toFixed(3) },
            { label: t('linR2'), value: metrics.r2.toFixed(3) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 flex flex-col"
            >
              <span className="text-zinc-500 text-xs">{label}</span>
              <span className="text-blue-400 font-mono text-lg font-semibold">{value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col gap-5">
            <div>
              <label className="text-zinc-300 text-sm font-medium flex justify-between mb-2">
                <span>{t('linNoise')}</span>
                <span className="text-blue-400 font-mono">{noise.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={3}
                step={0.1}
                value={noise}
                onChange={e => setNoise(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* OLS callout */}
            <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-4">
              <p className="text-blue-300 text-xs font-semibold mb-2 uppercase tracking-wide">OLS Formula</p>
              <p className="text-zinc-300 text-sm font-mono mb-1">β = (XᵀX)⁻¹ Xᵀy</p>
              <p className="text-zinc-500 text-xs leading-relaxed mt-2">
                OLS minimizes the sum of squared residuals. The closed-form solution exists when XᵀX is invertible.
              </p>
            </div>

            <div className="rounded-xl bg-zinc-800/40 border border-zinc-700/30 p-4">
              <p className="text-zinc-300 text-xs font-semibold mb-2 uppercase tracking-wide">What do they mean?</p>
              <ul className="text-zinc-500 text-xs space-y-1 leading-relaxed">
                <li><span className="text-zinc-300">MSE</span> — mean squared error, lower is better</li>
                <li><span className="text-zinc-300">R²</span> — proportion of variance explained (1 = perfect)</li>
              </ul>
            </div>

            <p className="text-zinc-500 text-xs italic">{t('linHint')}</p>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-zinc-400 text-xs mb-3">
              <span className="inline-block w-3 h-0.5 bg-blue-500 mr-1.5 align-middle" /> {t('linFittedLine')}
              <span className="inline-block w-2 h-2 rounded-full bg-zinc-400 ml-4 mr-1.5 align-middle" /> {t('linDataPoints')}
            </p>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={linePoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[-3.2, 3.2]}
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickFormatter={v => v.toFixed(1)}
                />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => v.toFixed(3)} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
                {/* Regression line */}
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="#3b82f6"
                  dot={false}
                  strokeWidth={2}
                  name={t('linFittedLine')}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Scatter overlay — using a separate chart stacked conceptually via absolute positioning trick */}
            <div className="mt-2">
              <ResponsiveContainer width="100%" height={0}>
                {/* Hidden but keeps recharts happy for data points below */}
                <ScatterChart><Scatter data={[]} /></ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Combined chart: scatter + line */}
            <div className="-mt-2">
              <ResponsiveContainer width="100%" height={340}>
                <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[-3.2, 3.2]}
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickFormatter={v => v.toFixed(1)}
                    name="x"
                  />
                  <YAxis dataKey="y" type="number" tick={{ fill: '#71717a', fontSize: 10 }} name="y" />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    {...tooltipStyle}
                    formatter={(v: number) => v.toFixed(3)}
                  />
                  <Scatter data={data} fill="#71717a" opacity={0.7} name={t('linDataPoints')} />
                  <Scatter data={linePoints} fill="#3b82f6" line={{ stroke: '#3b82f6', strokeWidth: 2 }} shape={() => null as unknown as React.ReactElement} name={t('linFittedLine')} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// SPDX-License-Identifier: Apache-2.0
import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { RotateCcw } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { generateLinearData, linspace, mse } from '../utils/linearAlgebra'

const TRUE_SLOPE = 2
const TRUE_INTERCEPT = 1

const tooltipStyle = {
  contentStyle: {
    background: '#18181b',
    border: '1px solid #3f3f46',
    color: '#e4e4e7',
    fontSize: 11,
  },
}

export default function ManualFit() {
  const { t } = useLanguage()
  const [nPoints, setNPoints] = useState(30)
  const [noise, setNoise] = useState(1.5)
  const [beta0, setBeta0] = useState(0)
  const [beta1, setBeta1] = useState(0)
  const [seed, setSeed] = useState(42)

  const { data, linePoints, metrics } = useMemo(() => {
    const data = generateLinearData(nPoints, TRUE_SLOPE, TRUE_INTERCEPT, noise, seed)
    const xs = linspace(-3, 3, 60)
    const linePoints = xs.map(x => ({ x, y: beta0 + beta1 * x }))
    const yTrue = data.map(d => d.y)
    const yPred = data.map(d => beta0 + beta1 * d.x)
    const m = mse(yTrue, yPred)
    const ssr = yTrue.reduce((acc, y, i) => acc + (y - yPred[i]) ** 2, 0)
    return { data, linePoints, metrics: { mse: m, ssr } }
  }, [nPoints, noise, beta0, beta1, seed])

  return (
    <section
      id="manual"
      className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-zinc-100 mb-1">{t('mfTitle')}</h2>
        <p className="text-zinc-400 mb-6">{t('mfSubtitle')}</p>

        {/* Metrics badges */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: 'β₀', value: beta0.toFixed(2) },
            { label: 'β₁', value: beta1.toFixed(2) },
            { label: t('mfSSR'), value: metrics.ssr.toFixed(2) },
            { label: t('mfMSE'), value: metrics.mse.toFixed(3) },
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
                <span>β₀ ({t('mfIntercept')})</span>
                <input
                  type="number"
                  step={0.1}
                  value={beta0}
                  onChange={e => setBeta0(Number(e.target.value))}
                  className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-blue-400 font-mono text-right text-sm"
                />
              </label>
              <input
                type="range"
                min={-3}
                max={3}
                step={0.05}
                value={beta0}
                onChange={e => setBeta0(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <label className="text-zinc-300 text-sm font-medium flex justify-between mb-2">
                <span>β₁ ({t('mfSlope')})</span>
                <input
                  type="number"
                  step={0.1}
                  value={beta1}
                  onChange={e => setBeta1(Number(e.target.value))}
                  className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-blue-400 font-mono text-right text-sm"
                />
              </label>
              <input
                type="range"
                min={-3}
                max={3}
                step={0.05}
                value={beta1}
                onChange={e => setBeta1(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <label className="text-zinc-300 text-sm font-medium flex justify-between mb-2">
                <span>{t('mfPoints')}</span>
                <span className="text-blue-400 font-mono">{nPoints}</span>
              </label>
              <input
                type="range"
                min={5}
                max={100}
                step={1}
                value={nPoints}
                onChange={e => setNPoints(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <label className="text-zinc-300 text-sm font-medium flex justify-between mb-2">
                <span>{t('mfNoise')}</span>
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

            <button
              type="button"
              onClick={() => setSeed(Math.floor(Math.random() * 1_000_000))}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 text-blue-300 text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {t('mfRegenerate')}
            </button>

            <p className="text-zinc-500 text-xs italic leading-relaxed">{t('mfHint')}</p>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-zinc-400 text-xs mb-3">
              <span className="inline-block w-3 h-0.5 bg-blue-500 mr-1.5 align-middle" />{' '}
              {t('mfYourLine')}
              <span className="inline-block w-2 h-2 rounded-full bg-zinc-400 ml-4 mr-1.5 align-middle" />{' '}
              {t('linDataPoints')}
            </p>
            <ResponsiveContainer width="100%" height={360}>
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
                <YAxis
                  dataKey="y"
                  type="number"
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  name="y"
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  {...tooltipStyle}
                  formatter={(v: number) => v.toFixed(3)}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
                <Scatter data={data} fill="#71717a" opacity={0.7} name={t('linDataPoints')} />
                <Scatter
                  data={linePoints}
                  fill="#3b82f6"
                  line={{ stroke: '#3b82f6', strokeWidth: 2 }}
                  shape={() => null as unknown as React.ReactElement}
                  name={t('mfYourLine')}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

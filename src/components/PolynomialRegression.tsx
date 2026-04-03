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
  ScatterChart,
  Scatter,
} from 'recharts'
import { useLanguage } from '../context/LanguageContext'
import {
  generateLinearData,
  fitPolynomial,
  predictPolynomial,
  linspace,
  mse,
} from '../utils/linearAlgebra'

const tooltipStyle = {
  contentStyle: {
    background: '#18181b',
    border: '1px solid #3f3f46',
    color: '#e4e4e7',
    fontSize: 11,
  },
}

// True function: cubic y = 0.5x³ - x + 1 + noise
function trueFn(x: number) {
  return 0.5 * x ** 3 - x + 1
}

function makeData(n: number, noise: number, seed: number) {
  // generateLinearData gives noisy linear; we override y with cubic + noise
  const base = generateLinearData(n, 0, 0, noise, seed)
  const xs = linspace(-3, 3, n)
  return xs.map((x, i) => ({ x, y: trueFn(x) + (base[i].y) }))
}

const TRAIN_DATA = makeData(30, 0.8, 7)
const TEST_DATA = makeData(20, 0.8, 99)
const MAX_DEGREE = 10

export default function PolynomialRegression() {
  const { t } = useLanguage()
  const [degree, setDegree] = useState(3)

  const { curvePoints, trainMse, testMse, mseByDegree } = useMemo(() => {
    const coeffs = fitPolynomial(TRAIN_DATA, degree)
    const xs = linspace(-3.2, 3.2, 120)
    const curvePoints = xs.map(x => ({ x, y: predictPolynomial(x, coeffs) }))

    const trainPred = TRAIN_DATA.map(d => predictPolynomial(d.x, coeffs))
    const testPred = TEST_DATA.map(d => predictPolynomial(d.x, coeffs))
    const trainMse = mse(TRAIN_DATA.map(d => d.y), trainPred)
    const testMse = mse(TEST_DATA.map(d => d.y), testPred)

    // Compute for all degrees
    const mseByDegree = Array.from({ length: MAX_DEGREE }, (_, i) => {
      const d = i + 1
      const c = fitPolynomial(TRAIN_DATA, d)
      const tp = TRAIN_DATA.map(pt => predictPolynomial(pt.x, c))
      const tsp = TEST_DATA.map(pt => predictPolynomial(pt.x, c))
      return {
        degree: d,
        train: Math.min(mse(TRAIN_DATA.map(pt => pt.y), tp), 50),
        test: Math.min(mse(TEST_DATA.map(pt => pt.y), tsp), 50),
      }
    })

    return { curvePoints, trainMse, testMse, mseByDegree }
  }, [degree])

  const fitLabel =
    degree <= 2 ? t('polyUnderfit') : degree >= 7 ? t('polyOverfit') : '✓ Good fit'

  return (
    <section
      id="polynomial"
      className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-zinc-100 mb-1">{t('polyTitle')}</h2>
        <p className="text-zinc-400 mb-6">{t('polySubtitle')}</p>

        {/* Badges */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2">
            <span className="text-zinc-500 text-xs">{t('polyTrain')}</span>
            <p className="text-blue-400 font-mono text-lg font-semibold">{trainMse.toFixed(3)}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2">
            <span className="text-zinc-500 text-xs">{t('polyTest')}</span>
            <p className="text-amber-400 font-mono text-lg font-semibold">{testMse.toFixed(3)}</p>
          </div>
          <div className={`rounded-xl border px-4 py-2 ${degree <= 2 ? 'border-amber-500/30 bg-amber-500/10' : degree >= 7 ? 'border-red-500/30 bg-red-500/10' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
            <span className="text-zinc-500 text-xs">Diagnosis</span>
            <p className={`font-medium text-sm mt-0.5 ${degree <= 2 ? 'text-amber-400' : degree >= 7 ? 'text-red-400' : 'text-emerald-400'}`}>{fitLabel}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col gap-5">
            <div>
              <label className="text-zinc-300 text-sm font-medium flex justify-between mb-2">
                <span>{t('polyDegree')}</span>
                <span className="text-blue-400 font-mono text-lg">{degree}</span>
              </label>
              <input
                type="range"
                min={1}
                max={MAX_DEGREE}
                step={1}
                value={degree}
                onChange={e => setDegree(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-zinc-600 text-xs mt-1">
                <span>1</span>
                <span>{MAX_DEGREE}</span>
              </div>
            </div>

            <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-4">
              <p className="text-blue-300 text-xs font-semibold mb-2 uppercase tracking-wide">Polynomial Model</p>
              <p className="text-zinc-300 text-sm font-mono">ŷ = Σ βₖ xᵏ</p>
              <p className="text-zinc-500 text-xs leading-relaxed mt-2">
                We fit via normal equations on the Vandermonde design matrix. Higher degrees can fit training data perfectly but fail to generalize.
              </p>
            </div>

            <div className="rounded-xl bg-zinc-800/40 border border-zinc-700/30 p-4">
              <p className="text-zinc-300 text-xs font-semibold mb-2 uppercase tracking-wide">Bias-Variance</p>
              <ul className="text-zinc-500 text-xs space-y-1 leading-relaxed">
                <li><span className="text-amber-400">Degree 1–2</span> — high bias (underfitting)</li>
                <li><span className="text-emerald-400">Degree 3–4</span> — balanced tradeoff</li>
                <li><span className="text-red-400">Degree 7+</span> — high variance (overfitting)</li>
              </ul>
            </div>

            <p className="text-zinc-500 text-xs italic">{t('polyHint')}</p>
          </div>

          {/* Right column: scatter + MSE chart */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Scatter + polynomial curve */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <p className="text-zinc-400 text-xs mb-3">Degree {degree} polynomial fit</p>
              <ResponsiveContainer width="100%" height={240}>
                <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                  <XAxis dataKey="x" type="number" domain={[-3.5, 3.5]} tick={{ fill: '#71717a', fontSize: 10 }} name="x" />
                  <YAxis dataKey="y" type="number" tick={{ fill: '#71717a', fontSize: 10 }} name="y" />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => v.toFixed(3)} />
                  <Scatter data={TRAIN_DATA} fill="#71717a" opacity={0.7} name="Train" />
                  <Scatter data={TEST_DATA} fill="#f59e0b" opacity={0.5} name="Test" shape="diamond" />
                  <Scatter
                    data={curvePoints}
                    fill="#3b82f6"
                    line={{ stroke: '#3b82f6', strokeWidth: 2 }}
                    shape={() => null as unknown as React.ReactElement}
                    name="Fit"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* MSE by degree */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <p className="text-zinc-400 text-xs mb-3">{t('polyMSE')}</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={mseByDegree} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                  <XAxis dataKey="degree" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} domain={[0, 'auto']} />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => v.toFixed(3)} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
                  <Line type="monotone" dataKey="train" stroke="#3b82f6" dot={false} strokeWidth={2} name={t('polyTrain')} />
                  <Line type="monotone" dataKey="test" stroke="#f59e0b" dot={false} strokeWidth={2} name={t('polyTest')} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

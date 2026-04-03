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
  ReferenceLine,
  ScatterChart,
  Scatter,
} from 'recharts'
import { useLanguage } from '../context/LanguageContext'
import { linspace, sigmoid, generateClassificationData } from '../utils/linearAlgebra'

const tooltipStyle = {
  contentStyle: {
    background: '#18181b',
    border: '1px solid #3f3f46',
    color: '#e4e4e7',
    fontSize: 11,
  },
}

const CLASS_DATA = generateClassificationData(80, 13)

// Simple logistic classifier: score = x1 + x2 (perfect for diagonally separated blobs)
function score(x1: number, x2: number) {
  return x1 + x2
}

export default function LogisticRegression() {
  const { t } = useLanguage()
  const [threshold, setThreshold] = useState(0.5)

  // Sigmoid curve data
  const sigmoidData = useMemo(() =>
    linspace(-8, 8, 200).map(x => ({ x, y: sigmoid(x) })),
  [])

  // Accuracy at current threshold
  const accuracy = useMemo(() => {
    const correct = CLASS_DATA.filter(d => {
      const prob = sigmoid(score(d.x1, d.x2))
      const pred = prob >= threshold ? 1 : 0
      return pred === d.label
    }).length
    return correct / CLASS_DATA.length
  }, [threshold])

  // Decision boundary line in 2D: x1 + x2 = logit(threshold)
  // sigmoid(x1+x2) = threshold => x1+x2 = log(t/(1-t))
  const logit = Math.log(threshold / (1 - threshold + 1e-10))
  const boundaryPoints = linspace(-3, 3, 2).map(x1 => ({
    x1,
    x2: logit - x1,
  }))

  const class0 = CLASS_DATA.filter(d => d.label === 0).map(d => ({ x: d.x1, y: d.x2 }))
  const class1 = CLASS_DATA.filter(d => d.label === 1).map(d => ({ x: d.x1, y: d.x2 }))
  const boundary = boundaryPoints.map(d => ({ x: d.x1, y: d.x2 }))

  return (
    <section
      id="logistic"
      className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-zinc-100 mb-1">{t('logTitle')}</h2>
        <p className="text-zinc-400 mb-6">{t('logSubtitle')}</p>

        {/* Accuracy badge */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2">
            <span className="text-zinc-500 text-xs">{t('logAccuracy')}</span>
            <p className="text-blue-400 font-mono text-lg font-semibold">{(accuracy * 100).toFixed(1)}%</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2">
            <span className="text-zinc-500 text-xs">{t('logThreshold')}</span>
            <p className="text-amber-400 font-mono text-lg font-semibold">{threshold.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col gap-5">
            <div>
              <label className="text-zinc-300 text-sm font-medium flex justify-between mb-2">
                <span>{t('logThreshold')}</span>
                <span className="text-blue-400 font-mono">{threshold.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={0.05}
                max={0.95}
                step={0.01}
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-4">
              <p className="text-blue-300 text-xs font-semibold mb-2 uppercase tracking-wide">Sigmoid</p>
              <p className="text-zinc-300 text-sm font-mono">σ(z) = 1 / (1 + e⁻ᶻ)</p>
              <p className="text-zinc-500 text-xs leading-relaxed mt-2">
                The sigmoid maps any real number z to (0, 1). We interpret this as the probability of class 1. If σ(z) ≥ threshold → predict 1, else 0.
              </p>
            </div>

            <div className="rounded-xl bg-zinc-800/40 border border-zinc-700/30 p-4">
              <p className="text-zinc-300 text-xs font-semibold mb-2 uppercase tracking-wide">Decision Boundary</p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                The boundary is where σ(z) = threshold, i.e. z = logit(threshold). In 2D feature space with score = x₁ + x₂, the boundary is a diagonal line.
              </p>
            </div>

            <p className="text-zinc-500 text-xs italic">{t('logHint')}</p>
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Sigmoid curve */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <p className="text-zinc-400 text-xs mb-3">{t('logSigmoid')}</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={sigmoidData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                  <XAxis dataKey="x" type="number" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => v.toFixed(0)} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} domain={[0, 1]} />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => v.toFixed(4)} />
                  <ReferenceLine y={threshold} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: `τ=${threshold.toFixed(2)}`, fill: '#f59e0b', fontSize: 10 }} />
                  <Line type="monotone" dataKey="y" stroke="#3b82f6" dot={false} strokeWidth={2} name="σ(x)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 2D scatter + decision boundary */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <p className="text-zinc-400 text-xs mb-3">{t('logDecisionBoundary')}</p>
              <ResponsiveContainer width="100%" height={220}>
                <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                  <XAxis dataKey="x" type="number" domain={[-3.5, 3.5]} tick={{ fill: '#71717a', fontSize: 10 }} name="x₁" />
                  <YAxis dataKey="y" type="number" domain={[-3.5, 3.5]} tick={{ fill: '#71717a', fontSize: 10 }} name="x₂" />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => v.toFixed(3)} />
                  <Scatter data={class0} fill="#71717a" opacity={0.8} name="Class 0" />
                  <Scatter data={class1} fill="#3b82f6" opacity={0.8} name="Class 1" />
                  <Scatter
                    data={boundary}
                    fill="#f59e0b"
                    line={{ stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '4 2' }}
                    shape={() => null as unknown as React.ReactElement}
                    name="Boundary"
                  />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-zinc-600 text-xs mt-2">
                <span className="inline-block w-2 h-2 rounded-full bg-zinc-500 mr-1" /> Class 0
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-4 mr-1" /> Class 1
                <span className="inline-block w-4 h-0.5 bg-amber-400 ml-4 mr-1.5 align-middle" /> {t('logDecisionBoundary')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

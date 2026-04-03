// SPDX-License-Identifier: Apache-2.0
import { TrendingUp, BarChart2, GitBranch, Activity } from 'lucide-react'
import { motion } from 'motion/react'
import { useLanguage } from '../context/LanguageContext'

const tags = [
  { key: 'heroTag1', icon: TrendingUp },
  { key: 'heroTag2', icon: BarChart2 },
  { key: 'heroTag3', icon: GitBranch },
  { key: 'heroTag4', icon: Activity },
]

export default function Hero() {
  const { t } = useLanguage()
  return (
    <section className="relative overflow-hidden py-24 px-6 bg-zinc-950">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto text-center flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium tracking-wide"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Interactive ML Education
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-100 tracking-tight"
        >
          {t('heroTitle')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-blue-400 font-medium"
        >
          {t('heroSubtitle')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl text-zinc-400 text-base leading-relaxed"
        >
          {t('heroDesc')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mt-2"
        >
          {tags.map(({ key, icon: Icon }) => (
            <span
              key={key}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-sm font-medium"
            >
              <Icon className="w-4 h-4 text-blue-500" />
              {t(key)}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

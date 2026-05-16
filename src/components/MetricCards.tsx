// SPDX-License-Identifier: Apache-2.0
import { useLanguage } from '../context/LanguageContext'

type MetricKey = 'ssr' | 'mse' | 'rmse' | 'mae' | 'r2'

const COPY: Record<MetricKey, { titleKey: string; formula: string; descKey: string }> = {
  ssr:  { titleKey: 'metSSRTitle',  formula: 'SSR = Σ (yᵢ − ŷᵢ)²',          descKey: 'metSSRDesc'  },
  mse:  { titleKey: 'metMSETitle',  formula: 'MSE = (1/n) Σ (yᵢ − ŷᵢ)²',    descKey: 'metMSEDesc'  },
  rmse: { titleKey: 'metRMSETitle', formula: 'RMSE = √MSE',                  descKey: 'metRMSEDesc' },
  mae:  { titleKey: 'metMAETitle',  formula: 'MAE = (1/n) Σ |yᵢ − ŷᵢ|',     descKey: 'metMAEDesc'  },
  r2:   { titleKey: 'metR2Title',   formula: 'R² = 1 − SSR / SST',           descKey: 'metR2Desc'   },
}

export default function MetricCards({ metrics }: { metrics: MetricKey[] }) {
  const { t } = useLanguage()
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {metrics.map(key => {
        const m = COPY[key]
        return (
          <div
            key={key}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 flex flex-col gap-2"
          >
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide">
              {t(m.titleKey)}
            </p>
            <p className="text-zinc-200 text-sm font-mono leading-snug">{m.formula}</p>
            <p className="text-zinc-500 text-xs leading-relaxed">{t(m.descKey)}</p>
          </div>
        )
      })}
    </div>
  )
}

// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from 'react'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import TranslationWidget from './components/TranslationWidget'
import Hero from './components/Hero'
import LinearRegression from './components/LinearRegression'
import Regularization from './components/Regularization'
import PolynomialRegression from './components/PolynomialRegression'
import LogisticRegression from './components/LogisticRegression'
import References from './components/References'
import Footer from './components/Footer'

const SECTIONS = [
  { id: 'linear', navKey: 'navLinear' },
  { id: 'regularization', navKey: 'navRegularization' },
  { id: 'polynomial', navKey: 'navPolynomial' },
  { id: 'logistic', navKey: 'navLogistic' },
] as const

function SectionNav() {
  const { t } = useLanguage()
  const [active, setActive] = useState('linear')
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setActive(id) }, { rootMargin: '-30% 0px -60% 0px' })
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])
  return (
    <nav className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto py-2 pl-28">
        {SECTIONS.map(({ id, navKey }) => (
          <a key={id} href={`#${id}`} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${active === id ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-zinc-500 hover:text-zinc-200'}`}>
            {t(navKey)}
          </a>
        ))}
      </div>
    </nav>
  )
}

function AppInner() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <TranslationWidget />
      <Hero />
      <SectionNav />
      <main>
        <LinearRegression />
        <Regularization />
        <PolynomialRegression />
        <LogisticRegression />
        <References />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppInner />
      </LanguageProvider>
    </ThemeProvider>
  )
}

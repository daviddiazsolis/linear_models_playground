// SPDX-License-Identifier: Apache-2.0
import { motion } from 'motion/react'
import { BookOpen, ExternalLink } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const books = [
  {
    key: 'refBook1',
    url: 'https://www.statlearning.com/',
  },
  {
    key: 'refBook2',
    url: 'https://www.microsoft.com/en-us/research/uploads/prod/2006/01/Bishop-Pattern-Recognition-and-Machine-Learning-2006.pdf',
  },
]

const links = [
  {
    key: 'refLink1',
    url: 'https://scikit-learn.org/stable/modules/linear_model.html',
  },
  {
    key: 'refLink2',
    url: 'https://hastie.su.domains/ElemStatLearn/',
  },
]

export default function References() {
  const { t } = useLanguage()
  return (
    <section
      id="references"
      className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-zinc-100">{t('refTitle')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Books */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-4">Books</p>
            <ul className="space-y-4">
              {books.map(({ key, url }) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 text-zinc-300 hover:text-blue-400 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{t(key)}</span>
                    <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-4">Online Resources</p>
            <ul className="space-y-4">
              {links.map(({ key, url }) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 text-zinc-300 hover:text-blue-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{t(key)}</span>
                    <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

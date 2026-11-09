import { AnimatePresence, motion } from 'framer-motion'
import { Droplets, Flame, Sparkles, Utensils, Wind, X } from 'lucide-react'
import { getDoshaEducationData, type DoshaKey } from '../data/doshaInfo'
import { useLanguage } from '../contexts/LanguageContext'

interface DoshaEducationModalProps {
  doshaKey: DoshaKey | null
  onClose: () => void
}

const DOSHA_ICONS = {
  vata: Wind,
  pitta: Flame,
  kapha: Droplets,
}

export default function DoshaEducationModal({ doshaKey, onClose }: DoshaEducationModalProps) {
  const { lang } = useLanguage()
  if (!doshaKey) return null

  const info = getDoshaEducationData(doshaKey, lang)
  const Icon = DOSHA_ICONS[doshaKey]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1F2A24]/45 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[28px] border border-[#E9E1D2] bg-white p-6 md:p-7 shadow-2xl space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-2 border-b border-stone-100">
            <div className="flex items-center gap-3.5">
              <div className={`grid h-13 w-13 place-items-center rounded-2xl shadow-sm ${info.colorBadge}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-serif font-bold text-[#1F2A24]">{info.name}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${info.colorBadge}`}>
                    {info.elements}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#8C6B38] mt-0.5">
                  {info.bioRole}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-[#F4EFE6] text-[#67746B] transition hover:bg-[#EAE2D5] hover:text-[#1F2A24] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Plain English/Hindi Concept Summary */}
          <div className="rounded-2xl bg-[#FAF6F0] p-4 border border-[#EEDFCA]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6B38] mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              {lang === 'hi' ? 'सरल शब्दों में समझें' : 'In Plain Terms'}
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-[#2C3E33]">
              {info.simpleSummary}
            </p>
          </div>

          {/* Biological Function & Qualities */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F9F4EE] p-3.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#67746B]">
                {lang === 'hi' ? 'शरीर में क्या करता है?' : 'What it Governs'}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[#1F2A24]">{info.governs}</p>
            </div>

            <div className="rounded-2xl bg-[#F9F4EE] p-3.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#67746B]">
                {lang === 'hi' ? 'दोष के प्राकृतिक गुण' : 'Natural Qualities (Gunas)'}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[#1F2A24]">{info.qualities}</p>
            </div>
          </div>

          {/* Balanced vs Imbalanced state */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#EAF3EA] p-3.5 border border-[#D1E6D1]">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#22543D] flex items-center gap-1.5">
                <span>🌱</span>
                {lang === 'hi' ? 'संतुलित अवस्था में' : 'When Balanced'}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[#1F2A24]">{info.balanced}</p>
            </div>

            <div className="rounded-2xl bg-[#FDF0E1] p-3.5 border border-[#F6DCBD]">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9C4221] flex items-center gap-1.5">
                <span>⚠️</span>
                {lang === 'hi' ? 'असंतुलित होने के लक्षण' : 'Signs of Excess / Imbalance'}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[#1F2A24]">{info.imbalanced}</p>
            </div>
          </div>

          {/* Balancing Routine & Best Foods */}
          <div className="rounded-2xl bg-[#F4F8F5] p-3.5 border border-[#D7E8DC] space-y-2">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2A4638] flex items-center gap-1.5">
                <span>🧘</span>
                {lang === 'hi' ? 'संतुलन बनाए रखने का तरीका' : 'How to Pacify & Balance'}
              </h4>
              <p className="mt-0.5 text-xs leading-relaxed text-[#1F2A24]">{info.balancingTips}</p>
            </div>

            <div className="pt-2 border-t border-[#D7E8DC]/60">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2A4638] flex items-center gap-1.5">
                <Utensils className="h-3 w-3 text-[#2A4638]" />
                {lang === 'hi' ? 'अनुकूल आहार' : 'Favored Foods'}
              </h4>
              <p className="mt-0.5 text-xs leading-relaxed text-[#1F2A24]">{info.bestFoods}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-[#2A4638] py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition hover:bg-[#233D2F] cursor-pointer"
            >
              {lang === 'hi' ? 'समझ आ गया' : 'Got it • Close Guide'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

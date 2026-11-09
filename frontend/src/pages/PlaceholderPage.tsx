import { motion } from 'framer-motion'
import { Leaf, type LucideIcon, FileText, History, Salad, CalendarDays, Sparkles, Settings, CircleDashed } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const iconMap: Record<string, LucideIcon> = {
  Leaf,
  FileText,
  History,
  Salad,
  CalendarDays,
  Sparkles,
  Settings,
  CircleDashed,
}

export default function PlaceholderPage({ title, icon = 'Leaf' }: { title: string; icon?: string }) {
  const { lang } = useLanguage()
  const Icon = iconMap[icon] ?? Leaf

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center"
    >
      <div className="w-full rounded-[28px] border border-[#E8E0D2] bg-[#F9F4EE] p-10 text-center shadow-[0_22px_80px_rgba(42,70,56,0.08)]">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#EAF2EB] text-[#2A4638] shadow-inner ring-1 ring-[#D8E6DA]">
          <Icon className="h-9 w-9" />
        </div>
        <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#1F2A24]">{title}</h2>
        <p className="mt-3 text-base text-[#67746B]">
          {lang === 'hi' ? 'यह पृष्ठ जल्द ही उपलब्ध होगा।' : 'This page is coming soon.'}
        </p>
      </div>
    </motion.section>
  )
}

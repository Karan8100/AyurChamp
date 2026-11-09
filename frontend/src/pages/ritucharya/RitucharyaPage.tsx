import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Compass,
  Droplets,
  Flame,
  Info,
  Leaf,
  Moon,
  Shirt,
  Sparkles,
  Sun,
  Utensils,
  Wind,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cachedAuthFetch, getCached } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { translateRitucharyaText } from '../../data/ritucharyaTranslations_hi'

interface SeasonDoshaDynamics {
  chaya: string | null
  prakopa: string | null
  prashama: string | null
}

interface SeasonAhara {
  predominant_rasa: string[]
  favor_foods: string[]
  moderate_foods: string[]
  water_guidance: string
}

interface SeasonVihara {
  daily_focus: string
  bathing: string
  clothing: string
  sleep_guidance: string
  exercise_guideline: string
  ritu_sandhi_note: string
  physician_note: string
}

interface SeasonDetail {
  id: string
  sanskrit_name: string
  english_name: string
  hindi_name: string
  months: string
  solstice: string
  solstice_meaning: string
  strength_level: string
  agni_state: string
  overview: string
  dosha_dynamics: SeasonDoshaDynamics
  ahara: SeasonAhara
  vihara: SeasonVihara
  chapter_ref: string
}

interface UserSeasonFocus {
  is_dominant_aggravated: boolean
  dominant_dosha: string
  note: string
}

interface RitucharyaData {
  current_season_id: string
  seasons: SeasonDetail[]
  user_focus?: UserSeasonFocus | null
}

const seasonIcons: Record<string, typeof Sun> = {
  varsha: Droplets,
  sharad: Sun,
  hemant: Moon,
  shishir: Wind,
  vasant: Leaf,
  grishma: Flame,
}

const seasonThemeColors: Record<
  string,
  {
    badge: string
    activeBorder: string
    activeBg: string
    accentText: string
    glow: string
    solsticePill: string
  }
> = {
  varsha: {
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    activeBorder: 'border-blue-400',
    activeBg: 'bg-gradient-to-br from-blue-50/80 via-white to-sky-50/50',
    accentText: 'text-blue-900',
    glow: 'bg-blue-400/10',
    solsticePill: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  sharad: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    activeBorder: 'border-amber-400',
    activeBg: 'bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50',
    accentText: 'text-amber-900',
    glow: 'bg-amber-400/10',
    solsticePill: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  hemant: {
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    activeBorder: 'border-indigo-400',
    activeBg: 'bg-gradient-to-br from-indigo-50/80 via-white to-slate-50/50',
    accentText: 'text-indigo-900',
    glow: 'bg-indigo-400/10',
    solsticePill: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  shishir: {
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    activeBorder: 'border-slate-400',
    activeBg: 'bg-gradient-to-br from-slate-50 via-white to-blue-50/40',
    accentText: 'text-slate-900',
    glow: 'bg-slate-400/10',
    solsticePill: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  vasant: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    activeBorder: 'border-emerald-400',
    activeBg: 'bg-gradient-to-br from-emerald-50/80 via-white to-green-50/50',
    accentText: 'text-emerald-900',
    glow: 'bg-emerald-400/10',
    solsticePill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  grishma: {
    badge: 'bg-orange-50 text-orange-800 border-orange-200',
    activeBorder: 'border-orange-400',
    activeBg: 'bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50',
    accentText: 'text-orange-900',
    glow: 'bg-orange-400/10',
    solsticePill: 'bg-orange-50 text-orange-700 border-orange-200',
  },
}

export default function RitucharyaPage() {
  const { lang, t } = useLanguage()
  const initialData = getCached<RitucharyaData>('/ritucharya/details')
  const [data, setData] = useState<RitucharyaData | null>(initialData)
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(initialData?.current_season_id || 'varsha')
  const [activeTab, setActiveTab] = useState<'dynamics' | 'ahara' | 'vihara'>('dynamics')
  const [loading, setLoading] = useState(() => !initialData)
  const [error, setError] = useState('')

  useEffect(() => {
    cachedAuthFetch<RitucharyaData>('/ritucharya/details')
      .then((res) => {
        setData(res)
        setSelectedSeasonId(res.current_season_id || 'varsha')
      })
      .catch((err) => {
        if (!data) setError(err instanceof Error ? err.message : 'Failed to load seasonal data.')
      })
      .finally(() => setLoading(false))
  }, [])


  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#67746B]">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A4638]/30 border-t-[#2A4638]" />
          <p className="text-sm font-medium">Aligning with the Ayurvedic seasonal calendar…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center p-6">
        <div className="w-full rounded-[28px] border border-[#E8E0D2] bg-white p-8 text-center shadow-md">
          <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
          <h2 className="mt-3 text-xl font-semibold text-[#1F2A24]">Seasonal Guide Unavailable</h2>
          <p className="mt-2 text-sm text-[#67746B]">{error || 'Could not load seasonal data.'}</p>
        </div>
      </div>
    )
  }

  const selectedSeason =
    data.seasons.find((s) => s.id === selectedSeasonId) ?? data.seasons[0]
  const isCurrentSeason = selectedSeason.id === data.current_season_id
  const theme = seasonThemeColors[selectedSeason.id] ?? seasonThemeColors.varsha

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8 max-w-6xl mx-auto"
    >
      {/* ── Top Hero Header ────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E0D2]/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF3EA] px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2A4638]">
              <Compass className="h-3 w-3" />
              {t('ritucharya.tag', 'Classical Chronobiology')}
            </span>
            <span className="text-xs font-semibold text-[#67746B]">
              • {t('ritucharya.subTag', '6 Classical Seasons (Shad Ritu)')}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#1F2A24] sm:text-4xl">
            {t('ritucharya.title', 'Ritucharya — Seasonal Wisdom')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#67746B]">
            {t(
              'ritucharya.subtitle',
              'In Ayurveda, nature operates on cyclical rhythms that shift our digestive power, doshic equilibrium, and vitality. Aligning with each season prevents imbalances before they arise.'
            )}
          </p>
        </div>

        {/* Current Active Ritu Badge */}
        <div className="flex-none">
          <div className="rounded-2xl border border-[#D89A4C]/35 bg-[#FFFDF9] px-4 py-3 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9E6218]">
              {t('ritucharya.activePeriod', 'Active Calendar Period')}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
              </span>
              <p className="text-sm font-bold text-[#1F2A24]">
                {lang === 'hi'
                  ? data.seasons.find((s) => s.id === data.current_season_id)?.hindi_name
                  : data.seasons.find((s) => s.id === data.current_season_id)?.sanskrit_name}
              </p>
            </div>
            <p className="mt-0.5 text-xs text-[#67746B]">
              {data.seasons.find((s) => s.id === data.current_season_id)?.months}
            </p>
          </div>
        </div>
      </header>

      {/* ── User Personalized Seasonal Focus Banner (If Assessed) ── */}
      {data.user_focus && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-[24px] border p-5 sm:p-6 shadow-sm ${
            data.user_focus.is_dominant_aggravated
              ? 'border-[#D89A4C]/35 bg-gradient-to-r from-[#FFFDF9] via-[#FAF3E7] to-[#F7EDDC]'
              : 'border-[#6B9E6B]/35 bg-gradient-to-r from-[#F9FCF9] via-[#F1F8F1] to-[#EAF4EA]'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    data.user_focus.is_dominant_aggravated
                      ? 'bg-[#D89A4C]/20 text-[#9E6218]'
                      : 'bg-[#6B9E6B]/20 text-[#245224]'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  {t('ritucharya.constitutionalReflection', 'Constitutional Reflection')} • {data.user_focus.dominant_dosha}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#1F2A24]">
                {data.user_focus.is_dominant_aggravated
                  ? (lang === 'hi'
                      ? `${t('ritucharya.dominantAttention', 'Pay mindful attention to your')} ${data.user_focus.dominant_dosha} ${t('ritucharya.dominantInSeason', 'this season')}`
                      : `Pay mindful attention to your ${data.user_focus.dominant_dosha} this season`)
                  : (lang === 'hi'
                      ? `${t('ritucharya.dominantConstitution', 'Your')} ${data.user_focus.dominant_dosha} ${t('ritucharya.inCurrentSeason', 'constitution in the current season')}`
                      : `Your ${data.user_focus.dominant_dosha} constitution in the current season`)}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-[#5F6B62]">
                {data.user_focus.note}
              </p>
            </div>

            <div className="flex-none">
              <Link
                to="/diet-planner"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2A4638] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#20372B]"
              >
                <span>{t('ritucharya.viewSeasonalDiet', 'View Seasonal Diet')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 6-Season Horizontal Navigation Wheel ──────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#67746B]">
            {t('ritucharya.selectSeason', 'Select A Season To Explore')}
          </p>
          <p className="text-xs text-[#67746B]">
            {t('ritucharya.showing6Seasons', 'Showing 6 classical periods across both solstices')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {data.seasons.map((season) => {
            const isSelected = season.id === selectedSeasonId
            const isLive = season.id === data.current_season_id
            const SIcon = seasonIcons[season.id] ?? Sun

            return (
              <button
                key={season.id}
                type="button"
                onClick={() => setSelectedSeasonId(season.id)}
                className={`relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#2A4638] bg-white shadow-md ring-2 ring-[#2A4638]/10'
                    : 'border border-[#E8E0D2] bg-[#FAF8F5] hover:border-[#D1C7B7] hover:bg-white'
                }`}
              >
                {/* Live season indicator badge */}
                {isLive && (
                  <span className="absolute -top-2 right-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    {t('ritucharya.now', 'Now')}
                  </span>
                )}

                <div>
                  <div
                    className={`mb-2.5 inline-grid h-8 w-8 place-items-center rounded-xl ${
                      isSelected
                        ? 'bg-[#2A4638] text-white'
                        : 'bg-[#EAE4D9] text-[#67746B]'
                    }`}
                  >
                    <SIcon className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#67746B]">
                    {lang === 'hi' ? season.hindi_name : season.english_name}
                  </p>
                  <h4 className="text-sm font-bold text-[#1F2A24] leading-tight">
                    {season.sanskrit_name}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-[#EDE7DD] text-[10px] text-[#67746B]">
                  {season.months.split('–')[0].trim()}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Active Season Detail Card ──────────────────────────────── */}
      <motion.div
        key={selectedSeason.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-[28px] border border-[#E8E0D2] bg-white p-6 sm:p-8 shadow-[0_16px_50px_rgba(42,70,56,0.06)] space-y-6"
      >
        {/* Season Header Info */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E8E0D2]/70">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-0.5 text-xs font-bold border ${theme.badge}`}>
                {selectedSeason.english_name} • {selectedSeason.hindi_name}
              </span>
              <span className="text-xs font-semibold text-[#67746B]">
                {selectedSeason.months}
              </span>
              {isCurrentSeason && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 text-emerald-800 px-2.5 py-0.5 text-[11px] font-bold border border-emerald-300">
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  {t('ritucharya.activeInNature', 'Active In Nature Today')}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2A24]">
              {selectedSeason.sanskrit_name}
            </h2>
            <p className="text-sm leading-relaxed text-[#67746B] max-w-3xl pt-1">
              {translateRitucharyaText(selectedSeason.overview, lang)}
            </p>
          </div>

          {/* Solstice & Vitality Quick Badges */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 min-w-[240px]">
            <div className="rounded-xl bg-[#F8F5EE] p-3 border border-[#E8E0D2]/80">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#67746B]">
                {t('ritucharya.solsticeLabel', 'Solar / Lunar Solstice')}
              </p>
              <p className="mt-0.5 text-xs font-bold text-[#1F2A24]">
                {selectedSeason.solstice.split('(')[0].trim()}
              </p>
            </div>
            <div className="rounded-xl bg-[#F8F5EE] p-3 border border-[#E8E0D2]/80">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#67746B]">
                {t('ritucharya.agniLabel', 'Digestive Fire (Agni)')}
              </p>
              <p className="mt-0.5 text-xs font-bold text-[#1F2A24]">
                {translateRitucharyaText(selectedSeason.agni_state, lang)}
              </p>
            </div>
          </div>
        </div>

        {/* ── 3 Tabs Navigation ─────────────────────────────────────── */}
        <div className="flex border-b border-[#E8E0D2]">
          <button
            type="button"
            onClick={() => setActiveTab('dynamics')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'dynamics'
                ? 'border-[#2A4638] text-[#2A4638]'
                : 'border-transparent text-[#67746B] hover:text-[#1F2A24]'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>{t('ritucharya.tabDynamics', 'Dosha Dynamics & Vitality')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ahara')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'ahara'
                ? 'border-[#2A4638] text-[#2A4638]'
                : 'border-transparent text-[#67746B] hover:text-[#1F2A24]'
            }`}
          >
            <Utensils className="h-4 w-4" />
            <span>{t('ritucharya.tabAhara', 'Ahara (Seasonal Nutrition)')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vihara')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'vihara'
                ? 'border-[#2A4638] text-[#2A4638]'
                : 'border-transparent text-[#67746B] hover:text-[#1F2A24]'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{t('ritucharya.tabVihara', 'Vihara (Lifestyle & Rhythms)')}</span>
          </button>
        </div>

        {/* ── Tab Panels ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {/* TAB 1: DOSHA DYNAMICS & VITALITY */}
          {activeTab === 'dynamics' && (
            <motion.div
              key="dynamics"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 pt-2"
            >
              {/* 3-Stage Dosha Biological Rhythm Tracker */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#1F2A24] mb-3">
                  {t('ritucharya.biologicalRhythm', 'Biological Dosha Rhythm')}
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Chaya */}
                  <div className="rounded-2xl border border-[#D89A4C]/25 bg-gradient-to-br from-[#FFFDF9] to-[#FAF3E7] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9E6218]">
                      {t('ritucharya.chayaAccumulation', 'Chaya (Accumulation)')}
                    </p>
                    <h4 className="mt-1 text-lg font-bold text-[#1F2A24]">
                      {selectedSeason.dosha_dynamics.chaya
                        ? (lang === 'hi' ? `${selectedSeason.dosha_dynamics.chaya} का संचय` : `${selectedSeason.dosha_dynamics.chaya} Begins Building`)
                        : (lang === 'hi' ? 'कोई संचय नहीं' : 'None in Excess')}
                    </h4>
                    <p className="mt-1.5 text-xs text-[#67746B] leading-relaxed">
                      {selectedSeason.dosha_dynamics.chaya
                        ? (lang === 'hi' ? `वातावरणीय बदलाव के कारण ${selectedSeason.dosha_dynamics.chaya} दोष का संचय शुरू होता है।` : `The environment creates subtle warmth or moisture, causing ${selectedSeason.dosha_dynamics.chaya} to quietly gather.`)
                        : (lang === 'hi' ? 'इस ऋतु में किसी दोष का अत्यधिक संचय नहीं होता।' : 'No single dosha accumulates significantly during this phase.')}
                    </p>
                  </div>

                  {/* Prakopa */}
                  <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/70 to-orange-50/40 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-800">
                      {t('ritucharya.prakopaPeak', 'Prakopa (Aggravation / Peak)')}
                    </p>
                    <h4 className="mt-1 text-lg font-bold text-[#1F2A24]">
                      {selectedSeason.dosha_dynamics.prakopa
                        ? (lang === 'hi' ? `${selectedSeason.dosha_dynamics.prakopa} का प्रकोप` : `${selectedSeason.dosha_dynamics.prakopa} is Naturally Active`)
                        : (lang === 'hi' ? 'प्राकृतिक संतुलन' : 'Naturally Balanced')}
                    </h4>
                    <p className="mt-1.5 text-xs text-[#67746B] leading-relaxed">
                      {selectedSeason.dosha_dynamics.prakopa
                        ? (lang === 'hi' ? `मौसमी वातावरण ${selectedSeason.dosha_dynamics.prakopa} को तीव्रता से बढ़ाता है। जीवनशैली में इसे शांत करने पर ध्यान दें।` : `The seasonal atmosphere strongly stimulates ${selectedSeason.dosha_dynamics.prakopa}. Lifestyle adjustments focus on soothing this dosha.`)
                        : (lang === 'hi' ? 'सभी दोष बिना किसी तीव्र प्रकोप के संतुलित रहते हैं।' : 'Doshas remain stable without intense seasonal aggravation.')}
                    </p>
                  </div>

                  {/* Prashama */}
                  <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">
                      {t('ritucharya.prashamaCalming', 'Prashama (Calming / Relief)')}
                    </p>
                    <h4 className="mt-1 text-lg font-bold text-[#1F2A24]">
                      {selectedSeason.dosha_dynamics.prashama
                        ? (lang === 'hi' ? `${selectedSeason.dosha_dynamics.prashama} का शमन` : `${selectedSeason.dosha_dynamics.prashama} Settles Down`)
                        : (lang === 'hi' ? 'स्थिर संतुलन' : 'Stable Rhythm')}
                    </h4>
                    <p className="mt-1.5 text-xs text-[#67746B] leading-relaxed">
                      {selectedSeason.dosha_dynamics.prashama
                        ? (lang === 'hi' ? `मौसम में बदलाव के साथ पूर्व में बढ़ा हुआ ${selectedSeason.dosha_dynamics.prashama} स्वाभाविक रूप से शांत होता है।` : `As environmental conditions change, previously stirred ${selectedSeason.dosha_dynamics.prashama} returns naturally to equilibrium.`)
                        : (lang === 'hi' ? 'स्वाभाविक रूप से स्थिर रहता है।' : 'Maintains steady baseline balance.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cosmic Solstice & Strength Breakdown */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#FAF8F5] p-5 border border-[#E8E0D2]">
                  <div className="flex items-center gap-2 mb-2 text-[#2A4638]">
                    <Sun className="h-4 w-4" />
                    <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#1F2A24]">
                      {selectedSeason.solstice}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#67746B] leading-relaxed">
                    {translateRitucharyaText(selectedSeason.solstice_meaning, lang)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF8F5] p-5 border border-[#E8E0D2]">
                  <div className="flex items-center gap-2 mb-2 text-[#2A4638]">
                    <Flame className="h-4 w-4" />
                    <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#1F2A24]">
                      {t('ritucharya.bodilyStrength', 'Bodily Strength (Bala)')}: {translateRitucharyaText(selectedSeason.strength_level, lang)}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#67746B] leading-relaxed">
                    {lang === 'hi' ? (
                      <>
                        पाचक अग्नि का स्तर{' '}
                        <span className="font-semibold text-[#1F2A24]">
                          {translateRitucharyaText(selectedSeason.agni_state, lang)}
                        </span>{' '}
                        है। इसके अनुसार अपनी कसरत और भोजन की मात्रा को व्यवस्थित करें।
                      </>
                    ) : (
                      <>
                        Digestive capacity is classified as{' '}
                        <span className="font-semibold text-[#1F2A24]">
                          {translateRitucharyaText(selectedSeason.agni_state, lang)}
                        </span>
                        . Adapt your workout intensity and meal densities accordingly.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: AHARA (SEASONAL NUTRITION) */}
          {activeTab === 'ahara' && (
            <motion.div
              key="ahara"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 pt-2"
            >
              {/* Predominant Rasas (Tastes) */}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#67746B] mb-2">
                  {t('ritucharya.tastesToFavor', 'Predominant Tastes To Favor (Shad Rasa)')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSeason.ahara.predominant_rasa.map((rasa) => (
                    <span
                      key={rasa}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF3EA] px-3.5 py-1 text-xs font-semibold text-[#2A4638] border border-[#2A4638]/20"
                    >
                      <Check className="h-3.5 w-3.5 text-[#2A4638]" />
                      {rasa}
                    </span>
                  ))}
                </div>
              </div>

              {/* Favor vs Moderate Foods Grid */}
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Favor Foods */}
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-5">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-800 mb-3">
                    <Check className="h-4 w-4 text-emerald-600" />
                    {t('ritucharya.seasonalFoodsToEnjoy', 'Seasonal Foods To Enjoy')}
                  </h4>
                  <ul className="space-y-2.5">
                    {selectedSeason.ahara.favor_foods.map((food, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1F2A24]">
                        <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-600" />
                        <span>{translateRitucharyaText(food, lang)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Moderate Foods */}
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-5">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-800 mb-3">
                    <X className="h-4 w-4 text-amber-600" />
                    {t('ritucharya.foodsToModerate', 'Foods To Moderate Or Keep Light')}
                  </h4>
                  <ul className="space-y-2.5">
                    {selectedSeason.ahara.moderate_foods.map((food, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1F2A24]">
                        <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-amber-600" />
                        <span>{translateRitucharyaText(food, lang)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Water & Hydration Guidance */}
              <div className="rounded-2xl bg-gradient-to-r from-sky-50/60 to-blue-50/40 p-4 sm:p-5 border border-sky-200/80 flex items-start gap-3">
                <Droplets className="h-5 w-5 text-sky-700 flex-none mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-sky-900">
                    {t('ritucharya.hydrationProtocol', 'Seasonal Hydration & Water Protocol')}
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-sky-950/80">
                    {translateRitucharyaText(selectedSeason.ahara.water_guidance, lang)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: VIHARA (LIFESTYLE & RHYTHMS) */}
          {activeTab === 'vihara' && (
            <motion.div
              key="vihara"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 pt-2"
            >
              {/* Daily Regimen Highlights Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#FAF8F5] p-5 border border-[#E8E0D2]">
                  <div className="flex items-center gap-2 mb-2 text-[#2A4638]">
                    <Clock className="h-4 w-4" />
                    <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#1F2A24]">
                      {t('ritucharya.dailyRoutineFocus', 'Daily Routine Focus')}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#67746B] leading-relaxed">
                    {translateRitucharyaText(selectedSeason.vihara.daily_focus, lang)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF8F5] p-5 border border-[#E8E0D2]">
                  <div className="flex items-center gap-2 mb-2 text-[#2A4638]">
                    <Droplets className="h-4 w-4" />
                    <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#1F2A24]">
                      {t('ritucharya.bathingBodyCare', 'Bathing & Body Care')}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#67746B] leading-relaxed">
                    {translateRitucharyaText(selectedSeason.vihara.bathing, lang)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF8F5] p-5 border border-[#E8E0D2]">
                  <div className="flex items-center gap-2 mb-2 text-[#2A4638]">
                    <Shirt className="h-4 w-4" />
                    <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#1F2A24]">
                      {t('ritucharya.clothingAtmosphere', 'Clothing & Atmosphere')}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#67746B] leading-relaxed">
                    {translateRitucharyaText(selectedSeason.vihara.clothing, lang)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF8F5] p-5 border border-[#E8E0D2]">
                  <div className="flex items-center gap-2 mb-2 text-[#2A4638]">
                    <Moon className="h-4 w-4" />
                    <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#1F2A24]">
                      {t('ritucharya.sleepHabits', 'Sleep Habits (Divaswapna)')}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#67746B] leading-relaxed">
                    {translateRitucharyaText(selectedSeason.vihara.sleep_guidance, lang)}
                  </p>
                </div>
              </div>

              {/* Physical Activity / Exercise Guideline */}
              <div className="rounded-2xl bg-[#FAF8F5] p-5 border border-[#E8E0D2]">
                <div className="flex items-center gap-2 mb-2 text-[#2A4638]">
                  <Wind className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#1F2A24]">
                    {t('ritucharya.exerciseIntensity', 'Exercise (Vyayama) Intensity')}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[#67746B] leading-relaxed">
                  {translateRitucharyaText(selectedSeason.vihara.exercise_guideline, lang)}
                </p>
              </div>

              {/* Ritu Sandhi (Seasonal Junction Guidance) */}
              <div className="rounded-2xl bg-amber-50/50 p-5 border border-amber-200/80">
                <div className="flex items-center gap-2 mb-2 text-amber-900">
                  <Compass className="h-4 w-4 text-amber-700" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-amber-950">
                    {t('ritucharya.rituSandhiTitle', 'Ritu Sandhi — 14-Day Seasonal Junction')}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-amber-950/80 leading-relaxed">
                  {translateRitucharyaText(selectedSeason.vihara.ritu_sandhi_note, lang)}
                </p>
              </div>

              {/* Qualified Physician Disclaimer */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 flex items-start gap-3">
                <Info className="h-4 w-4 text-slate-600 flex-none mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  {translateRitucharyaText(selectedSeason.vihara.physician_note, lang)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Classical Attribution Footer */}
        <div className="pt-6 border-t border-[#E8E0D2]/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8C7E6C]">
          <span className="italic">
            {selectedSeason.chapter_ref}
          </span>
          <span className="font-semibold text-[#2A4638]">
            {t('ritucharya.classicalAttribution', 'Ayushya Classical Knowledge Base')}
          </span>
        </div>
      </motion.div>
    </motion.section>
  )
}

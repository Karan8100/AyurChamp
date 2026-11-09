import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CloudSun,
  Coffee,
  Leaf,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  Utensils,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cachedAuthFetch, getCached } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

interface MealGuide {
  meal: string
  name: string
  description: string
  weekly_adjustment?: string | null
  adapted_for?: string | null
}

interface RituInfo {
  ritu: string
  sanskrit_name: string
  english_name: string
  months: string
  aggravates: string | null
  pacifies: string | null
}

interface SeasonalOverlay {
  note: string
  tips: string[]
  favor: string[]
  reduce: string[]
}

interface VikritiOverlay {
  most_aggravated: string
  tip: string
  days_ago: number
  created_at: string
  vata_delta: number
  pitta_delta: number
  kapha_delta: number
}

interface DietPlanData {
  dosha: string
  dosha_principle: string
  meals: MealGuide[]
  favor_foods: string[]
  reduce_foods: string[]
  ritu: RituInfo
  seasonal: SeasonalOverlay
  vikriti?: VikritiOverlay | null
  has_vikriti: boolean
  vikriti_stale?: boolean
}

const mealIcons: Record<string, typeof Sun> = {
  Breakfast: Coffee,
  Lunch: Sun,
  Dinner: Moon,
}

const rituColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  shishir: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', glow: 'bg-blue-400/10' },
  vasant: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', glow: 'bg-emerald-400/10' },
  grishma: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', glow: 'bg-amber-400/10' },
  varsha: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', glow: 'bg-slate-400/10' },
  sharad: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', glow: 'bg-orange-400/10' },
  hemant: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', glow: 'bg-indigo-400/10' },
}

function VikritiNudgeWidget({ isStale }: { isStale?: boolean }) {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="rounded-[24px] border border-[#D89A4C]/25 bg-gradient-to-br from-[#FDF6EC] via-[#FFF9F0] to-[#FDF0E1] p-6 shadow-[0_8px_30px_rgba(216,154,76,0.08)]"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[#D89A4C]/15 text-[#B2762A] shadow-inner">
          <Sparkles className="h-5.5 w-5.5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#1F2A24]">
            {isStale ? t('dietPlanner.updateVikriti') : t('dietPlanner.knowVikriti')}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[#67746B]">
            {isStale
              ? t('dietPlanner.stalePrompt')
              : t('dietPlanner.newPrompt')}
          </p>
          <Link
            to="/vikriti-assessment"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#D89A4C] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#D89A4C]/20 transition-all hover:bg-[#C27C30] hover:shadow-xl"
          >
            {isStale ? t('dietPlanner.retakeVikritiCheckin') : t('dietPlanner.startVikritiCheckin')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

function VikritiWeeklyBanner({ vikriti }: { vikriti: VikritiOverlay }) {
  const { lang, t } = useLanguage()
  const dosha = vikriti.most_aggravated.toLowerCase()

  const styles = {
    vata: {
      border: 'border-[#6B8FB5]/40',
      bg: 'bg-gradient-to-r from-[#F0F5FA] via-[#F7FAFD] to-[#EAF2F9]',
      badgeBg: 'bg-[#6B8FB5]/15 text-[#30557D] border-[#6B8FB5]/30',
      glow: 'bg-[#6B8FB5]/15',
    },
    pitta: {
      border: 'border-[#D89A4C]/40',
      bg: 'bg-gradient-to-r from-[#FFF9F0] via-[#FFFAF4] to-[#FDF2E2]',
      badgeBg: 'bg-[#D89A4C]/15 text-[#9E6218] border-[#D89A4C]/30',
      glow: 'bg-[#D89A4C]/15',
    },
    kapha: {
      border: 'border-[#6B9E6B]/40',
      bg: 'bg-gradient-to-r from-[#F0F7F0] via-[#F8FAF8] to-[#EAF4EA]',
      badgeBg: 'bg-[#6B9E6B]/15 text-[#2C572C] border-[#6B9E6B]/30',
      glow: 'bg-[#6B9E6B]/15',
    },
  }[dosha] ?? {
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    glow: 'bg-amber-400/10',
  }

  const delta = {
    vata: vikriti.vata_delta,
    pitta: vikriti.pitta_delta,
    kapha: vikriti.kapha_delta,
  }[dosha] ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-[26px] border-2 p-6 shadow-[0_16px_45px_rgba(42,70,56,0.08)] ${styles.border} ${styles.bg}`}
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full ${styles.glow} blur-[50px]`} />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${styles.badgeBg}`}>
              <Sparkles className="h-3.5 w-3.5" />
              {t('dietPlanner.weeklyDynamicAdj')}
            </span>
            <span className="text-xs font-semibold text-[#67746B]">
              • {vikriti.days_ago === 0
                ? t('dietPlanner.checkedToday')
                : t('dietPlanner.checkedDaysAgo').replace('{days}', String(vikriti.days_ago))}
            </span>
            {delta > 0 && (
              <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-[#1F2A24] border border-[#E9E1D2] shadow-xs">
                {t('dietPlanner.vsBaseline').replace('{delta}', String(delta))}
              </span>
            )}
          </div>

          <h2 className="text-lg md:text-xl font-bold tracking-tight text-[#1F2A24]">
            {lang === 'hi' ? (
              <>
                इस सप्ताह: आपका <span className="capitalize">{vikriti.most_aggravated}</span> दोष बढ़ा हुआ है
              </>
            ) : (
              <>
                This week: your <span className="capitalize">{vikriti.most_aggravated}</span> is elevated
              </>
            )}
          </h2>

          <p className="text-sm md:text-base leading-relaxed text-[#1F2A24]/90 font-medium">
            {vikriti.tip}
          </p>
        </div>

        <div className="flex-none pt-2 sm:pt-0">
          <Link
            to="/vikriti-assessment"
            className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-xs font-bold text-[#1F2A24] shadow-sm ring-1 ring-[#D1C7B7] transition hover:bg-white hover:ring-[#2A4638]"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#67746B]" />
            {t('dietPlanner.retakeCheckin')}
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function DietPlannerPage() {
  const { lang, t } = useLanguage()
  const [data, setData] = useState<DietPlanData | null>(() => getCached<DietPlanData>('/diet-plan'))
  const [loading, setLoading] = useState(() => !getCached<DietPlanData>('/diet-plan'))
  const [error, setError] = useState('')

  useEffect(() => {
    cachedAuthFetch<DietPlanData>('/diet-plan')
      .then(setData)
      .catch((err) => {
        if (!data) setError(err instanceof Error ? err.message : 'Failed to load diet plan.')
      })
      .finally(() => setLoading(false))
  }, [])


  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#67746B]">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A4638]/30 border-t-[#2A4638]" />
          <p className="text-sm font-medium">{t('dietPlanner.loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center"
      >
        <div className="w-full rounded-[28px] border border-[#E8E0D2] bg-white p-10 text-center shadow-[0_22px_80px_rgba(42,70,56,0.08)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#1F2A24]">
            {error.includes('assessment') ? t('dietPlanner.assessmentRequired') : t('dietPlanner.unableToLoad')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#67746B]">{error}</p>
          {error.includes('assessment') && (
            <Link
              to="/assessment"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#2A4638] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#2A4638]/15 transition hover:bg-[#233D2F]"
            >
              {t('dietPlanner.startAssessment')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </motion.section>
    )
  }

  const rColors = rituColors[data.ritu.ritu] ?? rituColors.hemant

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-7"
    >
      {/* ── Header: Dosha + Ritu Badge + Level Badge ─────────── */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6B8FB5]">
              {t('dietPlanner.yourDietPlan')}
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                data.has_vikriti
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200/90 shadow-xs'
              }`}
            >
              {data.has_vikriti ? (
                <>
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  {t('dietPlanner.level2Badge')}
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {t('dietPlanner.level1Badge')}
                </>
              )}
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#1F2A24] sm:text-3xl">
            {data.dosha} {t('dietPlanner.constitutionSuffix')}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#67746B]">
            {data.dosha_principle}
          </p>
        </div>

        <div
          className={`flex items-center gap-2.5 rounded-full border px-4 py-2 ${rColors.bg} ${rColors.border}`}
        >
          <CloudSun className={`h-4.5 w-4.5 ${rColors.text}`} />
          <div>
            <p className={`text-xs font-bold ${rColors.text}`}>{data.ritu.sanskrit_name}</p>
            <p className="text-[10px] font-medium text-[#67746B]">
              {data.ritu.english_name} • {data.ritu.months}
            </p>
          </div>
        </div>
      </header>

      {/* ── Weekly Vikriti Overlay OR Level 1 Baseline Conversion Banner ── */}
      {data.vikriti ? (
        <VikritiWeeklyBanner vikriti={data.vikriti} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-[26px] border border-[#D89A4C]/35 bg-gradient-to-br from-[#FFFDF9] via-[#FDF7EE] to-[#FAF1E3] p-6 shadow-[0_14px_40px_rgba(216,154,76,0.08)]"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#D89A4C]/10 blur-[50px]" />
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D89A4C]/15 border border-[#D89A4C]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9E6218]">
                  <Sparkles className="h-3 w-3" />
                  {t('dietPlanner.level1Badge')}
                </span>
                <span className="text-xs font-semibold text-[#8C6D47]">
                  {lang === 'hi' ? '• सामान्य प्रकृति सुझाव' : '• General Prakriti recommendations'}
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-[#1F2A24]">
                {t('dietPlanner.baselineBannerTitle').replace('{dosha}', data.dosha)}
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-[#67746B]">
                {t('dietPlanner.baselineBannerDesc')}
              </p>
            </div>

            <div className="flex-none pt-1 md:pt-0">
              <Link
                to="/vikriti-assessment"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2A4638] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#2A4638]/20 transition-all hover:bg-[#21372C] hover:shadow-xl active:scale-[0.98]"
              >
                <span>{t('dietPlanner.personalizeForWeek')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Seasonal Note Callout (visually distinct) ────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={`relative overflow-hidden rounded-[24px] border p-6 ${rColors.border} ${rColors.bg}`}
      >
        {/* Subtle glow accent */}
        <div className={`pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full ${rColors.glow} blur-[60px]`} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className={`h-4.5 w-4.5 ${rColors.text}`} />
            <h3 className={`text-sm font-bold uppercase tracking-[0.1em] ${rColors.text}`}>
              {t('dietPlanner.seasonalGuidance').replace('{season}', data.ritu.english_name)}
            </h3>
          </div>

          <p className="text-sm leading-relaxed text-[#1F2A24]/80">{data.seasonal.note}</p>

          {data.ritu.aggravates && (
            <p className="mt-3 text-xs font-medium text-[#67746B]">
              {t('dietPlanner.seasonAggravates').replace('{aggravates}', data.ritu.aggravates)}
              {data.ritu.pacifies && (
                <>
                  {' '}{t('dietPlanner.andPacifies').replace('{pacifies}', data.ritu.pacifies)}
                </>
              )}
            </p>
          )}

          {/* Seasonal tips */}
          <div className="mt-4 space-y-2">
            {data.seasonal.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-[#1F2A24]/70">
                <span className={`mt-0.5 h-1.5 w-1.5 flex-none rounded-full ${rColors.text.replace('text-', 'bg-')}`} />
                <span>{tip}</span>
              </div>
            ))}
          </div>

          {/* Seasonal favor/reduce */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/60 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 mb-2">
                {t('dietPlanner.seasonalFavorites')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.seasonal.favor.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-100/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-800"
                  >
                    <Check className="h-3 w-3" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-white/60 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700 mb-2">
                {t('dietPlanner.seasonalReduce')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.seasonal.reduce.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-100/70 px-2.5 py-1 text-[11px] font-semibold text-amber-800"
                  >
                    <X className="h-3 w-3" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Meal Plan Sections ────────────────────────────────── */}
      <div className="grid gap-5 md:grid-cols-3">
        {data.meals.map((meal, i) => {
          const Icon = mealIcons[meal.meal] ?? Utensils
          const mealLabel =
            meal.meal.toLowerCase() === 'breakfast'
              ? t('dietPlanner.breakfast')
              : meal.meal.toLowerCase() === 'lunch'
              ? t('dietPlanner.lunch')
              : meal.meal.toLowerCase() === 'dinner'
              ? t('dietPlanner.dinner')
              : meal.meal

          return (
            <motion.div
              key={meal.meal}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 + i * 0.08 }}
              className="flex flex-col justify-between rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(42,70,56,0.06)] ring-1 ring-[#E8E0D2]/60"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF3EA] text-[#2A4638]">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#67746B]">
                      {mealLabel}
                    </p>
                    <h3 className="text-sm font-semibold text-[#1F2A24]">{meal.name}</h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[#67746B]">{meal.description}</p>

                {/* Level 2 Dynamic Adaptation if present */}
                {meal.weekly_adjustment && (
                  <div className="mt-3.5 rounded-2xl border border-[#D89A4C]/30 bg-gradient-to-br from-[#FFF9F0] to-[#FAF1E3] p-3 shadow-xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#9E6218] uppercase tracking-[0.1em]">
                      <Sparkles className="h-3.5 w-3.5 text-[#D89A4C]" />
                      <span>{t('dietPlanner.adaptedForVikriti').replace('{dosha}', meal.adapted_for || '')}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#6D522B] font-medium">
                      {meal.weekly_adjustment}
                    </p>
                  </div>
                )}
              </div>

              {/* Level 1 Subtle Teaser Hook if no Vikriti check-in */}
              {!data.has_vikriti && (
                <div className="mt-4 pt-3 border-t border-[#F0EAE1]">
                  <Link
                    to="/vikriti-assessment"
                    className="group flex items-center justify-between text-xs text-[#8C6D47] hover:text-[#2A4638] transition-colors"
                  >
                    <span className="line-clamp-1 font-medium text-[11px]">
                      {t('dietPlanner.digestiveDistressQuestion')}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#2A4638] group-hover:translate-x-0.5 transition-transform flex-none ml-1 text-[11px]">
                      {t('dietPlanner.tailorMeal')} <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* ── Favor & Reduce Food Lists ─────────────────────────── */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Favor Foods */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.3 }}
          className="rounded-[24px] bg-white p-6 shadow-[0_12px_40px_rgba(42,70,56,0.06)] ring-1 ring-[#E8E0D2]/60"
        >
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-emerald-700 mb-4">
            <Check className="h-4 w-4" />
            {t('dietPlanner.foodsToFavor')}
          </h3>
          <div className="space-y-2.5">
            {data.favor_foods.map((food) => (
              <div key={food} className="flex items-center gap-3 text-sm text-[#1F2A24]">
                <span className="h-2 w-2 flex-none rounded-full bg-emerald-500" />
                {food}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reduce Foods */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.35 }}
          className="rounded-[24px] bg-white p-6 shadow-[0_12px_40px_rgba(42,70,56,0.06)] ring-1 ring-[#E8E0D2]/60"
        >
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-amber-700 mb-4">
            <AlertTriangle className="h-4 w-4" />
            {t('dietPlanner.foodsToReduce')}
          </h3>
          <div className="space-y-2.5">
            {data.reduce_foods.map((food) => (
              <div key={food} className="flex items-center gap-3 text-sm text-[#1F2A24]">
                <span className="h-2 w-2 flex-none rounded-full bg-amber-500" />
                {food}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Vikriti Nudge Widget ──────────────────────────────── */}
      <AnimatePresence>
        {!data.has_vikriti && <VikritiNudgeWidget isStale={data.vikriti_stale} />}
      </AnimatePresence>
    </motion.section>
  )
}

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  Leaf,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  Wind,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cachedAuthFetch, getCached } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { translateLifestyleText } from '../../data/lifestyleTranslations_hi'

interface SleepGuide {
  duration_hours: string
  recommended_window: string
  temperament: string
  bedtime_ritual: string[]
  weekly_adaptation?: string | null
}

interface ExerciseGuide {
  intensity_level: string
  intensity_meaning: string
  recommended_modalities: string[]
  optimal_time: string
  weekly_adaptation?: string | null
}

interface PranayamaGuide {
  technique_name: string
  technique_sanskrit: string
  description: string
  steps: string[]
  duration: string
  contraindication?: string | null
  weekly_adaptation?: string | null
}

interface DailyClockPhase {
  phase_id: string
  time_window: string
  dosha_active: string
  phase_title: string
  focus: string
  rituals: string[]
}

interface LifestyleRecommendationData {
  dosha: string
  sleep_guide: SleepGuide
  exercise_guide: ExerciseGuide
  pranayama_guide: PranayamaGuide
  daily_timeline: DailyClockPhase[]
  seasonal_note: string
  has_vikriti: boolean
  weekly_banner?: string | null
  chapter_ref: string
}

const clockPhaseColors: Record<
  string,
  { border: string; bg: string; badge: string; icon: typeof Sun }
> = {
  morning: {
    border: 'border-emerald-200',
    bg: 'bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30',
    badge: 'bg-emerald-100/80 text-emerald-800 border-emerald-300',
    icon: Sun,
  },
  midday: {
    border: 'border-amber-200',
    bg: 'bg-gradient-to-br from-amber-50/60 via-white to-orange-50/30',
    badge: 'bg-amber-100/80 text-amber-800 border-amber-300',
    icon: Flame,
  },
  afternoon: {
    border: 'border-blue-200',
    bg: 'bg-gradient-to-br from-blue-50/60 via-white to-sky-50/30',
    badge: 'bg-blue-100/80 text-blue-800 border-blue-300',
    icon: Wind,
  },
  evening: {
    border: 'border-indigo-200',
    bg: 'bg-gradient-to-br from-indigo-50/60 via-white to-slate-50/30',
    badge: 'bg-indigo-100/80 text-indigo-800 border-indigo-300',
    icon: Moon,
  },
}

export default function RecommendationsPage() {
  const { lang, t } = useLanguage()
  const initialData = getCached<LifestyleRecommendationData>('/recommendations/lifestyle')
  const [data, setData] = useState<LifestyleRecommendationData | null>(initialData)
  const [activeTab, setActiveTab] = useState<'clock' | 'sleep' | 'exercise' | 'pranayama'>('clock')
  const [loading, setLoading] = useState(() => !initialData)
  const [error, setError] = useState('')

  useEffect(() => {
    cachedAuthFetch<LifestyleRecommendationData>('/recommendations/lifestyle')
      .then(setData)
      .catch((err) => {
        if (!data) setError(err instanceof Error ? err.message : 'Failed to load lifestyle recommendations.')
      })
      .finally(() => setLoading(false))
  }, [])


  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#67746B]">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A4638]/30 border-t-[#2A4638]" />
          <p className="text-sm font-medium">{t('recommendations.loading', 'Personalizing your daily Ayurvedic regimen…')}</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center p-6"
      >
        <div className="w-full rounded-[28px] border border-[#E8E0D2] bg-white p-8 text-center shadow-md">
          <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
          <h2 className="mt-3 text-xl font-semibold text-[#1F2A24]">
            {error.includes('assessment')
              ? t('recommendations.assessmentRequired', 'Assessment Required')
              : t('recommendations.unableToLoad', 'Unable to Load')}
          </h2>
          <p className="mt-2 text-sm text-[#67746B]">{error || t('recommendations.couldNotLoad', 'Could not load recommendations.')}</p>
          {error.includes('assessment') && (
            <Link
              to="/assessment"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#2A4638] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#20372B]"
            >
              {t('recommendations.startAssessment', 'Start Prakriti Assessment')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-7 max-w-6xl mx-auto"
    >
      {/* ── Header: Title + Level Badge ────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E0D2]/70 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6B8FB5]">
              {t('recommendations.tag', 'Daily Regimen (Dinacharya)')}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                data.has_vikriti
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs'
              }`}
            >
              {data.has_vikriti ? (
                <>
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  {t('recommendations.level2Badge', 'Level 2 • Weekly Adapted Routine')}
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {t('recommendations.level1Badge', 'Level 1 • Baseline Routine')}
                </>
              )}
            </span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-[#1F2A24]">
            {data.dosha} {t('recommendations.guideSuffix', 'Constitution Lifestyle Guide')}
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-[#67746B]">
            {t(
              'recommendations.guideSubtitle',
              'Circadian chronobiology, restorative sleep, exertion limits, and breathwork grounded in your unique biological nature.'
            )}
          </p>
        </div>

        <div className="flex-none">
          <Link
            to="/diet-planner"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D1C7B7] bg-white px-3.5 py-2 text-xs font-bold text-[#1F2A24] shadow-xs transition hover:border-[#2A4638] hover:bg-[#F9F6F0]"
          >
            <span>{t('recommendations.viewDietPlan', 'View Diet Plan')}</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#67746B]" />
          </Link>
        </div>
      </header>

      {/* ── Top Hero Card: Level 2 Adaptation OR Level 1 Hook ───────── */}
      {data.has_vikriti && data.weekly_banner ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[24px] border border-[#D89A4C]/35 bg-gradient-to-r from-[#FFFDF9] via-[#FAF3E7] to-[#F7EDDC] p-5 sm:p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D89A4C]/20 border border-[#D89A4C]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9E6218]">
                  <Sparkles className="h-3 w-3" />
                  {t('recommendations.weeklyDynamicActive', 'Weekly Dynamic Adaptation Active')}
                </span>
              </div>
              <p className="text-sm font-semibold text-[#1F2A24] pt-1 leading-relaxed">
                {translateLifestyleText(data.weekly_banner, lang)}
              </p>
            </div>

            <div className="flex-none">
              <Link
                to="/vikriti-assessment"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3.5 py-2 text-xs font-bold text-[#1F2A24] shadow-xs border border-[#D1C7B7] transition hover:bg-white"
              >
                <RotateCcw className="h-3 w-3 text-[#67746B]" />
                <span>{t('recommendations.updatePulse', 'Update Pulse')}</span>
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[24px] border border-[#D89A4C]/30 bg-gradient-to-br from-[#FFFDF9] via-[#FDF7EE] to-[#FAF1E3] p-5 sm:p-6 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#D89A4C]/15 border border-[#D89A4C]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9E6218]">
                <Sparkles className="h-3 w-3" />
                {t('recommendations.foundationalBaseline', 'Foundational Constitution Baseline')}
              </span>
              <h3 className="text-base font-bold text-[#1F2A24]">
                {lang === 'hi'
                  ? `${t('recommendations.viewingLifelong', 'अपनी आजीवन')} ${data.dosha} ${t('recommendations.lifestyleRhythm', 'जीवनशैली दिनचर्या देख रहे हैं।')}`
                  : `Viewing your lifelong ${data.dosha} lifestyle rhythm.`}
              </h3>
              <p className="text-xs sm:text-sm text-[#67746B] leading-relaxed">
                {t(
                  'recommendations.weeklyCheckinPrompt',
                  'Feeling restless, burned out, or sluggish this week? Complete a 2-minute weekly check-in to dynamically tweak your sleep wind-down rituals, exercise intensity, and breathwork for right now.'
                )}
              </p>
            </div>

            <div className="flex-none">
              <Link
                to="/vikriti-assessment"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2A4638] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#20372B]"
              >
                <span>{t('recommendations.personalizeThisWeek', 'Personalize For This Week')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Seasonal Context Ribbon ─────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E8E0D2] bg-[#FAF8F5] p-4 flex items-start gap-3 text-xs sm:text-sm text-[#5F6B62]">
        <Leaf className="h-4.5 w-4.5 text-[#2A4638] flex-none mt-0.5" />
        <p className="leading-relaxed">{translateLifestyleText(data.seasonal_note, lang)}</p>
      </div>

      {/* ── 4 Interactive Tabs ──────────────────────────────────────── */}
      <div className="flex border-b border-[#E8E0D2] overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('clock')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'clock'
              ? 'border-[#2A4638] text-[#2A4638]'
              : 'border-transparent text-[#67746B] hover:text-[#1F2A24]'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>{t('recommendations.tabClock', 'Daily Clock (Dinacharya)')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sleep')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'sleep'
              ? 'border-[#2A4638] text-[#2A4638]'
              : 'border-transparent text-[#67746B] hover:text-[#1F2A24]'
          }`}
        >
          <Moon className="h-4 w-4" />
          <span>{t('recommendations.tabSleep', 'Sleep & Recovery (Nidra)')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exercise')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'exercise'
              ? 'border-[#2A4638] text-[#2A4638]'
              : 'border-transparent text-[#67746B] hover:text-[#1F2A24]'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>{t('recommendations.tabExercise', 'Exercise & Movement (Vyayama)')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pranayama')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'pranayama'
              ? 'border-[#2A4638] text-[#2A4638]'
              : 'border-transparent text-[#67746B] hover:text-[#1F2A24]'
          }`}
        >
          <Wind className="h-4 w-4" />
          <span>{t('recommendations.tabPranayama', 'Breath & Mind (Pranayama)')}</span>
        </button>
      </div>

      {/* ── Tab Panels ──────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* TAB 1: DAILY CLOCK (DINACHARYA) */}
        {activeTab === 'clock' && (
          <motion.div
            key="clock"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#67746B]">
                {t('recommendations.circadianTitle', 'Ayurvedic Circadian Chronobiology')}
              </p>
              <p className="text-xs text-[#67746B]">
                {t('recommendations.circadianSubtitle', 'Nature shifts doshas every 4 hours throughout the day')}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {data.daily_timeline.map((phase) => {
                const color = clockPhaseColors[phase.phase_id] ?? clockPhaseColors.morning
                const PIcon = color.icon

                return (
                  <div
                    key={phase.phase_id}
                    className={`rounded-[24px] border p-5 sm:p-6 shadow-xs ${color.border} ${color.bg}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${color.badge}`}>
                          <PIcon className="h-3 w-3" />
                          {phase.time_window}
                        </span>
                        <p className="mt-1 text-[11px] font-semibold text-[#67746B]">
                          {t(`recommendations.clockPhases.${phase.phase_id}.active`, phase.dosha_active)}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[#1F2A24] mb-1">
                      {t(`recommendations.clockPhases.${phase.phase_id}.title`, phase.phase_title)}
                    </h3>
                    <p className="text-xs text-[#5F6B62] leading-relaxed mb-4">
                      {t(`recommendations.clockPhases.${phase.phase_id}.focus`, phase.focus)}
                    </p>

                    <div className="space-y-2 border-t border-[#E8E0D2]/70 pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#67746B]">
                        {t('recommendations.keyActions', 'Key Self-Care Actions:')}
                      </p>
                      <ul className="space-y-1.5">
                        {phase.rituals.map((ritual, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-[#1F2A24]">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#2A4638] flex-none mt-0.5" />
                            <span className="leading-relaxed">{translateLifestyleText(ritual, lang)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 2: SLEEP & RECOVERY (NIDRA) */}
        {activeTab === 'sleep' && (
          <motion.div
            key="sleep"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#E8E0D2] bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 text-[#2A4638] mb-1">
                  <Moon className="h-4 w-4" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#67746B]">
                    {t('recommendations.recommendedRest', 'Recommended Nightly Rest')}
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-[#1F2A24]">
                  {translateLifestyleText(data.sleep_guide.duration_hours, lang)}
                </h3>
                <p className="mt-1 text-xs text-[#67746B]">
                  {lang === 'hi'
                    ? `आपकी ${data.dosha} चयापचय और विश्राम आवश्यकताओं के अनुसार`
                    : `Tailored to your ${data.dosha} metabolism and restorative needs`}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8E0D2] bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 text-[#2A4638] mb-1">
                  <Clock className="h-4 w-4" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#67746B]">
                    {t('recommendations.optimalSleepWindow', 'Optimal Sleep Window')}
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-[#1F2A24]">
                  {translateLifestyleText(data.sleep_guide.recommended_window, lang)}
                </h3>
                <p className="mt-1 text-xs text-[#67746B]">
                  {lang === 'hi'
                    ? 'रात १० बजे से पहले सोने से मध्यरात्रि में पित्त उत्तेजना से नींद नहीं टूटती'
                    : 'Falling asleep before 10 PM prevents midnight Pitta wakefulness'}
                </p>
              </div>
            </div>

            {/* Natural Temperament */}
            <div className="rounded-2xl border border-[#E8E0D2] bg-[#FAF8F5] p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2A24] mb-1.5">
                {t('recommendations.naturalTemperament', 'Natural Sleep Temperament')}
              </h4>
              <p className="text-xs sm:text-sm text-[#5F6B62] leading-relaxed">
                {translateLifestyleText(data.sleep_guide.temperament, lang)}
              </p>
            </div>

            {/* Weekly Dynamic Adaptation (Level 2) */}
            {data.sleep_guide.weekly_adaptation && (
              <div className="rounded-2xl border border-[#D89A4C]/35 bg-gradient-to-r from-[#FFFDF9] to-[#FAF3E7] p-5 shadow-xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#9E6218] uppercase tracking-wider mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#D89A4C]" />
                  <span>{t('recommendations.weeklySleepTweak', 'Weekly Dynamic Sleep Tweak')}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#6D522B] leading-relaxed font-medium">
                  {translateLifestyleText(data.sleep_guide.weekly_adaptation, lang)}
                </p>
              </div>
            )}

            {/* Bedtime Ritual Checklist */}
            <div className="rounded-2xl border border-[#E8E0D2] bg-white p-6 shadow-xs">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#1F2A24] mb-3">
                {t('recommendations.bedtimeRitual', 'Recommended Evening Bedtime Ritual')}
              </h4>
              <ul className="space-y-2.5">
                {data.sleep_guide.bedtime_ritual.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1F2A24]">
                    <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-[#2A4638]" />
                    <span className="leading-relaxed">{translateLifestyleText(step, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* TAB 3: EXERCISE & MOVEMENT (VYAYAMA) */}
        {activeTab === 'exercise' && (
          <motion.div
            key="exercise"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* The Classical Ardha-Shakti Principle Card */}
            <div className="rounded-[24px] border border-[#2A4638]/20 bg-gradient-to-br from-[#F4F8F4] via-white to-[#EAF3EA] p-6 shadow-xs">
              <div className="flex items-center gap-2 text-[#2A4638] mb-1.5">
                <Activity className="h-4.5 w-4.5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                  {t('recommendations.ardhaShaktiRule', 'The Classical Exertion Rule (Ardha-Shakti)')}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#1F2A24]">
                {t('recommendations.targetIntensity', 'Target Intensity')}: {translateLifestyleText(data.exercise_guide.intensity_level, lang)}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#5F6B62] leading-relaxed">
                {translateLifestyleText(data.exercise_guide.intensity_meaning, lang)}
              </p>
              <div className="mt-4 pt-3 border-t border-[#E8E0D2]/70 text-xs text-[#67746B]">
                {t('recommendations.optimalWorkoutTime', 'Optimal Workout Time')}:{' '}
                <span className="font-semibold text-[#1F2A24]">
                  {translateLifestyleText(data.exercise_guide.optimal_time, lang)}
                </span>
              </div>
            </div>

            {/* Weekly Dynamic Adaptation (Level 2) */}
            {data.exercise_guide.weekly_adaptation && (
              <div className="rounded-2xl border border-[#D89A4C]/35 bg-gradient-to-r from-[#FFFDF9] to-[#FAF3E7] p-5 shadow-xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#9E6218] uppercase tracking-wider mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#D89A4C]" />
                  <span>{t('recommendations.weeklyMovementTweak', 'Weekly Movement Adjustment')}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#6D522B] leading-relaxed font-medium">
                  {translateLifestyleText(data.exercise_guide.weekly_adaptation, lang)}
                </p>
              </div>
            )}

            {/* Recommended Modalities */}
            <div className="rounded-2xl border border-[#E8E0D2] bg-white p-6 shadow-xs">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#1F2A24] mb-3">
                {lang === 'hi'
                  ? `${data.dosha} ${t('recommendations.recommendedStyles', 'Recommended Movement Styles for')}`
                  : `${t('recommendations.recommendedStyles', 'Recommended Movement Styles for')} ${data.dosha}`}
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.exercise_guide.recommended_modalities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl bg-[#FAF8F5] p-3 border border-[#E8E0D2]/70 text-xs sm:text-sm text-[#1F2A24]"
                  >
                    <Check className="h-4 w-4 text-[#2A4638] flex-none mt-0.5" />
                    <span>{translateLifestyleText(item, lang)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: BREATH & MIND (PRANAYAMA) */}
        {activeTab === 'pranayama' && (
          <motion.div
            key="pranayama"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Primary Technique Card */}
            <div className="rounded-[24px] border border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-sky-50/30 p-6 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-900">
                  {t('recommendations.primaryBreathwork', 'Primary Breathwork (Pranayama)')}
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-800 border border-blue-200">
                  {translateLifestyleText(data.pranayama_guide.duration, lang)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#1F2A24]">
                {data.pranayama_guide.technique_name}
              </h3>
              <p className="text-xs font-medium text-[#67746B] mb-2">
                {data.pranayama_guide.technique_sanskrit}
              </p>
              <p className="text-xs sm:text-sm text-[#5F6B62] leading-relaxed">
                {translateLifestyleText(data.pranayama_guide.description, lang)}
              </p>
            </div>

            {/* Weekly Dynamic Adaptation (Level 2) */}
            {data.pranayama_guide.weekly_adaptation && (
              <div className="rounded-2xl border border-[#D89A4C]/35 bg-gradient-to-r from-[#FFFDF9] to-[#FAF3E7] p-5 shadow-xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#9E6218] uppercase tracking-wider mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#D89A4C]" />
                  <span>{t('recommendations.weeklyBreathworkTweak', 'Weekly Breathwork Adjustment')}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#6D522B] leading-relaxed font-medium">
                  {translateLifestyleText(data.pranayama_guide.weekly_adaptation, lang)}
                </p>
              </div>
            )}

            {/* Step by step practice guide */}
            <div className="rounded-2xl border border-[#E8E0D2] bg-white p-6 shadow-xs">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#1F2A24] mb-3">
                {t('recommendations.stepByStep', 'How to Practice Step-by-Step')}
              </h4>
              <ol className="space-y-3">
                {data.pranayama_guide.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#1F2A24]">
                    <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-[#EAF3EA] text-xs font-bold text-[#2A4638]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{translateLifestyleText(step, lang)}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Contraindication Safety Warning (e.g. Bhastrika/Kapalabhati) */}
            {data.pranayama_guide.contraindication && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-700 flex-none mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    {t('recommendations.healthPrecaution', 'Important Health Precaution')}
                  </h5>
                  <p className="mt-1 text-xs sm:text-sm text-amber-950/85 leading-relaxed">
                    {translateLifestyleText(data.pranayama_guide.contraindication, lang)}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Classical Attribution Footer ────────────────────────────── */}
      <footer className="pt-4 border-t border-[#E8E0D2]/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8C7E6C]">
        <span className="italic">{data.chapter_ref}</span>
        <span className="font-semibold text-[#2A4638]">
          {t('recommendations.classicalAttribution', 'Ayushya Classical Lifestyle Foundation')}
        </span>
      </footer>
    </motion.section>
  )
}

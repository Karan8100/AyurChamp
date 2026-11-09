import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Droplets,
  FileText,
  Flame,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Wind,
} from 'lucide-react'
import { cachedAuthFetch, getCached } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import ProgressionChart, {
  type BaselinePrakriti,
  type ProgressionPoint,
} from '../../components/history/ProgressionChart'
import DoshaDeviationCard from '../../components/history/DoshaDeviationCard'

type VikritiProgressionResponse = {
  baseline_prakriti: BaselinePrakriti
  timeline: ProgressionPoint[]
  current_deviation_index: number
  deviation_level: string
  deviation_label: string
  trend_summary: string
  trend_direction: string
  total_checkins: number
  latest_checkin_date: string | null
  is_demo_data: boolean
}

type VikritiHistoryItem = {
  checkin_id: number
  created_at: string
  date_formatted: string
  vata_score: number
  pitta_score: number
  kapha_score: number
  vata_delta: number
  pitta_delta: number
  kapha_delta: number
  most_aggravated: string
  deviation_index: number
  symptoms?: Record<string, string> | null
  clinical_milestone?: string | null
}

type VikritiHistoryResponse = {
  items: VikritiHistoryItem[]
  total_count: number
  is_demo_data: boolean
}

type AssessmentHistoryItem = {
  session_id: number
  completed_at: string | null
  started_at: string | null
  result_type: string
  vata_score: number
  pitta_score: number
  kapha_score: number
  phase_reached: number
  total_questions: number
}

type AssessmentHistoryResponse = {
  items: AssessmentHistoryItem[]
  total_count: number
  is_demo_data: boolean
}

export default function AssessmentHistoryPage() {
  const { lang, t } = useLanguage()

  const cachedProg = getCached<VikritiProgressionResponse>('/vikriti/progression')
  const cachedVik = getCached<VikritiHistoryResponse>('/vikriti/history')
  const cachedPrak = getCached<AssessmentHistoryResponse>('/assessment/history')

  const [progression, setProgression] = useState<VikritiProgressionResponse | null>(cachedProg)
  const [vikritiHistory, setVikritiHistory] = useState<VikritiHistoryResponse | null>(cachedVik)
  const [prakritiHistory, setPrakritiHistory] = useState<AssessmentHistoryResponse | null>(cachedPrak)
  const [isLoading, setIsLoading] = useState(() => !cachedProg && !cachedVik)
  const [activeTab, setActiveTab] = useState<'vikriti' | 'prakriti'>('vikriti')
  const [expandedCheckinId, setExpandedCheckinId] = useState<number | null>(() => {
    return cachedVik?.items?.[0]?.checkin_id ?? null
  })

  const isGuest = useMemo(() => {
    return localStorage.getItem('ayushya_is_guest') === 'true'
  }, [])

  useEffect(() => {
    if (!cachedProg && !cachedVik) setIsLoading(true)
    Promise.allSettled([
      cachedAuthFetch<VikritiProgressionResponse>('/vikriti/progression'),
      cachedAuthFetch<VikritiHistoryResponse>('/vikriti/history'),
      cachedAuthFetch<AssessmentHistoryResponse>('/assessment/history'),
    ])
      .then(([progRes, vikRes, prakRes]) => {
        if (progRes.status === 'fulfilled') setProgression(progRes.value)
        if (vikRes.status === 'fulfilled') {
          setVikritiHistory(vikRes.value)
          if (vikRes.value.items.length > 0 && !expandedCheckinId) {
            setExpandedCheckinId(vikRes.value.items[0].checkin_id)
          }
        }
        if (prakRes.status === 'fulfilled') setPrakritiHistory(prakRes.value)
      })
      .finally(() => setIsLoading(false))
  }, [])


  const isDemoMode = isGuest || progression?.is_demo_data

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 space-y-6 animate-pulse">
        <div className="h-28 bg-stone-200/70 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-stone-200/70 rounded-3xl" />
          <div className="h-64 bg-stone-200/70 rounded-3xl" />
          <div className="h-64 bg-stone-200/70 rounded-3xl" />
        </div>
        <div className="h-96 bg-stone-200/70 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {t('history.title')}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2A4638]/10 text-[#2A4638] text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'दीर्घकालिक ट्रैकिंग' : 'Longitudinal Tracking'}</span>
            </span>
          </div>
          <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
            {t('history.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/vikriti-assessment"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2A4638] hover:bg-[#1E3529] text-white text-sm font-semibold shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('history.startWeeklyCheckin')}</span>
          </Link>
        </div>
      </div>

      {/* Guest / Demo Mode Educational Case Study Banner */}
      {isDemoMode && (
        <div className="rounded-3xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-surface-soft to-stone-50 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2A4638] text-[#E2D5BE] flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                🌿
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                    {t('history.demoBannerTitle')}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                    Demo Case Study
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
                  {t('history.demoBannerDesc')}
                </p>
              </div>
            </div>

            {isGuest && (
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2A4638] hover:bg-[#1E3529] text-white text-xs sm:text-sm font-semibold shadow-xs transition shrink-0 self-end md:self-center"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t('common.createFreeAccount')}</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Overview Metrics Grid (3 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: DII Deviation Index & Level */}
        {progression && (
          <DoshaDeviationCard
            deviationIndex={progression.current_deviation_index}
            deviationLevel={progression.deviation_level}
            deviationLabel={progression.deviation_label}
            trendSummary={progression.trend_summary}
            trendDirection={progression.trend_direction}
          />
        )}

        {/* Card 2: Janma Prakriti Baseline Benchmark */}
        <div className="bg-white rounded-3xl border border-[#E5DED1] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#2A4638]/10 text-[#2A4638] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    {t('history.baselineConstitution')}
                  </h4>
                  <span className="text-[11px] text-stone-500 font-mono">
                    {progression?.baseline_prakriti.result_type.replace('_', '-').toUpperCase()}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Pitta-Kapha
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              {t('history.janmaPrakritiDesc')}
            </p>

            {/* Dosha Baseline Proportion Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-semibold text-[#5B8FB9]">
                  <Wind className="w-3.5 h-3.5" /> Vata
                </span>
                <span className="font-mono font-bold text-stone-800">
                  {progression?.baseline_prakriti.vata}%
                </span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#5B8FB9] h-full rounded-full"
                  style={{ width: `${progression?.baseline_prakriti.vata}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="flex items-center gap-1 font-semibold text-[#D97706]">
                  <Flame className="w-3.5 h-3.5" /> Pitta
                </span>
                <span className="font-mono font-bold text-stone-800">
                  {progression?.baseline_prakriti.pitta}%
                </span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#D97706] h-full rounded-full"
                  style={{ width: `${progression?.baseline_prakriti.pitta}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="flex items-center gap-1 font-semibold text-[#15803D]">
                  <Droplets className="w-3.5 h-3.5" /> Kapha
                </span>
                <span className="font-mono font-bold text-stone-800">
                  {progression?.baseline_prakriti.kapha}%
                </span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#15803D] h-full rounded-full"
                  style={{ width: `${progression?.baseline_prakriti.kapha}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-stone-200">
            <Link
              to="/prakruti-report"
              className="inline-flex items-center justify-between w-full text-xs font-semibold text-[#2A4638] hover:text-[#1E3529] group transition"
            >
              <span>{t('history.viewFullDossier')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Card 3: Check-in Consistency & Schedule */}
        <div className="bg-white rounded-3xl border border-[#E5DED1] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#2A4638]/10 text-[#2A4638] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    {t('history.checkinFrequency')}
                  </h4>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Dashavidha Pariksha
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-800">
                100% Adherent
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="text-2xl font-serif font-bold text-stone-900 font-mono">
                  {progression?.total_checkins || 0}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                  {t('history.weeklyCheckinsCompleted')}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="text-2xl font-serif font-bold text-emerald-800 font-mono">
                  {t('history.inDays')}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                  {t('history.nextCheckinDue')}
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {lang === 'hi'
                ? 'साप्ताहिक चेक-इन से मौसमी बदलावों और खान-पान के तात्कालिक असर का पता चलता है।'
                : 'Weekly check-ins capture transient doshic shifts before they manifest as chronic imbalances.'}
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-stone-200">
            <Link
              to="/assessment"
              className="inline-flex items-center justify-between w-full text-xs font-semibold text-stone-600 hover:text-stone-900 group transition"
            >
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                {t('history.retakeAssessment')}
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Progression Chart */}
      {progression && (
        <ProgressionChart
          timeline={progression.timeline}
          baseline={progression.baseline_prakriti}
        />
      )}

      {/* Clinical Interventions & Milestones Section */}
      <div className="bg-white rounded-3xl border border-[#E5DED1] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between gap-3 pb-5 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#D97706]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {t('history.clinicalInterventions')}
              </h3>
              <p className="text-xs text-stone-500">
                {t('history.milestonesDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="relative border-l-2 border-emerald-200 ml-4 sm:ml-6 space-y-6 pb-2">
          {progression?.timeline.map((point) => (
            <div key={point.checkin_id} className="relative pl-6 sm:pl-8 group">
              {/* Dot marker */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#2A4638] group-hover:bg-[#2A4638] transition-colors" />

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 hover:border-emerald-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900 font-serif">
                      {point.week_label}
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      • {point.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-500 font-mono">
                      Deviation: {point.deviation_index}%
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        point.most_aggravated === 'pitta'
                          ? 'bg-amber-100 text-amber-900'
                          : point.most_aggravated === 'vata'
                          ? 'bg-sky-100 text-sky-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {point.most_aggravated} elevated
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed italic">
                  {point.clinical_milestone ||
                    (lang === 'hi'
                      ? 'साप्ताहिक आहार व दिनचर्या प्रोटोकॉल जारी रहा।'
                      : 'Standard Ahara & Dinacharya adherence recorded.')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Records Tabs Section */}
      <div className="bg-white rounded-3xl border border-[#E5DED1] p-6 sm:p-8 shadow-xs">
        {/* Tab Switcher */}
        <div className="flex items-center gap-3 pb-5 border-b border-stone-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('vikriti')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'vikriti'
                ? 'bg-[#2A4638] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t('history.weeklyVikritiTab')}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'vikriti' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {vikritiHistory?.total_count || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('prakriti')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'prakriti'
                ? 'bg-[#2A4638] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('history.prakritiBaselineTab')}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'prakriti' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {prakritiHistory?.total_count || 0}
            </span>
          </button>
        </div>

        {/* Tab 1: Weekly Vikriti History */}
        {activeTab === 'vikriti' && (
          <div className="space-y-4">
            {vikritiHistory?.items.map((item, idx) => {
              const isExpanded = expandedCheckinId === item.checkin_id
              return (
                <div
                  key={item.checkin_id}
                  className="rounded-2xl border border-stone-200 hover:border-stone-300 transition-all overflow-hidden bg-white"
                >
                  <div
                    onClick={() =>
                      setExpandedCheckinId(isExpanded ? null : item.checkin_id)
                    }
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 cursor-pointer bg-stone-50/60 hover:bg-stone-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-serif font-bold text-stone-800 shadow-xs">
                        #{vikritiHistory.items.length - idx}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-stone-900">
                            {item.date_formatted}
                          </h4>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              item.most_aggravated === 'pitta'
                                ? 'bg-amber-100 text-amber-900'
                                : item.most_aggravated === 'vata'
                                ? 'bg-sky-100 text-sky-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {item.most_aggravated} spike
                          </span>
                        </div>
                        <span className="text-xs text-stone-500 font-mono">
                          Deviation: {item.deviation_index}%
                        </span>
                      </div>
                    </div>

                    {/* Dosha Pill Summary */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="px-2 py-1 rounded-lg bg-[#5B8FB9]/10 text-[#2D5477] font-semibold">
                          V: {item.vata_score}% ({item.vata_delta > 0 ? `+${item.vata_delta}` : item.vata_delta}%)
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-[#D97706]/10 text-[#92400E] font-semibold">
                          P: {item.pitta_score}% ({item.pitta_delta > 0 ? `+${item.pitta_delta}` : item.pitta_delta}%)
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-[#15803D]/10 text-[#14532D] font-semibold">
                          K: {item.kapha_score}% ({item.kapha_delta > 0 ? `+${item.kapha_delta}` : item.kapha_delta}%)
                        </span>
                      </div>

                      <div className="text-stone-400">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Symptom Details */}
                  {isExpanded && (
                    <div className="p-5 border-t border-stone-200 bg-white">
                      {item.clinical_milestone && (
                        <div className="mb-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 italic">
                          <span className="font-bold not-italic">
                            {lang === 'hi' ? 'नैदानिक मील का पत्थर: ' : 'Milestone: '}
                          </span>
                          {item.clinical_milestone}
                        </div>
                      )}

                      <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
                        {t('history.symptomsRecorded')}
                      </h5>

                      {item.symptoms ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {Object.entries(item.symptoms).map(([key, val]) => (
                            <div
                              key={key}
                              className="p-3 rounded-xl bg-stone-50 border border-stone-200/70"
                            >
                              <span className="font-semibold text-stone-800 capitalize block mb-0.5">
                                {key === 'digestion'
                                  ? t('history.digestion')
                                  : key === 'sleep'
                                  ? t('history.sleep')
                                  : key === 'mood'
                                  ? t('history.mood')
                                  : t('history.skin')}
                              </span>
                              <span className="text-stone-600">{val}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-stone-500 italic">
                          {lang === 'hi'
                            ? 'इस परीक्षण के विस्तृत उत्तर सुरक्षित हैं।'
                            : 'Standard diagnostic answers recorded for this session.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Tab 2: Prakriti Baseline Assessments */}
        {activeTab === 'prakriti' && (
          <div className="space-y-4">
            {prakritiHistory?.items && prakritiHistory.items.length > 0 ? (
              prakritiHistory.items.map((item) => (
                <div
                  key={item.session_id}
                  className="rounded-2xl border border-stone-200 p-5 bg-stone-50/40 hover:bg-stone-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#2A4638] text-[#E2D5BE] flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                      P
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-stone-900 font-serif">
                          {item.result_type.replace('_', '-').toUpperCase()} (Dvandvaja)
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                          Baseline Active
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {item.completed_at
                          ? new Date(item.completed_at).toLocaleDateString(
                              lang === 'hi' ? 'hi-IN' : 'en-IN',
                              { day: 'numeric', month: 'short', year: 'numeric' },
                            )
                          : 'Initial Assessment'}{' '}
                        • {item.total_questions} Questions Validated
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-[#5B8FB9]/10 text-[#2D5477] font-semibold">
                        V: {item.vata_score}%
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#D97706]/10 text-[#92400E] font-semibold">
                        P: {item.pitta_score}%
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#15803D]/10 text-[#14532D] font-semibold">
                        K: {item.kapha_score}%
                      </span>
                    </div>

                    <Link
                      to="/prakruti-report"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2A4638] hover:bg-[#1E3529] text-white text-xs font-semibold shadow-xs transition shrink-0"
                    >
                      <span>{t('history.viewFullDossier')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-stone-500 text-sm">
                <ShieldAlert className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p>{t('history.noAssessmentsYet')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

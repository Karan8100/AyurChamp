import { useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, BookOpen, Leaf, Sparkles, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authFetch, clearApiCache } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { VIKRITI_QUESTIONS_HI } from '../../data/vikritiQuestions_hi'

type Dosha = 'vata' | 'pitta' | 'kapha'

interface Option {
  dosha: Dosha
  text: string
  image_key?: string
  display_label?: string
}

interface Question {
  id: string
  phase: number
  domain?: string
  source_note?: string
  text: string
  options: Option[]
}

interface VikritiResult {
  checkin_id: number
  vata_score: number
  pitta_score: number
  kapha_score: number
  vata_delta: number
  pitta_delta: number
  kapha_delta: number
  most_aggravated: string
  created_at: string
  days_ago: number
  is_stale: boolean
}

interface Step {
  question: Question
  selectedDosha: Dosha | null
}

function FullScreenHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-[#E9E1D2]/60">
      <div className="flex items-center gap-2.5">
        <img src="/ayushya new logo.png" alt="Ayushya" className="h-9 w-auto object-contain rounded-xl" />
        <span className="text-lg font-bold tracking-tight text-[#1F2A24]">Ayushya</span>
      </div>


      <button
        type="button"
        onClick={onClose}
        aria-label="Close Vikriti assessment"
        className="grid h-9 w-9 place-items-center rounded-full bg-[#F4EFE6] text-[#67746B] transition hover:bg-[#EAE2D5] hover:text-[#1F2A24]"
      >
        <X className="h-5 w-5" />
      </button>
    </header>
  )
}

function FullScreenShell({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="relative min-h-screen bg-[#F6F1E7] px-4 pt-24 pb-12 flex flex-col items-center justify-center">
      <FullScreenHeader onClose={onClose} />
      <div className="w-full max-w-2xl flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  )
}

export default function VikritiAssessmentPage() {
  const navigate = useNavigate()
  const { lang, t } = useLanguage()

  const [phase, setPhase] = useState<'intro' | 'running' | 'completed'>('intro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkinId, setCheckinId] = useState<number | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [pointer, setPointer] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [, setResult] = useState<VikritiResult | null>(null)

  const pendingAnswersRef = useRef<Map<string, Promise<any>>>(new Map())

  const handleClose = () => {
    navigate('/diet-planner')
  }

  const startCheckin = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await authFetch<{
        checkin_id: number
        question: Question
        all_questions?: Question[]
        total_questions: number
      }>('/vikriti/start', {
        method: 'POST',
      })
      setCheckinId(data.checkin_id)
      const initialQuestions =
        data.all_questions && data.all_questions.length > 0
          ? data.all_questions
          : [data.question]
      setSteps(initialQuestions.map((q) => ({ question: q, selectedDosha: null })))
      setPointer(0)
      pendingAnswersRef.current.clear()
      setPhase('running')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the Vikriti check-in.')
    } finally {
      setLoading(false)
    }
  }

  const sendAnswerInBackground = (questionId: string, dosha: Dosha, cId: number) => {
    const promise = authFetch<{
      checkin_id: number
      status: 'in_progress' | 'completed'
      next_question?: Question
      result?: VikritiResult
    }>(`/vikriti/${cId}/answer`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        selected_dosha: dosha,
      }),
    }).catch((err) => {
      console.error(`Failed to record Vikriti answer for ${questionId}:`, err)
      throw err
    })

    pendingAnswersRef.current.set(questionId, promise)
    return promise
  }

  const handleViewDietPlan = () => {
    clearApiCache()
    navigate('/diet-planner')
  }


  // 1. Intro Screen
  if (phase === 'intro') {
    return (
      <FullScreenShell onClose={handleClose}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto w-full max-w-xl rounded-[32px] border border-[#E9E1D2] bg-white p-8 md:p-10 text-center shadow-[0_28px_90px_rgba(42,70,56,0.08)]"
        >
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#FDF6EC] text-[#D89A4C] shadow-inner ring-1 ring-[#F4D9B6]">
            <Sparkles className="h-9 w-9" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#1F2A24]">
            {t('assessment.vikritiIntroTitle')}
          </h1>

          <p className="mt-4 text-base leading-7 text-[#67746B]">
            {t('assessment.vikritiIntroDesc')}
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#FDF6EC]/70 px-4 py-3 text-xs font-medium text-[#B2762A] border border-[#D89A4C]/20">
            <span>✨</span>
            <span>{t('assessment.vikritiIntroFocus')}</span>
          </div>

          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

          <button
            type="button"
            onClick={startCheckin}
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D89A4C] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#D89A4C]/20 transition hover:bg-[#C27C30] disabled:opacity-60 cursor-pointer"
          >
            {loading ? t('common.saving') : t('common.begin')}
            {!loading && <ArrowRight className="h-5 w-5" />}
          </button>
        </motion.div>
      </FullScreenShell>
    )
  }

  // 2. Completion Screen
  if (phase === 'completed') {
    return (
      <FullScreenShell onClose={handleClose}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto w-full max-w-lg rounded-[32px] border border-[#E9E1D2] bg-white p-8 md:p-10 text-center shadow-[0_28px_90px_rgba(42,70,56,0.1)]"
        >
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#EEF5EE] text-[#2A4638] ring-1 ring-[#D9E4DA]">
            <Leaf className="h-10 w-10 text-[#2A4638]" />
          </div>

          <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#1F2A24]">
            {t('assessment.vikritiDoneTitle')}
          </h2>

          <p className="mt-3 text-base leading-7 text-[#67746B]">
            {t('assessment.vikritiDoneDesc')}
          </p>

          <button
            type="button"
            onClick={handleViewDietPlan}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2A4638] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#2A4638]/15 transition hover:bg-[#233D2F] cursor-pointer"
          >
            {t('common.viewDietPlan')}
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </FullScreenShell>
    )
  }

  // 3. Question Screen
  const currentStep = steps[pointer]
  if (!currentStep) return null

  const currentQuestion = currentStep.question
  const translatedQ = lang === 'hi' ? VIKRITI_QUESTIONS_HI[currentQuestion.id] : undefined
  const displayQuestionText = translatedQ?.text || currentQuestion.text

  const formatDomainLabel = (domain?: string) => {
    if (!domain) return null
    if (domain === 'physical') return t('domains.physical')
    if (domain === 'physiological') return t('domains.physiological')
    if (domain === 'psychological') return t('domains.psychological')
    return `Domain: ${domain}`
  }

  const displayDomainLabel = translatedQ?.domainLabel || formatDomainLabel(currentQuestion.domain)
  const totalQuestions = 10
  const progressPercent = Math.min(100, ((pointer + 1) / totalQuestions) * 100)

  const selectOption = (dosha: Dosha) => {
    setSteps((prev) => {
      const next = [...prev]
      next[pointer] = { ...next[pointer], selectedDosha: dosha }
      return next
    })
  }

  const goBack = () => {
    if (pointer === 0) return
    setPointer((p) => p - 1)
  }

  const goNext = async () => {
    if (!currentStep.selectedDosha || !checkinId) return

    // Fire current question's answer in the background
    const answerPromise = sendAnswerInBackground(currentQuestion.id, currentStep.selectedDosha, checkinId)

    const isLastQuestion = pointer === steps.length - 1

    // If intermediate question (Questions 1 to 9):
    // 0ms INSTANT transition!
    if (!isLastQuestion) {
      setPointer((p) => p + 1)
      return
    }

    // Final question (Question 10): await all pending syncs and complete
    setSubmitting(true)
    setError('')
    try {
      await Promise.all(Array.from(pendingAnswersRef.current.values()))
      const data = await answerPromise

      if (data.status === 'completed') {
        clearApiCache()
        if (data.result) setResult(data.result)
        setPhase('completed')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your answer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FullScreenShell onClose={handleClose}>
      <div className="w-full max-w-2xl mx-auto flex flex-col min-h-[60vh] justify-between">
        <div>
          {/* Top Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-[#67746B]">
              <div className="flex items-center gap-2">
                <span>{t('common.question')} {pointer + 1} {t('common.of')} {totalQuestions}</span>
                <span className="rounded-full bg-[#D89A4C]/10 border border-[#D89A4C]/25 px-2 py-0.5 text-[10px] font-semibold text-[#B2762A] tracking-normal">
                  {t('common.weeklyCheckin')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {displayDomainLabel && (
                  <span className="text-[#2A4638] font-semibold normal-case">
                    {displayDomainLabel}
                  </span>
                )}
                {currentQuestion.source_note && (
                  <div className="relative group inline-block">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-[#E5DED3] bg-[#F9F4EE] px-2.5 py-0.5 text-[10px] font-semibold text-[#8C6223] transition hover:bg-[#2A4638] hover:text-white hover:border-[#2A4638] shadow-xs cursor-pointer"
                      title="View Classical Source"
                    >
                      <BookOpen className="h-3 w-3 text-[#C27C30] group-hover:text-white" />
                      <span>{t('common.source')}</span>
                    </button>
                    <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 hidden w-72 rounded-xl border border-[#E9E1D2] bg-white p-3 text-left text-xs font-normal text-[#1F2A24] shadow-xl group-hover:block group-focus-within:block">
                      <p className="font-semibold text-[#8C6223]">Classical Basis</p>
                      <p className="mt-1 leading-relaxed text-[#67746B]">{currentQuestion.source_note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#EAE2D5]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#D89A4C] to-[#2A4638] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Title */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-[#1F2A24]">
              {displayQuestionText}
            </h2>
          </div>

          {/* Options */}
          <div className="grid gap-3.5">
            {currentQuestion.options.map((opt) => {
              const isSelected = currentStep.selectedDosha === opt.dosha
              const optText = translatedQ?.options?.[opt.dosha] || opt.text
              return (
                <motion.button
                  key={opt.dosha}
                  type="button"
                  onClick={() => selectOption(opt.dosha)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.15 }}
                  className={[
                    'w-full rounded-2xl border-2 p-5 text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-4',
                    isSelected
                      ? 'border-[#D89A4C] bg-[#FFF9F2] shadow-[0_10px_30px_rgba(216,154,76,0.12)] ring-1 ring-[#D89A4C]/20'
                      : 'border-[#E9E1D2] bg-white hover:border-[#C9A876]',
                  ].join(' ')}
                >
                  <p className="text-base font-medium text-[#1F2A24] leading-relaxed">
                    {optText}
                  </p>
                  <div
                    className={[
                      'h-6 w-6 flex-none rounded-full border-2 grid place-items-center transition-all',
                      isSelected ? 'border-[#D89A4C] bg-[#D89A4C] text-white' : 'border-[#D1C7B7] bg-white',
                    ].join(' ')}
                  >
                    {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </motion.button>
              )
            })}
          </div>

          {error && <p className="mt-4 text-center text-sm font-medium text-red-600">{error}</p>}
        </div>

        {/* Navigation Footer */}
        <div className="mt-8 flex items-center justify-between border-t border-[#E9E1D2]/80 pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={pointer === 0}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#67746B] transition hover:bg-[#EAE2D5] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!currentStep.selectedDosha || submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2A4638] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#2A4638]/15 transition hover:bg-[#233D2F] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {submitting ? (
              t('common.submitting')
            ) : pointer === totalQuestions - 1 ? (
              t('common.finishCheckin')
            ) : (
              t('common.next')
            )}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </FullScreenShell>
  )
}

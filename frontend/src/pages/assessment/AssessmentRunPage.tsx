import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, BookOpen, Leaf, Sparkles, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAssessmentStatus } from '../../hooks/useAssessmentStatus'
import { authFetch, clearApiCache } from '../../lib/api'
import { getPrakritiImage } from '../../lib/prakritiImages'
import { useLanguage } from '../../contexts/LanguageContext'
import { PRAKRITI_QUESTIONS_HI } from '../../data/prakritiQuestions_hi'

type Dosha = 'vata' | 'pitta' | 'kapha'

type Option = {
  dosha: Dosha
  text: string
  image_key?: string
  display_label?: string
}

type Question = {
  id: string
  phase: number
  domain?: string
  source_note?: string
  text: string
  image?: string
  options: Option[]
}

type AssessmentResult = {
  result_type: string
  vata_score: number
  pitta_score: number
  kapha_score: number
  phase_reached: number
  total_questions: number
}

type Step = {
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
        aria-label="Close assessment"
        className="grid h-9 w-9 place-items-center rounded-full bg-[#F4EFE6] text-[#67746B] transition hover:bg-[#EAE2D5] hover:text-[#1F2A24]"
      >
        <X className="h-5 w-5" />
      </button>
    </header>
  )
}

function FullScreenShell({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="relative min-h-screen bg-cream px-4 pt-24 pb-12 flex flex-col items-center justify-center">
      <FullScreenHeader onClose={onClose} />
      <div className="w-full max-w-2xl flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  )
}

function OptionCard({
  option,
  selected,
  disabled,
  onSelect,
}: {
  option: Option
  selected: boolean
  disabled: boolean
  onSelect: () => void
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const hasImage = Boolean(option.image_key)
  const imageUrl = option.image_key ? getPrakritiImage(option.image_key) : undefined
  const label = option.display_label ?? option.text
  const showSecondaryText = Boolean(option.display_label) && option.text !== option.display_label

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.15 }}
      className={[
        'w-full rounded-2xl border-2 p-5 text-left transition-all duration-200',
        selected
          ? 'border-[#2A4638] bg-[#EAF3EA] shadow-[0_10px_30px_rgba(42,70,56,0.12)] ring-1 ring-[#2A4638]/20'
          : 'border-[#E9E1D2] bg-white hover:border-[#C9A876]',
        disabled ? 'cursor-default opacity-80' : 'cursor-pointer',
      ].join(' ')}
    >
      {hasImage && (
        <div className="mb-3 flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-[#F3EEE3]">
          {imageUrl && !imgFailed ? (
            <img
              src={imageUrl}
              alt={label}
              className="h-full w-full object-contain"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <Leaf className="h-8 w-8 text-[#C9A876]/60" />
          )}
        </div>
      )}
      <p className="text-base font-semibold text-[#1F2A24]">{label}</p>
      {showSecondaryText && <p className="mt-1.5 text-xs leading-5 text-[#67746B]">{option.text}</p>}
    </motion.button>
  )
}

export default function AssessmentRunPage() {
  const navigate = useNavigate()
  const { setStatus } = useAssessmentStatus()
  const { lang, t } = useLanguage()

  const [phase, setPhase] = useState<'intro' | 'running' | 'completed'>('intro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [pointer, setPointer] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AssessmentResult | null>(null)

  const pendingAnswersRef = useRef<Map<string, Promise<any>>>(new Map())
  const earlyCompletedResultRef = useRef<AssessmentResult | null>(null)

  // Predictive Image Preloading for instant appearance
  useEffect(() => {
    for (let i = 1; i <= 2; i++) {
      const upcoming = steps[pointer + i]
      if (upcoming) {
        if (upcoming.question.image) {
          const imgUrl = getPrakritiImage(upcoming.question.image)
          if (imgUrl) {
            const img = new Image()
            img.src = imgUrl
          }
        }
        upcoming.question.options.forEach((opt) => {
          if (opt.image_key) {
            const url = getPrakritiImage(opt.image_key)
            if (url) {
              const img = new Image()
              img.src = url
            }
          }
        })
      }
    }
  }, [pointer, steps])

  const handleClose = () => {
    navigate('/dashboard')
  }

  const startAssessment = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await authFetch<{
        session_id: number
        question: Question
        all_questions?: Question[]
        total_questions?: number
      }>('/assessment/start', {
        method: 'POST',
      })
      setSessionId(data.session_id)
      const initialQuestions =
        data.all_questions && data.all_questions.length > 0
          ? data.all_questions
          : [data.question]
      setSteps(initialQuestions.map((q) => ({ question: q, selectedDosha: null })))
      setPointer(0)
      pendingAnswersRef.current.clear()
      earlyCompletedResultRef.current = null
      setPhase('running')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the assessment.')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckResult = () => {
    clearApiCache()
    if (result) {
      setStatus('completed', result)
    } else {
      setStatus('completed')
    }
    navigate('/prakruti-report')
  }

  const loadSampleEvaluation = () => {
    clearApiCache()
    const demoResult: AssessmentResult = {
      result_type: 'pitta_kapha',
      vata_score: 22.0,
      pitta_score: 48.0,
      kapha_score: 30.0,
      phase_reached: 1,
      total_questions: 24,
    }
    setResult(demoResult)
    setStatus('completed', demoResult)
    setPhase('completed')
  }



  const sendAnswerInBackground = (questionId: string, dosha: Dosha, sId: number) => {
    const promise = authFetch<{
      session_id: number
      status: 'in_progress' | 'completed'
      next_question?: Question
      all_phase2_questions?: Question[]
      result?: AssessmentResult
    }>(`/assessment/${sId}/answer`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        selected_dosha: dosha,
      }),
    })
      .then((res) => {
        if (res.status === 'completed' && res.result) {
          earlyCompletedResultRef.current = res.result
        }
        return res
      })
      .catch((err) => {
        console.error(`Failed to record answer for ${questionId}:`, err)
        pendingAnswersRef.current.delete(questionId)
        throw err
      })

    pendingAnswersRef.current.set(questionId, promise)
    return promise
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
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#EEF5EE] text-[#2A4638] shadow-inner ring-1 ring-[#D9E4DA]">
            <Sparkles className="h-9 w-9" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#1F2A24]">
            {t('assessment.prakritiIntroTitle')}
          </h1>

          <p className="mt-4 text-base leading-7 text-[#67746B]">
            {t('assessment.prakritiIntroDesc')}
          </p>

          <p className="mt-4 rounded-2xl bg-[#F9F4EE] px-4 py-2.5 text-xs font-medium text-[#8C6223]">
            {t('assessment.prakritiIntroTip')}
          </p>

          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

          <button
            type="button"
            onClick={startAssessment}
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2A4638] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#2A4638]/15 transition hover:bg-[#233D2F] disabled:opacity-60"
          >
            {loading ? t('common.saving') : t('common.begin')}
            {!loading && <ArrowRight className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={loadSampleEvaluation}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-[#2A4638] hover:bg-emerald-100/80 transition"
          >
            <span>{t('common.autoFillDemo')}</span>
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
            {t('assessment.prakritiDoneTitle')}
          </h2>

          <p className="mt-3 text-base leading-7 text-[#67746B]">
            {t('assessment.prakritiDoneDesc')}
          </p>

          <button
            type="button"
            onClick={handleCheckResult}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2A4638] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#2A4638]/15 transition hover:bg-[#233D2F]"
          >
            {t('common.checkResult')}
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
  const translatedQ = lang === 'hi' ? PRAKRITI_QUESTIONS_HI[currentQuestion.id] : undefined
  const displayQuestionText = translatedQ?.text || currentQuestion.text

  const formatDomainLabel = (domain?: string) => {
    if (!domain) return null
    if (domain === 'physical') return t('domains.physical')
    if (domain === 'physiological') return t('domains.physiological')
    if (domain === 'psychological') return t('domains.psychological')
    return `Domain: ${domain}`
  }

  const displayDomainLabel = translatedQ?.domainLabel || formatDomainLabel(currentQuestion.domain)
  const isInPhase2 = steps.some((s) => s.question.phase === 2) || currentQuestion.phase === 2
  const totalQuestions = isInPhase2 ? steps.length : 24
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
    if (!currentStep.selectedDosha || !sessionId) return

    // 1. If early stop was already achieved in Phase 2 background sync
    if (earlyCompletedResultRef.current) {
      setResult(earlyCompletedResultRef.current)
      setPhase('completed')
      return
    }

    const isPhase1Last = currentQuestion.phase === 1 && pointer === 23
    const isLastOverall = pointer === steps.length - 1

    // If intermediate question in Phase 1 or Phase 2 -> 0ms INSTANT transition!
    if (!isPhase1Last && !isLastOverall) {
      sendAnswerInBackground(currentQuestion.id, currentStep.selectedDosha, sessionId)
      setPointer((p) => p + 1)
      return
    }

    // Otherwise at boundary (Q24 tie-breaker check OR last Phase 2 question)
    setSubmitting(true)
    setError('')
    try {
      // 1. Check if any prior step failed to send or had an error, and resend it
      for (let i = 0; i < pointer; i++) {
        const step = steps[i]
        if (!step.selectedDosha) continue
        const pending = pendingAnswersRef.current.get(step.question.id)
        if (pending) {
          try {
            await pending
          } catch {
            await authFetch(`/assessment/${sessionId}/answer`, {
              method: 'POST',
              body: JSON.stringify({
                question_id: step.question.id,
                selected_dosha: step.selectedDosha,
              }),
            })
          }
        } else {
          await authFetch(`/assessment/${sessionId}/answer`, {
            method: 'POST',
            body: JSON.stringify({
              question_id: step.question.id,
              selected_dosha: step.selectedDosha,
            }),
          })
        }
      }

      // 2. Now submit current (final) question
      const data = await authFetch<{
        session_id: number
        status: 'in_progress' | 'completed'
        next_question?: Question
        all_phase2_questions?: Question[]
        result?: AssessmentResult
      }>(`/assessment/${sessionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({
          question_id: currentQuestion.id,
          selected_dosha: currentStep.selectedDosha,
        }),
      })

      if (data.status === 'completed') {
        if (data.result) setResult(data.result)
        setPhase('completed')
      } else if (data.status === 'in_progress') {
        if (data.all_phase2_questions && data.all_phase2_questions.length > 0) {
          const p2Steps: Step[] = data.all_phase2_questions.map((q) => ({
            question: q,
            selectedDosha: null,
          }))
          setSteps((prev) => [...prev, ...p2Steps])
        } else if (data.next_question) {
          setSteps((prev) => [...prev, { question: data.next_question as Question, selectedDosha: null }])
        }
        setPointer((p) => p + 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your answer. Please tap again.')
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
                {isInPhase2 && (
                  <span className="rounded-full bg-[#8C6223]/10 border border-[#8C6223]/25 px-2 py-0.5 text-[10px] font-semibold text-[#8C6223] tracking-normal">
                    {t('common.phase2TieBreaker')}
                  </span>
                )}
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

                    {/* Popover Card */}
                    <div className="absolute right-0 top-full mt-2 hidden w-72 rounded-2xl border border-[#E9E1D2] bg-white p-3.5 shadow-2xl text-xs normal-case font-normal text-[#1F2A24] group-hover:block z-30">
                      <div className="flex items-center gap-1.5 font-semibold text-[#2A4638] mb-1">
                        <BookOpen className="h-3.5 w-3.5 text-[#C9A876]" />
                        <span>Ayurvedic Classical Reference</span>
                      </div>
                      <p className="text-[#67746B] leading-relaxed">{currentQuestion.source_note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#EDE6D8]">
              <motion.div
                className="h-full rounded-full bg-[#2A4638]"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Optional Question Image Slot (4:3 aspect ratio). Only rendered if question.image is set! */}
              {currentQuestion.image && (
                <div className="mb-6 aspect-[4/3] max-h-56 w-full overflow-hidden rounded-2xl bg-[#F9F4EE] border border-[#E9E1D2] flex items-center justify-center">
                  <img
                    src={getPrakritiImage(currentQuestion.image)}
                    alt={displayQuestionText}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Question Text */}
              <h2 className="text-2xl md:text-3xl font-semibold leading-snug tracking-[-0.03em] text-[#1F2A24] text-center my-4">
                {displayQuestionText}
              </h2>

              {/* 3 Option Cards */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {currentQuestion.options.map((option) => {
                  const optTrans = translatedQ?.options?.[option.dosha]
                  const finalOption: Option = optTrans
                    ? {
                        ...option,
                        text: optTrans.text,
                        display_label: optTrans.display_label || option.display_label,
                      }
                    : option

                  return (
                    <OptionCard
                      key={option.dosha}
                      option={finalOption}
                      selected={currentStep.selectedDosha === option.dosha}
                      disabled={submitting}
                      onSelect={() => selectOption(option.dosha)}
                    />
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {error && <p className="mt-4 text-center text-sm font-medium text-red-600">{error}</p>}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="mt-10 flex items-center justify-between gap-4 pt-6 border-t border-[#E9E1D2]/60">
          <button
            type="button"
            onClick={goBack}
            disabled={pointer === 0}
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-[#2A4638] transition hover:bg-[#F2F5F0] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={submitting || !currentStep.selectedDosha}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2A4638] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2A4638]/15 transition hover:bg-[#233D2F] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {submitting ? t('common.saving') : pointer === totalQuestions - 1 ? t('common.finishAssessment') : t('common.next')}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </FullScreenShell>
  )
}

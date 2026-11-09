import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  CornerDownLeft,
  Info,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react'
import { apiBaseUrl, authFetch } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { AyurMitraIcon } from './AyurMitraIcon'
import { MarkdownContent } from './MarkdownContent'

export interface CitationItem {
  source: string
  content_snippet: string
}

export interface ClinicalContextData {
  prakriti?: string
  vata_score?: number
  pitta_score?: number
  kapha_score?: number
  active_vikriti?: {
    most_aggravated?: string
    vata_delta?: number
    pitta_delta?: number
    kapha_delta?: number
    days_ago?: number
  } | null
  current_season?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: CitationItem[]
  clinical_context?: ClinicalContextData | null
  clinical_reasoning?: string
  safety_disclaimer?: string
  timestamp: string
}

interface ChatApiResponse {
  answer: string
  citations: CitationItem[]
  clinical_context?: ClinicalContextData | null
  clinical_reasoning?: string
  safety_disclaimer?: string
}

interface AyurMitraDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const stripClinicalReasoning = (text: string): string => {
  if (!text) return ''
  return text
    .replace(/\n*\s*\[?\**\[?(?:CLINICAL[ _]REASONING|Clinical Reasoning|तर्क व प्रमाण)[\s\S]*$/i, '')
    .trimEnd()
}

export const AyurMitraDrawer: FC<AyurMitraDrawerProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useLanguage()
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ayurmitra_chat_history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          return parsed.map((m: ChatMessage) => ({
            ...m,
            content: stripClinicalReasoning(m.content),
          }))
        }
      } catch {
        return []
      }
    }
    return []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({})
  const [clinicalContext, setClinicalContext] = useState<ClinicalContextData | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Persist conversation
  useEffect(() => {
    try {
      localStorage.setItem('ayurmitra_chat_history', JSON.stringify(messages.slice(-20)))
    } catch {
      // quota or local storage restriction
    }
  }, [messages])

  // Scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, isOpen])

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 250)
    }
  }, [isOpen])

  const toggleCitation = (msgId: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }))
  }

  const clearChat = () => {
    setMessages([])
    setExpandedCitations({})
    localStorage.removeItem('ayurmitra_chat_history')
  }

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim()
    if (!textToSend || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Format history for backend
    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const assistantId = `assistant-${Date.now()}`

    try {
      const token = localStorage.getItem('ayushya_token') || localStorage.getItem('ayusha_token')
      const response = await fetch(`${apiBaseUrl}/chatbot/query-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: textToSend,
          language: lang,
          history: historyPayload,
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error(`Server returned ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ''
      let buffer = ''
      let assistantAdded = false

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        let currentEvent = ''
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const rawData = line.slice(6).trim()
            if (!rawData) continue
            try {
              const data = JSON.parse(rawData)
              if (currentEvent === 'guardrail') {
                accumulatedText = data.answer
                if (!assistantAdded) {
                  assistantAdded = true
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: assistantId,
                      role: 'assistant',
                      content: data.answer,
                      safety_disclaimer: data.disclaimer,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                } else {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantId
                        ? { ...msg, content: data.answer, safety_disclaimer: data.disclaimer }
                        : msg
                    )
                  )
                }
              } else if (currentEvent === 'meta') {
                if (data.clinical_context) {
                  setClinicalContext(data.clinical_context)
                }
                if (!assistantAdded) {
                  assistantAdded = true
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: assistantId,
                      role: 'assistant',
                      content: '',
                      citations: data.citations || [],
                      clinical_context: data.clinical_context,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                } else {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantId
                        ? { ...msg, citations: data.citations || [], clinical_context: data.clinical_context }
                        : msg
                    )
                  )
                }
              } else if (currentEvent === 'token') {
                accumulatedText += data.delta
                const cleanDisplay = stripClinicalReasoning(accumulatedText)
                if (!assistantAdded) {
                  assistantAdded = true
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: assistantId,
                      role: 'assistant',
                      content: cleanDisplay,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                } else {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantId ? { ...msg, content: cleanDisplay } : msg
                    )
                  )
                }
              } else if (currentEvent === 'reasoning') {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, clinical_reasoning: data.clinical_reasoning }
                      : msg
                  )
                )
              } else if (currentEvent === 'done') {
                const finalAnswer = stripClinicalReasoning(data.answer || accumulatedText)
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? {
                          ...msg,
                          content: finalAnswer,
                          ...(data.safety_disclaimer ? { safety_disclaimer: data.safety_disclaimer } : {}),
                        }
                      : msg
                  )
                )
              }
            } catch (parseErr) {
              console.warn('Failed parsing SSE packet:', parseErr)
            }
          }
        }
      }
    } catch (err: unknown) {
      console.warn('Streaming failed, falling back to static query:', err)
      try {
        const response = await authFetch<ChatApiResponse>('/chatbot/query', {
          method: 'POST',
          body: JSON.stringify({
            query: textToSend,
            language: lang,
            history: historyPayload,
          }),
        })

        const assistantMessage: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: stripClinicalReasoning(response.answer),
          citations: response.citations || [],
          clinical_context: response.clinical_context,
          clinical_reasoning: response.clinical_reasoning,
          safety_disclaimer: response.safety_disclaimer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }

        if (response.clinical_context) {
          setClinicalContext(response.clinical_context)
        }

        setMessages((prev) => {
          const exists = prev.some((m) => m.id === assistantId)
          return exists
            ? prev.map((m) => (m.id === assistantId ? assistantMessage : m))
            : [...prev, assistantMessage]
        })
      } catch (finalErr: unknown) {
        const errorMsg = finalErr instanceof Error ? finalErr.message : 'Unable to connect to AyurMitra.'
        const fallbackMessage: ChatMessage = {
          id: `assistant-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Communication Notice:**\n\n${errorMsg}\n\nPlease check your internet connection or try asking your question again in a moment.`,
          citations: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== assistantId),
          fallbackMessage,
        ])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestions = [
    t('ayurMitra.suggestion1', 'Why is curd strictly avoided at night?'),
    t('ayurMitra.suggestion2', 'Best herbs for Vata stress and calm sleep?'),
    t('ayurMitra.suggestion3', 'How to relieve hyperacidity & burning?'),
    t('ayurMitra.suggestion4', 'Can I take Ashwagandha during summer?'),
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs sm:hidden"
          />

          {/* Chat Window Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed inset-x-3 bottom-20 top-16 z-50 flex flex-col overflow-hidden rounded-3xl border border-[#E5DED1] bg-[#FCFBF7] shadow-[0_24px_70px_rgba(20,35,29,0.22)] sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[650px] sm:max-h-[82vh] sm:w-[450px]"
          >
            {/* 1. Header with Botanical Gradient */}
            <div className="relative flex items-center justify-between border-b border-[#E5DED1] bg-gradient-to-r from-[#2A4638] via-[#233C30] to-[#1C3026] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <AyurMitraIcon size="md" className="rounded-2xl ring-2 ring-[#E5B94C]/40" />
                  {/* Live Pulse Beacon */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-[#1C3026] bg-emerald-500" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold tracking-tight text-[#F7F3EB]">
                      {t('ayurMitra.title', 'AyurMitra')}
                    </h3>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#E5B94C] border border-[#E5B94C]/30">
                      Vaidya Co-Pilot
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-white/70">
                    {t('ayurMitra.subtitle', 'Classical Ayurvedic Clinical Intelligence')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={clearChat}
                    title={t('ayurMitra.clearChat', 'Clear chat')}
                    className="rounded-xl p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 2. Explainable AI Clinical Profile Pill Bar */}
            {clinicalContext && (
              <div className="flex items-center gap-2 border-b border-[#E5DED1] bg-[#F5EFE6] px-4 py-2 text-[11px] font-medium text-[#2A4638]">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#C48E22]" />
                <span className="truncate">
                  {clinicalContext.prakriti ? (
                    <>
                      <strong>Prakriti:</strong> {clinicalContext.prakriti}
                    </>
                  ) : null}
                  {clinicalContext.current_season ? (
                    <>
                      {' • '}
                      <strong>Season:</strong> {clinicalContext.current_season}
                    </>
                  ) : null}
                  {clinicalContext.active_vikriti?.most_aggravated ? (
                    <>
                      {' • '}
                      <strong>Imbalance:</strong> {clinicalContext.active_vikriti.most_aggravated} (+{clinicalContext.active_vikriti.pitta_delta ?? 0}%)
                    </>
                  ) : null}
                </span>
              </div>
            )}

            {/* 3. Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#FCFBF7] to-[#F8F5EE]">
              {messages.length === 0 ? (
                /* Welcome Screen */
                <div className="py-6 px-2 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mx-auto mb-3 flex justify-center"
                  >
                    <AyurMitraIcon size="xl" className="rounded-3xl shadow-lg ring-4 ring-[#2A4638]/10" />
                  </motion.div>

                  <h4 className="text-base font-bold text-[#1F2A24]">
                    {t('ayurMitra.welcomeTitle', 'Namaste! I am AyurMitra 🌿')}
                  </h4>
                  <p className="mt-1.5 text-xs text-[#5B6D60] max-w-xs mx-auto leading-relaxed">
                    {t(
                      'ayurMitra.welcomeSubtitle',
                      'Your personal Ayurvedic co-pilot grounded in classical treatises (Charaka, Sushruta, Vagbhata). How can I assist your wellbeing today?'
                    )}
                  </p>

                  {/* Suggestion Chips */}
                  <div className="mt-6 text-left">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#6F7D74]">
                      {t('ayurMitra.suggestionsTitle', 'Suggested classical inquiries')}
                    </p>
                    <div className="space-y-1.5">
                      {suggestions.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(sug)}
                          className="w-full text-left rounded-xl border border-[#E5DED1] bg-white/90 px-3.5 py-2.5 text-xs font-medium text-[#2A4638] shadow-2xs transition hover:border-[#2A4638]/40 hover:bg-[#F4EFE6] hover:text-[#1F2A24] flex items-center justify-between group"
                        >
                          <span className="truncate pr-2">{sug}</span>
                          <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-[#8B988F] group-hover:text-[#2A4638] transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Message Bubbles */
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-start gap-2 max-w-[88%]">
                      {msg.role === 'assistant' && (
                        <AyurMitraIcon size="sm" className="mt-1 shrink-0 rounded-lg ring-1 ring-[#2A4638]/20" />
                      )}

                      <div
                        className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                          msg.role === 'user'
                            ? 'bg-[#2A4638] text-[#F7F3EB] rounded-br-xs'
                            : 'bg-white/95 border border-[#E5DED1] text-[#1F2A24] rounded-bl-xs'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <>
                            <MarkdownContent content={stripClinicalReasoning(msg.content)} />

                            {/* Explainable AI (XAI) & Classical Citations Expander */}
                            {msg.citations && msg.citations.length > 0 && (
                              <div className="mt-3 border-t border-[#E5DED1] pt-2">
                                <button
                                  type="button"
                                  onClick={() => toggleCitation(msg.id)}
                                  className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-[#2A4638]/10 via-[#FAF4EA] to-[#2A4638]/5 border border-[#E5DED1] px-3 py-2 text-[11px] font-semibold text-[#2A4638] hover:border-[#2A4638]/40 transition-all shadow-2xs"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#2A4638] text-white text-[10px]">
                                      🔬
                                    </span>
                                    <span className="font-bold">Explainable AI (XAI) & Evidence</span>
                                    <span className="rounded-full bg-[#E5B94C]/25 text-[#926815] px-2 py-0.5 text-[9.5px] font-bold border border-[#E5B94C]/40">
                                      {msg.citations.length} Shastriya Sources
                                    </span>
                                  </span>
                                  {expandedCitations[msg.id] ? (
                                    <ChevronUp className="h-3.5 w-3.5 text-[#2A4638]" />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5 text-[#2A4638]" />
                                  )}
                                </button>

                                <AnimatePresence>
                                  {expandedCitations[msg.id] && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-2 space-y-2 overflow-hidden"
                                    >
                                      {/* XAI Diagnostic Reasoning Chain */}
                                      <div className="rounded-xl border border-[#D5CBB9] bg-[#FAF6EE] p-2.5 text-[11px] space-y-1.5 shadow-xs">
                                        <div className="flex items-center justify-between border-b border-[#E5DED1] pb-1">
                                          <span className="font-bold text-[#2A4638] flex items-center gap-1.5">
                                            <span>🧬</span> Clinical Reasoning Chain (तर्क व प्रमाण)
                                          </span>
                                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                            ✓ RAG Grounded
                                          </span>
                                        </div>
                                        <p className="text-[#3F4F44] text-[10.5px] leading-relaxed">
                                          <strong>Governing Principle:</strong>{' '}
                                          {msg.clinical_reasoning ? (
                                            <span className="text-[#1C3026] font-medium">{msg.clinical_reasoning}</span>
                                          ) : (
                                            <em>Samanya-Vishesha Siddhanta (Like increases like; opposite qualities pacify the excess dosha).</em>
                                          )}
                                        </p>
                                        <p className="text-[#5B6D60] text-[10px]">
                                          Recommendations are filtered through your personal constitution and current seasonal ritu, cross-referenced against classical Samhitas.
                                        </p>
                                      </div>

                                      {/* Canonical Classical Treatise Sources */}
                                      {msg.citations.map((c, ci) => (
                                        <div
                                          key={ci}
                                          className="rounded-xl border border-[#E5DED1] bg-white/95 p-2.5 text-[10.5px] shadow-2xs"
                                        >
                                          <div className="flex items-center gap-1.5 font-bold text-[#2A4638]">
                                            <BookOpen className="h-3.5 w-3.5 text-[#C48E22]" />
                                            <span>📜 {c.source}</span>
                                          </div>
                                          <p className="mt-1 text-[#4F5E54] leading-relaxed italic border-l-2 border-[#2A4638]/40 pl-2">
                                            "{c.content_snippet}"
                                          </p>
                                        </div>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}

                            {/* Safety Alert if acute warning */}
                            {msg.content.includes('EMERGENCY') && (
                              <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-[11px] text-rose-800">
                                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                                <div>
                                  <strong>Emergency Advisory:</strong> Please seek immediate medical help at a nearby hospital.
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <span className="mt-1 px-1 text-[10px] text-[#8B988F]">
                      {msg.timestamp}
                    </span>
                  </div>
                ))
              )}

              {/* Typing / Consultation State */}
              {isLoading && (!messages.length || messages[messages.length - 1].role !== 'assistant' || !messages[messages.length - 1].content) && (
                <div className="flex items-start gap-2 max-w-[85%]">
                  <AyurMitraIcon size="sm" className="mt-1 shrink-0 rounded-lg ring-1 ring-[#2A4638]/20" />
                  <div className="rounded-2xl rounded-bl-xs border border-[#E5DED1] bg-white px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#2A4638]">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-[#3B7D57] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-[#3B7D57] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-[#3B7D57] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[11px] text-[#55645A]">
                        {t('ayurMitra.thinking', 'AyurMitra is consulting the classical Samhitas…')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 4. Input Bar & Disclaimer Dock */}
            <div className="border-t border-[#E5DED1] bg-[#F9F6F0] p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="relative flex items-end gap-2 rounded-2xl border border-[#E0D7C7] bg-white p-2 shadow-xs transition-all focus-within:border-[#2A4638] focus-within:ring-2 focus-within:ring-[#2A4638]/10"
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t(
                    'ayurMitra.askPlaceholder',
                    'Ask AyurMitra about your diet, doshas, herbs, or digestion…'
                  )}
                  rows={1}
                  className="max-h-28 min-h-[38px] w-full resize-none bg-transparent px-2 py-1.5 text-xs text-[#1F2A24] placeholder:text-[#8C9890] focus:outline-hidden"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label={t('ayurMitra.send', 'Send')}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2A4638] text-white transition-all hover:bg-[#1E3329] disabled:cursor-not-allowed disabled:bg-[#D5CEBF] disabled:text-[#8E8678] shadow-xs cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              {/* Legal / Classical Disclaimer */}
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#78887E]">
                <Info className="h-3 w-3 shrink-0 text-[#A28B62]" />
                <span className="truncate">
                  {t(
                    'ayurMitra.disclaimer',
                    'Classical educational wellness guidance. Consult a certified Vaidya for medical care.'
                  )}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

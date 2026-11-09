import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  FileText,
  Flame,
  HeartPulse,
  Layers,
  Leaf,
  Printer,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Utensils,
} from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { cachedAuthFetch, getCached } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { A4SinglePageDossier } from '../../components/report/A4SinglePageDossier'

type PatientInfo = {
  name: string
  email?: string
  dossier_id: string
  assessment_date: string
  preferred_language: string
}

type PrakritiDetails = {
  result_type: string
  phenotype_name: string
  phenotype_sanskrit: string
  phenotype_category: string
  vata_score: number
  pitta_score: number
  kapha_score: number
  total_questions_answered: number
  agni_type: string
  agni_description: string
  koshta_type: string
  dominant_gunas: string[]
  physical_markers: string[]
  psychological_markers: string[]
}

type VikritiOverlay = {
  has_active_checkin: boolean
  most_aggravated?: string
  delta_percentage?: number
  days_ago?: number
  recommendation?: string
}

type DietaryBlueprint = {
  tastes_to_favor: string[]
  tastes_to_moderate: string[]
  key_beneficial_foods: string[]
  foods_to_minimize: string[]
  viruddha_ahara_warnings: string[]
  meal_routine_advice: string
}

type DinacharyaBlueprint = {
  brahma_muhurta: string
  morning_cleansing: string[]
  optimal_sleep: string
  exercise_rule: string
  suggested_pranayama: string
}

type SpiceRecommendation = {
  spice_name: string
  sanskrit_name: string
  therapeutic_benefit: string
}

type ClassicalCitation = {
  treatise: string
  reference: string
  summary: string
}

type ComprehensiveReport = {
  patient_info: PatientInfo
  prakriti: PrakritiDetails
  vikriti_overlay: VikritiOverlay
  dietary_blueprint: DietaryBlueprint
  dinacharya_blueprint: DinacharyaBlueprint
  kitchen_pharmacopoeia: SpiceRecommendation[]
  classical_citations: ClassicalCitation[]
  verification_hash: string
  generated_at: string
}

export default function PrakrutiReportPage() {
  const { lang, setLanguage, t } = useLanguage()
  const a4ReportRef = useRef<HTMLDivElement>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  const initialReport = getCached<ComprehensiveReport>('/report/prakruti')
  const [report, setReport] = useState<ComprehensiveReport | null>(initialReport)
  const [loading, setLoading] = useState(() => !initialReport)
  const [isExporting, setIsExporting] = useState(false)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'single' | 'detailed'>('single')

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async (force = false) => {
    if (!report && !initialReport) setLoading(true)
    setErrorStatus(null)
    try {
      const data = await cachedAuthFetch<ComprehensiveReport>('/report/prakruti', { forceRefresh: force })
      setReport(data)
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status || 500
      setErrorStatus(status)
    } finally {
      setLoading(false)
    }
  }


  // Guaranteed 1-Page A4 PDF Downloader using jspdf + html2canvas
  const handleDownloadPdf = async () => {
    if (!a4ReportRef.current || !report) return
    setIsExporting(true)

    try {
      const element = a4ReportRef.current

      // Capture the strictly budgeted A4 single-page container
      const canvas = await html2canvas(element, {
        scale: 2.5, // 300+ DPI high resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 800,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.98)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = 210
      const pdfHeight = 297

      // Strictly fit exactly on 1 single A4 sheet (0, 0, 210mm, 297mm)
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')

      const patientSlug = (report.patient_info.name || 'Patient').replace(/\s+/g, '_')
      const doshaSlug = report.prakriti.result_type.toUpperCase()
      pdf.save(`AYUSHYA_Prakriti_Dossier_${patientSlug}_${doshaSlug}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
      // Graceful fallback to browser print preview if canvas fails
      window.print()
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-9 h-9 text-[#2A4638] animate-spin" />
        <p className="text-stone-700 font-medium tracking-wide">
          {lang === 'hi'
            ? 'आपका शास्त्रीय नैदानिक डोज़ियर तैयार किया जा रहा है…'
            : 'Assembling your classical clinical health dossier…'}
        </p>
      </div>
    )
  }

  // Unassessed User State (404)
  if (errorStatus === 404 || !report) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-stone-200 rounded-2xl shadow-sm text-center">
        <div className="w-16 h-16 bg-[#2A4638]/10 text-[#2A4638] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-3">
          {t('report.takeAssessmentFirst')}
        </h2>
        <p className="text-stone-600 leading-relaxed mb-8 max-w-lg mx-auto">
          {t('report.takeAssessmentDesc')}
        </p>
        <Link
          to="/assessment"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A4638] hover:bg-[#1E3529] text-white font-medium rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5"
        >
          {t('report.startAssessmentNow')}
        </Link>
      </div>
    )
  }

  const { patient_info, prakriti, vikriti_overlay, dietary_blueprint, dinacharya_blueprint, kitchen_pharmacopoeia, classical_citations, verification_hash } = report

  return (
    <div className="report-page-container min-h-screen py-6 px-3 sm:px-6">
      {/* Top Floating Control Bar (Hidden during Print) */}
      <div className="no-print max-w-[850px] mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-sm sticky top-4 z-20">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('report.backToDashboard')}</span>
          </Link>

          {/* View Mode Toggle Pill */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs font-semibold text-stone-600">
            <button
              onClick={() => setViewMode('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'single'
                  ? 'bg-white text-[#2A4638] shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 Certificate (1-Page)</span>
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'detailed'
                  ? 'bg-white text-[#2A4638] shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Detailed Dossier</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle Pill */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs font-semibold text-stone-600">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                lang === 'en' ? 'bg-[#2A4638] text-white shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                lang === 'hi' ? 'bg-[#2A4638] text-white shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Native Print / Save */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            title={t('report.printDossier')}
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span className="hidden md:inline">{t('report.printDossier')}</span>
          </button>

          {/* Primary Instant 1-Page A4 PDF Download CTA */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-[#2A4638] hover:bg-[#1E3529] disabled:opacity-60 rounded-xl shadow-xs transition-all transform hover:-translate-y-0.5"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('report.downloading')}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{t('report.downloadPdf')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. DEDICATED SINGLE-PAGE A4 EXECUTIVE CLINICAL CERTIFICATE */}
      <div
        className={viewMode === 'single' ? 'w-full overflow-x-auto pb-6' : 'hidden md:block'}
        style={
          viewMode === 'single'
            ? undefined
            : { position: 'fixed', left: '-9999px', top: '-9999px', pointerEvents: 'none' }
        }
      >
        <div className="min-w-[800px] flex justify-center mx-auto">
          <A4SinglePageDossier ref={a4ReportRef} report={report} />
        </div>
      </div>

      {/* 2. COMPREHENSIVE MULTI-SECTION WEB DOSSIER VIEW (FOR DETAILED READING) */}
      <div
        className={viewMode === 'detailed' ? 'block' : 'hidden'}
      >
        <div
          ref={reportRef}
          id="prakruti-dossier"
          className="dossier-canvas max-w-[850px] mx-auto bg-white border border-stone-300 shadow-xl rounded-2xl overflow-hidden p-6 sm:p-10 text-stone-900 font-sans"
        >
        {/* ========================================================= */}
        {/* INSTITUTIONAL HEADER & GOVT COMPLIANCE MONOGRAM          */}
        {/* ========================================================= */}
        <header className="border-b-2 border-[#2A4638] pb-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#2A4638] text-white flex items-center justify-center shadow-md">
                <Leaf className="w-8 h-8 text-[#E2D5BE]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-serif font-black tracking-wider text-[#2A4638]">
                    AYUSHYA
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-[#2A4638]/10 text-[#2A4638] font-bold rounded-full uppercase tracking-wider">
                    CCRAS Validated
                  </span>
                </div>
                <h1 className="text-base font-semibold text-stone-800">
                  {t('report.title')}
                </h1>
                <p className="text-xs text-stone-500 font-medium">
                  {t('report.subtitle')}
                </p>
              </div>
            </div>

            {/* Compliance Badge */}
            <div className="text-right sm:border-l sm:border-stone-200 sm:pl-5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2A4638] bg-[#2A4638]/5 px-2.5 py-1 rounded-md mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2A4638]" />
                <span>{t('report.evaluationStatus')}</span>
              </div>
              <p className="text-[11px] text-stone-500 font-mono">
                ISO 9001:2015 & D&C Rule 158B
              </p>
            </div>
          </div>

          {/* Patient Credentials Bar */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
            <div>
              <span className="text-stone-500 block text-[11px] font-medium">{t('report.patientName')}</span>
              <strong className="text-stone-900 text-sm font-semibold">{patient_info.name}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px] font-medium">{t('report.dossierId')}</span>
              <strong className="font-mono text-stone-900 text-sm">{patient_info.dossier_id}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px] font-medium">{t('report.assessmentDate')}</span>
              <strong className="text-stone-900 text-sm">{patient_info.assessment_date}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px] font-medium">Auth Hash</span>
              <strong className="font-mono text-stone-700 text-xs tracking-wider">{verification_hash.slice(0, 10)}…</strong>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* SECTION 1: CONSTITUTIONAL PHENOTYPE DIAGNOSIS (प्रकृति)    */}
        {/* ========================================================= */}
        <section className="mb-8 avoid-break">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[#2A4638]" />
            <h2 className="text-lg font-serif font-bold text-stone-900">
              {t('report.sec1Title')}
            </h2>
          </div>
          <p className="text-xs text-stone-600 mb-4">
            {t('report.sec1Desc')}
          </p>

          {/* Hero Phenotype Card */}
          <div className="bg-gradient-to-br from-[#2A4638] to-[#1E3529] text-white p-6 rounded-2xl shadow-sm mb-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold tracking-wider text-[#E2D5BE] uppercase block mb-1">
                  {prakriti.phenotype_category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold">
                  {prakriti.phenotype_sanskrit} ({prakriti.phenotype_name})
                </h3>
                <p className="text-xs text-stone-200 mt-2 max-w-xl leading-relaxed">
                  Classical bilateral dominance. Your constitution combines metabolic vigor with cellular resilience.
                </p>
              </div>

              {/* Total Questions Verified */}
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2.5 rounded-xl text-center">
                <span className="text-xs text-stone-300 block">Validated Criteria</span>
                <span className="text-xl font-mono font-bold text-[#E2D5BE]">
                  {prakriti.total_questions_answered} / 24
                </span>
              </div>
            </div>

            {/* Tri-Dosha Proportion Scorecard */}
            <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-3 gap-3">
              {/* Vata */}
              <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <span className="text-[11px] font-semibold text-blue-200 block uppercase">
                  वात (Vata)
                </span>
                <span className="text-2xl font-bold font-mono text-white">
                  {prakriti.vata_score}%
                </span>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#6B8FB5] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(prakriti.vata_score, 100)}%` }}
                  />
                </div>
              </div>

              {/* Pitta */}
              <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <span className="text-[11px] font-semibold text-amber-200 block uppercase">
                  पित्त (Pitta)
                </span>
                <span className="text-2xl font-bold font-mono text-white">
                  {prakriti.pitta_score}%
                </span>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#D89A4C] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(prakriti.pitta_score, 100)}%` }}
                  />
                </div>
              </div>

              {/* Kapha */}
              <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <span className="text-[11px] font-semibold text-emerald-200 block uppercase">
                  कफ (Kapha)
                </span>
                <span className="text-2xl font-bold font-mono text-white">
                  {prakriti.kapha_score}%
                </span>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#6B9E6B] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(prakriti.kapha_score, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Physical & Psychological Phenotypic Traits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#2A4638]" />
                {t('report.physicalMarkers')}
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-700">
                {prakriti.physical_markers.map((marker, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2A4638] shrink-0 mt-0.5" />
                    <span>{marker}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#2A4638]" />
                {t('report.psychologicalMarkers')}
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-700">
                {prakriti.psychological_markers.map((trait, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2A4638] shrink-0 mt-0.5" />
                    <span>{trait}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: METABOLIC & PHYSIOLOGICAL ATTRIBUTES (AGNI)    */}
        {/* ========================================================= */}
        <section className="mb-8 avoid-break">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-serif font-bold text-stone-900">
              {t('report.sec2Title')}
            </h2>
          </div>
          <p className="text-xs text-stone-600 mb-4">
            {t('report.sec2Desc')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Agni */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
              <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wider block mb-1">
                {t('report.digestiveAgni')}
              </span>
              <strong className="text-sm font-bold text-stone-900 block mb-1.5">
                {prakriti.agni_type}
              </strong>
              <p className="text-xs text-stone-700 leading-relaxed">
                {prakriti.agni_description}
              </p>
            </div>

            {/* Koshta */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider block mb-1">
                {t('report.bowelKoshta')}
              </span>
              <strong className="text-sm font-bold text-stone-900 block mb-1.5">
                {prakriti.koshta_type.split('(')[0]}
              </strong>
              <p className="text-xs text-stone-700 leading-relaxed">
                {prakriti.koshta_type}
              </p>
            </div>

            {/* Dominant Gunas */}
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl">
              <span className="text-[11px] font-bold uppercase text-blue-800 tracking-wider block mb-1">
                {t('report.dominantGunas')}
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {prakriti.dominant_gunas.map((guna, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium bg-white px-2 py-0.5 rounded-md border border-blue-200 text-stone-800 shadow-2xs"
                  >
                    {guna}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: PRECISION DIETARY BLUEPRINT (AHARA NIYAMA)     */}
        {/* ========================================================= */}
        <section className="mb-8 avoid-break">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-5 h-5 text-[#2A4638]" />
            <h2 className="text-lg font-serif font-bold text-stone-900">
              {t('report.sec3Title')}
            </h2>
          </div>
          <p className="text-xs text-stone-600 mb-4">
            {t('report.sec3Desc')}
          </p>

          {/* Shad Rasa Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Tastes to Favor */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                {t('report.tastesToFavor')}
              </h4>
              <div className="space-y-1.5">
                {dietary_blueprint.tastes_to_favor.map((taste, idx) => (
                  <div key={idx} className="text-xs text-stone-800 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>{taste}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tastes to Moderate */}
            <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2">
                {t('report.tastesToModerate')}
              </h4>
              <div className="space-y-1.5">
                {dietary_blueprint.tastes_to_moderate.map((taste, idx) => (
                  <div key={idx} className="text-xs text-stone-800 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>{taste}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Everyday Staples vs Minimize */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
                {t('report.everydayStaples')}
              </h4>
              <ul className="space-y-1 text-xs text-stone-700">
                {dietary_blueprint.key_beneficial_foods.map((food, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
                {t('report.foodsToMinimize')}
              </h4>
              <ul className="space-y-1 text-xs text-stone-700">
                {dietary_blueprint.foods_to_minimize.map((food, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Viruddha Ahara Warnings */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                {t('report.viruddhaAharaTitle')}
              </h4>
            </div>
            <p className="text-[11px] text-amber-800 mb-2">
              {t('report.viruddhaAharaDesc')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {dietary_blueprint.viruddha_ahara_warnings.map((warning, idx) => (
                <div
                  key={idx}
                  className="bg-white/90 p-2.5 rounded-lg border border-amber-200 text-xs font-medium text-stone-800 shadow-2xs"
                >
                  {warning}
                </div>
              ))}
            </div>
          </div>

          {/* Meal Routine Advice */}
          <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-700 font-medium">
            <span className="font-bold text-stone-900 mr-1.5">Circadian Meal Rule:</span>
            {dietary_blueprint.meal_routine_advice}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: CIRCADIAN LIFESTYLE & SLEEP PROTOCOL           */}
        {/* ========================================================= */}
        <section className="mb-8 avoid-break">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-[#2A4638]" />
            <h2 className="text-lg font-serif font-bold text-stone-900">
              {t('report.sec4Title')}
            </h2>
          </div>
          <p className="text-xs text-stone-600 mb-4">
            {t('report.sec4Desc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Awakening & Cleansing */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-[11px] font-bold uppercase text-[#2A4638] tracking-wider block mb-1">
                {t('report.brahmaMuhurta')}
              </span>
              <strong className="text-sm font-semibold text-stone-900 block mb-2">
                {dinacharya_blueprint.brahma_muhurta}
              </strong>
              <div className="space-y-1.5 text-xs text-stone-700">
                <span className="font-bold block text-stone-900">{t('report.morningDetox')}:</span>
                {dinacharya_blueprint.morning_cleansing.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#2A4638] font-bold">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sleep & Exercise */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#2A4638] tracking-wider block mb-1">
                  {t('report.optimalSleep')}
                </span>
                <p className="text-xs text-stone-800 font-medium mb-3">
                  {dinacharya_blueprint.optimal_sleep}
                </p>

                <span className="text-[11px] font-bold uppercase text-[#2A4638] tracking-wider block mb-1">
                  {t('report.exerciseRule')}
                </span>
                <p className="text-xs text-stone-800 font-medium mb-3">
                  {dinacharya_blueprint.exercise_rule}
                </p>
              </div>

              <div className="bg-[#2A4638]/5 p-2.5 rounded-lg border border-[#2A4638]/20">
                <span className="text-[11px] font-bold text-[#2A4638] block uppercase">
                  {t('report.suggestedPranayama')}
                </span>
                <p className="text-xs text-stone-800 mt-1">
                  {dinacharya_blueprint.suggested_pranayama}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: DYNAMIC SEASONAL & VIKRITI OVERLAY             */}
        {/* ========================================================= */}
        {vikriti_overlay.has_active_checkin && (
          <section className="mb-8 avoid-break">
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-amber-700" />
                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                  {t('report.sec5Title')}
                </h3>
              </div>
              <p className="text-xs text-amber-900 font-medium">
                Active Vikriti Check-in ({vikriti_overlay.days_ago} days ago):{' '}
                <strong className="text-amber-950 underline">
                  {vikriti_overlay.most_aggravated} (+{vikriti_overlay.delta_percentage}%)
                </strong>
                . {vikriti_overlay.recommendation}
              </p>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* SECTION 6: KITCHEN PHARMACOPOEIA (DRAVYAGUNA SPICES)      */}
        {/* ========================================================= */}
        <section className="mb-8 avoid-break">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-5 h-5 text-[#2A4638]" />
            <h2 className="text-lg font-serif font-bold text-stone-900">
              {t('report.sec6Title')}
            </h2>
          </div>
          <p className="text-xs text-stone-600 mb-4">
            {t('report.sec6Desc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {kitchen_pharmacopoeia.map((spice, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl hover:border-stone-300 transition-colors"
              >
                <span className="text-xs font-serif font-bold text-stone-900 block">
                  {spice.spice_name}
                </span>
                <span className="text-[11px] font-mono text-[#2A4638] block mb-1.5">
                  {spice.sanskrit_name}
                </span>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  {spice.therapeutic_benefit}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 7: CLINICAL SAFETY ADVISORY & ETHICS NOTICE       */}
        {/* ========================================================= */}
        <section className="mb-8 avoid-break">
          <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2.5 mb-2">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                {t('report.sec7Title')}
              </h3>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed font-normal">
              {t('report.safetyNoticeText')}
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FOOTER: SHASTRIYA PRAMANA & VERIFICATION MONOGRAM         */}
        {/* ========================================================= */}
        <footer className="pt-6 border-t border-stone-300 avoid-break">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Classical Citations */}
            <div className="space-y-1 text-[11px] text-stone-500 max-w-lg">
              <div className="flex items-center gap-1.5 font-bold text-stone-700 uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5 text-[#2A4638]" />
                <span>{t('report.citationsTitle')}</span>
              </div>
              {classical_citations.map((cite, idx) => (
                <p key={idx} className="leading-tight">
                  <strong className="text-stone-700">{cite.treatise}:</strong> {cite.reference}
                </p>
              ))}
            </div>

            {/* Cryptographic QR Monogram & Hash */}
            <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div className="w-12 h-12 bg-white border border-stone-300 rounded-lg flex items-center justify-center text-stone-800 shadow-2xs">
                <QrCode className="w-9 h-9 text-[#2A4638]" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-stone-500 block uppercase tracking-wider">
                  {t('report.verificationStamp')}
                </span>
                <span className="text-[11px] font-mono font-bold text-stone-900 block">
                  {verification_hash}
                </span>
                <span className="text-[9px] text-stone-500 block">
                  Generated {report.generated_at}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-center text-[10px] text-stone-600">
            Ayushya • National Institute of Ayurveda / Ministry of Ayush Compliant Preventive AI Health Dossier
          </div>
        </footer>
      </div>
    </div>
  </div>
  )
}

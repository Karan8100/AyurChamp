import { forwardRef } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  Leaf,
  QrCode,
  ShieldCheck,
  Utensils,
} from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

export type PatientInfo = {
  name: string
  email?: string
  dossier_id: string
  assessment_date: string
  preferred_language: string
}

export type PrakritiDetails = {
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

export type VikritiOverlay = {
  has_active_checkin: boolean
  most_aggravated?: string
  delta_percentage?: number
  days_ago?: number
  recommendation?: string
}

export type DietaryBlueprint = {
  tastes_to_favor: string[]
  tastes_to_moderate: string[]
  key_beneficial_foods: string[]
  foods_to_minimize: string[]
  viruddha_ahara_warnings: string[]
  meal_routine_advice: string
}

export type DinacharyaBlueprint = {
  brahma_muhurta: string
  morning_cleansing: string[]
  optimal_sleep: string
  exercise_rule: string
  suggested_pranayama: string
}

export type SpiceRecommendation = {
  spice_name: string
  sanskrit_name: string
  therapeutic_benefit: string
}

export type ClassicalCitation = {
  treatise: string
  reference: string
  summary: string
}

export type ComprehensiveReport = {
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

interface Props {
  report: ComprehensiveReport
}

export const A4SinglePageDossier = forwardRef<HTMLDivElement, Props>(({ report }, ref) => {
  const { t } = useLanguage()
  const {
    patient_info,
    prakriti,
    vikriti_overlay,
    dietary_blueprint,
    dinacharya_blueprint,
    kitchen_pharmacopoeia,
    verification_hash,
  } = report

  return (
    <div
      ref={ref}
      id="prakruti-a4-single"
      className="a4-page-canvas mx-auto bg-white border border-stone-300 shadow-xl rounded-2xl overflow-hidden text-stone-900 font-sans"
      style={{
        width: '800px',
        minHeight: '980px',
        maxHeight: '1020px',
        padding: '16px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* ========================================================= */}
      {/* 1. INSTITUTIONAL HEADER & GOVT COMPLIANCE MONOGRAM        */}
      {/* ========================================================= */}
      <div className="dossier-header border-b-2 border-[#2A4638] pb-2 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#2A4638] text-white flex items-center justify-center shadow-xs shrink-0">
              <Leaf className="w-6 h-6 text-[#E2D5BE]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif font-black tracking-wider text-[#2A4638]">
                  AYUSHYA
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-[#2A4638]/10 text-[#2A4638] font-bold rounded-full uppercase tracking-wider">
                  CCRAS-PAS Validated
                </span>
              </div>
              <h1 className="text-xs font-semibold text-stone-800 leading-tight">
                {t('report.title')}
              </h1>
              <p className="text-[10px] text-stone-500">
                National Institute of Ayurveda / CCRAS Preventive Health Record
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2A4638] bg-[#2A4638]/5 px-2 py-0.5 rounded-md mb-0.5">
              <ShieldCheck className="w-3 h-3 text-[#2A4638]" />
              <span>{t('report.evaluationStatus')}</span>
            </div>
            <p className="text-[10px] text-stone-500 font-mono">
              ISO 9001:2015 & D&C Rule 158B
            </p>
          </div>
        </div>

        {/* Patient Credentials Bar */}
        <div className="mt-2.5 grid grid-cols-4 gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 text-[11px]">
          <div>
            <span className="text-stone-500 block text-[9px] uppercase font-bold">{t('report.patientName')}</span>
            <strong className="text-stone-900 truncate block">{patient_info.name}</strong>
          </div>
          <div>
            <span className="text-stone-500 block text-[9px] uppercase font-bold">{t('report.dossierId')}</span>
            <strong className="font-mono text-stone-900">{patient_info.dossier_id}</strong>
          </div>
          <div>
            <span className="text-stone-500 block text-[9px] uppercase font-bold">{t('report.assessmentDate')}</span>
            <strong className="text-stone-900">{patient_info.assessment_date}</strong>
          </div>
          <div>
            <span className="text-stone-500 block text-[9px] uppercase font-bold">Verification Hash</span>
            <strong className="font-mono text-stone-700 text-[10px]">{verification_hash.slice(0, 10)}…</strong>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CONSTITUTIONAL DIAGNOSIS (HERO CARD)                   */}
      {/* ========================================================= */}
      <section className="mb-2.5">
        <div className="bg-gradient-to-r from-[#2A4638] to-[#1E3529] text-white p-3.5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold tracking-wider text-[#E2D5BE] uppercase block">
                {prakriti.phenotype_category}
              </span>
              <h2 className="text-xl font-serif font-bold text-white leading-tight">
                {prakriti.phenotype_sanskrit} ({prakriti.phenotype_name})
              </h2>
            </div>
            <div className="bg-white/10 px-3 py-1 rounded-lg text-center border border-white/20 shrink-0">
              <span className="text-[9px] text-stone-300 block">Validated Items</span>
              <span className="text-sm font-mono font-bold text-[#E2D5BE]">
                {prakriti.total_questions_answered} / 24
              </span>
            </div>
          </div>

          {/* Tri-Dosha Proportion Scorecard */}
          <div className="mt-2.5 pt-2 border-t border-white/20 grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-lg p-2 text-center border border-white/10">
              <span className="text-[9px] font-semibold text-blue-200 block uppercase">वात (Vata)</span>
              <span className="text-lg font-bold font-mono text-white">{prakriti.vata_score}%</span>
              <div className="w-full bg-white/20 h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-[#6B8FB5] h-full rounded-full" style={{ width: `${Math.min(prakriti.vata_score, 100)}%` }} />
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center border border-white/10">
              <span className="text-[9px] font-semibold text-amber-200 block uppercase">पित्त (Pitta)</span>
              <span className="text-lg font-bold font-mono text-white">{prakriti.pitta_score}%</span>
              <div className="w-full bg-white/20 h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-[#D89A4C] h-full rounded-full" style={{ width: `${Math.min(prakriti.pitta_score, 100)}%` }} />
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center border border-white/10">
              <span className="text-[9px] font-semibold text-emerald-200 block uppercase">कफ (Kapha)</span>
              <span className="text-lg font-bold font-mono text-white">{prakriti.kapha_score}%</span>
              <div className="w-full bg-white/20 h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-[#6B9E6B] h-full rounded-full" style={{ width: `${Math.min(prakriti.kapha_score, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Key Markers */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="p-2 bg-stone-50 border border-stone-200 rounded-lg">
            <h4 className="text-[10px] font-bold text-stone-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#2A4638]" />
              <span>{t('report.physicalMarkers')}</span>
            </h4>
            <ul className="space-y-0.5 text-[10px] text-stone-700">
              {prakriti.physical_markers.slice(0, 3).map((marker, idx) => (
                <li key={idx} className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#2A4638] shrink-0" />
                  <span className="truncate">{marker}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-2 bg-stone-50 border border-stone-200 rounded-lg">
            <h4 className="text-[10px] font-bold text-stone-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#2A4638]" />
              <span>{t('report.psychologicalMarkers')}</span>
            </h4>
            <ul className="space-y-0.5 text-[10px] text-stone-700">
              {prakriti.psychological_markers.slice(0, 3).map((trait, idx) => (
                <li key={idx} className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#2A4638] shrink-0" />
                  <span className="truncate">{trait}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. METABOLIC & PHYSIOLOGICAL PROFILE                      */}
      {/* ========================================================= */}
      <section className="mb-2.5">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-lg">
            <span className="text-[9px] font-bold uppercase text-amber-800 tracking-wider block">
              {t('report.digestiveAgni')}
            </span>
            <strong className="text-[11px] font-bold text-stone-900 block truncate">
              {prakriti.agni_type.split('(')[0]}
            </strong>
            <p className="text-[9px] text-stone-600 line-clamp-2 mt-0.5">
              {prakriti.agni_description}
            </p>
          </div>

          <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <span className="text-[9px] font-bold uppercase text-emerald-800 tracking-wider block">
              {t('report.bowelKoshta')}
            </span>
            <strong className="text-[11px] font-bold text-stone-900 block truncate">
              {prakriti.koshta_type.split('(')[0]}
            </strong>
            <p className="text-[9px] text-stone-600 line-clamp-2 mt-0.5">
              {prakriti.koshta_type}
            </p>
          </div>

          <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-lg">
            <span className="text-[9px] font-bold uppercase text-blue-800 tracking-wider block">
              {t('report.dominantGunas')}
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {prakriti.dominant_gunas.slice(0, 3).map((guna, idx) => (
                <span key={idx} className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-blue-200 text-stone-800 truncate">
                  {guna.split('(')[0]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. PRECISION DIETARY BLUEPRINT (AHARA NIYAMA)             */}
      {/* ========================================================= */}
      <section className="mb-2.5">
        <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[11px] font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#2A4638]" />
              <span>{t('report.sec3Title')}</span>
            </h3>
            <span className="text-[9px] text-stone-500 font-medium">Shad Rasa Matrix</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="p-2 bg-emerald-50/80 border border-emerald-200 rounded-lg">
              <span className="text-[9px] font-bold uppercase text-emerald-900 block mb-0.5">
                {t('report.tastesToFavor')}
              </span>
              <p className="text-[10px] font-semibold text-emerald-800">
                {dietary_blueprint.tastes_to_favor.join(' • ')}
              </p>
              <p className="text-[9px] text-stone-600 mt-1 truncate">
                <strong className="text-stone-800">Staples:</strong> {dietary_blueprint.key_beneficial_foods.slice(0, 3).join(', ')}
              </p>
            </div>

            <div className="p-2 bg-rose-50/80 border border-rose-200 rounded-lg">
              <span className="text-[9px] font-bold uppercase text-rose-900 block mb-0.5">
                {t('report.tastesToModerate')}
              </span>
              <p className="text-[10px] font-semibold text-rose-800">
                {dietary_blueprint.tastes_to_moderate.join(' • ')}
              </p>
              <p className="text-[9px] text-stone-600 mt-1 truncate">
                <strong className="text-stone-800">Minimize:</strong> {dietary_blueprint.foods_to_minimize.slice(0, 3).join(', ')}
              </p>
            </div>
          </div>

          {/* Viruddha Ahara Warnings */}
          <div className="p-1.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-[10px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="font-bold text-amber-900 shrink-0">Viruddha Ahara:</span>
            <span className="text-amber-800 truncate">
              {dietary_blueprint.viruddha_ahara_warnings.join(' • ')}
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. CIRCADIAN LIFESTYLE & KITCHEN SPICES                   */}
      {/* ========================================================= */}
      <section className="mb-2.5">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-stone-50 border border-stone-200 rounded-lg">
            <span className="text-[9px] font-bold uppercase text-[#2A4638] tracking-wider block mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Dinacharya</span>
            </span>
            <strong className="text-[10px] font-bold text-stone-900 block truncate">
              Wake: {dinacharya_blueprint.brahma_muhurta}
            </strong>
            <p className="text-[9px] text-stone-600 truncate mt-0.5">
              Sleep: {dinacharya_blueprint.optimal_sleep}
            </p>
          </div>

          <div className="p-2 bg-stone-50 border border-stone-200 rounded-lg">
            <span className="text-[9px] font-bold uppercase text-[#2A4638] tracking-wider block mb-0.5">
              Vyayama & Breath
            </span>
            <strong className="text-[10px] font-bold text-stone-900 block truncate">
              {dinacharya_blueprint.exercise_rule.split('(')[0]}
            </strong>
            <p className="text-[9px] text-stone-600 truncate mt-0.5">
              {dinacharya_blueprint.suggested_pranayama.split('(')[0]}
            </p>
          </div>

          <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-lg">
            <span className="text-[9px] font-bold uppercase text-amber-900 tracking-wider block mb-0.5">
              Dynamic Vikriti
            </span>
            {vikriti_overlay.has_active_checkin ? (
              <>
                <strong className="text-[10px] font-bold text-amber-950 block truncate">
                  {vikriti_overlay.most_aggravated} (+{vikriti_overlay.delta_percentage}%)
                </strong>
                <p className="text-[9px] text-amber-800 truncate mt-0.5">
                  {vikriti_overlay.days_ago} days ago check-in
                </p>
              </>
            ) : (
              <p className="text-[9px] text-stone-600 mt-1">
                Equilibrium stable. No acute spike.
              </p>
            )}
          </div>
        </div>

        {/* Culinary Spices Strip */}
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {kitchen_pharmacopoeia.map((spice, idx) => (
            <div key={idx} className="p-1.5 bg-stone-50 border border-stone-200 rounded-md text-center">
              <span className="text-[10px] font-bold text-stone-900 block truncate">{spice.spice_name}</span>
              <span className="text-[8px] font-mono text-[#2A4638] block truncate">{spice.sanskrit_name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. INSTITUTIONAL FOOTER & COMPLIANCE SEAL                 */}
      {/* ========================================================= */}
      <div className="dossier-footer pt-1.5 border-t border-stone-300">
        <div className="flex items-center justify-between gap-4">
          <div className="text-[9px] text-stone-500 max-w-sm">
            <p className="font-bold text-stone-700 uppercase mb-0.5">Shastriya Pramana Authority:</p>
            <p className="truncate">Charaka Samhita (Sutrasthana 5 & 27) • Ashtanga Hridaya (1 & 2)</p>
            <p className="text-[8px] text-stone-400 mt-0.5">
              Educational Swasthavritta record. Consult a certified BAMS Vaidya for medical prescriptions.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-lg border border-stone-200 shrink-0">
            <div className="w-8 h-8 bg-white border border-stone-300 rounded flex items-center justify-center">
              <QrCode className="w-6 h-6 text-[#2A4638]" />
            </div>
            <div className="text-left">
              <span className="text-[8px] font-bold text-stone-500 block uppercase">SHA-256 Hash</span>
              <span className="text-[9px] font-mono font-bold text-stone-900 block">
                {verification_hash.slice(0, 14)}…
              </span>
              <span className="text-[8px] text-stone-400 block">
                Generated {report.generated_at}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-1.5 text-center text-[8px] text-stone-500 border-t border-stone-100 pt-1">
          Ayushya Digital Clinical Health System • Government CCRAS Guidelines & Classical Samhitas Aligned
        </div>
      </div>
    </div>
  )
})

A4SinglePageDossier.displayName = 'A4SinglePageDossier'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Clock,
  Compass,
  Droplets,
  Flame,
  Leaf,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  Utensils,
  Wind,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import DoshaEducationModal from '../../components/DoshaEducationModal'
import type { DoshaKey } from '../../data/doshaInfo'
import { useAssessmentStatus, type AssessmentResult } from '../../hooks/useAssessmentStatus'
import { useVikritiStatus, type VikritiResult } from '../../hooks/useVikritiStatus'
import { useLanguage } from '../../contexts/LanguageContext'
import { cachedAuthFetch } from '../../lib/api'
import { getMealAtmosphere, getSeasonAtmosphere } from '../../lib/dynamicImagery'

type DoshaDatum = {
  key: DoshaKey
  name: string
  sanskritName: string
  percent: number
  descriptor: string
  bioRole: string
  whatItDoes: string
  trait: string
  icon: typeof Wind
  color: string
  badgeColor: string
  borderColor: string
  hoverBorder: string
  bgGradient: string
  progressBg: string
  hex: string
}

function formatResultType(resultType: string, lang: 'en' | 'hi'): string {
  if (!resultType) return lang === 'hi' ? 'सम प्रकृति (Balanced)' : 'Balanced'
  if (resultType === 'tridoshic') return lang === 'hi' ? 'त्रिदोषज (Tridoshic)' : 'Tridoshic'
  const formatted = resultType
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-')
  return lang === 'hi' ? `${formatted} प्रधान` : formatted
}

function buildDoshaData(result: AssessmentResult | null, lang: 'en' | 'hi'): DoshaDatum[] {
  const scores = result
    ? { vata: result.vata_score, pitta: result.pitta_score, kapha: result.kapha_score }
    : { vata: 44, pitta: 32, kapha: 24 }

  return [
    {
      key: 'vata',
      name: 'Vata',
      sanskritName: 'वात',
      percent: Math.round(scores.vata),
      descriptor: lang === 'hi' ? 'वायु + आकाश' : 'Air + Space',
      bioRole: lang === 'hi' ? 'गति व संचलन की शक्ति (Kinetic Energy)' : 'Kinetic Energy & Movement',
      whatItDoes:
        lang === 'hi'
          ? 'श्वास गति, तंत्रिका तंत्र (Nerve Impulses), रक्त संचार और विचारों के प्रवाह को नियंत्रित करता है।'
          : 'Regulates breathing, nerve impulses, blood circulation, cellular movement, and creative thought flow.',
      trait: lang === 'hi' ? 'रचनात्मक • ऊर्जावान • त्वरित अनुकूलन' : 'Creative • Energetic • Fast Adapter',
      icon: Wind,
      color: 'bg-[#E8F1FB] text-[#2C5282]',
      badgeColor: 'border-[#6B8FB5]/30 bg-[#E8F1FB] text-[#2C5282]',
      borderColor: 'border-[#6B8FB5]/25',
      hoverBorder: 'hover:border-[#6B8FB5]/70 hover:shadow-[0_8px_25px_rgba(107,143,181,0.18)]',
      bgGradient: 'from-[#F5F9FD] via-[#FFFFFF] to-[#EFF5FB]',
      progressBg: 'bg-[#6B8FB5]',
      hex: '#6B8FB5',
    },
    {
      key: 'pitta',
      name: 'Pitta',
      sanskritName: 'पित्त',
      percent: Math.round(scores.pitta),
      descriptor: lang === 'hi' ? 'अग्नि + जल' : 'Fire + Water',
      bioRole: lang === 'hi' ? 'पाचन, रूपांतरण व ताप (Metabolic Fire)' : 'Metabolic Fire & Digestion',
      whatItDoes:
        lang === 'hi'
          ? 'पाचक अग्नि (Agni), मेटाबॉलिज्म, शरीर का तापमान और सटीक बौद्धिक निर्णय क्षमता चलाता है।'
          : 'Drives digestive fire (Agni), nutrient metabolism, body heat regulation, and sharp intellectual focus.',
      trait: lang === 'hi' ? 'एकाग्र • तीव्र बुद्धि • साहसी' : 'Focused • Decisive • Sharp-Minded',
      icon: Flame,
      color: 'bg-[#FDF0E1] text-[#9C4221]',
      badgeColor: 'border-[#D89A4C]/30 bg-[#FDF0E1] text-[#9E6218]',
      borderColor: 'border-[#D89A4C]/25',
      hoverBorder: 'hover:border-[#D89A4C]/70 hover:shadow-[0_8px_25px_rgba(216,154,76,0.18)]',
      bgGradient: 'from-[#FDF9F3] via-[#FFFFFF] to-[#FDF4E7]',
      progressBg: 'bg-[#D89A4C]',
      hex: '#D89A4C',
    },
    {
      key: 'kapha',
      name: 'Kapha',
      sanskritName: 'कफ',
      percent: Math.round(scores.kapha),
      descriptor: lang === 'hi' ? 'पृथ्वी + जल' : 'Earth + Water',
      bioRole: lang === 'hi' ? 'शारीरिक गठन, ओजस व स्थिरता (Structure & Ojas)' : 'Structure, Immunity & Stability',
      whatItDoes:
        lang === 'hi'
          ? 'शारीरिक गठन, मांसपेशियों व हड्डियों की मजबूती, जोड़ों में चिकनाई और रोग प्रतिरोधक क्षमता का आधार।'
          : 'Provides physical lubrication, bone/tissue strength, immune vitality (Ojas), and deep mental calm.',
      trait: lang === 'hi' ? 'शांत • स्नेही • उच्च सहनशक्ति' : 'Calm • Grounded • Compassionate',
      icon: Droplets,
      color: 'bg-[#EAF3EA] text-[#22543D]',
      badgeColor: 'border-[#6B9E6B]/30 bg-[#EAF3EA] text-[#22543D]',
      borderColor: 'border-[#6B9E6B]/25',
      hoverBorder: 'hover:border-[#6B9E6B]/70 hover:shadow-[0_8px_25px_rgba(107,158,107,0.18)]',
      bgGradient: 'from-[#F4F9F4] via-[#FFFFFF] to-[#EAF5EA]',
      progressBg: 'bg-[#6B9E6B]',
      hex: '#6B9E6B',
    },
  ]
}

interface MealGuide {
  meal: string
  name: string
  description: string
  weekly_adjustment?: string | null
  adapted_for?: string | null
}

interface DietPlanData {
  dosha: string
  dosha_principle: string
  meals: MealGuide[]
  favor_foods: string[]
  reduce_foods: string[]
  has_vikriti: boolean
  vikriti?: {
    most_aggravated: string
    tip: string
    days_ago: number
  } | null
  seasonal?: {
    note: string
    favor: string[]
    reduce: string[]
  }
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
}

interface RitucharyaData {
  current_season_id: string
  seasons: SeasonDetail[]
  user_focus?: {
    is_dominant_aggravated: boolean
    dominant_dosha: string
    note: string
  } | null
}

interface DinacharyaPhase {
  id: string
  timeRange: string
  doshaName: string
  name: string
  hindiName: string
  guidance: string
  hindiGuidance: string
  icon: typeof Sun
  accentColor: string
  badgeColor: string
}

const DINACHARYA_PHASES: DinacharyaPhase[] = [
  {
    id: 'morning_kapha',
    timeRange: '06:00 - 10:00',
    doshaName: 'Kapha',
    name: 'Kapha Phase (Awakening)',
    hindiName: 'कफ काल • प्रातः जागरण',
    guidance: 'Body is naturally heavy. Best time for brisk exercise, warm ginger water, and a light breakfast.',
    hindiGuidance: 'शरीर में स्वाभाविक भारीपन होता है। फुर्तीला व्यायाम, गुनगुना पानी और हल्का सुपाच्य नाश्ता लें।',
    icon: Droplets,
    accentColor: '#6B9E6B',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'midday_pitta',
    timeRange: '10:00 - 14:00',
    doshaName: 'Pitta (Peak Agni)',
    name: 'Pitta Phase (Peak Digestion)',
    hindiName: 'पित्त काल • मध्याह्न अग्नि',
    guidance: 'Solar fire is at its zenith. Eat your primary, most wholesome meal of the day now for peak absorption.',
    hindiGuidance: 'सूर्य तेज पर है और पाचक अग्नि उच्चतम है। दिन का मुख्य और पौष्टिक भोजन इसी समय करें।',
    icon: Flame,
    accentColor: '#D89A4C',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'afternoon_vata',
    timeRange: '14:00 - 18:00',
    doshaName: 'Vata',
    name: 'Vata Phase (Mental Agility)',
    hindiName: 'वात काल • मानसिक सजगता',
    guidance: 'Nervous system is light and receptive. Optimal for creative tasks, communication, and warm herbal tea.',
    hindiGuidance: 'मस्तिष्क हल्का और सजग होता है। नए विचार, योजनाएं और सौम्य हर्बल चाय के लिए सर्वश्रेष्ठ समय।',
    icon: Wind,
    accentColor: '#6B8FB5',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    id: 'evening_kapha',
    timeRange: '18:00 - 22:00',
    doshaName: 'Kapha (Rest)',
    name: 'Kapha Phase (Evening Settling)',
    hindiName: 'कफ सन्ध्या • विश्राम व शांति',
    guidance: 'Body prepares for cellular rest. Eat a light dinner before 8 PM, dim lights, and avoid screens.',
    hindiGuidance: 'शरीर विश्राम की ओर बढ़ता है। रात ८ बजे से पहले हल्का भोजन करें और स्क्रीन से दूरी बनाएं।',
    icon: Moon,
    accentColor: '#5C6B9E',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
]

function getActiveDinacharyaPhase(hour: number): DinacharyaPhase {
  if (hour >= 6 && hour < 10) return DINACHARYA_PHASES[0]
  if (hour >= 10 && hour < 14) return DINACHARYA_PHASES[1]
  if (hour >= 14 && hour < 18) return DINACHARYA_PHASES[2]
  if (hour >= 18 && hour < 22) return DINACHARYA_PHASES[3]
  return {
    id: 'night_rest',
    timeRange: '22:00 - 06:00',
    doshaName: 'Pitta & Vata Detox',
    name: 'Cellular Detox & Deep Sleep',
    hindiName: 'आन्तरिक शोधन काल • गहरी निद्रा',
    guidance: 'Internal metabolic cleansing occurs. Deep sleep is essential for the liver and immune vitality (Ojas).',
    hindiGuidance: 'शरीर आन्तरिक विषाक्तता का शोधन करता है। गहरी और निर्बाध नींद स्वास्थ्य के लिए अनिवार्य है।',
    icon: Sparkles,
    accentColor: '#2A4638',
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-300',
  }
}

function PrakritiPieChart({ data }: { data: DoshaDatum[] }) {
  const { lang, t } = useLanguage()
  const [activeItem, setActiveItem] = useState<DoshaDatum | null>(null)
  const total = data.reduce((sum, item) => sum + item.percent, 0) || 1

  const gradient = data.reduce((acc, item, index) => {
    const start = data.slice(0, index).reduce((sum, current) => sum + current.percent, 0)
    const end = start + item.percent
    return `${acc}${index > 0 ? ', ' : ''}${item.hex} ${(start / total) * 100}% ${(end / total) * 100}%`
  }, '')

  const dominant = [...data].sort((a, b) => b.percent - a.percent)[0]
  const isBalanced = Math.abs(dominant.percent - 33) < 8
  const centerText = isBalanced
    ? t('dashboard.balancedPrakriti', 'Balanced Prakruti')
    : (lang === 'hi' ? `${dominant.name} प्रधान` : `${dominant.name} Dominant`)

  const labelPositions = data.map((item, index) => {
    const cumulative = data.slice(0, index).reduce((sum, current) => sum + current.percent, 0)
    const angle = ((cumulative + item.percent / 2) / total) * 360 - 90
    const radians = (angle * Math.PI) / 180
    const radius = 72

    return {
      ...item,
      x: Math.cos(radians) * radius,
      y: Math.sin(radians) * radius,
    }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Container forced to true square (aspect-square) with fixed equal dimensions */}
      <div className="relative aspect-square h-[210px] w-[210px] flex-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute inset-0 aspect-square rounded-full shadow-[0_10px_40px_rgba(42,70,56,0.15)] ring-4 ring-white"
          style={{ background: `conic-gradient(${gradient})` }}
        />

        {/* Center cutout for clean donut aesthetic */}
        <div className="absolute inset-8 aspect-square rounded-full bg-white shadow-inner flex flex-col items-center justify-center p-2 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#67746B]">
            {activeItem ? activeItem.name : t('dashboard.constitution', 'Constitution')}
          </p>
          <p className="mt-0.5 text-xs font-bold text-[#1F2A24]">
            {activeItem ? `${activeItem.percent}%` : centerText}
          </p>
        </div>

        {/* Dynamic Percentage Badges */}
        {labelPositions.map((item) => (
          <button
            key={item.key}
            type="button"
            onMouseEnter={() => setActiveItem(item)}
            onMouseLeave={() => setActiveItem(null)}
            onClick={() => setActiveItem(activeItem?.key === item.key ? null : item)}
            className="absolute rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold tracking-[0.04em] text-[#1F2A24] shadow-md transition transform hover:scale-110 active:scale-95"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${item.x}px), calc(-50% + ${item.y}px))`,
            }}
          >
            {item.percent}%
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-[#F9F4EE] px-4 py-2 text-center shadow-[inset_0_0_0_1px_rgba(42,70,56,0.06)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#67746B]">
          {activeItem ? `${activeItem.name} ${t('dashboard.trait', 'Trait')}` : t('dashboard.balance', 'Balance')}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-[#1F2A24]">
          {activeItem ? activeItem.trait : centerText}
        </p>
      </div>
    </div>
  )
}

function DoshaSummaryRow({
  item,
  onClick,
}: {
  item: DoshaDatum
  onClick: () => void
}) {
  const Icon = item.icon
  const { lang, t } = useLanguage()

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border bg-gradient-to-r ${item.bgGradient} ${item.borderColor} ${item.hoverBorder} p-4 shadow-xs transition-all duration-200 cursor-pointer group relative overflow-hidden`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`grid h-12 w-12 flex-none place-items-center rounded-2xl shadow-xs ${item.color} group-hover:scale-105 transition`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-[#1F2A24] group-hover:text-[#2A4638] transition">
                {item.name} <span className="text-xs font-normal text-[#67746B]">({item.sanskritName})</span>
              </h3>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${item.badgeColor}`}>
                {item.descriptor}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#8C6B38] mt-0.5">
              {item.bioRole}
            </p>
          </div>
        </div>

        {/* User score percentage */}
        <div className="flex flex-col items-end flex-none">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-serif font-bold text-[#1F2A24]">{item.percent}%</span>
          </div>
          <span className="text-[9.5px] uppercase tracking-wider font-semibold text-[#67746B]">
            {t('dashboard.yourPrakritiShare', lang === 'hi' ? 'आपकी प्रकृति' : 'Constitution')}
          </span>
        </div>
      </div>

      {/* Plain Language "What it does" explanation */}
      <p className="mt-2.5 text-xs leading-relaxed text-[#556358]">
        {item.whatItDoes}
      </p>

      {/* Animated Mini Progress Bar */}
      <div className="mt-3 space-y-1">
        <div className="h-1.5 w-full rounded-full bg-stone-200/70 overflow-hidden">
          <div
            className={`h-full rounded-full ${item.progressBg} transition-all duration-500`}
            style={{ width: `${Math.min(item.percent, 100)}%` }}
          />
        </div>
      </div>

      {/* Bottom affordance bar: Trait & Tap hint */}
      <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
        <span className="text-[#67746B] truncate max-w-[65%]">
          {item.trait}
        </span>
        <span className="inline-flex items-center gap-1 font-bold text-[#2A4638] group-hover:underline cursor-pointer">
          <span>{t('dashboard.exploreDoshaGuide', lang === 'hi' ? 'संतुलन गाइड' : 'Explore Guide')}</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
        </span>
      </div>
    </motion.button>
  )
}

function TodayNutritionCard({
  dietPlan,
  lang,
}: {
  dietPlan: DietPlanData | null
  lang: 'en' | 'hi'
}) {
  const { t } = useLanguage()
  const currentHour = new Date().getHours()
  const mealAtmosphere = getMealAtmosphere(currentHour)
  const mealIndex = currentHour < 11 ? 0 : currentHour < 17 ? 1 : 2
  const currentMeal = dietPlan?.meals?.[mealIndex] || dietPlan?.meals?.[1] || {
    meal: currentHour < 11 ? 'Breakfast' : currentHour < 17 ? 'Lunch' : 'Dinner',
    name: lang === 'hi' ? 'गर्म हल्दी-मूंग खिचड़ी गाय के घी के साथ' : 'Warm Turmeric Moong Khichdi with Cow Ghee',
    description:
      lang === 'hi'
        ? 'सौम्य पाचक मसालों (जीरा, अदरक) के साथ पकी हुई सुपाच्य और सात्विक खिचड़ी।'
        : 'Grounding tri-doshic recipe cooked with digestive cumin, ginger, and healing cow ghee.',
    weekly_adjustment: null,
  }

  const mealTimingTag = lang === 'hi' ? mealAtmosphere.hindiTimingTag : mealAtmosphere.timingTag

  const favorItems = dietPlan?.favor_foods?.slice(0, 3) || [
    lang === 'hi' ? 'गाय का घी' : 'Cow Ghee',
    lang === 'hi' ? 'मूंग दाल व जीरा' : 'Moong Dal & Cumin',
    lang === 'hi' ? 'गुनगुना अदरक जल' : 'Warm Ginger Water',
  ]

  const reduceItems = dietPlan?.reduce_foods?.slice(0, 3) || [
    lang === 'hi' ? 'बर्फ वाले शीतल पेय' : 'Cold Iced Drinks',
    lang === 'hi' ? 'कच्चा सूखा सलाद' : 'Raw Dry Salads',
    lang === 'hi' ? 'भारी बासी भोजन' : 'Heavy Leftovers',
  ]

  const isVikritiAdapted = Boolean(dietPlan?.has_vikriti && dietPlan?.vikriti)

  return (
    <section className="rounded-[30px] bg-white p-6 shadow-[0_22px_70px_rgba(42,70,56,0.08)] flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-[#2A4638]">
                <Utensils className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#1F2A24]">
                {t('dashboard.dietTitle')}
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#67746B]">
              {t('dashboard.dietSubtitle')}
            </p>
          </div>

          <Link
            to="/diet-planner"
            className="text-xs font-bold text-[#2A4638] hover:underline flex-none cursor-pointer mt-1"
          >
            {t('dashboard.viewAll')}
          </Link>
        </div>

        {/* Intelligence Status Badge */}
        <div className="mt-3 flex items-center gap-2">
          {isVikritiAdapted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-[10.5px] font-bold text-amber-800">
              <Sparkles className="h-3 w-3 text-amber-600" />
              <span>
                {lang === 'hi'
                  ? `स्तर २ • ${dietPlan?.vikriti?.most_aggravated} शमन हेतु अनुकूलित`
                  : `Level 2 • Adapted for ${dietPlan?.vikriti?.most_aggravated} spike`}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF3EA] border border-[#D1E6D1] px-2.5 py-1 text-[10.5px] font-bold text-[#2A4638]">
              <Leaf className="h-3 w-3 text-[#2A4638]" />
              <span>
                {lang === 'hi' ? 'स्तर १ • मूल प्रकृति आधारित आहार' : 'Level 1 • Baseline Constitution Plan'}
              </span>
            </span>
          )}
        </div>

        {/* Hero Plate Spotlight with Dynamic Diurnal Atmosphere */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200/70 bg-[#FAF8F5] shadow-xs group">
          <div className="relative h-44 w-full overflow-hidden">
            <motion.img
              key={mealAtmosphere.imageSrc}
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              src={mealAtmosphere.imageSrc}
              alt={currentMeal.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-bold text-white shadow-xs">
                <Clock className="h-3 w-3 text-[#E2D5BE]" />
                {mealTimingTag}
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E2D5BE]">
                {currentMeal.meal}
              </span>
              <h3 className="font-serif font-bold text-base leading-snug line-clamp-1 drop-shadow-xs">
                {currentMeal.name}
              </h3>
            </div>
          </div>

          <div className="p-3.5 space-y-2">
            <p className="text-xs leading-relaxed text-[#556358] line-clamp-2">
              {currentMeal.description}
            </p>
            {currentMeal.weekly_adjustment && (
              <div className="flex items-start gap-1.5 rounded-xl bg-amber-50/80 p-2 border border-amber-200/60 text-[11px] text-amber-900">
                <Sparkles className="h-3.5 w-3.5 text-amber-600 flex-none mt-0.5" />
                <span className="leading-snug">
                  <strong>{lang === 'hi' ? 'साप्ताहिक सुधार: ' : 'Weekly adjustment: '}</strong>
                  {currentMeal.weekly_adjustment}
                </span>
              </div>
            )}

            {/* Illustrative Concept Disclaimer Badge */}
            <div className="pt-0.5">
              <Link
                to="/diet-planner"
                className="inline-flex items-center gap-1 rounded-md bg-[#FAF5EE] px-2 py-0.5 text-[10px] font-semibold text-[#8C6B38] border border-[#EEDFCA] hover:bg-[#F4EBDB] transition"
              >
                <span>{t('dashboard.illustrativeVisualBadge')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Micro-Guide: Favor vs Reduce Today */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-xs">
          {/* Favor */}
          <div className="rounded-xl bg-[#F2F7F2] p-2.5 border border-[#D5E5D5]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#22543D] flex items-center gap-1 mb-1.5">
              <span>🟢</span>
              {lang === 'hi' ? 'आज क्या लें' : 'Favor Today'}
            </p>
            <ul className="space-y-1 text-[11px] font-medium text-[#1F2A24]">
              {favorItems.map((item, idx) => (
                <li key={idx} className="truncate flex items-center gap-1">
                  <span className="text-[#2A4638] text-[10px]">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Reduce */}
          <div className="rounded-xl bg-[#FDF5F5] p-2.5 border border-[#F4D9D9]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9C3D32] flex items-center gap-1 mb-1.5">
              <span>🔴</span>
              {lang === 'hi' ? 'किनसे बचें' : 'Reduce Today'}
            </p>
            <ul className="space-y-1 text-[11px] font-medium text-[#1F2A24]">
              {reduceItems.map((item, idx) => (
                <li key={idx} className="truncate flex items-center gap-1">
                  <span className="text-[#9C3D32] text-[10px]">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom CTA to Diet Planner */}
      <Link
        to="/diet-planner"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2A4638] px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#2A4638]/15 transition hover:bg-[#1E3529] cursor-pointer"
      >
        <span>{t('dashboard.exploreDietPlannerCta')}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  )
}

function LivingChronobiologyCard({
  ritucharya,
  lang,
}: {
  ritucharya: RitucharyaData | null
  lang: 'en' | 'hi'
}) {
  const { t } = useLanguage()
  const currentHour = new Date().getHours()
  const activePhase = getActiveDinacharyaPhase(currentHour)

  const activeSeason =
    ritucharya?.seasons?.find((s) => s.id === ritucharya.current_season_id) || {
      id: 'sharad',
      sanskrit_name: 'शरद ऋतु',
      english_name: 'Sharad Ritu (Classical Autumn)',
      hindi_name: 'शरद ऋतु (आश्विन - कार्तिक)',
      months: 'Mid September – Mid November',
      solstice: 'दक्षिणायन (Visarga Kala)',
      solstice_meaning: 'Lunar cooling phase where human vitality and bodily moisture gradually recover.',
      overview:
        'The sharp sun rays of autumn naturally provoke Pitta dosha accumulated during the monsoon. Pacify with sweet, bitter, cooling foods and calm moonlit evening walks.',
    }

  const seasonImageSrc = getSeasonAtmosphere(ritucharya?.current_season_id || activeSeason.id)

  return (
    <section className="rounded-[30px] bg-white p-6 md:p-7 shadow-[0_22px_70px_rgba(42,70,56,0.08)]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-800 shadow-xs">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#1F2A24]">
              {t('dashboard.ritucharyaTitle')}
            </h2>
            <p className="text-xs text-[#67746B] mt-0.5">
              {t('dashboard.ritucharyaSubtitle')}
            </p>
          </div>
        </div>

        {/* Season Pill Badge */}
        <div className="flex items-center gap-2.5">
          <span className="rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-bold text-orange-900 shadow-2xs">
            🍂 {lang === 'hi' ? activeSeason.sanskrit_name : activeSeason.english_name}
          </span>
          <span className="hidden sm:inline-block rounded-full bg-stone-100 px-3 py-1.5 text-[11px] font-semibold text-[#67746B]">
            {activeSeason.solstice}
          </span>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1.6fr] items-start">
        {/* Left: Atmospheric Season Art & Personal Impact */}
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-[#FAF8F5] shadow-xs">
          <div className="relative h-44 sm:h-48 w-full overflow-hidden">
            <motion.img
              key={seasonImageSrc}
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              src={seasonImageSrc}
              alt={activeSeason.english_name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-bold text-white shadow-xs">
                <span>🍂</span>
                {activeSeason.solstice}
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E2D5BE]">
                {activeSeason.months}
              </span>
              <h3 className="font-serif font-bold text-base drop-shadow-xs">
                {lang === 'hi' ? activeSeason.sanskrit_name : activeSeason.english_name}
              </h3>
            </div>
          </div>

          <div className="p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8C6B38]">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>{lang === 'hi' ? 'मौसमी जैविक प्रभाव' : 'Seasonal Biological Dynamics'}</span>
            </div>
            <p className="text-xs leading-relaxed text-[#556358]">
              {ritucharya?.user_focus?.note || activeSeason.overview}
            </p>

            {/* Context link badge */}
            <div className="pt-0.5">
              <Link
                to="/ritucharya"
                className="inline-flex items-center gap-1 rounded-md bg-[#FAF5EE] px-2 py-0.5 text-[10px] font-semibold text-[#8C6B38] border border-[#EEDFCA] hover:bg-[#F4EBDB] transition"
              >
                <span>{t('dashboard.seasonalGuidanceBadge')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right: 24-Hour Dinacharya Live Clock & 3 Actionable Rituals */}
        <div className="space-y-4">
          {/* Dinacharya Clock Bar */}
          <div className="rounded-2xl bg-[#FBF9F6] p-4 border border-stone-200/70">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#2A4638]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2A24]">
                  {t('dashboard.dinacharyaClock')}
                </h4>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800 border border-emerald-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('dashboard.activePhaseNow')}
              </span>
            </div>

            {/* 4 Phase Visual Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              {DINACHARYA_PHASES.map((phase) => {
                const isActive = activePhase.id === phase.id
                return (
                  <div
                    key={phase.id}
                    className={`rounded-xl p-2 transition border ${
                      isActive
                        ? 'bg-white shadow-sm ring-2 ring-[#2A4638] border-transparent font-bold'
                        : 'bg-white/60 text-stone-500 border-stone-200/50'
                    }`}
                  >
                    <p className="text-[10px] text-stone-400 font-mono">{phase.timeRange}</p>
                    <p className={`text-xs mt-0.5 ${isActive ? 'text-[#1F2A24] font-bold' : 'text-stone-600'}`}>
                      {phase.doshaName}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Active Phase Callout */}
            <div className="mt-3 rounded-xl bg-white p-3 border border-stone-200/70 flex items-start gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-700 flex-none mt-0.5">
                <activePhase.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1F2A24]">
                  {lang === 'hi' ? activePhase.hindiName : activePhase.name}
                </p>
                <p className="text-[11.5px] leading-relaxed text-[#556358] mt-0.5">
                  {lang === 'hi' ? activePhase.hindiGuidance : activePhase.guidance}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Actionable Ritual Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Morning */}
            <div className="rounded-2xl bg-[#F9F4EE] p-3.5 border border-stone-200/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#67746B]">
                🌅 {t('dashboard.morning')}
              </span>
              <p className="mt-1 text-xs leading-relaxed text-[#1F2A24]">
                {lang === 'hi'
                  ? 'उषापान (गुनगुना जल) और जिह्वा निर्लेखन (जीभी साफ करना) से पाचक अग्नि को जाग्रत करें।'
                  : 'Warm water (Ushapan) and gentle tongue scraping to eliminate overnight metabolic toxins.'}
              </p>
            </div>

            {/* Midday */}
            <div className="rounded-2xl bg-[#F9F4EE] p-3.5 border border-stone-200/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#67746B]">
                ☀️ {t('dashboard.midday')}
              </span>
              <p className="mt-1 text-xs leading-relaxed text-[#1F2A24]">
                {lang === 'hi'
                  ? 'मध्याह्न १२-१ बजे के बीच मुख्य सात्विक भोजन लें; ठंडे पानी और कच्चे भोजन से बचें।'
                  : 'Wholesome warm lunch during peak solar Agni; favor freshly cooked grains and ghee.'}
              </p>
            </div>

            {/* Evening */}
            <div className="rounded-2xl bg-[#F9F4EE] p-3.5 border border-stone-200/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#67746B]">
                🌙 {t('dashboard.evening')}
              </span>
              <p className="mt-1 text-xs leading-relaxed text-[#1F2A24]">
                {lang === 'hi'
                  ? 'तिल तेल से पाद-अभ्यंग (पैरों की मालिश) और रात ८ बजे से पहले हल्का सुपाच्य भोजन।'
                  : 'Foot oil massage (Padabhyanga), gentle breathing, and early restorative sleep before 10 PM.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA to Full Ritucharya Page */}
      <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-[#67746B]">
          {lang === 'hi'
            ? 'शास्त्रीय अष्टांग हृदयम् एवं चरक संहिता के अनुसार ऋतुचर्या।'
            : 'Classical chronobiology codified from Ashtanga Hridaya & Charaka Samhita.'}
        </span>
        <Link
          to="/ritucharya"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#FAF5EE] px-3.5 py-1.5 text-xs font-bold text-[#2A4638] border border-[#E9DFD1] hover:bg-[#2A4638] hover:text-white hover:border-[#2A4638] transition cursor-pointer"
        >
          <span>{t('dashboard.exploreRitucharyaCta')}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  )
}

function VikritiCurrentStateCard({
  vikriti,
  prakritiResult,
}: {
  vikriti: VikritiResult | null
  prakritiResult: AssessmentResult | null
}) {
  const { lang, t } = useLanguage()

  // State A: Active check-in exists (≤10 days)
  if (vikriti && !vikriti.is_stale) {
    const dosha = vikriti.most_aggravated.toLowerCase()
    const elevatedStyle = {
      vata: {
        border: 'border-[#6B8FB5]/35',
        bg: 'bg-gradient-to-br from-[#F4F8FC] via-[#FFFFFF] to-[#EBF3FB]',
        badgeBg: 'bg-[#6B8FB5]/15 text-[#2C5282] border-[#6B8FB5]/30',
        bar: 'bg-[#6B8FB5]',
        glow: 'bg-[#6B8FB5]/10',
      },
      pitta: {
        border: 'border-[#D89A4C]/35',
        bg: 'bg-gradient-to-br from-[#FFF9F2] via-[#FFFFFF] to-[#FDF2E2]',
        badgeBg: 'bg-[#D89A4C]/15 text-[#9E6218] border-[#D89A4C]/30',
        bar: 'bg-[#D89A4C]',
        glow: 'bg-[#D89A4C]/10',
      },
      kapha: {
        border: 'border-[#6B9E6B]/35',
        bg: 'bg-gradient-to-br from-[#F4F9F4] via-[#FFFFFF] to-[#EAF4EA]',
        badgeBg: 'bg-[#6B9E6B]/15 text-[#22543D] border-[#6B9E6B]/30',
        bar: 'bg-[#6B9E6B]',
        glow: 'bg-[#6B9E6B]/10',
      },
    }[dosha] ?? {
      border: 'border-amber-300',
      bg: 'bg-amber-50/50',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      bar: 'bg-amber-500',
      glow: 'bg-amber-400/10',
    }

    const delta = {
      vata: vikriti.vata_delta,
      pitta: vikriti.pitta_delta,
      kapha: vikriti.kapha_delta,
    }[dosha] ?? 0

    const baselineScores = prakritiResult
      ? {
          vata: Math.round(prakritiResult.vata_score),
          pitta: Math.round(prakritiResult.pitta_score),
          kapha: Math.round(prakritiResult.kapha_score),
        }
      : { vata: 33, pitta: 33, kapha: 33 }

    const currentScores = {
      vata: Math.round(vikriti.vata_score),
      pitta: Math.round(vikriti.pitta_score),
      kapha: Math.round(vikriti.kapha_score),
    }

    return (
      <div className={`relative overflow-hidden rounded-[28px] border-2 p-6 md:p-7 shadow-[0_18px_60px_rgba(42,70,56,0.06)] ${elevatedStyle.border} ${elevatedStyle.bg}`}>
        <div className={`pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full ${elevatedStyle.glow} blur-[60px]`} />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Info */}
          <div className="max-w-xl space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${elevatedStyle.badgeBg}`}>
                <Sparkles className="h-3.5 w-3.5" />
                {t('dashboard.vikritiBadge')}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#67746B]">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {vikriti.days_ago === 0
                  ? t('dashboard.checkedToday')
                  : t('dashboard.checkedDaysAgo').replace('{days}', String(vikriti.days_ago))}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#1F2A24]">
              {lang === 'hi' ? (
                <>
                  आपका <span className="capitalize">{vikriti.most_aggravated}</span> दोष वर्तमान में बढ़ा हुआ है
                </>
              ) : (
                <>
                  Your <span className="capitalize">{vikriti.most_aggravated}</span> is currently elevated
                </>
              )}
              {delta > 0 && (
                <span className="ml-2.5 inline-block rounded-full bg-white px-3 py-0.5 text-xs font-bold text-[#1F2A24] border border-[#E8E0D2] shadow-xs">
                  {t('dashboard.vsBaseline').replace('{delta}', String(delta))}
                </span>
              )}
            </h2>

            <p className="text-sm leading-relaxed text-[#67746B]">
              {lang === 'hi' ? (
                <>
                  आपकी जन्मजात प्रकृति (Prakriti) स्थिर है, लेकिन वर्तमान कारणों से आपका{' '}
                  <span className="font-semibold text-[#1F2A24] capitalize">{vikriti.most_aggravated}</span> दोष बढ़ गया है। इसे शांत करने के लिए आपका साप्ताहिक डाइट प्लान कस्टमाइज़ कर दिया गया है।
                </>
              ) : (
                <>
                  Your congenital constitution (Prakriti) remains steady, but current transient factors have elevated your{' '}
                  <span className="font-semibold text-[#1F2A24] capitalize">{vikriti.most_aggravated}</span>. Your weekly diet plan has been customized to pacify this.
                </>
              )}
            </p>
          </div>

          {/* Middle: Comparison bars */}
          <div className="flex-none rounded-2xl bg-white/90 p-4 border border-[#E9E1D2]/80 shadow-xs space-y-2.5 min-w-[240px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#67746B]">
              {t('dashboard.baselineVsWeek')}
            </p>
            {(['vata', 'pitta', 'kapha'] as const).map((d) => {
              const base = baselineScores[d]
              const curr = currentScores[d]
              const isElevated = d === dosha
              const color = d === 'vata' ? '#6B8FB5' : d === 'pitta' ? '#D89A4C' : '#6B9E6B'
              return (
                <div key={d} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`capitalize ${isElevated ? 'font-bold text-[#1F2A24]' : 'font-medium text-[#67746B]'}`}>
                      {d} {isElevated && '🔥'}
                    </span>
                    <span className="text-[11px] text-[#67746B]">
                      {base}% ➔ <strong className={isElevated ? 'text-[#1F2A24]' : 'text-[#67746B]'}>{curr}%</strong>
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#EAE2D5] overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, curr)}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2.5 flex-none sm:flex-row lg:flex-col justify-center">
            <Link
              to="/diet-planner"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2A4638] px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#2A4638]/15 transition hover:bg-[#233D2F]"
            >
              {t('dashboard.viewAdaptedDiet')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/vikriti-assessment"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E8E0D2] bg-white px-4 py-2 text-xs font-semibold text-[#1F2A24] shadow-xs transition hover:bg-[#F9F4EE]"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#67746B]" />
              {t('dashboard.retakeCheckin')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // State B: No check-in yet or stale (>10 days)
  const isStale = Boolean(vikriti?.is_stale)

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#D89A4C]/25 bg-gradient-to-r from-[#FDF8F0] via-[#FFFBF6] to-[#FDF4E7] p-6 shadow-[0_16px_50px_rgba(216,154,76,0.06)]">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[#D89A4C]/15 text-[#B2762A] shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#D89A4C]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9E6218] border border-[#D89A4C]/25">
                {isStale ? t('dashboard.checkinDue') : t('dashboard.weeklyWellnessLoop')}
              </span>
              {isStale && (
                <span className="text-xs font-semibold text-[#67746B]">
                  {t('dashboard.lastCheckedDaysAgo').replace('{days}', String(vikriti?.days_ago ?? 0))}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[#1F2A24]">
              {isStale ? t('dashboard.checkinDueTitle') : t('dashboard.checkCurrentBalance')}
            </h2>
            <p className="text-sm leading-relaxed text-[#67746B] max-w-2xl">
              {isStale
                ? t('dashboard.checkinDueDesc')
                : t('dashboard.checkinNewDesc')}
            </p>
          </div>
        </div>

        <div className="flex-none pt-2 sm:pt-0">
          <Link
            to="/vikriti-assessment"
            className="inline-flex items-center gap-2 rounded-xl bg-[#D89A4C] px-5 py-2.5 text-xs md:text-sm font-semibold text-white shadow-lg shadow-[#D89A4C]/20 transition hover:bg-[#C27C30]"
          >
            {isStale ? t('dashboard.retake2MinCheckin') : t('dashboard.take2MinCheckin')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { lang, t } = useLanguage()
  const { status, result, loading } = useAssessmentStatus()
  const { vikriti } = useVikritiStatus()
  const [selectedEducationDosha, setSelectedEducationDosha] = useState<DoshaKey | null>(null)

  const [dietPlan, setDietPlan] = useState<DietPlanData | null>(null)
  const [ritucharya, setRitucharya] = useState<RitucharyaData | null>(null)

  useEffect(() => {
    cachedAuthFetch<DietPlanData>('/diet-plan')
      .then(setDietPlan)
      .catch(() => setDietPlan(null))

    cachedAuthFetch<RitucharyaData>('/ritucharya/details')
      .then(setRitucharya)
      .catch(() => setRitucharya(null))
  }, [])

  const doshaData = useMemo(() => buildDoshaData(result, lang), [result, lang])
  const balanceBadgeLabel = result ? formatResultType(result.result_type, lang) : t('dashboard.balancedPrakriti')

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[#67746B]">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A4638]/30 border-t-[#2A4638]" />
          <p className="text-sm font-medium">{t('dashboard.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {status === 'none' ? (
          <motion.section
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="flex min-h-[72vh] items-center justify-center"
          >
            <div className="w-full max-w-2xl rounded-[30px] border border-[#E9E1D2] bg-white/80 p-10 text-center shadow-[0_28px_90px_rgba(42,70,56,0.08)] backdrop-blur-sm">
              <div className="mx-auto flex h-20 w-auto items-center justify-center">
                <img src="/ayushya new logo.png" alt="Ayushya" className="h-20 w-auto object-contain rounded-2xl" />
              </div>

              <h2 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-[#1F2A24]">
                {t('dashboard.knowYourPrakriti')}
              </h2>
              <p className="mt-3 text-base leading-7 text-[#67746B]">
                {t('dashboard.knowYourPrakritiDesc')}
              </p>
              <Link
                to="/assessment"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2A4638] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#2A4638]/15 transition hover:bg-[#233D2F]"
              >
                {t('dashboard.startAssessment')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="filled"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* ── This Week's Imbalance (Vikriti Current State Pulse) ── */}
            <VikritiCurrentStateCard vikriti={vikriti} prakritiResult={result} />

            <div className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">
              <section className="rounded-[30px] bg-white p-7 shadow-[0_22px_70px_rgba(42,70,56,0.08)]">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6B8FB5]">
                      {t('dashboard.yourPrakriti')}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#1F2A24]">
                      {t('dashboard.mindBodyConstitution')}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full bg-[#EAF3EA] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2A4638]">
                      {balanceBadgeLabel}
                    </span>
                    <Link
                      to="/assessment"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#E9E1D2] bg-[#F9F4EE] px-3.5 py-1.5 text-xs font-semibold text-[#2A4638] transition hover:bg-[#2A4638] hover:text-white hover:border-[#2A4638] shadow-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {t('dashboard.retakeAssessment')}
                    </Link>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
                  <div className="flex items-center justify-center">
                    <PrakritiPieChart data={doshaData} />
                  </div>

                  <div className="space-y-3">
                    {/* Educational Explainer Banner: Removes confusion about "Dosha" */}
                    <div className="rounded-2xl bg-[#FAF6F0] p-3.5 border border-[#EEDFCA] space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#D89A4C] flex-none" />
                        <h4 className="text-xs font-bold text-[#1F2A24]">
                          {t('dashboard.doshaExplainerTitle', 'What are the 3 Doshas (Tridosha)?')}
                        </h4>
                      </div>
                      <p className="text-[11.5px] leading-relaxed text-[#67746B]">
                        {t('dashboard.doshaExplainerSubtitle', 'In Ayurveda, Doshas are not diseases or flaws — they are the 3 bio-energies governing all physical and mental functions. Tap any card below to explore its functions, excess signs, and balancing foods.')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#67746B]">
                        {t('dashboard.tapToLearnMore')}
                      </p>
                      <span className="text-[10.5px] text-[#8C6B38] font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D89A4C] animate-pulse" />
                        {lang === 'hi' ? 'क्लिक करके गाइड देखें' : 'Interactive • Tap for guide'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {doshaData.map((item) => (
                        <DoshaSummaryRow
                          key={item.key}
                          item={item}
                          onClick={() => setSelectedEducationDosha(item.key)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <TodayNutritionCard dietPlan={dietPlan} lang={lang} />
            </div>

            <LivingChronobiologyCard ritucharya={ritucharya} lang={lang} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Dosha Educational Modal */}
      <DoshaEducationModal
        doshaKey={selectedEducationDosha}
        onClose={() => setSelectedEducationDosha(null)}
      />
    </>
  )
}

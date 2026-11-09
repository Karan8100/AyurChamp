import { useMemo } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

interface DoshaDeviationCardProps {
  deviationIndex: number
  deviationLevel: string
  deviationLabel: string
  trendSummary: string
  trendDirection: string
}

export default function DoshaDeviationCard({
  deviationIndex,
  deviationLevel,
  deviationLabel,
  trendSummary,
  trendDirection,
}: DoshaDeviationCardProps) {
  const { lang } = useLanguage()

  const levelConfig = useMemo(() => {
    switch (deviationLevel) {
      case 'sama':
        return {
          title: lang === 'hi' ? 'सम दोष (उत्तम सामंजस्य)' : (deviationLabel || 'Sama Dosa (Homeostasis)'),
          subtitle:
            lang === 'hi'
              ? 'दोष संतुलन उत्तम है, जैविक क्रियाएं स्वाभाविक चल रही हैं।'
              : 'Tridoshic balance is in equilibrium with your baseline constitution.',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          gaugeColor: '#10B981',
          icon: CheckCircle2,
        }
      case 'alpa':
        return {
          title: lang === 'hi' ? 'अल्प विकृति (सौम्य मौसमी विचलन)' : 'Alpa Vikriti (Mild Variance)',
          subtitle:
            lang === 'hi'
              ? 'ऋतु या आहार के प्रभाव से सौम्य विचलन है, सामान्य दिनचर्या से नियंत्रित हो सकता है।'
              : 'Mild fluctuation likely triggered by seasonal transition or temporary diet.',
          badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
          gaugeColor: '#0EA5E9',
          icon: Activity,
        }
      case 'madhyama':
        return {
          title: lang === 'hi' ? 'मध्यम विकृति (सक्रिय असंतुलन)' : 'Madhyama Vikriti (Moderate)',
          subtitle:
            lang === 'hi'
              ? 'एक या अधिक दोषों में स्पष्ट वृद्धि है, लक्षित शमन आहार की आवश्यकता है।'
              : 'Noticeable doshic elevation requiring focused dietary & lifestyle pacification.',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          gaugeColor: '#F59E0B',
          icon: ShieldAlert,
        }
      case 'teevra':
      default:
        return {
          title: lang === 'hi' ? 'तीव्र विकृति (गंभीर असंतुलन)' : 'Teevra Vikriti (Acute Imbalance)',
          subtitle:
            lang === 'hi'
              ? 'दोषों में अत्यधिक विचलन है, आयुर्वेदिक वैद्य का परामर्श अनुशंसित है।'
              : 'Acute doshic vitiation. Clinical consultation with an Ayurvedic physician is advised.',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
          gaugeColor: '#F43F5E',
          icon: ShieldAlert,
        }
    }
  }, [deviationLevel, lang])

  const Icon = levelConfig.icon

  // Calculate percentage of max scale (50% max)
  const clampedPercent = Math.min(100, Math.max(0, (deviationIndex / 50) * 100))

  return (
    <div className="bg-white rounded-3xl border border-[#E5DED1] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#2A4638]/10 text-[#2A4638] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">
                {lang === 'hi' ? 'दोष विचलन सूचकांक (DII)' : 'Doshic Imbalance Index (DII)'}
              </h4>
              <span className="text-[11px] text-stone-500 font-mono">
                Charaka Samhita Vimana Sthana 8
              </span>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${levelConfig.badgeBg}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{levelConfig.title.split(' ')[0]} {levelConfig.title.split(' ')[1]}</span>
          </span>
        </div>

        {/* Primary Metric Gauge */}
        <div className="my-5 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-semibold text-stone-600">
              {lang === 'hi' ? 'वर्तमान कुल विचलन' : 'Total Systemic Divergence'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-serif font-black text-stone-900 font-mono">
                {deviationIndex}%
              </span>
              <span className="text-xs text-stone-500 font-mono">/ 50%</span>
            </div>
          </div>

          {/* Segmented Meter */}
          <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${clampedPercent}%`,
                backgroundColor: levelConfig.gaugeColor,
              }}
            />
          </div>

          {/* Meter Scale Marks */}
          <div className="flex justify-between text-[10px] font-mono text-stone-400 mt-1.5">
            <span>0% (Sama)</span>
            <span>15% (Alpa)</span>
            <span>30% (Madhyama)</span>
            <span>50%+ (Teevra)</span>
          </div>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed mb-4">
          {levelConfig.subtitle}
        </p>
      </div>

      {/* Trajectory Trend Box */}
      <div className="pt-3 border-t border-stone-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
          {trendDirection === 'improving' ? (
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          ) : trendDirection === 'elevated' ? (
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="leading-snug">{trendSummary}</span>
        </div>
      </div>
    </div>
  )
}

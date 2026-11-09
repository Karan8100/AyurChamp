import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Wind, Droplets, Info, Sparkles } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

export type ProgressionPoint = {
  checkin_id: number
  date: string
  week_label: string
  vata_score: number
  pitta_score: number
  kapha_score: number
  vata_delta: number
  pitta_delta: number
  kapha_delta: number
  most_aggravated: string
  deviation_index: number
  clinical_milestone?: string | null
}

export type BaselinePrakriti = {
  vata: number
  pitta: number
  kapha: number
  result_type: string
  phenotype?: string
}

interface ProgressionChartProps {
  timeline: ProgressionPoint[]
  baseline: BaselinePrakriti
}

export default function ProgressionChart({ timeline, baseline }: ProgressionChartProps) {
  const { lang } = useLanguage()
  const [viewMode, setViewMode] = useState<'absolute' | 'delta'>('absolute')
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null)
  const [visibleDoshas, setVisibleDoshas] = useState<{ vata: boolean; pitta: boolean; kapha: boolean }>({
    vata: true,
    pitta: true,
    kapha: true,
  })

  // SVG dimensions & coordinate math
  const width = 720
  const height = 300
  const padding = { top: 30, right: 30, bottom: 50, left: 50 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom

  // Y Scale limits
  const { yMin, yMax } = useMemo(() => {
    if (viewMode === 'delta') {
      return { yMin: -25, yMax: 25 }
    }
    return { yMin: 0, yMax: 80 }
  }, [viewMode])

  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val))
    const ratio = (clamped - yMin) / (yMax - yMin)
    return height - padding.bottom - ratio * innerHeight
  }

  const getX = (index: number) => {
    if (timeline.length <= 1) return padding.left + innerWidth / 2
    return padding.left + (index / (timeline.length - 1)) * innerWidth
  }

  // Generate cubic bezier curve string
  const getCurvePath = (values: number[]) => {
    if (values.length === 0) return ''
    if (values.length === 1) return `M ${getX(0)} ${getY(values[0])}`

    let path = `M ${getX(0)} ${getY(values[0])}`
    for (let i = 0; i < values.length - 1; i++) {
      const x0 = getX(i)
      const y0 = getY(values[i])
      const x1 = getX(i + 1)
      const y1 = getY(values[i + 1])
      const cx = (x0 + x1) / 2
      path += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`
    }
    return path
  }

  const vataValues = useMemo(
    () => timeline.map((p) => (viewMode === 'absolute' ? p.vata_score : p.vata_delta)),
    [timeline, viewMode],
  )
  const pittaValues = useMemo(
    () => timeline.map((p) => (viewMode === 'absolute' ? p.pitta_score : p.pitta_delta)),
    [timeline, viewMode],
  )
  const kaphaValues = useMemo(
    () => timeline.map((p) => (viewMode === 'absolute' ? p.kapha_score : p.kapha_delta)),
    [timeline, viewMode],
  )

  const activePoint = activePointIndex !== null ? timeline[activePointIndex] : null

  // Y-ticks
  const yTicks = useMemo(() => {
    if (viewMode === 'delta') {
      return [-20, -10, 0, 10, 20]
    }
    return [0, 20, 40, 60, 80]
  }, [viewMode])

  const toggleDosha = (dosha: 'vata' | 'pitta' | 'kapha') => {
    setVisibleDoshas((prev) => {
      const updated = { ...prev, [dosha]: !prev[dosha] }
      // Don't allow disabling all
      if (!updated.vata && !updated.pitta && !updated.kapha) return prev
      return updated
    })
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E5DED1] p-6 sm:p-8 shadow-xs relative">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
              {lang === 'hi' ? 'त्रिदोष प्रगति विक्षेप ग्राफ (Dosha Trajectory)' : 'Tridosha Longitudinal Progression'}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              {timeline.length} {lang === 'hi' ? 'सप्ताह' : 'Weeks'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {viewMode === 'absolute'
              ? lang === 'hi'
                ? 'साप्ताहिक प्रकृति अनुपात (%) एवं आधारभूत बेंचमार्क की तुलना'
                : 'Weekly doshic proportion (%) tracked against birth Prakriti baseline'
              : lang === 'hi'
              ? 'जन्म प्रकृति की तुलना में विचलन (Δ%) — 0% संतुलित स्थिति दर्शाता है'
              : 'Doshic aggravation delta (Δ%) relative to baseline — 0% indicates optimal equilibrium'}
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center self-start sm:self-auto bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode('absolute')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'absolute'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'hi' ? 'अनुपात (%)' : 'Proportion (%)'}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('delta')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'delta'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'hi' ? 'विचलन (Δ%)' : 'Aggravation Delta (Δ%)'}
          </button>
        </div>
      </div>

      {/* Legend & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-2 text-xs">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Vata */}
          <button
            type="button"
            onClick={() => toggleDosha('vata')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
              visibleDoshas.vata
                ? 'bg-[#5B8FB9]/10 border-[#5B8FB9]/30 text-[#2D5477] font-semibold'
                : 'opacity-40 border-stone-200 text-stone-400'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-[#5B8FB9]" />
            <span>Vata</span>
            {viewMode === 'absolute' && (
              <span className="text-[10px] opacity-75 font-mono">({baseline.vata}%)</span>
            )}
          </button>

          {/* Pitta */}
          <button
            type="button"
            onClick={() => toggleDosha('pitta')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
              visibleDoshas.pitta
                ? 'bg-[#D97706]/10 border-[#D97706]/30 text-[#92400E] font-semibold'
                : 'opacity-40 border-stone-200 text-stone-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Pitta</span>
            {viewMode === 'absolute' && (
              <span className="text-[10px] opacity-75 font-mono">({baseline.pitta}%)</span>
            )}
          </button>

          {/* Kapha */}
          <button
            type="button"
            onClick={() => toggleDosha('kapha')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
              visibleDoshas.kapha
                ? 'bg-[#15803D]/10 border-[#15803D]/30 text-[#14532D] font-semibold'
                : 'opacity-40 border-stone-200 text-stone-400'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Kapha</span>
            {viewMode === 'absolute' && (
              <span className="text-[10px] opacity-75 font-mono">({baseline.kapha}%)</span>
            )}
          </button>
        </div>

        {/* Benchmark notice */}
        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 font-mono">
          <span className="inline-block w-3.5 border-b-2 border-dashed border-stone-400" />
          <span>{lang === 'hi' ? 'डैश रेखा = मूल जन्म प्रकृति' : 'Dashed lines = Baseline Prakriti'}</span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="w-full overflow-x-auto pt-2 select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[580px] overflow-visible"
        >
          {/* Equilibrium Zone for Delta Mode (-5% to +5%) */}
          {viewMode === 'delta' && (
            <rect
              x={padding.left}
              y={getY(5)}
              width={innerWidth}
              height={getY(-5) - getY(5)}
              fill="#10B981"
              fillOpacity="0.06"
              stroke="#10B981"
              strokeWidth="1"
              strokeDasharray="4 4"
              strokeOpacity="0.3"
            />
          )}

          {/* Grid lines and Y axis ticks */}
          {yTicks.map((tick) => {
            const y = getY(tick)
            const isZero = tick === 0
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={isZero && viewMode === 'delta' ? '#2A4638' : '#E5E7EB'}
                  strokeWidth={isZero && viewMode === 'delta' ? 1.5 : 1}
                  strokeDasharray={isZero ? undefined : '2 3'}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-stone-400 text-[10px] font-mono font-medium"
                >
                  {viewMode === 'delta' && tick > 0 ? `+${tick}%` : `${tick}%`}
                </text>
              </g>
            )
          })}

          {/* Baseline Horizontal Benchmark Lines in Absolute Mode */}
          {viewMode === 'absolute' && (
            <>
              {visibleDoshas.vata && (
                <line
                  x1={padding.left}
                  y1={getY(baseline.vata)}
                  x2={width - padding.right}
                  y2={getY(baseline.vata)}
                  stroke="#5B8FB9"
                  strokeWidth="1.25"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />
              )}
              {visibleDoshas.pitta && (
                <line
                  x1={padding.left}
                  y1={getY(baseline.pitta)}
                  x2={width - padding.right}
                  y2={getY(baseline.pitta)}
                  stroke="#D97706"
                  strokeWidth="1.25"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />
              )}
              {visibleDoshas.kapha && (
                <line
                  x1={padding.left}
                  y1={getY(baseline.kapha)}
                  x2={width - padding.right}
                  y2={getY(baseline.kapha)}
                  stroke="#15803D"
                  strokeWidth="1.25"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />
              )}
            </>
          )}

          {/* X Axis vertical lines and labels */}
          {timeline.map((point, index) => {
            const x = getX(index)
            const isHovered = activePointIndex === index
            return (
              <g key={point.checkin_id}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke={isHovered ? '#2A4638' : '#F3F4F6'}
                  strokeWidth={isHovered ? 1.5 : 1}
                  strokeDasharray={isHovered ? '3 3' : undefined}
                />
                <text
                  x={x}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-semibold transition-colors ${
                    isHovered ? 'fill-[#2A4638] font-bold' : 'fill-stone-600'
                  }`}
                >
                  {point.week_label.split(' ')[0]} {point.week_label.split(' ')[1] || ''}
                </text>
                <text
                  x={x}
                  y={height - padding.bottom + 32}
                  textAnchor="middle"
                  className="fill-stone-400 text-[9px] font-mono"
                >
                  {point.date.slice(5)}
                </text>
              </g>
            )
          })}

          {/* Curves */}
          {visibleDoshas.vata && (
            <path
              d={getCurvePath(vataValues)}
              fill="none"
              stroke="#5B8FB9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {visibleDoshas.pitta && (
            <path
              d={getCurvePath(pittaValues)}
              fill="none"
              stroke="#D97706"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {visibleDoshas.kapha && (
            <path
              d={getCurvePath(kaphaValues)}
              fill="none"
              stroke="#15803D"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Dots on Curves */}
          {timeline.map((point, index) => {
            const x = getX(index)
            const isHovered = activePointIndex === index

            return (
              <g key={point.checkin_id}>
                {/* Vata Dot */}
                {visibleDoshas.vata && (
                  <circle
                    cx={x}
                    cy={getY(viewMode === 'absolute' ? point.vata_score : point.vata_delta)}
                    r={isHovered ? 5.5 : 3.5}
                    fill="#FFFFFF"
                    stroke="#5B8FB9"
                    strokeWidth="2.5"
                    className="transition-all cursor-pointer"
                  />
                )}
                {/* Pitta Dot */}
                {visibleDoshas.pitta && (
                  <circle
                    cx={x}
                    cy={getY(viewMode === 'absolute' ? point.pitta_score : point.pitta_delta)}
                    r={isHovered ? 5.5 : 3.5}
                    fill="#FFFFFF"
                    stroke="#D97706"
                    strokeWidth="2.5"
                    className="transition-all cursor-pointer"
                  />
                )}
                {/* Kapha Dot */}
                {visibleDoshas.kapha && (
                  <circle
                    cx={x}
                    cy={getY(viewMode === 'absolute' ? point.kapha_score : point.kapha_delta)}
                    r={isHovered ? 5.5 : 3.5}
                    fill="#FFFFFF"
                    stroke="#15803D"
                    strokeWidth="2.5"
                    className="transition-all cursor-pointer"
                  />
                )}

                {/* Invisible hover slice for easy point selection */}
                <rect
                  x={x - innerWidth / (timeline.length * 2)}
                  y={padding.top}
                  width={innerWidth / timeline.length}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActivePointIndex(index)}
                  onClick={() => setActivePointIndex(index)}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Floating or Docked Tooltip on active point */}
      <AnimatePresence>
        {activePoint && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-4 rounded-2xl bg-stone-900 text-white shadow-lg border border-stone-800 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#E2D5BE]">{activePoint.week_label}</span>
                <span className="text-stone-400 font-mono text-[11px]">• {activePoint.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-400">{lang === 'hi' ? 'विचलन सूचकांक:' : 'Deviation Index:'}</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-800 text-[#E2D5BE] font-bold font-mono">
                  {activePoint.deviation_index}%
                </span>
              </div>
            </div>

            {/* Dosha scores */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/50">
                <div className="flex items-center gap-1 text-[#5B8FB9] font-medium text-[11px] mb-1">
                  <Wind className="w-3 h-3" />
                  <span>Vata</span>
                </div>
                <div className="font-bold text-sm font-mono">{activePoint.vata_score}%</div>
                <div className="text-[10px] text-stone-400 mt-0.5 font-mono">
                  Δ {activePoint.vata_delta > 0 ? `+${activePoint.vata_delta}` : activePoint.vata_delta}%
                </div>
              </div>

              <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/50">
                <div className="flex items-center gap-1 text-[#D97706] font-medium text-[11px] mb-1">
                  <Flame className="w-3 h-3" />
                  <span>Pitta</span>
                </div>
                <div className="font-bold text-sm font-mono">{activePoint.pitta_score}%</div>
                <div className="text-[10px] text-stone-400 mt-0.5 font-mono">
                  Δ {activePoint.pitta_delta > 0 ? `+${activePoint.pitta_delta}` : activePoint.pitta_delta}%
                </div>
              </div>

              <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/50">
                <div className="flex items-center gap-1 text-[#15803D] font-medium text-[11px] mb-1">
                  <Droplets className="w-3 h-3" />
                  <span>Kapha</span>
                </div>
                <div className="font-bold text-sm font-mono">{activePoint.kapha_score}%</div>
                <div className="text-[10px] text-stone-400 mt-0.5 font-mono">
                  Δ {activePoint.kapha_delta > 0 ? `+${activePoint.kapha_delta}` : activePoint.kapha_delta}%
                </div>
              </div>
            </div>

            {/* Clinical milestone if present */}
            {activePoint.clinical_milestone && (
              <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-start gap-2 text-stone-300">
                <Info className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <span className="italic leading-relaxed">
                  <span className="font-semibold text-stone-200">
                    {lang === 'hi' ? 'नैदानिक मील का पत्थर: ' : 'Clinical Milestone: '}
                  </span>
                  {activePoint.clinical_milestone}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

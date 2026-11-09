import type { FC } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { AyurMitraIcon } from './AyurMitraIcon'
import { useLanguage } from '../../contexts/LanguageContext'

interface AyurMitraFloatingButtonProps {
  isOpen: boolean
  onClick: () => void
}

export const AyurMitraFloatingButton: FC<AyurMitraFloatingButtonProps> = ({
  isOpen,
  onClick,
}) => {
  const { t } = useLanguage()
  const [showTooltip, setShowTooltip] = useState(() => {
    return !localStorage.getItem('ayurmitra_tooltip_dismissed')
  })

  const dismissTooltip = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowTooltip(false)
    localStorage.setItem('ayurmitra_tooltip_dismissed', 'true')
  }

  const handleClick = () => {
    if (showTooltip) {
      setShowTooltip(false)
      localStorage.setItem('ayurmitra_tooltip_dismissed', 'true')
    }
    onClick()
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* 1. Welcoming Floating Speech Bubble (First-time / Idle) */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 15, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ delay: 0.8, duration: 0.25 }}
            onClick={handleClick}
            className="hidden sm:flex items-center gap-2 rounded-2xl border border-[#E5DED1] bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md cursor-pointer hover:border-[#2A4638]/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold text-[#1F2A24]">
                {t('ayurMitra.title', 'AyurMitra')}
              </p>
              <span className="text-[11px] text-[#55645A]">
                • {t('ayurMitra.askPlaceholder', 'Ask your Vaidya co-pilot…').slice(0, 24)}…
              </span>
            </div>

            <button
              type="button"
              onClick={dismissTooltip}
              className="ml-1 rounded-lg p-0.5 text-[#88978D] hover:bg-[#F2ECE1] hover:text-[#1F2A24] transition-colors"
              title="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Botanical Floating Action Button */}
      <motion.button
        type="button"
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.93 }}
        aria-label={isOpen ? 'Close AyurMitra Co-Pilot' : 'Open AyurMitra Co-Pilot'}
        className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2A4638] via-[#20362B] to-[#16271E] text-white shadow-[0_12px_36px_rgba(25,43,34,0.35)] ring-2 ring-[#E5B94C]/40 transition-all cursor-pointer"
      >
        {/* Breathing Outer Aura Pulse Ring */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-2xl bg-emerald-500/20 animate-pulse pointer-events-none" />
        )}

        {/* Dynamic Icon Switch (Close 'X' when open, AyurMitra Emblem when closed) */}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6 text-[#F7F3EB]" />
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative flex items-center justify-center"
            >
              <AyurMitraIcon size="md" className="h-9 w-9" />
              
              {/* Online Indicator Dot */}
              <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-[#16271E] bg-emerald-500" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

import type { FC } from 'react'

/**
 * 🌿 AYURMITRA ICON COMPONENT
 * ==============================================================================
 * TO REPLACE THIS ICON WITH YOUR OWN CUSTOM DESIGN:
 * 1. Place your custom image in `frontend/public/`
 *    (e.g., `frontend/public/ayurmitra-icon.png` or `frontend/public/ayurmitra-icon.svg`)
 * 2. In this file, set USE_CUSTOM_IMAGE = true and verify CUSTOM_IMAGE_PATH below!
 * ==============================================================================
 */

// Set this to `true` when you want to use your custom image from the public/ folder:
export const USE_CUSTOM_IMAGE = false
export const CUSTOM_IMAGE_PATH = '/ayurmitra-icon.png' // file located in frontend/public/

interface AyurMitraIconProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const AyurMitraIcon: FC<AyurMitraIconProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  }

  const dimension = sizeMap[size] || sizeMap.md

  // 1. If user switched on custom image, render it directly
  if (USE_CUSTOM_IMAGE) {
    return (
      <img
        src={CUSTOM_IMAGE_PATH}
        alt="AyurMitra"
        className={`${dimension} rounded-2xl object-cover shadow-sm ${className}`}
      />
    )
  }

  // 2. Default Premium Botanical Ayurvedic Emblem (Sacred Lotus + Prana Leaf + Healing Golden Glow)
  return (
    <div className={`relative inline-flex items-center justify-center ${dimension} ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          <linearGradient id="ayurBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A4638" />
            <stop offset="50%" stopColor="#1E3329" />
            <stop offset="100%" stopColor="#13231B" />
          </linearGradient>

          <linearGradient id="leafGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8D678" />
            <stop offset="50%" stopColor="#E5B94C" />
            <stop offset="100%" stopColor="#C48E22" />
          </linearGradient>

          <linearGradient id="leafEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78C697" />
            <stop offset="100%" stopColor="#3B7D57" />
          </linearGradient>

          <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5EBD7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2A4638" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Halo Circle */}
        <circle cx="24" cy="24" r="23" fill="url(#ayurBg)" stroke="#E5B94C" strokeWidth="1.5" strokeOpacity="0.35" />
        
        {/* Soft Radial Ambient Aura */}
        <circle cx="24" cy="24" r="18" fill="url(#auraGlow)" />

        {/* Central Sacred Lotus Petal Base */}
        <path
          d="M24 38C24 38 12 31 12 21C12 15 16 11 20 12C22 12.5 24 15 24 15C24 15 26 12.5 28 12C32 11 36 15 36 21C36 31 24 38 24 38Z"
          fill="url(#leafEmerald)"
          fillOpacity="0.3"
        />

        {/* Left Botanical Leaf */}
        <path
          d="M24 29C20 27 15 22 15 16C18 15 23 18 24 24"
          stroke="url(#leafEmerald)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Botanical Leaf */}
        <path
          d="M24 29C28 27 33 22 33 16C30 15 25 18 24 24"
          stroke="url(#leafEmerald)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Golden Spine & Bud */}
        <path
          d="M24 34V14M24 14C22.8 11.5 24 8 24 8C24 8 25.2 11.5 24 14Z"
          stroke="url(#leafGold)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Prana Sparkle Stars */}
        <circle cx="24" cy="8" r="1.8" fill="#FFF2CC" />
        <circle cx="13.5" cy="15" r="1.2" fill="#E5B94C" fillOpacity="0.9" />
        <circle cx="34.5" cy="15" r="1.2" fill="#E5B94C" fillOpacity="0.9" />
      </svg>
    </div>
  )
}

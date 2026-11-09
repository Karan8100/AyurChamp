import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  ChevronDown,
  Droplets,
  FileText,
  Flame,
  Globe,
  Heart,
  History,
  LayoutDashboard,
  Leaf,
  Menu,
  Moon,
  Settings,
  Salad,
  Sparkles,
  Sun,
  Wind,
  X,
  type LucideIcon,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { cachedAuthFetch, getCached } from '../lib/api'
import { useLanguage } from '../contexts/LanguageContext'
import { AyurMitraDrawer, AyurMitraFloatingButton } from './chat'

type MeResponse = {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  role: string
  avatar_type?: string | null
  avatar_value?: string | null
}

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
}

export default function AppShell({ children }: { children?: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { lang, setLanguage, t } = useLanguage()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [profile, setProfile] = useState<MeResponse | null>(() => getCached<MeResponse>('/auth/me'))

  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    cachedAuthFetch<MeResponse>('/auth/me')
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [])


  const isGuest = useMemo(() => {
    return localStorage.getItem('ayushya_is_guest') === 'true' || profile?.role === 'guest'
  }, [profile])

  const displayName = useMemo(() => {
    if (isGuest) return 'Guest Evaluator'
    const firstName = profile?.name?.trim().split(' ')[0]
    if (firstName) return firstName
    if (profile?.email) return profile.email.split('@')[0]
    return null
  }, [profile, isGuest])

  const userName = displayName ?? t('common.member')
  const avatarInitial = isGuest ? 'G' : (displayName ? displayName.charAt(0).toUpperCase() : '?')

  const navItems = useMemo<NavItem[]>(
    () => [

      { label: t('nav.dashboard'), to: '/dashboard', icon: LayoutDashboard },
      { label: t('nav.prakrutiReport'), to: '/prakruti-report', icon: FileText },
      { label: t('nav.assessmentHistory'), to: '/assessment-history', icon: History },
      { label: t('nav.dietPlanner'), to: '/diet-planner', icon: Salad },
      { label: t('nav.ritucharya'), to: '/ritucharya', icon: CalendarDays },
      { label: t('nav.recommendations'), to: '/recommendations', icon: Sparkles },
      { label: t('nav.profile'), to: '/profile', icon: Settings },
    ],
    [t],
  )

  const headerTitle = useMemo(() => {
    if (location.pathname === '/dashboard') {
      return displayName
        ? `${t('common.welcomeMember')}, ${displayName} 🌿`
        : t('pageMeta./dashboard.title')
    }
    return t(`pageMeta.${location.pathname}.title`, 'Ayushya')
  }, [location.pathname, displayName, t])

  const headerSubtitle = useMemo(() => {
    return t(`pageMeta.${location.pathname}.subtitle`, '')
  }, [location.pathname, t])

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(new Date()),
    [lang],
  )

  const logout = () => {
    localStorage.removeItem('ayushya_token')
    localStorage.removeItem('ayusha_token')
    localStorage.removeItem('ayushya_is_guest')
    localStorage.removeItem('ayushya_assessment_status')
    localStorage.removeItem('ayusha_assessment_status')
    localStorage.removeItem('ayushya_assessment_result')
    localStorage.removeItem('ayusha_assessment_result')
    setIsUserMenuOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell-root min-h-screen bg-cream text-ink">
      {/* Desktop Sidebar (hidden on mobile, fixed on desktop) */}
      <aside className="app-sidebar no-print hidden md:flex flex-col justify-between fixed inset-y-0 left-0 w-[260px] bg-[#2A4638] px-5 py-6 text-white shadow-[0_20px_60px_rgba(20,35,29,0.15)] z-20 overflow-y-auto">
        <div>
          <div className="flex items-center gap-3 pl-1 pt-1">
            <img src="/ayushya new logo.png" alt="Ayushya" className="h-11 w-auto rounded-xl object-contain bg-[#FAF8F5] p-0.5 shadow-sm ring-1 ring-white/10" />
            <div>
              <p className="text-[11px] font-bold tracking-[0.28em] text-[#F5EBD7]">AYUSHYA</p>
              <p className="mt-1 text-[11px] font-medium text-white/65">{t('common.ayurvedaPersonalized')}</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1.5">
            {navItems.map(({ label, to, icon: Icon }) => (
              <motion.div key={to} whileHover={{ x: 2 }} whileTap={{ scale: 0.99 }}>
                <NavLink
                  to={to}
                  className={({ isActive }) => [
                    'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white/10 text-white shadow-inner ring-1 ring-white/10'
                      : 'text-white/75 hover:bg-white/5 hover:text-white',
                  ].join(' ')}
                >
                  {({ isActive }) => (
                    <>
                      <span className={[
                        'grid h-8 w-8 place-items-center rounded-xl transition-colors',
                        isActive ? 'bg-[#F7F3EB]/10 text-white' : 'bg-white/5 text-white/70 group-hover:bg-white/10',
                      ].join(' ')}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Off-Canvas Drawer Backdrop and Slide-out Sidebar */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="app-sidebar-mobile fixed inset-y-0 left-0 z-50 w-[280px] bg-[#2A4638] px-5 py-6 text-white shadow-2xl md:hidden flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pl-1 pt-1">
                  <div className="flex items-center gap-3">
                    <img src="/ayushya new logo.png" alt="Ayushya" className="h-10 w-auto rounded-xl object-contain bg-[#FAF8F5] p-0.5 shadow-sm ring-1 ring-white/10" />
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.28em] text-[#F5EBD7]">AYUSHYA</p>
                      <p className="mt-0.5 text-[10px] font-medium text-white/65">{t('common.ayurvedaPersonalized')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="mt-8 space-y-1.5">
                  {navItems.map(({ label, to, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={({ isActive }) => [
                        'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-white/10 text-white shadow-inner ring-1 ring-white/10'
                          : 'text-white/75 hover:bg-white/5 hover:text-white',
                      ].join(' ')}
                    >
                      {({ isActive }) => (
                        <>
                          <span className={[
                            'grid h-8 w-8 place-items-center rounded-xl transition-colors',
                            isActive ? 'bg-[#F7F3EB]/10 text-white' : 'bg-white/5 text-white/70 group-hover:bg-white/10',
                          ].join(' ')}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>{label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Mobile Drawer Footer with user info & logout */}
              <div className="border-t border-white/10 pt-4 mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate max-w-[170px]">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#E7F0E8] text-sm font-semibold text-[#2A4638]">
                      {avatarInitial}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">{userName}</p>
                      <p className="text-[10px] text-white/60 truncate">{isGuest ? 'Guest' : profile?.email || ''}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs text-rose-300 hover:text-rose-100 font-medium px-2 py-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                  >
                    {t('common.logout')}
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="app-content-container md:ml-[260px] ml-0 min-h-screen bg-cream flex flex-col">
        {isGuest && (
          <div className="no-print bg-gradient-to-r from-emerald-900 via-[#2A4638] to-[#1E3529] text-white px-4 py-2 sm:px-6 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-emerald-700/40 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-[#E2D5BE] font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-400/30">
                🌿 {t('common.guestModeBadge')}
              </span>
              <span className="text-emerald-100 hidden sm:inline">
                {t('common.guestModeDesc')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  logout()
                  navigate('/signup')
                }}
                className="text-[11px] font-semibold bg-[#E2D5BE] hover:bg-white text-[#1E3529] px-2.5 py-1 rounded-md transition shadow-2xs cursor-pointer"
              >
                {t('common.createFreeAccount')}
              </button>
              <button
                onClick={logout}
                className="text-[11px] text-emerald-200 hover:text-white underline transition cursor-pointer"
              >
                {t('common.exitGuestMode')}
              </button>
            </div>
          </div>
        )}

        <header className="app-top-header no-print sticky top-0 z-20 border-b border-[#E5DED1] bg-[#F6F1E7]/90 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5">
            {/* Left: Mobile hamburger menu toggle + Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#E4DED2] bg-[#F8F3EA] text-[#2A4638] md:hidden shadow-xs hover:bg-[#EFE9DE] transition cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="truncate">
                <h1 className="text-base sm:text-xl md:text-2xl font-semibold tracking-[-0.03em] text-[#1F2A24] truncate">
                  {headerTitle}
                </h1>
                <p className="hidden sm:block mt-0.5 text-xs md:text-sm text-[#67746B] truncate">
                  {headerSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Segmented Language Switcher */}
              <div
                className="flex items-center rounded-full border border-[#E4DED2] bg-[#F8F3EA] p-1 shadow-xs"
                role="group"
                aria-label="Language selection"
              >
                <span className="grid h-7 w-7 place-items-center pl-1 text-[#5B6D60]" aria-hidden="true">
                  <Globe className="h-3.5 w-3.5" />
                </span>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`relative rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                    lang === 'en' ? 'text-white' : 'text-[#67746B] hover:text-[#1F2A24]'
                  }`}
                  aria-pressed={lang === 'en'}
                >
                  {lang === 'en' && (
                    <motion.span
                      layoutId="activeLanguagePill"
                      className="absolute inset-0 rounded-full bg-[#2A4638] shadow-xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">EN</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`relative rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                    lang === 'hi' ? 'text-white' : 'text-[#67746B] hover:text-[#1F2A24]'
                  }`}
                  aria-pressed={lang === 'hi'}
                >
                  {lang === 'hi' && (
                    <motion.span
                      layoutId="activeLanguagePill"
                      className="absolute inset-0 rounded-full bg-[#2A4638] shadow-xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">हिन्दी</span>
                </button>
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  className="flex items-center gap-2 sm:gap-3 rounded-full border border-[#E4DED2] bg-[#F8F3EA] px-2 py-1.5 text-left shadow-sm cursor-pointer"
                >
                  <div className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-[#E7F0E8] text-sm font-semibold text-[#2A4638] overflow-hidden shadow-xs">
                    {profile?.avatar_type === 'photo' && profile?.avatar_value ? (
                      <img src={profile.avatar_value} alt={userName} className="h-full w-full object-cover" />
                    ) : profile?.avatar_type === 'icon' && profile?.avatar_value ? (
                      (() => {
                        const [iconName, color] = profile.avatar_value.split(':')
                        const IconComponent = {
                          leaf: Leaf,
                          wind: Wind,
                          flame: Flame,
                          droplet: Droplets,
                          sun: Sun,
                          moon: Moon,
                          sparkles: Sparkles,
                          heart: Heart,
                        }[iconName] || Leaf
                        return (
                          <div
                            className="flex h-full w-full items-center justify-center text-white"
                            style={{ backgroundColor: color || '#2A4638' }}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                        )
                      })()
                    ) : (
                      avatarInitial
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-[#1F2A24] max-w-[120px] truncate">{userName}</span>

                  <ChevronDown className="h-4 w-4 text-[#5B6D60]" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-[calc(100%+10px)] w-44 rounded-2xl border border-[#E4DED2] bg-white p-2 shadow-xl z-30"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          navigate('/profile')
                        }}
                        className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-ink transition hover:bg-[#F6F1E7] cursor-pointer"
                      >
                        {t('nav.profile')}
                      </button>
                      <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[#B95D5D] transition hover:bg-[#FDF2F2] cursor-pointer"
                      >
                        {t('common.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Calendar Date pill (visible on xl screens to save space) */}
              <div className="hidden xl:flex items-center gap-2 rounded-full border border-[#E4DED2] bg-[#F8F3EA] px-3 py-2 text-sm font-medium text-[#2A4638]">
                <CalendarDays className="h-4 w-4" />
                <span>{dateLabel}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="app-main-content flex-1 px-3.5 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">{children ?? <Outlet />}</main>

        {/* AyurMitra Conversational Co-Pilot & Floating Action Button */}
        <div className="no-print">
          <AyurMitraDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          <AyurMitraFloatingButton isOpen={isChatOpen} onClick={() => setIsChatOpen((prev) => !prev)} />
        </div>
      </div>
    </div>
  )
}

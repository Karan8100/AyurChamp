import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Camera,
  Download,
  Droplets,
  Flame,
  Heart,
  Leaf,
  LogOut,
  Moon,
  Shield,
  ShieldAlert,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Wind,
  X,
} from 'lucide-react'
import { authFetch, cachedAuthFetch, clearApiCache, getCached } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

type MeResponse = {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  role: string
  preferred_language?: string
  date_of_birth?: string | null
  gender?: string | null
  avatar_type?: string | null
  avatar_value?: string | null
  notifications_enabled?: boolean
}

// ── 8 Theme Icon Avatars ────────────────────────────────────
const AVATAR_ICONS = [
  { id: 'leaf:#2A4638', icon: Leaf, label: 'Ayurveda Leaf', bg: '#2A4638', text: '#E2D5BE' },
  { id: 'wind:#6B8FB5', icon: Wind, label: 'Vata Wind', bg: '#6B8FB5', text: '#FFFFFF' },
  { id: 'flame:#D89A4C', icon: Flame, label: 'Pitta Flame', bg: '#D89A4C', text: '#FFFFFF' },
  { id: 'droplet:#6B9E6B', icon: Droplets, label: 'Kapha Droplet', bg: '#6B9E6B', text: '#FFFFFF' },
  { id: 'sun:#E5A83B', icon: Sun, label: 'Surya Sun', bg: '#E5A83B', text: '#FFFFFF' },
  { id: 'moon:#5C6B9E', icon: Moon, label: 'Chandra Moon', bg: '#5C6B9E', text: '#FFFFFF' },
  { id: 'sparkles:#B87A40', icon: Sparkles, label: 'Tejas Sparkle', bg: '#B87A40', text: '#FFFFFF' },
  { id: 'heart:#9E5C6B', icon: Heart, label: 'Ojas Heart', bg: '#9E5C6B', text: '#FFFFFF' },
]

function computeAge(dob: string | null | undefined): string | null {
  if (!dob) return null
  const birth = new Date(dob)
  if (isNaN(birth.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return age > 0 ? `${age} yrs` : null
}

function formatDobDisplay(dob: string | null | undefined, lang: string): string | null {
  if (!dob) return null
  const birth = new Date(dob)
  if (isNaN(birth.getTime())) return dob
  return birth.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatGenderDisplay(gender: string | null | undefined, t: (k: string) => string): string {
  if (!gender) return ''
  switch (gender.toLowerCase()) {
    case 'male':
      return t('profile.male') || 'Male'
    case 'female':
      return t('profile.female') || 'Female'
    case 'other':
      return t('profile.other') || 'Other'
    case 'prefer_not_to_say':
      return t('profile.preferNotToSay') || 'Prefer not to say'
    default:
      return gender
  }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { lang, setLanguage, t } = useLanguage()

  const initialProfile = getCached<MeResponse>('/auth/me')
  const [profile, setProfile] = useState<MeResponse | null>(initialProfile)
  const [loading, setLoading] = useState(() => !initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isNudgeDismissed, setIsNudgeDismissed] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editDob, setEditDob] = useState('')
  const [editGender, setEditGender] = useState('')

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [avatarTab, setAvatarTab] = useState<'icons' | 'upload'>('icons')
  const [previewUpload, setPreviewUpload] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Data Export & Delete Modal State
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const isGuest = useMemo(() => {
    return localStorage.getItem('ayushya_is_guest') === 'true' || profile?.role === 'guest'
  }, [profile])

  useEffect(() => {
    cachedAuthFetch<MeResponse>('/auth/me')
      .then((res) => {
        setProfile(res)
        setEditName(res.name || '')
        setEditDob(res.date_of_birth || '')
        setEditGender(res.gender || '')
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [])

  const handleStartEdit = () => {
    setEditName(profile?.name || '')
    setEditDob(profile?.date_of_birth || '')
    setEditGender(profile?.gender || '')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditName(profile?.name || '')
    setEditDob(profile?.date_of_birth || '')
    setEditGender(profile?.gender || '')
    setIsEditing(false)
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const updated = await authFetch<MeResponse>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: editName.trim() || null,
          date_of_birth: editDob || null,
          gender: editGender || null,
        }),
      })
      setProfile(updated)
      clearApiCache('/auth/me')
      setIsEditing(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not save profile changes.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectIconAvatar = async (iconId: string) => {
    try {
      const updated = await authFetch<MeResponse>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          avatar_type: 'icon',
          avatar_value: iconId,
        }),
      })
      setProfile(updated)
      clearApiCache('/auth/me')
      setIsAvatarModalOpen(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update avatar.')
    }
  }

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUpload(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveUploadedPhoto = async () => {
    if (!previewUpload) return
    setIsUploadingPhoto(true)
    try {
      const uploadRes = await authFetch<{ url: string; provider: string; message?: string }>('/auth/avatar-upload', {
        method: 'POST',
        body: JSON.stringify({
          image_base64: previewUpload,
          filename: 'avatar.png',
        }),
      })

      const updated = await authFetch<MeResponse>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          avatar_type: 'photo',
          avatar_value: uploadRes.url,
        }),
      })

      setProfile(updated)
      clearApiCache('/auth/me')
      setIsAvatarModalOpen(false)
      setPreviewUpload(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upload photo.')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleToggleNotifications = async () => {
    const nextVal = !(profile?.notifications_enabled ?? true)
    try {
      const updated = await authFetch<MeResponse>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          notifications_enabled: nextVal,
        }),
      })
      setProfile(updated)
      clearApiCache('/auth/me')
    } catch {
      // Revert silently on failure
    }
  }

  const handleLanguageChange = async (newLang: 'en' | 'hi') => {
    setLanguage(newLang)
    try {
      const updated = await authFetch<MeResponse>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          preferred_language: newLang,
        }),
      })
      setProfile(updated)
      clearApiCache('/auth/me')
    } catch {
      // Local state is already set by setLanguage
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const exportJson = await authFetch<Record<string, unknown>>('/auth/export-data')
      const blob = new Blob([JSON.stringify(exportJson, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ayushya_health_data_${profile?.id || 'guest'}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not export user data.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await authFetch('/auth/account', { method: 'DELETE' })
      handleLogout()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete account.')
      setIsDeleting(false)
    }
  }

  const handleLogout = () => {
    clearApiCache()
    localStorage.removeItem('ayushya_token')
    localStorage.removeItem('ayusha_token')
    localStorage.removeItem('ayushya_is_guest')
    localStorage.removeItem('ayushya_assessment_status')
    localStorage.removeItem('ayusha_assessment_status')
    localStorage.removeItem('ayushya_assessment_result')
    localStorage.removeItem('ayusha_assessment_result')
    navigate('/login', { replace: true })
  }

  // Render current user avatar element
  const renderAvatarContent = () => {
    if (profile?.avatar_type === 'photo' && profile.avatar_value) {
      return (
        <img
          src={profile.avatar_value}
          alt={profile.name || 'Avatar'}
          className="h-full w-full object-cover rounded-full"
        />
      )
    }

    if (profile?.avatar_type === 'icon' && profile.avatar_value) {
      const matched = AVATAR_ICONS.find((a) => a.id === profile.avatar_value)
      if (matched) {
        const MatchedIcon = matched.icon
        return (
          <div
            className="flex h-full w-full items-center justify-center rounded-full"
            style={{ backgroundColor: matched.bg, color: matched.text }}
          >
            <MatchedIcon className="h-8 w-8" />
          </div>
        )
      }
    }

    // Default Fallback
    return (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#2A4638] text-[#C9A876]">
        <Leaf className="h-8 w-8" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#67746B]">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A4638]/30 border-t-[#2A4638]" />
          <p className="text-sm font-medium">{t('common.loading') || 'Loading profile…'}</p>
        </div>
      </div>
    )
  }

  const isDobOrGenderMissing = !profile?.date_of_birth || !profile?.gender
  const calculatedAge = computeAge(profile?.date_of_birth)

  return (
    <div className="mx-auto max-w-2xl py-6 space-y-3.5">
      {/* ── Optional Demographic Nudge Banner (Dismissible) ───── */}
      {isDobOrGenderMissing && !isNudgeDismissed && !isGuest && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-center justify-between gap-3 rounded-2xl border border-[#D89A4C]/30 bg-[#FDF6EC] px-4 py-3 text-xs shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#D89A4C]/15 text-[#B2762A] flex-none">
              ✨
            </span>
            <p className="text-[#6D4C1D] leading-snug">
              <span className="font-semibold text-[#1F2A24]">
                {t('profile.nudgeTitle') || 'Add your age & gender'}
              </span>
              {' — '}
              {t('profile.nudgeDesc') || 'for personalized breathwork cautions & Dinacharya chronobiology.'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-none">
            <button
              type="button"
              onClick={handleStartEdit}
              className="font-bold text-[#B2762A] underline hover:text-[#8C5A1D] cursor-pointer"
            >
              {t('common.edit') || 'Edit'}
            </button>
            <button
              type="button"
              onClick={() => setIsNudgeDismissed(true)}
              aria-label="Dismiss nudge"
              className="text-[#6D4C1D]/60 hover:text-[#1F2A24] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Card 1: Profile Header ────────────────────────────── */}
      <section className="rounded-2xl bg-white p-5 shadow-[0_10px_35px_rgba(42,70,56,0.04)]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Clickable Avatar Circle with Camera Badge */}
            <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
              <div className="h-20 w-20 rounded-full shadow-md overflow-hidden ring-3 ring-[#FAF8F5] transition group-hover:ring-[#2A4638]/40">
                {renderAvatarContent()}
              </div>
              <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-white text-[#2A4638] shadow-md ring-1 ring-black/5 group-hover:bg-[#2A4638] group-hover:text-white transition">
                <Camera className="h-3.5 w-3.5" />
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1F2A24]">
                {isGuest ? 'Guest Evaluator' : (profile?.name || 'Ayushya Member')}
              </h1>
              <p className="text-xs text-[#67746B] mt-0.5 font-mono">
                {isGuest ? 'guest@ayushya.org • Ephemeral Session' : profile?.email}
              </p>
              {isGuest && (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                  <Shield className="h-3 w-3 text-amber-600" />
                  Guest Mode
                </span>
              )}
            </div>
          </div>

          {!isGuest && (
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="rounded-xl border border-[#D1C7B7] bg-white px-4 py-2 text-xs font-semibold text-[#1F2A24] shadow-xs transition hover:border-[#2A4638] hover:bg-[#FAF8F5] cursor-pointer"
                >
                  {t('profile.editProfile') || 'Edit Profile'}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-[#67746B] hover:bg-stone-100 transition cursor-pointer"
                  >
                    {t('common.cancel') || 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="rounded-xl bg-[#2A4638] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1E3529] transition cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (t('common.saving') || 'Saving…') : (t('common.save') || 'Save')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Card 2: Personal Information ───────────────────────── */}
      <section className="rounded-2xl bg-white p-5 shadow-[0_10px_35px_rgba(42,70,56,0.04)]">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A7A6E]">
          {t('profile.personalInfo') || 'Personal Information'}
        </h2>

        {!isEditing ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="rounded-xl bg-[#FAF8F5] p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#67746B]">
                {t('profile.fullName') || 'Full Name'}
              </span>
              <p className="mt-1 text-sm font-semibold text-[#1F2A24]">
                {profile?.name || <span className="text-stone-400 italic">Not set</span>}
              </p>
            </div>

            {/* Email (Read-only) */}
            <div className="rounded-xl bg-[#FAF8F5] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#67746B]">
                  {t('profile.email') || 'Email Address'}
                </span>
                <span className="text-[10px] text-stone-400">Read-only</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#1F2A24] font-mono truncate">
                {profile?.email || 'guest@ayushya.org'}
              </p>
            </div>

            {/* Date of Birth / Age */}
            <div className="rounded-xl bg-[#FAF8F5] p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#67746B]">
                {t('profile.dateOfBirth') || 'Date of Birth'}
              </span>
              <div className="mt-1">
                {profile?.date_of_birth ? (
                  <p className="text-sm font-semibold text-[#1F2A24]">
                    {formatDobDisplay(profile.date_of_birth, lang)}{' '}
                    {calculatedAge && <span className="text-xs text-[#67746B] font-normal">({calculatedAge})</span>}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="text-xs font-semibold text-[#B8926A] hover:underline cursor-pointer"
                  >
                    + Add for better insights
                  </button>
                )}
              </div>
            </div>

            {/* Gender */}
            <div className="rounded-xl bg-[#FAF8F5] p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#67746B]">
                {t('profile.gender') || 'Gender'}
              </span>
              <div className="mt-1">
                {profile?.gender ? (
                  <p className="text-sm font-semibold text-[#1F2A24] capitalize">
                    {formatGenderDisplay(profile.gender, t)}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="text-xs font-semibold text-[#B8926A] hover:underline cursor-pointer"
                  >
                    + Add for better insights
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Editable Form Mode */
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F2A24] mb-1">
                {t('profile.fullName') || 'Full Name'}
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-[#2A4638] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F2A24] mb-1">
                  {t('profile.dateOfBirth') || 'Date of Birth'}
                </label>
                <input
                  type="date"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-[#2A4638] focus:outline-none"
                />
                <span className="text-[11px] text-[#67746B] mt-1 block">
                  Used to adapt age-appropriate Ayurvedic regimens.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2A24] mb-1">
                  {t('profile.gender') || 'Gender'}
                </label>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-[#2A4638] focus:outline-none bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                <span className="text-[11px] text-[#67746B] mt-1 block">
                  Context for breathwork pacing & physiological safety.
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Card 3: Preferences ───────────────────────────────── */}
      <section className="rounded-2xl bg-white p-5 shadow-[0_10px_35px_rgba(42,70,56,0.04)]">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A7A6E]">
          {t('profile.preferences') || 'Preferences'}
        </h2>

        <div className="mt-4 space-y-4">
          {/* Language Switcher */}
          <div className="flex items-center justify-between gap-4 py-1">
            <div>
              <p className="text-sm font-semibold text-[#1F2A24]">
                {t('profile.language') || 'Interface Language'}
              </p>
              <p className="text-xs text-[#67746B] mt-0.5">
                Switch between English and Hindi for all diagnostic assessments and diet plans.
              </p>
            </div>

            {/* Pill-shaped buttons side by side */}
            <div className="flex items-center rounded-full p-1 bg-[#F4EFE6] border border-[#E5DED1]">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#2A4638] text-[#F5EBD7] shadow-xs'
                    : 'text-[#1F2A24] hover:text-[#2A4638]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('hi')}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                  lang === 'hi'
                    ? 'bg-[#2A4638] text-[#F5EBD7] shadow-xs'
                    : 'text-[#1F2A24] hover:text-[#2A4638]'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          <hr className="border-stone-100" />

          {/* Weekly Vikriti Check-in Notification Reminder */}
          <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700 flex-none mt-0.5">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1F2A24]">
                  {t('profile.weeklyReminder') || 'Weekly Vikriti Check-in Reminder'}
                </p>
                <p className="text-xs text-[#67746B] mt-0.5">
                  Receive a gentle prompt every 7 days to reassess transient dosha fluctuations and update your weekly diet overlay.
                </p>
              </div>
            </div>

            {/* Switch toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={profile?.notifications_enabled ?? true}
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-6 w-11 flex-none cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                (profile?.notifications_enabled ?? true) ? 'bg-[#2A4638]' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                  (profile?.notifications_enabled ?? true) ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* ── Card 4: Account ───────────────────────────────────── */}
      <section className="rounded-2xl bg-white p-5 shadow-[0_10px_35px_rgba(42,70,56,0.04)]">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A7A6E]">
          {t('profile.account') || 'Account'}
        </h2>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#67746B]">
                {t('profile.accountRole') || 'Account Role'}:
              </span>
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-[#1F2A24] capitalize">
                {profile?.role || 'user'}
              </span>
            </div>
            <p className="text-xs text-[#67746B] mt-1">
              Active session secured with bearer token authentication.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E0C4BE] px-4 py-2 text-xs font-semibold text-[#A34A3D] transition hover:bg-[#FDF6F5] cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{t('profile.logout') || 'Log Out'}</span>
          </button>
        </div>
      </section>

      {/* ── Card 5: Privacy & Data (DPDP Act Compliance) ──────── */}
      <section className="rounded-2xl bg-white p-5 shadow-[0_10px_35px_rgba(42,70,56,0.04)] border border-[#EAD9D5]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[#A34A3D]" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A34A3D]">
            {t('profile.privacyAndData') || 'Privacy & Data (DPDP Act 2023)'}
          </h2>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-[#67746B]">
          Under the Digital Personal Data Protection (DPDP) Act, you possess statutory rights over your Ayurvedic health records, clinical dossiers, and personal identity.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Download My Data */}
          <button
            type="button"
            onClick={handleExportData}
            disabled={isExporting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#1F2A24] shadow-xs transition hover:bg-stone-50 cursor-pointer disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-[#2A4638]" />
            <span>
              {isExporting ? 'Preparing Export…' : (t('profile.downloadData') || 'Download My Data (JSON)')}
            </span>
          </button>

          {/* Delete Account */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E0C4BE] bg-white px-4 py-2.5 text-xs font-semibold text-[#A34A3D] shadow-xs transition hover:bg-[#FDF6F5] cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{t('profile.deleteAccount') || 'Delete My Account'}</span>
          </button>
        </div>
      </section>

      {/* ── Avatar Picker Modal ───────────────────────────────── */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-[#E5DED1] bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <h3 className="text-base font-serif font-bold text-[#1F2A24]">
                  {t('profile.chooseAvatarTitle') || 'Choose Avatar or Photo'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="rounded-full p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex rounded-xl bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => setAvatarTab('icons')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                    avatarTab === 'icons'
                      ? 'bg-white text-[#1F2A24] shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Theme Icons (8)
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarTab('upload')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                    avatarTab === 'upload'
                      ? 'bg-white text-[#1F2A24] shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Upload Photo
                </button>
              </div>

              {/* Tab 1: 8 Icons Grid */}
              {avatarTab === 'icons' && (
                <div className="mt-5">
                  <p className="text-xs text-[#67746B] mb-3">
                    Select an Ayurvedic elemental icon to represent your doshic constitution:
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {AVATAR_ICONS.map((item) => {
                      const IconComponent = item.icon
                      const isSelected = profile?.avatar_type === 'icon' && profile?.avatar_value === item.id

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectIconAvatar(item.id)}
                          className={`group flex flex-col items-center gap-1.5 rounded-2xl p-2.5 transition cursor-pointer ${
                            isSelected ? 'bg-stone-100 ring-2 ring-[#2A4638]' : 'hover:bg-stone-50'
                          }`}
                        >
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition group-hover:scale-105"
                            style={{ backgroundColor: item.bg, color: item.text }}
                          >
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <span className="text-[10px] font-semibold text-stone-700 truncate max-w-full">
                            {item.label.split(' ')[0]}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Upload Photo */}
              {avatarTab === 'upload' && (
                <div className="mt-5 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handlePhotoFileChange}
                  />

                  {previewUpload ? (
                    <div className="flex flex-col items-center">
                      <div className="h-28 w-28 rounded-full overflow-hidden shadow-md ring-4 ring-[#2A4638]/20 mb-3">
                        <img src={previewUpload} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-[#2A4638] font-semibold underline cursor-pointer"
                        >
                          Choose different
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveUploadedPhoto}
                        disabled={isUploadingPhoto}
                        className="mt-4 w-full rounded-xl bg-[#2A4638] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1E3529] transition cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingPhoto ? 'Uploading…' : 'Set as Profile Picture'}
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 p-8 hover:border-[#2A4638] hover:bg-[#FAF8F5] transition cursor-pointer"
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-[#2A4638] mb-2">
                        <Upload className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-[#1F2A24]">
                        Click to upload photo
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1">
                        PNG, JPG, or WEBP (Square cropped recommended)
                      </p>
                    </div>
                  )}

                  <p className="text-[10px] text-stone-400 mt-3">
                    Images are securely stored via Cloudinary CDN.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Two-Step Account Deletion Confirmation Modal ───────── */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-[#E0C4BE] bg-white p-6 shadow-2xl"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-[#A34A3D] mb-3">
                <Trash2 className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-serif font-bold text-[#1F2A24]">
                Confirm Account Deletion
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-[#67746B]">
                This action is permanent and adheres to Section 12 of the DPDP Act. Your account will be deactivated and you will be immediately logged out.
              </p>

              <div className="mt-4 rounded-xl bg-stone-50 p-3 text-xs text-stone-700">
                Type <span className="font-bold text-[#A34A3D]">DELETE</span> below to confirm:
              </div>

              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type DELETE"
                className="mt-2 w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs uppercase tracking-wider font-mono focus:border-[#A34A3D] focus:outline-none"
              />

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setDeleteConfirmationText('')
                  }}
                  className="flex-1 rounded-xl border border-stone-200 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmationText.trim() !== 'DELETE' || isDeleting}
                  className="flex-1 rounded-xl bg-[#A34A3D] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#8B3B30] transition cursor-pointer disabled:opacity-40"
                >
                  {isDeleting ? 'Deleting…' : 'Permanently Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

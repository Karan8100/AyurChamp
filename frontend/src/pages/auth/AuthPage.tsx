import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

type AuthMode = 'login' | 'signup'
type LoginMethod = 'email' | 'email-otp' | 'phone'
type ApiError = { detail?: string; message?: string }

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const OTP_COOLDOWN_SECONDS = 60

// Validation schemas
const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your full name.'),
    email: z.string().trim().email('Enter a valid email address.'),
    phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    language: z.enum(['en', 'hi']),
    consent: z.literal(true, {
      error: 'Please accept the privacy policy & health consent to proceed.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

const loginEmailSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
})

const loginPhoneSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number.'),
})

const loginEmailOtpSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
})

type SignupValues = z.infer<typeof signupSchema>
type LoginEmailValues = z.infer<typeof loginEmailSchema>
type LoginPhoneValues = z.infer<typeof loginPhoneSchema>
type LoginEmailOtpValues = z.infer<typeof loginEmailOtpSchema>

function Spinner() {
  return (
    <span
      className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/35 border-t-white"
      aria-label="Loading"
    />
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600"
      role="alert"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </motion.p>
  )
}

interface OtpInputProps {
  otp: string[]
  setOtp: React.Dispatch<React.SetStateAction<string[]>>
  disabled?: boolean
}

function OtpBoxes({ otp, setOtp, disabled }: OtpInputProps) {
  const focusBox = (index: number) => {
    document.getElementById(`otp-${index}`)?.focus()
  }

  const handleChange = (index: number, raw: string) => {
    const digitsOnly = raw.replace(/\D/g, '')
    if (!digitsOnly) {
      const next = [...otp]
      next[index] = ''
      setOtp(next)
      return
    }

    if (digitsOnly.length > 1) {
      const chars = digitsOnly.slice(0, 6).split('')
      const next = [...otp]
      chars.forEach((char, i) => {
        if (index + i < 6) next[index + i] = char
      })
      setOtp(next)
      const nextFocus = Math.min(index + chars.length, 5)
      focusBox(nextFocus)
      return
    }

    const next = [...otp]
    next[index] = digitsOnly.slice(-1)
    setOtp(next)
    if (index < 5) {
      focusBox(index + 1)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      focusBox(index - 1)
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusBox(index - 1)
    } else if (e.key === 'ArrowRight' && index < 5) {
      focusBox(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData) {
      const chars = pastedData.split('')
      const next = ['', '', '', '', '', '']
      chars.forEach((c, idx) => {
        next[idx] = c
      })
      setOtp(next)
      const targetIdx = Math.min(chars.length, 5)
      focusBox(targetIdx)
    }
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          id={`otp-${index}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete="one-time-code"
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1}`}
          className={`h-12 sm:h-13 w-full rounded-xl border text-center text-xl font-bold tracking-tight outline-none transition-all duration-200 ${
            digit
              ? 'border-brand bg-white text-brand shadow-sm ring-2 ring-brand/10'
              : 'border-brand/20 bg-surface-soft text-ink hover:border-brand/40 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10'
          }`}
        />
      ))}
    </div>
  )
}

function CountdownProgressBar({
  countdown,
  totalSeconds,
  onResend,
  isResending,
}: {
  countdown: number
  totalSeconds: number
  onResend: () => void
  isResending: boolean
}) {
  const percentage = Math.max(0, Math.min(100, (countdown / totalSeconds) * 100))
  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="rounded-2xl border border-brand/10 bg-surface-soft/80 p-4">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-ink-muted">Verification code expiration</span>
        {countdown > 0 ? (
          <span className="font-mono font-bold text-brand">{formattedTime}</span>
        ) : (
          <span className="font-semibold text-rose-600">Code expired</span>
        )}
      </div>

      {/* 1-Minute Animated Countdown Progress Bar */}
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-brand/10">
        <motion.div
          className={`h-full rounded-full ${
            countdown > 15 ? 'bg-brand' : 'bg-amber-500'
          }`}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'linear' }}
        />
      </div>

      <div className="mt-3.5 flex items-center justify-between pt-1 text-xs">
        <span className="text-ink-muted">Didn't receive the code?</span>
        {countdown > 0 ? (
          <span className="text-ink-muted/80">
            Resend in <strong className="font-semibold text-brand">{formattedTime}</strong>
          </span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={isResending}
            className="inline-flex items-center gap-1.5 font-semibold text-brand hover:text-brand-deep hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>Resend OTP</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default function AuthPage({ initialMode = 'login' }: { initialMode?: AuthMode }) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGuestLoading, setIsGuestLoading] = useState(false)

  const [shake, setShake] = useState(false)

  // Signup flow states
  const [signupStep, setSignupStep] = useState<'form' | 'verify'>('form')
  const [signupOtp, setSignupOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [signupCountdown, setSignupCountdown] = useState(OTP_COOLDOWN_SECONDS)

  // Phone Login flow states
  const [phoneLoginStep, setPhoneLoginStep] = useState<'input' | 'verify'>('input')
  const [phoneOtp, setPhoneOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [phoneCountdown, setPhoneCountdown] = useState(OTP_COOLDOWN_SECONDS)

  // Email OTP Login flow states
  const [emailOtpLoginStep, setEmailOtpLoginStep] = useState<'input' | 'verify'>('input')
  const [emailOtp, setEmailOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [emailOtpCountdown, setEmailOtpCountdown] = useState(OTP_COOLDOWN_SECONDS)

  // Form Hooks
  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      language: 'en',
      consent: true,
    },
  })

  const loginEmailForm = useForm<LoginEmailValues>({
    resolver: zodResolver(loginEmailSchema),
    defaultValues: { email: '', password: '' },
  })

  const loginPhoneForm = useForm<LoginPhoneValues>({
    resolver: zodResolver(loginPhoneSchema),
    defaultValues: { phone: '' },
  })

  const loginEmailOtpForm = useForm<LoginEmailOtpValues>({
    resolver: zodResolver(loginEmailOtpSchema),
    defaultValues: { email: '' },
  })

  // 1-minute Countdown Timer for Signup OTP
  useEffect(() => {
    if (signupStep !== 'verify' || signupCountdown <= 0) return
    const timer = window.setInterval(() => {
      setSignupCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [signupStep, signupCountdown])

  // Autofocus first OTP box on signup verify
  useEffect(() => {
    if (signupStep === 'verify') {
      const timer = window.setTimeout(() => {
        document.getElementById('otp-0')?.focus()
      }, 150)
      return () => window.clearTimeout(timer)
    }
  }, [signupStep])

  // 1-minute Countdown Timer for Phone Login OTP
  useEffect(() => {
    if (phoneLoginStep !== 'verify' || phoneCountdown <= 0) return
    const timer = window.setInterval(() => {
      setPhoneCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [phoneLoginStep, phoneCountdown])

  // Autofocus first OTP box on phone login verify
  useEffect(() => {
    if (phoneLoginStep === 'verify') {
      const timer = window.setTimeout(() => {
        document.getElementById('otp-0')?.focus()
      }, 150)
      return () => window.clearTimeout(timer)
    }
  }, [phoneLoginStep])

  // 1-minute Countdown Timer for Email OTP Login
  useEffect(() => {
    if (emailOtpLoginStep !== 'verify' || emailOtpCountdown <= 0) return
    const timer = window.setInterval(() => {
      setEmailOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [emailOtpLoginStep, emailOtpCountdown])

  // Autofocus first OTP box on email OTP login verify
  useEffect(() => {
    if (emailOtpLoginStep === 'verify') {
      const timer = window.setTimeout(() => {
        document.getElementById('otp-0')?.focus()
      }, 150)
      return () => window.clearTimeout(timer)
    }
  }, [emailOtpLoginStep])

  const triggerShake = () => {
    setShake(true)
    window.setTimeout(() => setShake(false), 460)
  }

  const getErrorMessage = async (response: Response) => {
    try {
      const data = (await response.json()) as ApiError
      return data.detail ?? data.message ?? 'Something went wrong. Please try again.'
    } catch {
      return 'Something went wrong. Please try again.'
    }
  }

  const completeAuth = (token: string, isGuest = false) => {
    localStorage.setItem('ayushya_token', token)
    localStorage.removeItem('ayusha_token')
    if (isGuest) {
      localStorage.setItem('ayushya_is_guest', 'true')
    } else {
      localStorage.removeItem('ayushya_is_guest')
    }
    window.setTimeout(() => navigate('/dashboard'), 300)
  }

  const handleGuestAccess = async () => {
    setApiError('')
    setIsGuestLoading(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }
      const data = (await response.json()) as { access_token: string }
      completeAuth(data.access_token, true)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Guest access unavailable')
    } finally {
      setIsGuestLoading(false)
    }
  }


  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setApiError('')
    setSignupStep('form')
    setPhoneLoginStep('input')
    setEmailOtpLoginStep('input')
    setSignupOtp(['', '', '', '', '', ''])
    setPhoneOtp(['', '', '', '', '', ''])
    setEmailOtp(['', '', '', '', '', ''])
  }

  // Handle Signup Submit -> Transition to Email Verification
  const onSignupSubmit = async (values: SignupValues) => {
    setApiError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${apiBaseUrl}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          name: values.name,
          phone: `+91${values.phone}`,
          purpose: 'signup',
        }),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      setSignupStep('verify')
      setSignupCountdown(OTP_COOLDOWN_SECONDS)
      setSignupOtp(['', '', '', '', '', ''])
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unable to send verification code.')
      triggerShake()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Resend Signup OTP
  const handleResendSignupOtp = async () => {
    const values = signupForm.getValues()
    setApiError('')
    setIsSubmitting(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          name: values.name,
          phone: `+91${values.phone}`,
          purpose: 'signup',
        }),
      })
      if (!response.ok) throw new Error(await getErrorMessage(response))
      setSignupCountdown(OTP_COOLDOWN_SECONDS)
      setSignupOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to resend code.')
      triggerShake()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Verify Signup OTP and Complete Registration
  const verifySignupOtp = async () => {
    const otpCode = signupOtp.join('')
    if (otpCode.length !== 6) {
      setApiError('Please enter the full 6-digit verification code.')
      triggerShake()
      return
    }

    setApiError('')
    setIsSubmitting(true)
    const values = signupForm.getValues()

    try {
      // 1. Verify OTP code
      const verifyRes = await fetch(`${apiBaseUrl}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          phone: `+91${values.phone}`,
          code: otpCode,
          consent_given: values.consent,
        }),
      })

      if (!verifyRes.ok) {
        throw new Error(await getErrorMessage(verifyRes))
      }

      // 2. Create the user account with details & password
      const signupRes = await fetch(`${apiBaseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: `+91${values.phone}`,
          password: values.password,
          preferred_language: values.language,
          consent_given: values.consent,
        }),
      })

      if (!signupRes.ok) {
        const verifyData = (await verifyRes.json()) as { access_token?: string }
        if (verifyData.access_token) {
          completeAuth(verifyData.access_token)
          return
        }
        throw new Error(await getErrorMessage(signupRes))
      }

      const data = (await signupRes.json()) as { access_token: string }
      completeAuth(data.access_token)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Verification failed. Please try again.')
      triggerShake()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Direct Email Login Submit
  const onLoginEmailSubmit = async (values: LoginEmailValues) => {
    setApiError('')
    setIsSubmitting(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const data = (await response.json()) as { access_token: string }
      completeAuth(data.access_token)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Incorrect email or password.')
      triggerShake()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Request Phone Login OTP
  const onLoginPhoneSubmit = async (values: LoginPhoneValues) => {
    setApiError('')
    setIsSubmitting(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+91${values.phone}`,
          purpose: 'login',
        }),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      setPhoneLoginStep('verify')
      setPhoneCountdown(OTP_COOLDOWN_SECONDS)
      setPhoneOtp(['', '', '', '', '', ''])
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unable to send OTP.')
      triggerShake()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Resend Phone Login OTP
  const handleResendPhoneOtp = async () => {
    const values = loginPhoneForm.getValues()
    setApiError('')
    setIsSubmitting(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+91${values.phone}`,
          purpose: 'login',
        }),
      })
      if (!response.ok) throw new Error(await getErrorMessage(response))
      setPhoneCountdown(OTP_COOLDOWN_SECONDS)
      setPhoneOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to resend code.')
      triggerShake()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Request Email OTP Login
  const onLoginEmailOtpSubmit = async (values: LoginEmailOtpValues) => {
    setApiError('')
    setIsSubmitting(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          purpose: 'login',
        }),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      setEmailOtpLoginStep('verify')
      setEmailOtpCountdown(OTP_COOLDOWN_SECONDS)
      setEmailOtp(['', '', '', '', '', ''])
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unable to send OTP.')
      triggerShake()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Resend Email OTP Login
  const handleResendEmailOtp = async () => {
    const values = loginEmailOtpForm.getValues()
    setApiError('')
    setIsSubmitting(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          purpose: 'login',
        }),
      })
      if (!response.ok) throw new Error(await getErrorMessage(response))
      setEmailOtpCountdown(OTP_COOLDOWN_SECONDS)
      setEmailOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to resend code.')
      triggerShake()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Verify Email OTP Login
  const verifyEmailOtpLogin = async () => {
    const otpCode = emailOtp.join('')
    if (otpCode.length !== 6) {
      setApiError('Please enter the complete 6-digit OTP.')
      triggerShake()
      return
    }

    setApiError('')
    setIsSubmitting(true)
    const values = loginEmailOtpForm.getValues()

    try {
      const response = await fetch(`${apiBaseUrl}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          code: otpCode,
          consent_given: false,
        }),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const data = (await response.json()) as { access_token: string }
      completeAuth(data.access_token)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Invalid verification code.')
      triggerShake()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Verify Phone Login OTP
  const verifyPhoneLoginOtp = async () => {
    const otpCode = phoneOtp.join('')
    if (otpCode.length !== 6) {
      setApiError('Please enter the complete 6-digit OTP.')
      triggerShake()
      return
    }

    setApiError('')
    setIsSubmitting(true)
    const values = loginPhoneForm.getValues()

    try {
      const response = await fetch(`${apiBaseUrl}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+91${values.phone}`,
          code: otpCode,
          consent_given: false,
        }),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const data = (await response.json()) as { access_token: string }
      completeAuth(data.access_token)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Invalid verification code.')
      triggerShake()
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'block w-full rounded-xl border border-brand/20 bg-surface-soft px-4 py-3.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-muted/60 hover:border-brand/40 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10'

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF8F5] text-ink selection:bg-brand selection:text-white">
      {/* ========================================================================= */}
      {/* MOBILE TOP BANNER (Visible only on < lg screens) */}
      {/* ========================================================================= */}
      <header className="flex lg:hidden items-center justify-between border-b border-brand/10 bg-white px-5 py-3 shadow-xs">
        <img
          src="/ayushya new logo.png"
          alt="Ayushya"
          className="h-10 w-auto object-contain rounded-lg"
        />
        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand">
          <ShieldCheck className="h-4 w-4 text-kapha" />
          <span>AYUSH Compliant</span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* LEFT PANEL: BRAND & VISUALS (50% on Desktop, Sticky & Clean Light Theme) */}
      {/* ========================================================================= */}
      <section
        className="hidden lg:flex lg:w-1/2 h-screen sticky top-0 flex-col justify-between p-12 xl:p-16 bg-cream/70 border-r border-brand/10 overflow-hidden relative"
        aria-label="Ayushya Brand Story"
      >
        {/* Soft Ayurvedic Ambient Glowing Accents */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-vata/10 blur-[90px]" />
        <div className="pointer-events-none absolute top-1/2 -right-20 h-80 w-80 rounded-full bg-kapha/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-pitta/10 blur-[80px]" />

        {/* Top: Large Logo with built-in name */}
        <div className="relative z-10 pt-2">
          <img
            src="/ayushya new logo.png"
            alt="Ayushya"
            className="h-20 xl:h-24 w-auto object-contain -ml-2 rounded-2xl"
          />
        </div>


        {/* Center: Hero Headline & Classical Subtext */}
        <div className="relative z-10 my-auto py-6 max-w-lg">
          <h1 className="text-3xl xl:text-4xl 2xl:text-[42px] font-serif font-bold leading-tight tracking-tight text-ink">
            <span className="text-brand font-extrabold">Discover</span> your true Prakruti & master your daily wellness.
          </h1>

          <p className="mt-5 text-sm xl:text-base leading-relaxed text-ink-muted">
            Grounded in classical Ayurvedic texts (Charaka Samhita) & modern clinical scoring.
            Personalized diet, lifestyle & habit guidance powered by AI.
          </p>

          {/* Clean Tri-Dosha accent chips */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-vata/30 bg-vata/10 p-3.5 text-center transition hover:border-vata/50">
              <span className="block text-sm font-bold text-[#4B6F95]">Vata</span>
              <span className="text-[11px] font-medium text-ink-muted">Air & Ether</span>
            </div>
            <div className="rounded-2xl border border-pitta/30 bg-pitta/10 p-3.5 text-center transition hover:border-pitta/50">
              <span className="block text-sm font-bold text-[#B2762A]">Pitta</span>
              <span className="text-[11px] font-medium text-ink-muted">Fire & Water</span>
            </div>
            <div className="rounded-2xl border border-kapha/30 bg-kapha/10 p-3.5 text-center transition hover:border-kapha/50">
              <span className="block text-sm font-bold text-[#4E7F4E]">Kapha</span>
              <span className="text-[11px] font-medium text-ink-muted">Earth & Water</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 pb-2 flex items-center gap-2 text-xs font-medium text-ink-muted">
          <ShieldCheck className="h-4.5 w-4.5 text-brand shrink-0" />
          <span>AYUSH Compliant • Personalized Ayurvedic Health Profile</span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: AUTH FORMS (50% on Desktop, Scrollable independent container) */}
      {/* ========================================================================= */}
      <section
        className="w-full lg:w-1/2 min-h-screen lg:h-screen lg:overflow-y-auto flex flex-col p-6 sm:p-10 md:p-12 lg:px-14 lg:py-16 xl:px-20 bg-white"
        aria-label="User Authentication Form"
      >
        <div className="w-full max-w-md mx-auto my-auto pt-6 sm:pt-10 lg:pt-12 pb-12 sm:pb-16">
          {/* Top Header Mode Toggle (Login vs Sign Up) */}
          <header className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-ink">
                {mode === 'login' ? 'Welcome Back' : 'Begin Your Journey'}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
                {mode === 'login'
                  ? 'Access your personalized Ayurvedic health dashboard'
                  : 'Create your profile to unlock your comprehensive Prakruti diagnosis'}
              </p>
            </div>

            {/* Mode Switcher Pills */}
            <div
              className="grid grid-cols-2 rounded-2xl bg-surface-soft p-1.5 border border-brand/10 shadow-inner"
              role="tablist"
              aria-label="Authentication Mode Selection"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => switchMode('login')}
                className={`relative rounded-xl py-3 text-sm font-semibold transition-colors duration-200 ${
                  mode === 'login' ? 'text-brand' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {mode === 'login' && (
                  <motion.span
                    layoutId="auth-mode-pill"
                    className="absolute inset-0 rounded-xl bg-white shadow-sm border border-brand/10"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={() => switchMode('signup')}
                className={`relative rounded-xl py-3 text-sm font-semibold transition-colors duration-200 ${
                  mode === 'signup' ? 'text-brand' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {mode === 'signup' && (
                  <motion.span
                    layoutId="auth-mode-pill"
                    className="absolute inset-0 rounded-xl bg-white shadow-sm border border-brand/10"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">Create Account</span>
              </button>
            </div>
          </header>

          {/* Form Container with Shake Animation on Error */}
          <motion.div
            animate={shake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.45 }}
          >
            {/* Global API Error Alert Banner */}
            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800 shadow-sm"
                  role="alert"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                  <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                    {apiError}
                  </div>
                  <button
                    type="button"
                    onClick={() => setApiError('')}
                    className="text-rose-500 hover:text-rose-700 -mr-1 p-0.5 rounded-lg hover:bg-rose-100"
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ================================================================= */}
            {/* 1. SIGNUP FLOW (Unified Form -> Inline OTP Verification) */}
            {/* ================================================================= */}
            {mode === 'signup' && (
              <AnimatePresence mode="wait">
                {signupStep === 'form' ? (
                  <motion.form
                    key="signup-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={signupForm.handleSubmit(onSignupSubmit, triggerShake)}
                    noValidate
                    className="space-y-4.5"
                  >
                    {/* Full Name */}
                    <div>
                      <label htmlFor="signup-name" className="text-xs font-semibold text-ink uppercase tracking-wider">
                        Full Name
                      </label>
                      <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink-muted">
                          <UserIcon className="h-4.5 w-4.5" />
                        </div>
                        <input
                          id="signup-name"
                          type="text"
                          autoComplete="name"
                          placeholder="e.g. Aditi Sharma"
                          className={`${inputClass} pl-11`}
                          {...signupForm.register('name')}
                        />
                      </div>
                      <FieldError message={signupForm.formState.errors.name?.message} />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label htmlFor="signup-email" className="text-xs font-semibold text-ink uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink-muted">
                          <Mail className="h-4.5 w-4.5" />
                        </div>
                        <input
                          id="signup-email"
                          type="email"
                          autoComplete="email"
                          placeholder="name@example.com"
                          className={`${inputClass} pl-11`}
                          {...signupForm.register('email')}
                        />
                      </div>
                      <FieldError message={signupForm.formState.errors.email?.message} />
                    </div>

                    {/* Phone Number with +91 Prefix */}
                    <div>
                      <label htmlFor="signup-phone" className="text-xs font-semibold text-ink uppercase tracking-wider">
                        Mobile Number
                      </label>
                      <div className="mt-1.5 flex overflow-hidden rounded-xl border border-brand/20 bg-surface-soft transition-all duration-200 focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
                        <div className="flex items-center gap-1.5 border-r border-brand/15 bg-brand/5 px-3.5 text-sm font-bold text-brand">
                          <Phone className="h-4 w-4" />
                          <span>+91</span>
                        </div>
                        <input
                          id="signup-phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          placeholder="10-digit mobile number"
                          className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-ink outline-none placeholder:text-ink-muted/60"
                          {...signupForm.register('phone')}
                        />
                      </div>
                      <FieldError message={signupForm.formState.errors.phone?.message} />
                    </div>

                    {/* Password & Confirm Password Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Password */}
                      <div>
                        <label
                          htmlFor="signup-password"
                          className="text-xs font-semibold text-ink uppercase tracking-wider"
                        >
                          Password
                        </label>
                        <div className="relative mt-1.5">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink-muted">
                            <Lock className="h-4.5 w-4.5" />
                          </div>
                          <input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Min. 8 chars"
                            className={`${inputClass} pl-11 pr-11`}
                            {...signupForm.register('password')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-brand p-1"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FieldError message={signupForm.formState.errors.password?.message} />
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label
                          htmlFor="signup-confirm-password"
                          className="text-xs font-semibold text-ink uppercase tracking-wider"
                        >
                          Confirm Password
                        </label>
                        <div className="relative mt-1.5">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink-muted">
                            <Lock className="h-4.5 w-4.5" />
                          </div>
                          <input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Re-enter"
                            className={`${inputClass} pl-11 pr-11`}
                            {...signupForm.register('confirmPassword')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-brand p-1"
                            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FieldError message={signupForm.formState.errors.confirmPassword?.message} />
                      </div>
                    </div>

                    {/* Preferred Language Selector */}
                    <div>
                      <label
                        htmlFor="signup-language"
                        className="text-xs font-semibold text-ink uppercase tracking-wider"
                      >
                        Preferred Language
                      </label>
                      <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink-muted">
                          <Globe className="h-4.5 w-4.5" />
                        </div>
                        <select
                          id="signup-language"
                          className={`${inputClass} pl-11 appearance-none cursor-pointer`}
                          {...signupForm.register('language')}
                        >
                          <option value="en">English (US / Global)</option>
                          <option value="hi">हिन्दी (Hindi)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-ink-muted">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* Privacy & Health Consent Checkbox */}
                    <div className="pt-1.5">
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand/15 bg-surface-soft/60 p-3 hover:bg-surface-soft transition">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand/30 accent-brand focus:ring-brand"
                          {...signupForm.register('consent')}
                        />
                        <span className="text-xs leading-relaxed text-ink-muted">
                          I agree to the{' '}
                          <button type="button" className="font-semibold text-brand hover:underline">
                            Privacy Policy
                          </button>{' '}
                          and consent to my health data being processed for my personalized Prakruti assessment.
                        </span>
                      </label>
                      <FieldError message={signupForm.formState.errors.consent?.message} />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-all duration-200 hover:bg-brand-deep hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand/25 disabled:cursor-wait disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner />
                          <span>Generating Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  /* ============================================================= */
                  /* INLINE SIGNUP EMAIL VERIFICATION STEP (With 1-Min Bar)        */
                  /* ============================================================= */
                  <motion.div
                    key="signup-verify"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="rounded-2xl border border-brand/10 bg-brand/5 p-5 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-md shadow-brand/20">
                        <Mail className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-serif font-bold text-ink">Verify Your Account</h3>
                      <p className="mt-1 text-xs sm:text-sm text-ink-muted">
                        We sent a 6-digit verification code to:
                      </p>
                      <p className="mt-1 font-semibold text-brand font-mono text-sm sm:text-base">
                        {signupForm.getValues('email')}
                      </p>
                    </div>

                    {/* 6-Digit OTP Box Grid */}
                    <div>
                      <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2 text-center">
                        Enter 6-Digit Verification Code
                      </label>
                      <OtpBoxes
                        otp={signupOtp}
                        setOtp={setSignupOtp}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* 1-Minute Countdown Progress Bar */}
                    <CountdownProgressBar
                      countdown={signupCountdown}
                      totalSeconds={OTP_COOLDOWN_SECONDS}
                      onResend={handleResendSignupOtp}
                      isResending={isSubmitting}
                    />

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                      <button
                        type="button"
                        onClick={verifySignupOtp}
                        disabled={isSubmitting || signupOtp.some((d) => !d)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-all duration-200 hover:bg-brand-deep hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner />
                            <span>Verifying Code...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4.5 w-4.5" />
                            <span>Verify & Complete Signup</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSignupStep('form')
                          setApiError('')
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand/15 py-3 text-xs font-semibold text-ink-muted hover:bg-surface-soft hover:text-ink transition"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Edit Information / Change Email</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* ================================================================= */}
            {/* 2. LOGIN FLOW (Email & Password vs Passwordless Email vs Quick Phone Login) */}
            {/* ================================================================= */}
            {mode === 'login' && (
              <div>
                {/* Method Switcher Tabs inside Login */}
                <div
                  className="mb-6 grid grid-cols-3 rounded-xl border border-brand/10 bg-surface-soft/60 p-1"
                  role="tablist"
                  aria-label="Login Method"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={loginMethod === 'email'}
                    onClick={() => {
                      setLoginMethod('email')
                      setApiError('')
                      setPhoneLoginStep('input')
                      setEmailOtpLoginStep('input')
                    }}
                    className={`rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      loginMethod === 'email'
                        ? 'bg-brand text-white shadow-sm'
                        : 'text-ink-muted hover:text-brand'
                    }`}
                  >
                    Email & Password
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={loginMethod === 'email-otp'}
                    onClick={() => {
                      setLoginMethod('email-otp')
                      setApiError('')
                      setPhoneLoginStep('input')
                      setEmailOtpLoginStep('input')
                    }}
                    className={`rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      loginMethod === 'email-otp'
                        ? 'bg-brand text-white shadow-sm'
                        : 'text-ink-muted hover:text-brand'
                    }`}
                  >
                    Passwordless Email
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={loginMethod === 'phone'}
                    onClick={() => {
                      setLoginMethod('phone')
                      setApiError('')
                      setPhoneLoginStep('input')
                      setEmailOtpLoginStep('input')
                    }}
                    className={`rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      loginMethod === 'phone'
                        ? 'bg-brand text-white shadow-sm'
                        : 'text-ink-muted hover:text-brand'
                    }`}
                  >
                    Quick Phone Login
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {/* Option A: Direct Email & Password Login */}
                  {loginMethod === 'email' ? (
                    <motion.form
                      key="login-email-form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={loginEmailForm.handleSubmit(onLoginEmailSubmit, triggerShake)}
                      noValidate
                      className="space-y-4.5"
                    >
                      {/* Email Address */}
                      <div>
                        <label
                          htmlFor="login-email"
                          className="text-xs font-semibold text-ink uppercase tracking-wider"
                        >
                          Email Address
                        </label>
                        <div className="relative mt-1.5">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink-muted">
                            <Mail className="h-4.5 w-4.5" />
                          </div>
                          <input
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            className={`${inputClass} pl-11`}
                            {...loginEmailForm.register('email')}
                          />
                        </div>
                        <FieldError message={loginEmailForm.formState.errors.email?.message} />
                      </div>

                      {/* Password */}
                      <div>
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="login-password"
                            className="text-xs font-semibold text-ink uppercase tracking-wider"
                          >
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                'Password reset link instructions will be delivered to your registered email address.'
                              )
                            }
                            className="text-xs font-semibold text-brand hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative mt-1.5">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink-muted">
                            <Lock className="h-4.5 w-4.5" />
                          </div>
                          <input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            className={`${inputClass} pl-11 pr-11`}
                            {...loginEmailForm.register('password')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-brand p-1"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FieldError message={loginEmailForm.formState.errors.password?.message} />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-all duration-200 hover:bg-brand-deep hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand/25 disabled:cursor-wait disabled:opacity-75"
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner />
                            <span>Signing In...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In Securely</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : loginMethod === 'email-otp' ? (
                    /* Option B: Passwordless Email Login -> OTP Flow */
                    <AnimatePresence mode="wait">
                      {emailOtpLoginStep === 'input' ? (
                        <motion.form
                          key="login-email-otp-input"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          onSubmit={loginEmailOtpForm.handleSubmit(onLoginEmailOtpSubmit, triggerShake)}
                          noValidate
                          className="space-y-4.5"
                        >
                          <div>
                            <label
                              htmlFor="login-email-otp"
                              className="text-xs font-semibold text-ink uppercase tracking-wider"
                            >
                              Email Address
                            </label>
                            <div className="relative mt-1.5">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink-muted">
                                <Mail className="h-4.5 w-4.5" />
                              </div>
                              <input
                                id="login-email-otp"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                className={`${inputClass} pl-11`}
                                {...loginEmailOtpForm.register('email')}
                              />
                            </div>
                            <FieldError message={loginEmailOtpForm.formState.errors.email?.message} />
                          </div>

                          <p className="text-xs text-ink-muted">
                            We will send a one-time verification code to this email address.
                          </p>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-all duration-200 hover:bg-brand-deep hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand/25 disabled:cursor-wait disabled:opacity-75"
                          >
                            {isSubmitting ? (
                              <>
                                <Spinner />
                                <span>Sending Verification Code...</span>
                              </>
                            ) : (
                              <>
                                <span>Send Verification Code</span>
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </motion.form>
                      ) : (
                        /* Email OTP Login Inline OTP Step */
                        <motion.div
                          key="login-email-otp-verify"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-6"
                        >
                          <div className="rounded-2xl border border-brand/10 bg-brand/5 p-4 text-center">
                            <p className="text-xs sm:text-sm text-ink-muted">
                              Verification code sent to:
                            </p>
                            <p className="mt-1 font-semibold text-brand font-mono text-sm sm:text-base">
                              {loginEmailOtpForm.getValues('email')}
                            </p>
                          </div>

                          {/* 6-Digit OTP Boxes */}
                          <div>
                            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2 text-center">
                              Enter 6-Digit Verification Code
                            </label>
                            <OtpBoxes
                              otp={emailOtp}
                              setOtp={setEmailOtp}
                              disabled={isSubmitting}
                            />
                          </div>

                          {/* 1-Minute Countdown Progress Bar */}
                          <CountdownProgressBar
                            countdown={emailOtpCountdown}
                            totalSeconds={OTP_COOLDOWN_SECONDS}
                            onResend={handleResendEmailOtp}
                            isResending={isSubmitting}
                          />

                          {/* Action Buttons */}
                          <div className="space-y-3 pt-2">
                            <button
                              type="button"
                              onClick={verifyEmailOtpLogin}
                              disabled={isSubmitting || emailOtp.some((d) => !d)}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-all duration-200 hover:bg-brand-deep hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isSubmitting ? (
                                <>
                                  <Spinner />
                                  <span>Signing In...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4.5 w-4.5" />
                                  <span>Verify & Sign In</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEmailOtpLoginStep('input')
                                setApiError('')
                              }}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand/15 py-3 text-xs font-semibold text-ink-muted hover:bg-surface-soft hover:text-ink transition"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                              <span>Change Email Address</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
) : (
                    /* Option C: Quick Phone Login -> OTP Flow */
                    <AnimatePresence mode="wait">
                      {phoneLoginStep === 'input' ? (
                        <motion.form
                          key="login-phone-input"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          onSubmit={loginPhoneForm.handleSubmit(onLoginPhoneSubmit, triggerShake)}
                          noValidate
                          className="space-y-4.5"
                        >
                          <div>
                            <label
                              htmlFor="login-phone"
                              className="text-xs font-semibold text-ink uppercase tracking-wider"
                            >
                              Registered Mobile Number
                            </label>
                            <div className="mt-1.5 flex overflow-hidden rounded-xl border border-brand/20 bg-surface-soft transition-all duration-200 focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
                              <div className="flex items-center gap-1.5 border-r border-brand/15 bg-brand/5 px-3.5 text-sm font-bold text-brand">
                                <Phone className="h-4 w-4" />
                                <span>+91</span>
                              </div>
                              <input
                                id="login-phone"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                placeholder="10-digit mobile number"
                                className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-ink outline-none placeholder:text-ink-muted/60"
                                {...loginPhoneForm.register('phone')}
                              />
                            </div>
                            <FieldError message={loginPhoneForm.formState.errors.phone?.message} />
                          </div>

                          <p className="text-xs text-ink-muted">
                            We will send a one-time verification code to your registered contact number.
                          </p>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-all duration-200 hover:bg-brand-deep hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand/25 disabled:cursor-wait disabled:opacity-75"
                          >
                            {isSubmitting ? (
                              <>
                                <Spinner />
                                <span>Sending Verification Code...</span>
                              </>
                            ) : (
                              <>
                                <span>Send Verification Code</span>
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </motion.form>
                      ) : (
                        /* Phone Login Inline OTP Step */
                        <motion.div
                          key="login-phone-verify"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-6"
                        >
                          <div className="rounded-2xl border border-brand/10 bg-brand/5 p-4 text-center">
                            <p className="text-xs sm:text-sm text-ink-muted">
                              Verification code sent to registered contact for:
                            </p>
                            <p className="mt-1 font-semibold text-brand font-mono text-sm sm:text-base">
                              +91 {loginPhoneForm.getValues('phone')}
                            </p>
                          </div>

                          {/* 6-Digit OTP Boxes */}
                          <div>
                            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2 text-center">
                              Enter 6-Digit Verification Code
                            </label>
                            <OtpBoxes
                              otp={phoneOtp}
                              setOtp={setPhoneOtp}
                              disabled={isSubmitting}
                            />
                          </div>

                          {/* 1-Minute Countdown Progress Bar */}
                          <CountdownProgressBar
                            countdown={phoneCountdown}
                            totalSeconds={OTP_COOLDOWN_SECONDS}
                            onResend={handleResendPhoneOtp}
                            isResending={isSubmitting}
                          />

                          {/* Action Buttons */}
                          <div className="space-y-3 pt-2">
                            <button
                              type="button"
                              onClick={verifyPhoneLoginOtp}
                              disabled={isSubmitting || phoneOtp.some((d) => !d)}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-all duration-200 hover:bg-brand-deep hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isSubmitting ? (
                                <>
                                  <Spinner />
                                  <span>Signing In...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4.5 w-4.5" />
                                  <span>Verify & Sign In</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPhoneLoginStep('input')
                                setApiError('')
                              }}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand/15 py-3 text-xs font-semibold text-ink-muted hover:bg-surface-soft hover:text-ink transition"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                              <span>Change Phone Number</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Guest Mode Quick Entry Card */}
          <div className="mt-8 pt-6 border-t border-brand/10">
            <button
              type="button"
              onClick={handleGuestAccess}
              disabled={isGuestLoading}
              className="w-full group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-surface-soft to-stone-100 hover:from-emerald-100/90 hover:to-emerald-50 border border-emerald-300/80 hover:border-emerald-500/80 shadow-xs hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#2A4638] text-[#E2D5BE] flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                  🌿
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900 group-hover:text-[#2A4638] transition-colors">
                      {t('common.exploreAsGuest')}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-[#2A4638] text-white px-2 py-0.5 rounded-full">
                      1-Click Demo
                    </span>
                  </div>
                  <span className="text-xs text-stone-600 block mt-0.5">
                    {t('common.exploreAsGuestDesc')}
                  </span>
                </div>
              </div>
              <div className="text-stone-400 group-hover:text-[#2A4638] transition-colors pl-2">
                {isGuestLoading ? (
                  <Spinner />
                ) : (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </button>
          </div>

          {/* Footer Security Guarantee */}
          <footer className="mt-10 border-t border-brand/10 pt-6 text-center">

            <p className="text-[11px] text-ink-muted/80">
              Encrypted end-to-end. Your health data remains strictly private & compliant with clinical
              Ayurvedic safety protocols.
            </p>
          </footer>
        </div>
      </section>
    </main>
  )
}

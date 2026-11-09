import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { translations, type Language } from '../lib/translations'

interface LanguageContextType {
  lang: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (path: string, fallback?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('ayushya_language') || localStorage.getItem('ayusha_language')
    return saved === 'hi' || saved === 'en' ? saved : 'en'
  })

  const setLanguage = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('ayushya_language', newLang)
    localStorage.removeItem('ayusha_language')
    document.documentElement.lang = newLang
  }

  const toggleLanguage = () => {
    setLanguage(lang === 'en' ? 'hi' : 'en')
  }

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const t = (path: string, fallback = ''): string => {
    const keys = path.split('.')
    let current: unknown = translations[lang]

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key]
      } else {
        // Fallback to english if missing in target lang
        let enCurrent: unknown = translations.en
        for (const enKey of keys) {
          if (enCurrent && typeof enCurrent === 'object' && enKey in enCurrent) {
            enCurrent = (enCurrent as Record<string, unknown>)[enKey]
          } else {
            return fallback || path
          }
        }
        return typeof enCurrent === 'string' ? enCurrent : fallback || path
      }
    }

    return typeof current === 'string' ? current : fallback || path
  }

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { setLanguage } from '@/lib/actions/language'
import { translations } from '@/lib/i18n/translations'
import type { Lang, Translations } from '@/lib/i18n/translations'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: translations['en'] as unknown as Translations,
})

export function LanguageProvider({
  children,
  initialLang = 'en',
}: {
  children: React.ReactNode
  initialLang?: Lang
}) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback(async (newLang: Lang) => {
    setLangState(newLang)
    await setLanguage(newLang)
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] as unknown as Translations }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

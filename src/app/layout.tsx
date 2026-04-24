import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { inter, lora } from '@/styles/fonts'
import { validateEnv } from '@/lib/env'
import { LanguageProvider } from '@/components/shared/LanguageProvider'
import { getT } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'
import './globals.css'

// Fail fast on startup if any required environment variable is missing.
validateEnv()

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('devy-lang')?.value === 'fr' ? 'fr' : 'en') as Lang
  const t = getT(lang)
  return {
    title: t.meta.home.title,
    description: t.meta.home.description,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('devy-lang')?.value === 'fr' ? 'fr' : 'en') as Lang

  return (
    <html lang={lang} className={`${inter.variable} ${lora.variable}`}>
      <body className="bg-canvas text-ink font-body antialiased">
        <LanguageProvider initialLang={lang}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}

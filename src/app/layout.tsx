import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { inter, lora } from '@/styles/fonts'
import { validateEnv } from '@/lib/env'
import { LanguageProvider } from '@/components/shared/LanguageProvider'
import type { Lang } from '@/lib/i18n'
import './globals.css'

// Fail fast on startup if any required environment variable is missing.
// This surfaces misconfiguration immediately rather than at runtime.
validateEnv()

export const metadata: Metadata = {
  title: 'Devy — AI Support for Neurodevelopment',
  description: 'Evidence-based guidance for parents, caregivers, teachers, and clinicians supporting children with special needs.',
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

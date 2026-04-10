import type { Metadata } from 'next'
import { inter, lora } from '@/styles/fonts'
import { validateEnv } from '@/lib/env'
import './globals.css'

// Fail fast on startup if any required environment variable is missing.
// This surfaces misconfiguration immediately rather than at runtime.
validateEnv()

export const metadata: Metadata = {
  title: 'Devy — AI Support for Special Needs Families',
  description: 'Evidence-based guidance for parents, caregivers, teachers, and clinicians supporting children with special needs.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="bg-canvas text-ink font-body antialiased">
        {children}
      </body>
    </html>
  )
}

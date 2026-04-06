import type { Metadata } from 'next'
import { inter, lora } from '@/styles/fonts'
import './globals.css'

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

'use server'

import { cookies } from 'next/headers'
import type { Lang } from '@/lib/i18n'

export async function setLanguage(lang: Lang): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('devy-lang', lang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

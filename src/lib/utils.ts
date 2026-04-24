import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Lang } from '@/lib/i18n/translations'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function toLocale(lang: Lang | undefined): string {
  return lang === 'fr' ? 'fr-CA' : 'en-CA'
}

/**
 * Short relative date — "Today", "Yesterday", "3 days ago", or an absolute
 * month/day for anything older than a week. Localizes month names in French.
 */
export function formatDate(dateStr: string, lang: Lang = 'en'): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (lang === 'fr') {
    if (days === 0) return "Aujourd’hui"
    if (days === 1) return 'Hier'
    if (days < 7) return `il y a ${days} jour${days > 1 ? 's' : ''}`
  } else {
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
  }
  return date.toLocaleDateString(toLocale(lang), { month: 'short', day: 'numeric' })
}

/** Full "15 April 2026" / "15 avril 2026" */
export function formatDateFull(dateStr: string, lang: Lang = 'en'): string {
  return new Date(dateStr).toLocaleDateString(toLocale(lang), {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

/** Number with locale-appropriate grouping (1 234 in fr, 1,234 in en). */
export function formatNumber(n: number, lang: Lang = 'en'): string {
  return n.toLocaleString(toLocale(lang))
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max).trimEnd() + '…'
}

export function formatFileSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

/** Derive age in years from a date-of-birth string (YYYY-MM-DD). Returns null if dob is null/empty. */
export function ageFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

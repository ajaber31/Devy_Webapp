import { Resend } from 'resend'

// Resend client — only instantiated when RESEND_API_KEY is set.
// All send functions check for the key and silently skip if missing,
// so emails are optional (won't break anything if not configured).
let _resend: Resend | null = null

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

export const FROM_EMAIL = 'Devy <noreply@devy.ca>'

'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
} from '@/lib/validation/schemas'

function mapAccountTypeToRole(accountType: string): string {
  switch (accountType) {
    case 'clinician_professional': return 'clinician'
    case 'caregiver':              return 'caregiver'
    case 'teacher':                return 'teacher'
    case 'other':                  return 'other'
    default:                       return 'parent'
  }
}

export async function signIn(formData: { email: string; password: string }) {
  const parsed = signInSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: 'Invalid email or password format' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    // Return a generic message — never leak whether email exists.
    return { error: 'Invalid email or password' }
  }

  return { ok: true }
}

export async function signUp(formData: {
  name: string
  email: string
  password: string
  accountType: string
}) {
  const parsed = signUpSchema.safeParse(formData)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { error: first?.message ?? 'Invalid input' }
  }

  const supabase = createClient()
  const role = mapAccountTypeToRole(parsed.data.accountType)

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    // Generic message — do not expose whether the email is already registered.
    return { error: 'Could not create account. Please try again.' }
  }

  return {
    success: true,
    message: 'Check your email to confirm your account, then sign in.',
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPassword(email: string): Promise<{ error?: string }> {
  const parsed = forgotPasswordSchema.safeParse({ email })
  if (!parsed.success) {
    // Return success to avoid email enumeration even on bad input.
    return {}
  }

  const supabase = createClient()
  // Always return success to prevent email enumeration.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  })
  return {}
}

export async function updatePassword(newPassword: string): Promise<{ error?: string }> {
  const parsed = updatePasswordSchema.safeParse(newPassword)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid password' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data })
  return error ? { error: 'Failed to update password' } : {}
}

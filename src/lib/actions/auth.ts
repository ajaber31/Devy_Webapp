'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function mapAccountTypeToRole(accountType: string): string {
  if (accountType === 'clinician_professional') return 'clinician'
  return 'parent'
}

export async function signIn(formData: { email: string; password: string }) {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

  // Return success — client handles navigation via useRouter
  // (redirect() inside a Server Action called from a client event handler is unreliable)
  return { ok: true }
}

export async function signUp(formData: {
  name: string
  email: string
  password: string
  accountType: string
}) {
  const supabase = createClient()
  const role = mapAccountTypeToRole(formData.accountType)

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: { name: formData.name, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
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

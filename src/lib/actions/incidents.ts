'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { Database } from '@/lib/supabase/database.types'

function serviceClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function requireAdmin(): Promise<{ error: string } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (data?.role !== 'admin') return { error: 'Forbidden' }
  return null
}

export interface Incident {
  id: string
  reported_by: string | null
  reporter_name?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  affected_users_count: number | null
  data_types_affected: string[]
  status: Database['public']['Tables']['incident_log']['Row']['status']
  resolution: string | null
  reported_to_authority_at: string | null
  created_at: string
  updated_at: string
}

const createIncidentSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(5000).trim(),
  affected_users_count: z.number().int().min(0).nullable().optional(),
  data_types_affected: z.array(z.string().max(100).trim()).max(20).optional(),
})

const updateIncidentSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['open', 'investigating', 'resolved', 'reported_to_opc', 'reported_to_ipc']).optional(),
  resolution: z.string().max(5000).trim().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  reported_to_authority_at: z.string().datetime().nullable().optional(),
})

export async function getIncidents(): Promise<Incident[]> {
  const authErr = await requireAdmin()
  if (authErr) return []

  const db = serviceClient()
  const { data } = await db
    .from('incident_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return (data ?? []) as Incident[]
}

export async function createIncident(
  input: z.infer<typeof createIncidentSchema>,
): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const parsed = createIncidentSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const db = serviceClient()
  const { error } = await db.from('incident_log').insert({
    reported_by: user?.id ?? null,
    severity: parsed.data.severity,
    title: parsed.data.title,
    description: parsed.data.description,
    affected_users_count: parsed.data.affected_users_count ?? null,
    data_types_affected: parsed.data.data_types_affected ?? [],
  })

  if (error) return { error: 'Failed to create incident' }
  revalidatePath('/admin/incidents')
  return {}
}

export async function updateIncident(
  input: z.infer<typeof updateIncidentSchema>,
): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const parsed = updateIncidentSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const { id, ...updates } = parsed.data
  const db = serviceClient()
  const { error } = await db
    .from('incident_log')
    .update(updates)
    .eq('id', id)

  if (error) return { error: 'Failed to update incident' }
  revalidatePath('/admin/incidents')
  return {}
}

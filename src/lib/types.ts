export type UserRole = 'parent' | 'caregiver' | 'clinician' | 'teacher' | 'other' | 'admin'

// ─── Billing types ────────────────────────────────────────────────────────────

export type PlanId = 'free' | 'starter' | 'pro' | 'clinician' | 'petits_genies'

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'paused'

/** Full billing state for the authenticated user. Fetched server-side via getBillingStatus(). */
export interface BillingStatus {
  planId: PlanId
  status: SubscriptionStatus
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  /** ISO timestamp of when the current billing period ends. */
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  /** Number of questions asked today (UTC day). */
  questionsToday: number
  /** Maximum questions per day for the current plan. -1 = unlimited. */
  questionLimit: number
  /** Number of child profiles the user currently has. */
  childCount: number
  /** Maximum child profiles for the current plan. -1 = unlimited. */
  childLimit: number
}
export type UserStatus = 'active' | 'invited' | 'suspended'
export type DocumentStatus = 'uploaded' | 'parsing' | 'chunking' | 'embedding' | 'ready' | 'failed'
export type MessageRole = 'user' | 'assistant'
export type DeltaDirection = 'up' | 'down' | 'neutral'

/** Authenticated user's profile from the profiles table */
export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  avatarUrl?: string
  createdAt: string
  /** Version string of the privacy policy accepted (e.g. "2026-04"). null = not yet consented. */
  consentVersion: string | null
  /** UTC timestamp when the user accepted the current privacy policy. */
  consentAcceptedAt: string | null
}

/** Current live version of the privacy policy. Bump this string whenever the
 *  policy changes materially — all users will be prompted to re-consent. */
export const CURRENT_CONSENT_VERSION = '2026-04'

/** Used for admin user management listing */
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  planId?: PlanId
  avatarUrl?: string
  organization?: string
  joinedAt: string
  lastActiveAt: string
}

export interface Conversation {
  id: string
  title: string
  preview: string
  updatedAt: string
  messageCount: number
  isPinned: boolean
  tags: string[]
  childId?: string
  childName?: string
}

export interface Child {
  id: string
  userId: string
  name: string
  dateOfBirth: string | null
  /** User-defined descriptive labels. Not clinical diagnoses. */
  contextLabels: string[]
  supportNeeds: string[]
  strengths: string[]
  interests: string[]
  routines: string[]
  goals: string[]
  notes: string
  avatarColor: 'sage' | 'dblue' | 'sand'
  createdAt: string
}

export interface Source {
  id: string
  title: string
  documentName: string
  pageNumber?: number
  excerpt: string
}

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  createdAt: string
  sources?: Source[]
  notFoundNote?: string
}

export interface Document {
  id: string
  title: string
  originalFilename: string
  type: 'pdf' | 'docx' | 'txt'
  fileSizeBytes: number
  storagePath: string
  status: DocumentStatus
  uploadedBy: string | null
  uploadedAt: string
  processedAt: string | null
  tags: string[]
  chunkCount: number
  errorMessage: string | null
}

export interface Resource {
  id: string
  title: string
  description: string
  category: string
  href: string
  isPinned: boolean
}

export interface StatCardData {
  label: string
  value: string
  delta: string
  deltaDirection: DeltaDirection
  icon: string
  color: 'sage' | 'dblue' | 'sand' | 'neutral'
}

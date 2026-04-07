export type UserRole = 'parent' | 'caregiver' | 'clinician' | 'teacher' | 'admin'
export type UserStatus = 'active' | 'invited' | 'suspended'
export type DocumentStatus = 'processing' | 'ready' | 'error'
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
}

/** Used for admin user management listing */
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
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
  name: string
  type: 'pdf' | 'docx' | 'txt' | 'url'
  sizeKb: number
  status: DocumentStatus
  uploadedBy: string
  uploadedAt: string
  tags: string[]
  chunkCount?: number
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

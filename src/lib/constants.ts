import { LayoutDashboard, MessageCircle, Users, Settings, BookOpen, Library } from 'lucide-react'

export const DASHBOARD_NAV_ITEMS = [
  { label: 'Dashboard',     href: '/dashboard', icon: LayoutDashboard },
  { label: 'Children',      href: '/children',  icon: Users },
  { label: 'Conversations', href: '/chat',       icon: MessageCircle },
  { label: 'Resources',     href: '/resources',  icon: BookOpen },
  { label: 'Settings',      href: '/settings',   icon: Settings },
]

export const ADMIN_NAV_ITEMS = [
  { label: 'Admin Dashboard',       href: '/dashboard',       icon: LayoutDashboard },
  { label: 'Global Knowledge Base', href: '/admin/documents', icon: Library },
  { label: 'Platform Users',        href: '/admin/users',     icon: Users },
  { label: 'Platform Settings',     href: '/settings',        icon: Settings },
]

export const ACCOUNT_TYPE_OPTIONS = [
  {
    value: 'parent_caregiver',
    label: 'Parent / Caregiver',
    description: 'Get guidance and resources for supporting your child at home and in everyday life.',
    icon: '🏠',
  },
  {
    value: 'clinician_professional',
    label: 'Clinician / Professional',
    description: 'Access evidence-based clinical resources and practice tools for supporting your clients.',
    icon: '🩺',
  },
]

export const EXAMPLE_PROMPTS = [
  'What strategies help reduce sensory overload in the classroom?',
  'How do I write a measurable IEP goal for communication skills?',
  'What are the early signs of pathological demand avoidance (PDA)?',
  'How can I support a child with ADHD during homework time?',
]

export const CHILD_EXAMPLE_PROMPTS = (childName: string): string[] => [
  `What strategies can help ${childName} with sensory overload?`,
  `How can I support ${childName}&apos;s communication goals at home?`,
  `What does the research say about ${childName}&apos;s diagnosis?`,
  `How do I write an IEP goal for ${childName}?`,
]

export const LANDING_NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Who It\'s For', href: '#who-its-for' },
  { label: 'Trust & Safety', href: '#trust' },
]

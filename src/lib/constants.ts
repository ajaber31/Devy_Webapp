import { LayoutDashboard, MessageCircle, FileText, Users, Settings } from 'lucide-react'

export const DASHBOARD_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Chat',      href: '/chat',      icon: MessageCircle },
  { label: 'Settings',  href: '/settings',  icon: Settings },
]

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard',        icon: LayoutDashboard },
  { label: 'Chat',      href: '/chat',             icon: MessageCircle },
  { label: 'Documents', href: '/admin/documents',  icon: FileText },
  { label: 'Users',     href: '/admin/users',      icon: Users },
  { label: 'Settings',  href: '/settings',         icon: Settings },
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

export const LANDING_NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Who It\'s For', href: '#who-its-for' },
  { label: 'Trust & Safety', href: '#trust' },
]

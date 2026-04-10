import { LayoutDashboard, MessageCircle, Users, Settings, Library } from 'lucide-react'

export const DASHBOARD_NAV_ITEMS = [
  { label: 'Dashboard',     href: '/dashboard', icon: LayoutDashboard },
  { label: 'Children',      href: '/children',  icon: Users },
  { label: 'Conversations', href: '/chat',       icon: MessageCircle },
  { label: 'Settings',      href: '/settings',   icon: Settings },
]

export const ADMIN_NAV_ITEMS = [
  { label: 'Admin Dashboard',       href: '/dashboard',       icon: LayoutDashboard },
  { label: 'Conversations',         href: '/chat',            icon: MessageCircle },
  { label: 'Global Knowledge Base', href: '/admin/documents', icon: Library },
  { label: 'Platform Users',        href: '/admin/users',     icon: Users },
  { label: 'Platform Settings',     href: '/settings',        icon: Settings },
]

export const ACCOUNT_TYPE_OPTIONS = [
  {
    value: 'parent',
    label: 'Parent',
    description: 'Support your child at home with evidence-based guidance and strategies.',
    icon: '🏠',
  },
  {
    value: 'caregiver',
    label: 'Caregiver',
    description: 'Get resources and strategies to support the children in your care.',
    icon: '🤝',
  },
  {
    value: 'clinician_professional',
    label: 'Clinician / Professional',
    description: 'Access evidence-based clinical resources and practice tools for your clients.',
    icon: '🩺',
  },
  {
    value: 'teacher',
    label: 'Teacher',
    description: 'Find classroom strategies and research-backed support approaches for your students.',
    icon: '📚',
  },
  {
    value: 'other',
    label: 'Other',
    description: "Access Devy's knowledge base for professional or personal use.",
    icon: '✨',
  },
]

export const EXAMPLE_PROMPTS = [
  'What strategies help reduce sensory overload in the classroom?',
  'How do I write a measurable IEP goal for communication skills?',
  'What are the early signs of pathological demand avoidance (PDA)?',
  'How can I support a child with ADHD during homework time?',
  'What does the research say about ABA therapy for autism?',
  'How do I support a child with dyslexia who is falling behind in reading?',
  'What are evidence-based approaches for managing meltdowns?',
  'How can I help a child with anxiety transition between activities?',
]

export const CHILD_EXAMPLE_PROMPTS = (childName: string): string[] => [
  `What strategies can help ${childName} with sensory overload?`,
  `How can I support ${childName}'s communication goals at home?`,
  `What does the research say about ${childName}'s diagnosis?`,
  `How do I write an IEP goal for ${childName}?`,
  `What are the best ways to support ${childName} during transitions?`,
  `How can I help ${childName} build social skills?`,
  `What calming strategies work best for a child like ${childName}?`,
  `How can I track ${childName}'s progress toward their goals?`,
]

export const LANDING_NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Who It\'s For', href: '#who-its-for' },
  { label: 'Trust & Safety', href: '#trust' },
]

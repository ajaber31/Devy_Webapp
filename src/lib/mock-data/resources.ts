import type { Resource } from '@/lib/types'

export const mockResources: Resource[] = [
  {
    id: 'r1',
    title: 'IEP Goal Writing Guide',
    description: 'Step-by-step framework for writing SMART IEP goals',
    category: 'IEP Support',
    href: '#',
    isPinned: true,
  },
  {
    id: 'r2',
    title: 'Sensory Processing Primer',
    description: 'Understanding sensory differences in everyday life',
    category: 'Sensory',
    href: '#',
    isPinned: true,
  },
  {
    id: 'r3',
    title: 'Behavior Support Planning',
    description: 'Creating proactive BSPs that center the child\'s needs',
    category: 'Behavior',
    href: '#',
    isPinned: true,
  },
  {
    id: 'r4',
    title: 'AAC Getting Started',
    description: 'Introduction to augmentative and alternative communication',
    category: 'Communication',
    href: '#',
    isPinned: false,
  },
  {
    id: 'r5',
    title: 'Sleep & Regulation',
    description: 'Evidence-based sleep support for children with special needs',
    category: 'Daily Living',
    href: '#',
    isPinned: false,
  },
]

export const mockStats = [
  {
    label: 'Conversations',
    value: '0',
    delta: 'All time',
    deltaDirection: 'neutral' as const,
    icon: 'MessageCircle',
    color: 'sage' as const,
  },
  {
    label: 'Child Profiles',
    value: '0',
    delta: 'In your account',
    deltaDirection: 'neutral' as const,
    icon: 'Users',
    color: 'dblue' as const,
  },
  {
    label: 'Questions Asked',
    value: '0',
    delta: 'Across all chats',
    deltaDirection: 'neutral' as const,
    icon: 'HelpCircle',
    color: 'sand' as const,
  },
  {
    label: 'Sources Cited',
    value: '—',
    delta: 'Coming with AI',
    deltaDirection: 'neutral' as const,
    icon: 'FileCheck',
    color: 'neutral' as const,
  },
]

'use client'

import Link from 'next/link'
import { MessageCircle, Users, Settings, ArrowUpRight, BookOpen } from 'lucide-react'
import { useLanguage } from '@/components/shared/LanguageProvider'

interface QuickActionsProps {
  nounPlural: string
}

export function QuickActions({ nounPlural }: QuickActionsProps) {
  const { t } = useLanguage()
  const qa = t.dashboard.quickActions

  const actions = [
    {
      icon: MessageCircle,
      label: qa.startChat,
      description: qa.startChatDesc,
      href: '/chat',
      color: 'bg-sage-100 text-sage-600',
    },
    {
      icon: Users,
      label: qa.myPeople.replace('{noun}', nounPlural.toLowerCase()),
      description: qa.viewOrAdd,
      href: '/children',
      color: 'bg-dblue-100 text-dblue-600',
    },
    {
      icon: BookOpen,
      label: qa.browseResources,
      description: qa.resourcesDesc,
      href: '/resources',
      color: 'bg-sand-100 text-sand-500',
    },
    {
      icon: Settings,
      label: t.nav.settings,
      description: qa.settingsDesc,
      href: '/settings',
      color: 'bg-raised text-ink-secondary',
    },
  ]

  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-display text-[1.05rem] font-semibold text-ink">{qa.title}</h3>
      </div>
      <ul className="p-3 grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <li key={action.href}>
              <Link
                href={action.href}
                className="flex flex-col gap-2.5 p-3 rounded-card hover:bg-surface border border-transparent hover:border-border group focus-ring"
                style={{ transitionProperty: 'background-color, border-color', transitionDuration: '150ms' }}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-8 h-8 rounded-card ${action.color} flex items-center justify-center`}>
                    <Icon size={15} strokeWidth={1.75} />
                  </div>
                  <ArrowUpRight size={13} className="text-ink-tertiary group-hover:text-sage-500 mt-0.5 opacity-0 group-hover:opacity-100"
                    style={{ transitionProperty: 'opacity, color', transitionDuration: '150ms' }} />
                </div>
                <div>
                  <p className="text-body-xs font-semibold text-ink">{action.label}</p>
                  <p className="text-body-xs text-ink-tertiary">{action.description}</p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

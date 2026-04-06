import Link from 'next/link'
import { MessageCircle, FileText, Users, Settings, ArrowUpRight } from 'lucide-react'

const actions = [
  {
    icon: MessageCircle,
    label: 'Start a chat',
    description: 'Ask a new question',
    href: '/chat',
    color: 'bg-sage-100 text-sage-600',
  },
  {
    icon: FileText,
    label: 'Manage documents',
    description: 'Upload or review files',
    href: '/admin/documents',
    color: 'bg-dblue-100 text-dblue-600',
  },
  {
    icon: Users,
    label: 'Team members',
    description: 'View or invite users',
    href: '/admin/users',
    color: 'bg-sand-100 text-sand-500',
  },
  {
    icon: Settings,
    label: 'Settings',
    description: 'Profile & preferences',
    href: '/settings',
    color: 'bg-raised text-ink-secondary',
  },
]

export function QuickActions() {
  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-display text-[1.05rem] font-semibold text-ink">Quick actions</h3>
      </div>
      <ul className="p-3 grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <li key={action.href}>
              <Link
                href={action.href}
                className="flex flex-col gap-2.5 p-3 rounded-card hover:bg-surface border border-transparent hover:border-border group"
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

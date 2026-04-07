'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, Target, Star, Heart, Calendar, MessageCircle, FileText, ChevronLeft } from 'lucide-react'
import { ChildProfileHeader } from '@/components/children/ChildProfileHeader'
import { mockChildren } from '@/lib/mock-data/children'
import { mockConversations } from '@/lib/mock-data/conversations'
import { formatDate } from '@/lib/utils'

interface PageProps {
  params: { id: string }
}

export default function ChildProfilePage({ params }: PageProps) {
  const child = mockChildren.find(c => c.id === params.id)
  if (!child) notFound()

  const childConversations = mockConversations.filter(c => c.childId === child.id)

  const sections = [
    {
      id: 'support',
      label: 'Support Needs',
      icon: Heart,
      items: child.supportNeeds,
      chipClass: 'bg-sage-50 text-sage-700 border border-sage-200',
    },
    {
      id: 'strengths',
      label: 'Strengths & Interests',
      icon: Star,
      items: [...child.strengths, ...child.interests],
      chipClass: 'bg-dblue-50 text-dblue-700 border border-dblue-200',
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/children"
        className="inline-flex items-center gap-1.5 text-body-sm text-ink-secondary hover:text-ink focus-ring rounded"
        style={{ transitionProperty: 'color', transitionDuration: '150ms' }}
      >
        <ChevronLeft size={14} strokeWidth={2} />
        Back to Children
      </Link>

      {/* Profile header */}
      <ChildProfileHeader child={child} />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — main sections */}
        <div className="lg:col-span-2 space-y-5">
          {/* Support Needs + Strengths chips */}
          {sections.map(({ id, label, icon: Icon, items, chipClass }) => (
            <div key={id} className="bg-white rounded-card-lg shadow-card border border-border/50 px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={15} strokeWidth={1.75} className="text-ink-secondary" />
                <h3 className="font-display text-[0.95rem] font-semibold text-ink">{label}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span key={item} className={`inline-block px-3 py-1 rounded-pill text-body-xs font-medium ${chipClass}`}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Goals & Focus Areas */}
          <div className="bg-white rounded-card-lg shadow-card border border-border/50 px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Target size={15} strokeWidth={1.75} className="text-ink-secondary" />
              <h3 className="font-display text-[0.95rem] font-semibold text-ink">Goals &amp; Focus Areas</h3>
            </div>
            <ul className="space-y-2">
              {child.goals.map((goal, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded border-2 border-sage-300 flex-shrink-0 mt-0.5" />
                  <span className="text-body-sm text-ink leading-snug">{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Routines */}
          <div className="bg-white rounded-card-lg shadow-card border border-border/50 px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={15} strokeWidth={1.75} className="text-ink-secondary" />
              <h3 className="font-display text-[0.95rem] font-semibold text-ink">Routines</h3>
            </div>
            <ol className="space-y-2">
              {child.routines.map((routine, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center text-body-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-body-sm text-ink leading-snug">{routine}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-card-lg shadow-card border border-border/50 px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={15} strokeWidth={1.75} className="text-ink-secondary" />
              <h3 className="font-display text-[0.95rem] font-semibold text-ink">Notes</h3>
            </div>
            <p className="text-body-sm text-ink-secondary leading-relaxed">{child.notes}</p>
          </div>
        </div>

        {/* Right column — conversations */}
        <div className="space-y-5">
          <div className="bg-white rounded-card-lg shadow-card border border-border/50 px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={15} strokeWidth={1.75} className="text-ink-secondary" />
              <h3 className="font-display text-[0.95rem] font-semibold text-ink">Recent Conversations</h3>
            </div>

            {childConversations.length === 0 ? (
              <p className="text-body-xs text-ink-tertiary">No conversations yet.</p>
            ) : (
              <ul className="space-y-2">
                {childConversations.map((convo) => (
                  <li key={convo.id}>
                    <Link
                      href={`/chat?childId=${child.id}&childName=${encodeURIComponent(child.name)}`}
                      className="block p-3 rounded-card hover:bg-surface border border-transparent hover:border-border group focus-ring"
                      style={{ transitionProperty: 'background-color, border-color', transitionDuration: '150ms' }}
                    >
                      <p className="text-body-sm font-medium text-ink group-hover:text-sage-700 leading-snug truncate"
                        style={{ transitionProperty: 'color', transitionDuration: '150ms' }}>
                        {convo.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-body-xs text-ink-tertiary">{formatDate(convo.updatedAt)}</span>
                        <span className="text-ink-tertiary">&middot;</span>
                        <span className="text-body-xs text-ink-tertiary">{convo.messageCount} messages</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={`/chat?childId=${child.id}&childName=${encodeURIComponent(child.name)}`}
              className="mt-3 flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-card text-body-xs font-semibold bg-sage-500 text-white hover:bg-sage-600 active:scale-[0.98] shadow-button focus-ring"
              style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
            >
              <MessageCircle size={12} strokeWidth={2} />
              New conversation
            </Link>
          </div>

          {/* Profile meta */}
          <div className="bg-white rounded-card-lg shadow-card border border-border/50 px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={15} strokeWidth={1.75} className="text-ink-secondary" />
              <h3 className="font-display text-[0.95rem] font-semibold text-ink">Profile Info</h3>
            </div>
            <dl className="space-y-2">
              <div className="flex justify-between gap-2">
                <dt className="text-body-xs text-ink-tertiary">Age</dt>
                <dd className="text-body-xs text-ink font-medium">{child.age} years old</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-body-xs text-ink-tertiary">Date of birth</dt>
                <dd className="text-body-xs text-ink font-medium">
                  {new Date(child.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-body-xs text-ink-tertiary">Profile created</dt>
                <dd className="text-body-xs text-ink font-medium">{formatDate(child.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-body-xs text-ink-tertiary">Conversations</dt>
                <dd className="text-body-xs text-ink font-medium">{childConversations.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

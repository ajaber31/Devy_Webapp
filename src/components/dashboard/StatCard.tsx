'use client'

import { MessageCircle, BookOpen, FileCheck, Users, HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CountUp } from '@/components/shared/CountUp'
import type { StatCardData } from '@/lib/types'

const iconMap: Record<string, React.ReactNode> = {
  MessageCircle: <MessageCircle size={18} strokeWidth={1.75} />,
  BookOpen:      <BookOpen size={18} strokeWidth={1.75} />,
  FileCheck:     <FileCheck size={18} strokeWidth={1.75} />,
  Users:         <Users size={18} strokeWidth={1.75} />,
  HelpCircle:    <HelpCircle size={18} strokeWidth={1.75} />,
}

const colorMap = {
  sage:    { icon: 'bg-sage-100 text-sage-600',   delta: 'text-success' },
  dblue:   { icon: 'bg-dblue-100 text-dblue-600', delta: 'text-info' },
  sand:    { icon: 'bg-sand-100 text-sand-500',   delta: 'text-warning' },
  neutral: { icon: 'bg-raised text-ink-secondary', delta: 'text-ink-secondary' },
}

export function StatCard({ label, value, delta, deltaDirection, icon, color }: StatCardData) {
  const colors = colorMap[color]
  const numericValue = Number(value)
  const isNumeric = !isNaN(numericValue) && value.trim() !== ''

  const DeltaIcon = deltaDirection === 'up'
    ? TrendingUp
    : deltaDirection === 'down'
    ? TrendingDown
    : Minus

  return (
    <div
      className="bg-white rounded-card-lg p-5 shadow-card hover:shadow-card-hover border border-border/50 flex flex-col gap-4 group"
      style={{
        transitionProperty: 'box-shadow',
        transitionDuration: '200ms',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-card flex items-center justify-center flex-shrink-0', colors.icon)}>
          {iconMap[icon]}
        </div>
        <div className={cn('flex items-center gap-1 text-body-xs font-medium', colors.delta)}>
          <DeltaIcon size={12} strokeWidth={2.5} />
          <span>{delta}</span>
        </div>
      </div>
      <div>
        <p className="font-display text-display-md font-bold text-ink leading-none mb-1">
          {isNumeric ? <CountUp value={numericValue} /> : value}
        </p>
        <p className="text-body-sm text-ink-secondary">{label}</p>
      </div>
    </div>
  )
}

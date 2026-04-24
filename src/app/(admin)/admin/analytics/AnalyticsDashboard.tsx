'use client'

import {
  Users, MessageCircle, DollarSign, Zap, Crown, Stethoscope, Sparkles,
  Layers, HelpCircle, TrendingUp,
} from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'
import { PLANS } from '@/lib/stripe/plans'
import { useLanguage } from '@/components/shared/LanguageProvider'
import type { AdminAnalytics } from '@/lib/actions/admin'

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent: 'sage' | 'dblue' | 'sand' | 'neutral'
}) {
  const accents = {
    sage:    { bg: 'bg-sage-100',  text: 'text-sage-600' },
    dblue:   { bg: 'bg-dblue-100', text: 'text-dblue-600' },
    sand:    { bg: 'bg-sand-100',  text: 'text-sand-500' },
    neutral: { bg: 'bg-raised',    text: 'text-ink-tertiary' },
  }
  const a = accents[accent]

  return (
    <div className="bg-white rounded-card-lg border border-border/50 shadow-card p-5 flex items-start gap-4">
      <div className={cn('w-10 h-10 rounded-card flex items-center justify-center shrink-0', a.bg)}>
        <Icon size={18} className={a.text} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-body-xs text-ink-tertiary mb-0.5">{label}</p>
        <p className="text-display-sm font-bold text-ink tracking-tight">{value}</p>
        {sub && <p className="text-body-xs text-ink-tertiary mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Plan bar ─────────────────────────────────────────────────────────────────

function PlanBar({
  label, count, total, color,
}: {
  label: string; count: number; total: number; color: string
}) {
  const pct = total > 0 ? Math.max((count / total) * 100, count > 0 ? 2 : 0) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-body-sm text-ink-secondary">{label}</span>
        <span className="text-body-sm font-semibold text-ink">{count}</span>
      </div>
      <div className="h-2 bg-raised rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', color)}
          style={{ width: `${pct}%`, transitionProperty: 'width', transitionDuration: '500ms' }}
        />
      </div>
    </div>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-display-sm font-semibold text-ink mb-4">{children}</h2>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export function AnalyticsDashboard({ data }: { data: AdminAnalytics }) {
  const { t, lang } = useLanguage()
  const a = t.admin.analytics
  const totalSubs =
    data.planCounts.free +
    data.planCounts.starter +
    data.planCounts.pro +
    data.planCounts.clinician +
    data.planCounts.petits_genies
  const paidUsers = data.planCounts.starter + data.planCounts.pro + data.planCounts.clinician

  return (
    <div className="space-y-8 mt-6">

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={a.totalUsers}
          value={data.totalUsers}
          sub={a.paidUsers.replace('{n}', String(paidUsers))}
          icon={Users}
          accent="sage"
        />
        <StatCard
          label={a.monthlyRevenue}
          value={`$${data.mrr} CAD`}
          sub={a.recurring}
          icon={DollarSign}
          accent="sand"
        />
        <StatCard
          label={a.conversations}
          value={data.totalConversations}
          sub={a.totalMessages.replace('{n}', String(data.totalMessages))}
          icon={MessageCircle}
          accent="dblue"
        />
        <StatCard
          label={a.questionsToday}
          value={data.questionsToday}
          sub={a.acrossAllUsers}
          icon={HelpCircle}
          accent="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-card-lg border border-border/50 shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <SectionHeading>{a.subscriptionsTitle}</SectionHeading>
            <div className="text-right">
              <p className="text-display-sm font-bold text-ink">${data.mrr}</p>
              <p className="text-body-xs text-ink-tertiary">{t.landing.pricing.perMonth}</p>
            </div>
          </div>

          <div className="space-y-4">
            <PlanBar label={t.plans.free.name} count={data.planCounts.free} total={totalSubs} color="bg-ink-tertiary/30" />
            <PlanBar label={`${t.plans.starter.name} — $${PLANS.starter.priceCAD}/mo`} count={data.planCounts.starter} total={totalSubs} color="bg-dblue-400" />
            <PlanBar label={`${t.plans.pro.name} — $${PLANS.pro.priceCAD}/mo`} count={data.planCounts.pro} total={totalSubs} color="bg-sage-500" />
            <PlanBar label={`${t.plans.clinician.name} — $${PLANS.clinician.priceCAD}/mo`} count={data.planCounts.clinician} total={totalSubs} color="bg-sand-500" />
            {data.planCounts.petits_genies > 0 && (
              <PlanBar label={`${t.plans.petits_genies.name} — ${a.sponsored}`} count={data.planCounts.petits_genies} total={totalSubs} color="bg-dblue-300" />
            )}
          </div>

          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border flex-wrap">
            <div className="flex items-center gap-1.5 text-body-xs text-ink-secondary">
              <div className="w-5 h-5 rounded-full bg-dblue-100 flex items-center justify-center">
                <Zap size={11} className="text-dblue-600" strokeWidth={2} />
              </div>
              <span className="font-medium">{data.planCounts.starter}</span> {t.plans.starter.name}
            </div>
            <div className="flex items-center gap-1.5 text-body-xs text-ink-secondary">
              <div className="w-5 h-5 rounded-full bg-sage-100 flex items-center justify-center">
                <Crown size={11} className="text-sage-600" strokeWidth={2} />
              </div>
              <span className="font-medium">{data.planCounts.pro}</span> {t.plans.pro.name}
            </div>
            <div className="flex items-center gap-1.5 text-body-xs text-ink-secondary">
              <div className="w-5 h-5 rounded-full bg-sand-100 flex items-center justify-center">
                <Stethoscope size={11} className="text-sand-600" strokeWidth={2} />
              </div>
              <span className="font-medium">{data.planCounts.clinician}</span> {t.plans.clinician.name}
            </div>
            {data.planCounts.petits_genies > 0 && (
              <div className="flex items-center gap-1.5 text-body-xs text-ink-secondary">
                <div className="w-5 h-5 rounded-full bg-dblue-50 flex items-center justify-center">
                  <Sparkles size={11} className="text-dblue-600" strokeWidth={2} />
                </div>
                <span className="font-medium">{data.planCounts.petits_genies}</span> Petits Génies
              </div>
            )}
            <div className="ml-auto">
              <span className="px-2 py-0.5 bg-sage-50 border border-sage-200 text-sage-700 text-body-xs font-medium rounded-pill">
                {a.paidPct.replace('{pct}', String(totalSubs > 0 ? Math.round((paidUsers / totalSubs) * 100) : 0))}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-card-lg border border-border/50 shadow-card p-6">
          <SectionHeading>{a.knowledgeBase}</SectionHeading>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-surface rounded-card border border-border/50">
              <p className="text-body-xs text-ink-tertiary mb-1">{a.readyDocuments}</p>
              <p className="text-display-sm font-bold text-ink">{data.documentsReady}</p>
            </div>
            <div className="p-4 bg-surface rounded-card border border-border/50">
              <p className="text-body-xs text-ink-tertiary mb-1">{a.totalChunks}</p>
              <p className="text-display-sm font-bold text-ink">{formatNumber(data.totalChunks, lang)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-body-xs font-medium text-ink-secondary uppercase tracking-wide">{a.byFileType}</p>
            {[
              { label: 'PDF', count: data.documentsByType.pdf, color: 'bg-red-300' },
              { label: 'DOCX', count: data.documentsByType.docx, color: 'bg-dblue-300' },
              { label: 'TXT', count: data.documentsByType.txt, color: 'bg-sand-300' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={cn('w-2 h-2 rounded-full shrink-0', color)} />
                <span className="text-body-sm text-ink-secondary flex-1">{label}</span>
                <span className="text-body-sm font-semibold text-ink">{count}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex items-center gap-2 text-body-xs text-ink-tertiary">
              <Layers size={13} />
              <span>{a.avgChunks.replace('{n}', String(data.documentsReady > 0 ? Math.round(data.totalChunks / data.documentsReady) : 0))}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-card-lg border border-border/50 shadow-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={16} className="text-sage-600" strokeWidth={1.75} />
          <SectionHeading>{a.engagement}</SectionHeading>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-body-xs text-ink-tertiary mb-0.5">{a.totalConversations}</p>
            <p className="text-display-sm font-bold text-ink">{data.totalConversations}</p>
          </div>
          <div>
            <p className="text-body-xs text-ink-tertiary mb-0.5">{a.totalMessages.replace(' {n} ', ' ').replace('{n}', '').trim()}</p>
            <p className="text-display-sm font-bold text-ink">{formatNumber(data.totalMessages, lang)}</p>
          </div>
          <div>
            <p className="text-body-xs text-ink-tertiary mb-0.5">{a.avgMsgs}</p>
            <p className="text-display-sm font-bold text-ink">
              {data.totalConversations > 0
                ? (data.totalMessages / data.totalConversations).toFixed(1)
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-body-xs text-ink-tertiary mb-0.5">{a.questionsToday}</p>
            <p className="text-display-sm font-bold text-ink">{data.questionsToday}</p>
          </div>
        </div>
      </div>

    </div>
  )
}

import {
  Users, MessageCircle, DollarSign, Zap, Crown, Stethoscope, Sparkles,
  Layers, HelpCircle, TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLANS } from '@/lib/stripe/plans'
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
          label="Total users"
          value={data.totalUsers}
          sub={`${paidUsers} paid`}
          icon={Users}
          accent="sage"
        />
        <StatCard
          label="Monthly revenue"
          value={`$${data.mrr} CAD`}
          sub="Recurring"
          icon={DollarSign}
          accent="sand"
        />
        <StatCard
          label="Conversations"
          value={data.totalConversations}
          sub={`${data.totalMessages} total messages`}
          icon={MessageCircle}
          accent="dblue"
        />
        <StatCard
          label="Questions today"
          value={data.questionsToday}
          sub="Across all users"
          icon={HelpCircle}
          accent="neutral"
        />
      </div>

      {/* Subscriptions + KB side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Subscription breakdown */}
        <div className="bg-white rounded-card-lg border border-border/50 shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <SectionHeading>Subscriptions</SectionHeading>
            <div className="text-right">
              <p className="text-display-sm font-bold text-ink">${data.mrr}</p>
              <p className="text-body-xs text-ink-tertiary">CAD / month</p>
            </div>
          </div>

          <div className="space-y-4">
            <PlanBar
              label="Free"
              count={data.planCounts.free}
              total={totalSubs}
              color="bg-ink-tertiary/30"
            />
            <PlanBar
              label={`Starter — $${PLANS.starter.priceCAD}/mo`}
              count={data.planCounts.starter}
              total={totalSubs}
              color="bg-dblue-400"
            />
            <PlanBar
              label={`Pro — $${PLANS.pro.priceCAD}/mo`}
              count={data.planCounts.pro}
              total={totalSubs}
              color="bg-sage-500"
            />
            <PlanBar
              label={`Clinician — $${PLANS.clinician.priceCAD}/mo`}
              count={data.planCounts.clinician}
              total={totalSubs}
              color="bg-sand-500"
            />
            {data.planCounts.petits_genies > 0 && (
              <PlanBar
                label="Petits Génies — sponsored"
                count={data.planCounts.petits_genies}
                total={totalSubs}
                color="bg-dblue-300"
              />
            )}
          </div>

          {/* Plan icon summary */}
          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border flex-wrap">
            <div className="flex items-center gap-1.5 text-body-xs text-ink-secondary">
              <div className="w-5 h-5 rounded-full bg-dblue-100 flex items-center justify-center">
                <Zap size={11} className="text-dblue-600" strokeWidth={2} />
              </div>
              <span className="font-medium">{data.planCounts.starter}</span> Starter
            </div>
            <div className="flex items-center gap-1.5 text-body-xs text-ink-secondary">
              <div className="w-5 h-5 rounded-full bg-sage-100 flex items-center justify-center">
                <Crown size={11} className="text-sage-600" strokeWidth={2} />
              </div>
              <span className="font-medium">{data.planCounts.pro}</span> Pro
            </div>
            <div className="flex items-center gap-1.5 text-body-xs text-ink-secondary">
              <div className="w-5 h-5 rounded-full bg-sand-100 flex items-center justify-center">
                <Stethoscope size={11} className="text-sand-600" strokeWidth={2} />
              </div>
              <span className="font-medium">{data.planCounts.clinician}</span> Clinician
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
                {totalSubs > 0
                  ? `${Math.round((paidUsers / totalSubs) * 100)}% paid`
                  : '0% paid'}
              </span>
            </div>
          </div>
        </div>

        {/* Knowledge base stats */}
        <div className="bg-white rounded-card-lg border border-border/50 shadow-card p-6">
          <SectionHeading>Knowledge Base</SectionHeading>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-surface rounded-card border border-border/50">
              <p className="text-body-xs text-ink-tertiary mb-1">Ready documents</p>
              <p className="text-display-sm font-bold text-ink">{data.documentsReady}</p>
            </div>
            <div className="p-4 bg-surface rounded-card border border-border/50">
              <p className="text-body-xs text-ink-tertiary mb-1">Total chunks</p>
              <p className="text-display-sm font-bold text-ink">{data.totalChunks.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-body-xs font-medium text-ink-secondary uppercase tracking-wide">By file type</p>
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
              <span>Avg {data.documentsReady > 0 ? Math.round(data.totalChunks / data.documentsReady) : 0} chunks per document</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement summary */}
      <div className="bg-white rounded-card-lg border border-border/50 shadow-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={16} className="text-sage-600" strokeWidth={1.75} />
          <SectionHeading>Engagement</SectionHeading>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-body-xs text-ink-tertiary mb-0.5">Total conversations</p>
            <p className="text-display-sm font-bold text-ink">{data.totalConversations}</p>
          </div>
          <div>
            <p className="text-body-xs text-ink-tertiary mb-0.5">Total messages</p>
            <p className="text-display-sm font-bold text-ink">{data.totalMessages.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-body-xs text-ink-tertiary mb-0.5">Avg msgs / convo</p>
            <p className="text-display-sm font-bold text-ink">
              {data.totalConversations > 0
                ? (data.totalMessages / data.totalConversations).toFixed(1)
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-body-xs text-ink-tertiary mb-0.5">Questions today</p>
            <p className="text-display-sm font-bold text-ink">{data.questionsToday}</p>
          </div>
        </div>
      </div>

    </div>
  )
}

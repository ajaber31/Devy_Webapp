import { Lock, FileCheck, AlertCircle } from 'lucide-react'
import { AnimateIn } from '@/components/shared/AnimateIn'

const testimonials = [
  {
    quote: "Every answer is grounded in real clinical evidence — either from Devy's knowledge base or peer-reviewed research. That kind of reliability changes everything. I can actually reference what Devy surfaces with my colleagues.",
    author: 'Maya T.',
    role: 'Occupational Therapist',
    initials: 'MT',
    color: 'bg-sage-200 text-sage-800',
  },
  {
    quote: "I can ask Devy a question at midnight when I'm worried about my son, and I know the answer is based on real clinical material — not something an AI invented. That peace of mind is genuinely invaluable.",
    author: 'James O.',
    role: 'Parent',
    initials: 'JO',
    color: 'bg-dblue-200 text-dblue-800',
  },
]

const trustPoints = [
  {
    icon: Lock,
    title: 'Vetted sources only',
    description: 'Devy draws exclusively from its clinician-curated knowledge base and peer-reviewed PubMed research. No unverified internet sources, ever.',
  },
  {
    icon: FileCheck,
    title: 'Every answer is grounded',
    description: 'Responses are built from real clinical material — either from the KB or from PubMed abstracts/full text. Never invented, never speculative.',
  },
  {
    icon: AlertCircle,
    title: 'Explicit about its limits',
    description: 'When information isn\'t in the knowledge base, Devy says so clearly and directly — rather than generating a plausible but unreliable answer.',
  },
]

export function TrustSection() {
  return (
    <section id="trust" className="py-24 bg-surface relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse at right top, rgba(92,134,81,0.1) 0%, transparent 60%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-[500px] h-[350px] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at left bottom, rgba(79,115,159,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <AnimateIn className="text-center mb-16">
          <p className="text-body-sm font-medium text-sage-600 uppercase tracking-wider mb-3">Trust &amp; safety</p>
          <h2 className="font-display text-display-lg font-bold text-ink tracking-tight mb-4">
            Trust isn&apos;t a feature. It&apos;s the foundation.
          </h2>
          <p className="text-body-lg text-ink-secondary max-w-xl mx-auto">
            When decisions affect a child&apos;s wellbeing, your tools need to be held to a higher standard. Devy is designed from the ground up for that accountability.
          </p>
        </AnimateIn>

        {/* Trust pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {trustPoints.map((point, i) => {
            const Icon = point.icon
            return (
              <AnimateIn key={point.title} delay={i * 100}>
                <div className="bg-white rounded-card-lg p-6 shadow-card border border-border/50 text-center h-full">
                  <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center mx-auto mb-4">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-display-sm font-semibold text-ink mb-2">{point.title}</h3>
                  <p className="text-body-sm text-ink-secondary leading-relaxed">{point.description}</p>
                </div>
              </AnimateIn>
            )
          })}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {testimonials.map((t, i) => (
            <AnimateIn key={t.author} delay={i * 120}>
              <div className="bg-white rounded-card-lg p-7 shadow-card border border-border/50 h-full flex flex-col">
                <div className="text-sand-500 text-3xl font-display leading-none mb-4" aria-hidden="true">&ldquo;</div>
                <blockquote className="text-body-base text-ink leading-relaxed mb-5 italic font-display flex-1">
                  {t.quote}
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center font-semibold text-body-xs flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-ink">{t.author}</p>
                    <p className="text-body-xs text-ink-tertiary">{t.role}</p>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>

        {/* Org trust marks */}
        <AnimateIn>
          <div className="text-center">
            <p className="text-body-xs text-ink-tertiary uppercase tracking-wider mb-6">Used by clinicians and educators at</p>
            <div className="flex items-center justify-center gap-8 flex-wrap opacity-50 grayscale">
              {['BrightPath Therapy', 'Sunrise School District', 'Cedar Valley SES', 'Family First Support'].map((org) => (
                <div key={org} className="px-4 py-2 bg-raised rounded-md">
                  <span className="text-body-xs font-semibold text-ink-secondary">{org}</span>
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}

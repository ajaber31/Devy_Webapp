import { Lock, FileCheck, AlertCircle } from 'lucide-react'

const testimonials = [
  {
    quote: "For the first time, I have a tool that doesn't just give me a confident-sounding answer — it shows me where the information comes from. That transparency changes everything as a clinician.",
    author: 'Maya T.',
    role: 'Occupational Therapist',
    initials: 'MT',
    color: 'bg-sage-200 text-sage-800',
  },
  {
    quote: "I can ask Devy a question at midnight when I'm worried about my son, and I know the answer is based on real clinical material — not something an AI made up. That peace of mind is invaluable.",
    author: 'James O.',
    role: 'Parent',
    initials: 'JO',
    color: 'bg-dblue-200 text-dblue-800',
  },
]

const trustPoints = [
  {
    icon: Lock,
    title: 'Your documents, your sources',
    description: 'Devy only draws from the specific knowledge base your organization uploads and approves. No external internet searches.',
  },
  {
    icon: FileCheck,
    title: 'Every answer is cited',
    description: 'Source cards appear beneath every AI response, showing the exact document, section, and page number used.',
  },
  {
    icon: AlertCircle,
    title: 'Clear about limitations',
    description: 'When information isn\'t available in the knowledge base, Devy says so explicitly rather than fabricating a response.',
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

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-body-sm font-medium text-sage-600 uppercase tracking-wider mb-3">Trust & safety</p>
          <h2 className="font-display text-display-lg font-bold text-ink tracking-tight mb-4">
            Trust isn&apos;t a feature. It&apos;s the foundation.
          </h2>
          <p className="text-body-lg text-ink-secondary max-w-xl mx-auto">
            When you&apos;re making decisions about a child&apos;s wellbeing, you need to be able to trust your tools. Devy is designed from the ground up for that.
          </p>
        </div>

        {/* Trust pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {trustPoints.map((point) => {
            const Icon = point.icon
            return (
              <div key={point.title} className="bg-white rounded-card-lg p-6 shadow-card border border-border/50 text-center">
                <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-display-sm font-semibold text-ink mb-2">{point.title}</h3>
                <p className="text-body-sm text-ink-secondary leading-relaxed">{point.description}</p>
              </div>
            )
          })}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {testimonials.map((t) => (
            <div key={t.author} className="bg-white rounded-card-lg p-7 shadow-card border border-border/50">
              <div className="text-sand-500 text-3xl font-display leading-none mb-4" aria-hidden="true">&ldquo;</div>
              <blockquote className="text-body-base text-ink leading-relaxed mb-5 italic font-display">
                {t.quote}
              </blockquote>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center font-semibold text-body-xs`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-ink">{t.author}</p>
                  <p className="text-body-xs text-ink-tertiary">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Org logos / trust marks */}
        <div className="text-center">
          <p className="text-body-xs text-ink-tertiary uppercase tracking-wider mb-6">Used by teams at</p>
          <div className="flex items-center justify-center gap-8 flex-wrap opacity-50 grayscale">
            {['BrightPath Therapy', 'Sunrise School District', 'Cedar Valley SES', 'Family First Support'].map((org) => (
              <div key={org} className="px-4 py-2 bg-raised rounded-md">
                <span className="text-body-xs font-semibold text-ink-secondary">{org}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

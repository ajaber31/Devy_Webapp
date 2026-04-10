import { Lock, FileCheck, AlertCircle, ShieldCheck, FlaskConical, BookOpen } from 'lucide-react'
import { AnimateIn } from '@/components/shared/AnimateIn'

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

        {/* Design principles */}
        <AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'No diagnosis, ever',
                body: 'Devy will never suggest, imply, or state a clinical diagnosis. Questions that require a diagnosis are always redirected to a qualified professional — no exceptions.',
              },
              {
                icon: FlaskConical,
                title: 'Built with clinical oversight',
                body: "Devy's knowledge base is curated by clinicians and continuously augmented with peer-reviewed PubMed research. Every response traces back to real, vetted material.",
              },
              {
                icon: BookOpen,
                title: 'Transparent about its limits',
                body: "When a question goes beyond what Devy knows with confidence, it says so. Intellectual honesty is built into the system — not bolted on as a disclaimer.",
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white rounded-card-lg p-6 shadow-card border border-border/50 flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-card bg-sage-100 text-sage-600 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="font-display text-display-sm font-semibold text-ink mb-1.5">{item.title}</h4>
                    <p className="text-body-sm text-ink-secondary leading-relaxed">{item.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}

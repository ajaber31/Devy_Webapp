import { AnimateIn } from '@/components/shared/AnimateIn'

const steps = [
  {
    number: '01',
    title: 'Ask in plain language',
    description:
      'Type your question the way you\'d ask a knowledgeable colleague — whether you\'re preparing for an IEP meeting, researching an intervention, or supporting a family at home. No clinical jargon required.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="17" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Devy searches trusted sources',
    description:
      'Devy searches its clinician-curated knowledge base first. If more depth is needed, it automatically queries PubMed for peer-reviewed abstracts — and adds them to the KB so future searches are even faster.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M20 20L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 11H14M11 8V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Get a clear, grounded answer',
    description:
      'You receive a calm, precise response drawn from real clinical evidence — translated into plain language. Sources are noted, and Devy is explicit when something lies outside its current knowledge base.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 9H16M8 13H13M8 17H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="18" cy="6" r="3" fill="#5C8651"/>
        <path d="M17 6L17.8 6.8L19.5 5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-canvas">
      <div className="max-w-6xl mx-auto px-6">
        <AnimateIn className="text-center mb-16">
          <p className="text-body-sm font-medium text-sage-600 uppercase tracking-wider mb-3">How it works</p>
          <h2 className="font-display text-display-lg font-bold text-ink tracking-tight mb-4">
            Simple to use. Trustworthy by design.
          </h2>
          <p className="text-body-lg text-ink-secondary max-w-xl mx-auto">
            Every response is built from real, vetted material — never invented. That commitment is baked into how Devy works at every step.
          </p>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-12 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px border-t-2 border-dashed border-border"
          />

          {steps.map((step, i) => (
            <AnimateIn key={step.number} delay={i * 120}>
              <div
                className="relative bg-white rounded-card-lg p-7 shadow-card hover:shadow-card-hover border border-border/60 group h-full"
                style={{
                  transitionProperty: 'box-shadow, transform',
                  transitionDuration: '200ms',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Step number — decorative */}
                <div
                  aria-hidden="true"
                  className="absolute top-5 right-6 font-display text-[4rem] font-bold text-sage-100 leading-none select-none pointer-events-none group-hover:text-sage-200"
                  style={{ transitionProperty: 'color', transitionDuration: '200ms' }}
                >
                  {step.number}
                </div>

                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-card bg-sage-100 text-sage-600 flex items-center justify-center mb-5 group-hover:bg-sage-200"
                    style={{ transitionProperty: 'background-color', transitionDuration: '200ms' }}
                  >
                    {step.icon}
                  </div>
                  <h3 className="font-display text-display-sm font-semibold text-ink mb-3">
                    {step.title}
                  </h3>
                  <p className="text-body-sm text-ink-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}

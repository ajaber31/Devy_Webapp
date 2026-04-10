import { ShieldCheck, BookOpen, MessageSquare, Clock, Users, Layers } from 'lucide-react'
import { AnimateIn } from '@/components/shared/AnimateIn'

const features = [
  {
    icon: ShieldCheck,
    title: 'Grounded, not guessed',
    description:
      'Every response is drawn from Devy\'s clinician-curated knowledge base or peer-reviewed PubMed research. Devy never fills gaps with plausible-sounding guesses — the kind of hallucination that makes other AI tools risky in clinical contexts.',
  },
  {
    icon: BookOpen,
    title: 'Self-expanding knowledge base',
    description:
      'When the knowledge base doesn\'t have an answer, Devy automatically searches PubMed, retrieves the relevant abstract or full text, and adds it to the KB — so subsequent queries on the same topic go straight to source.',
  },
  {
    icon: MessageSquare,
    title: 'Talk to it like a colleague',
    description:
      'Ask the way you think, not the way you\'d type a database query. Devy understands clinical context, follow-up questions, and nuanced phrasing — and responds in language calibrated to your role.',
  },
  {
    icon: Clock,
    title: 'Available when you need it most',
    description:
      'Support doesn\'t keep office hours. Whether you\'re a clinician preparing a report at 10pm or a parent navigating a difficult evening, Devy is there with grounded, reliable guidance.',
  },
  {
    icon: Users,
    title: 'One KB, continuously curated',
    description:
      'Our clinical team continuously expands and refines Devy\'s knowledge base with vetted resources. Every user draws from the same trusted, up-to-date sources — no siloed, stale data.',
  },
  {
    icon: Layers,
    title: 'Transparent about its limits',
    description:
      'When information isn\'t in the knowledge base and PubMed doesn\'t have a relevant result, Devy says so — clearly and without hedging. That honesty is a core feature, not a limitation.',
  },
]

export function WhyUseItSection() {
  return (
    <section className="py-24 bg-canvas">
      <div className="max-w-6xl mx-auto px-6">
        <AnimateIn className="text-center mb-16">
          <p className="text-body-sm font-medium text-sage-600 uppercase tracking-wider mb-3">Why Devy</p>
          <h2 className="font-display text-display-lg font-bold text-ink tracking-tight mb-4">
            Not just another chatbot.
          </h2>
          <p className="text-body-lg text-ink-secondary max-w-xl mx-auto">
            Most AI tools are built to sound confident. Devy is built to be trustworthy — and in clinical contexts, those are very different things.
          </p>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <AnimateIn key={feature.title} delay={i * 70}>
                <div
                  className="group flex gap-4 p-6 rounded-card-lg bg-white border border-border/60 shadow-card hover:shadow-card-hover h-full"
                  style={{
                    transitionProperty: 'box-shadow',
                    transitionDuration: '200ms',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-card bg-sage-100 text-sage-600 flex items-center justify-center group-hover:bg-sage-200"
                    style={{ transitionProperty: 'background-color', transitionDuration: '200ms' }}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-display text-[1.05rem] font-semibold text-ink mb-2 tracking-[-0.01em]">
                      {feature.title}
                    </h3>
                    <p className="text-body-sm text-ink-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </AnimateIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

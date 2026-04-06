import { ShieldCheck, BookOpen, MessageSquare, Clock, Users, Layers } from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Source-grounded answers',
    description:
      'Every response is drawn from your organization\'s vetted knowledge base. Devy never invents information or fills gaps with guesswork.',
  },
  {
    icon: BookOpen,
    title: 'Transparent citations',
    description:
      'Answers include clear source cards showing which document the information came from, including page references. You always know the basis of what you\'re reading.',
  },
  {
    icon: MessageSquare,
    title: 'Conversational and clear',
    description:
      'Ask questions the way you would talk to a knowledgeable colleague. No need for technical queries. Devy understands context and gives clear, practical answers.',
  },
  {
    icon: Clock,
    title: 'Available when you need it',
    description:
      'Support doesn\'t keep office hours. Get reliable guidance at 11pm when you\'re preparing for tomorrow\'s IEP meeting or dealing with a difficult evening.',
  },
  {
    icon: Users,
    title: 'Designed for your team',
    description:
      'Administrators can upload and manage the documents that inform Devy\'s knowledge base — so every team member draws from the same trusted sources.',
  },
  {
    icon: Layers,
    title: 'Honest when it doesn\'t know',
    description:
      'When information isn\'t in the knowledge base, Devy says so clearly — rather than speculating. That honesty is a core feature, not a limitation.',
  },
]

export function WhyUseItSection() {
  return (
    <section className="py-24 bg-canvas">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-body-sm font-medium text-sage-600 uppercase tracking-wider mb-3">Why Devy</p>
          <h2 className="font-display text-display-lg font-bold text-ink tracking-tight mb-4">
            Not just another chatbot.
          </h2>
          <p className="text-body-lg text-ink-secondary max-w-xl mx-auto">
            Most AI tools are built to sound confident. Devy is built to be trustworthy — and those are very different things.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group flex gap-4 p-6 rounded-card-lg bg-white border border-border/60 shadow-card hover:shadow-card-hover"
                style={{
                  transitionProperty: 'box-shadow',
                  transitionDuration: '200ms',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-card bg-sage-100 text-sage-600 flex items-center justify-center group-hover:bg-sage-200 transition-colors duration-200">
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
            )
          })}
        </div>
      </div>
    </section>
  )
}

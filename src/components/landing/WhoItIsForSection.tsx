import { AnimateIn } from '@/components/shared/AnimateIn'

// Clinicians first, then teachers, then parents, then support teams
const personas = [
  {
    title: 'Clinicians & Therapists',
    description:
      'Access evidence-based intervention frameworks, clinical guidelines, and literature summaries instantly. Spend less time searching databases and more time with your clients.',
    color: 'sage' as const,
    useCases: ['Intervention strategies', 'Clinical guidelines', 'Family psychoeducation', 'Progress documentation'],
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
        <path d="M14 3C14 3 7 6.5 7 14C7 18.97 10.13 23 14 23C17.87 23 21 18.97 21 14C21 6.5 14 3 14 3Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M11 13.5H17M14 10.5V16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Teachers & Educators',
    description:
      'Find classroom accommodation strategies, IEP goal templates, and behaviour support guidance rooted in current best practice. Support every student more effectively, every day.',
    color: 'dblue' as const,
    useCases: ['Classroom accommodations', 'IEP goal writing', 'Behaviour support plans', 'Transition planning'],
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="8" width="22" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 8V6C9 4.89543 9.89543 4 11 4H17C18.1046 4 19 4.89543 19 6V8" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 14H20M8 18H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Parents & Caregivers',
    description:
      'Get clear, compassionate guidance on your child\'s needs at home — at any hour. From sensory strategies to school advocacy, ask anything and receive grounded, practical answers.',
    color: 'sand' as const,
    useCases: ['Behaviour & regulation', 'Sensory support', 'Sleep & routines', 'School advocacy'],
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C14 4 8 8 8 14C8 17.31 10.69 20 14 20C17.31 20 20 17.31 20 14C20 8 14 4 14 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M7 22C7 22 9.5 20.5 14 20.5C18.5 20.5 21 22 21 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="14" cy="6" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    title: 'School Support Teams',
    description:
      'From psychologists to social workers and case managers — get fast, reliable answers to complex support questions without searching through stacks of documents.',
    color: 'neutral' as const,
    useCases: ['Multi-tiered support', 'Crisis de-escalation', 'Family communication', 'Resource coordination'],
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="7" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="21" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 22C4 18.69 6.69 16 10 16H18C21.31 16 24 18.69 24 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const colorMap = {
  sage:    { bg: 'bg-sage-100',   icon: 'text-sage-600',      accent: 'bg-sage-500',   ring: 'hover:ring-sage-200' },
  dblue:   { bg: 'bg-dblue-100',  icon: 'text-dblue-600',     accent: 'bg-dblue-500',  ring: 'hover:ring-dblue-200' },
  sand:    { bg: 'bg-sand-100',   icon: 'text-sand-500',      accent: 'bg-sand-500',   ring: 'hover:ring-sand-200' },
  neutral: { bg: 'bg-raised',     icon: 'text-ink-secondary', accent: 'bg-ink',        ring: 'hover:ring-border' },
}

export function WhoItIsForSection() {
  return (
    <section id="who-its-for" className="py-24 bg-surface relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 50% at 10% 50%, rgba(92,134,81,0.07) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 90% 50%, rgba(79,115,159,0.05) 0%, transparent 50%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <AnimateIn className="text-center mb-16">
          <p className="text-body-sm font-medium text-sage-600 uppercase tracking-wider mb-3">Who it&apos;s for</p>
          <h2 className="font-display text-display-lg font-bold text-ink tracking-tight mb-4">
            Built for everyone who shows up for these children.
          </h2>
          <p className="text-body-lg text-ink-secondary max-w-xl mx-auto">
            Whether you&apos;re in the clinic, the classroom, or at home at midnight — Devy meets you where you are, with answers you can trust.
          </p>
        </AnimateIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((persona, i) => {
            const colors = colorMap[persona.color]
            return (
              <AnimateIn key={persona.title} delay={i * 80}>
                <div
                  className={`bg-white rounded-card-lg p-6 shadow-card hover:shadow-card-hover border border-border/50 flex flex-col group ring-2 ring-transparent ${colors.ring} h-full`}
                  style={{
                    transitionProperty: 'box-shadow, ring-color',
                    transitionDuration: '200ms',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div
                    className={`w-12 h-12 rounded-card ${colors.bg} ${colors.icon} flex items-center justify-center mb-4 group-hover:scale-105`}
                    style={{ transitionProperty: 'transform', transitionDuration: '200ms', transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  >
                    {persona.icon}
                  </div>
                  <h3 className="font-display text-display-sm font-semibold text-ink mb-2">{persona.title}</h3>
                  <p className="text-body-sm text-ink-secondary leading-relaxed mb-4 flex-1">{persona.description}</p>
                  <ul className="space-y-1.5">
                    {persona.useCases.map((use) => (
                      <li key={use} className="flex items-center gap-2 text-body-xs text-ink-secondary">
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.accent} flex-shrink-0`} />
                        {use}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

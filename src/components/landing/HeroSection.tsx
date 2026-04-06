import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { NoiseTexture } from '@/components/shared/NoiseTexture'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero">
      <NoiseTexture opacity={0.025} />

      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="absolute top-24 right-[10%] w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(92,134,81,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-16 left-[5%] w-[400px] h-[400px] rounded-full opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(79,115,159,0.15) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Copy */}
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-sage-100 text-sage-700 rounded-pill text-body-xs font-medium mb-6 border border-sage-200">
            <ShieldCheck size={13} strokeWidth={2.5} />
            Evidence-based · Source-cited · Built for families
          </div>

          <h1 className="font-display text-display-xl font-bold text-ink leading-[1.08] tracking-[-0.03em] mb-6">
            Grounded answers for families who need&nbsp;
            <span className="italic text-sage-600">real</span> support.
          </h1>

          <p className="text-body-lg text-ink-secondary max-w-lg mb-8 leading-relaxed">
            Devy is an AI assistant designed for parents, caregivers, teachers, and clinicians supporting children with special needs. Every answer is grounded in trusted knowledge sources — and clearly shows where it came from.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sage-500 text-white font-medium text-body-base rounded-pill shadow-button hover:bg-sage-600 hover:shadow-button-hover active:scale-[0.98] focus-ring"
              style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
            >
              Start for free
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/70 text-ink font-medium text-body-base rounded-pill border border-border hover:bg-white shadow-card focus-ring"
              style={{ transitionProperty: 'background-color, box-shadow', transitionDuration: '150ms' }}
            >
              See how it works
            </a>
          </div>

          <div className="mt-10 flex items-center gap-6 flex-wrap">
            {[
              'No hallucination-prone responses',
              'All answers cite their sources',
              'Built with clinicians',
            ].map((point) => (
              <div key={point} className="flex items-center gap-2 text-body-sm text-ink-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0" />
                {point}
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="relative rounded-card-lg overflow-hidden shadow-floating bg-white">
            {/* Mock chat preview */}
            <div className="bg-surface px-5 py-4 border-b border-border flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-sage-400" />
              <span className="text-body-xs font-medium text-ink-secondary">Devy — Sensory processing strategies</span>
            </div>

            <div className="p-5 space-y-4">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-sage-500 text-white text-body-sm rounded-card rounded-br-sm px-4 py-3 shadow-button">
                  What strategies help with sensory overload at school?
                </div>
              </div>

              {/* AI message */}
              <div className="flex justify-start">
                <div className="max-w-[85%] space-y-3">
                  <div className="bg-surface text-ink text-body-sm rounded-card rounded-bl-sm px-4 py-3 shadow-card leading-relaxed">
                    There are several well-supported approaches. Proactive sensory diet activities in the morning, environmental modifications like reduced visual clutter, and clear transition warnings tend to have the strongest evidence base.
                  </div>

                  {/* Source card */}
                  <div className="bg-raised border border-border rounded-lg px-3.5 py-2.5 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded bg-sage-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-sage-600" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 4.5H8M5 7H9M5 9.5H7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M11 5L14 5M11 8H14M11 11H12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    </div>
                    <div>
                      <p className="text-body-xs font-medium text-ink">ASHA SPD Clinical Guidelines 2024</p>
                      <p className="text-body-xs text-ink-tertiary mt-0.5">Page 47 · Sensory Diet Section</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-border bg-canvas flex items-center gap-2">
              <div className="flex-1 bg-raised rounded-pill px-4 py-2 text-body-sm text-ink-tertiary">
                Ask a question…
              </div>
              <div className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none"><path d="M2 8H14M8.5 3.5L14 8L8.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-5 -left-5 bg-white rounded-card shadow-floating px-4 py-3 flex items-center gap-3 border border-border">
            <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center">
              <ShieldCheck size={16} className="text-sage-600" strokeWidth={2} />
            </div>
            <div>
              <p className="text-body-xs font-semibold text-ink">Source-grounded</p>
              <p className="text-body-xs text-ink-tertiary">Every answer cites its source</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

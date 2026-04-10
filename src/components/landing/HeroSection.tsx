import Link from 'next/link'
import { ArrowRight, FlaskConical } from 'lucide-react'
import { NoiseTexture } from '@/components/shared/NoiseTexture'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero">
      <NoiseTexture opacity={0.025} />

      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="absolute top-24 right-[8%] w-[560px] h-[560px] rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(92,134,81,0.18) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-16 left-[4%] w-[440px] h-[440px] rounded-full opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(79,115,159,0.15) 0%, transparent 70%)',
          filter: 'blur(55px)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(92,134,81,0.08) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Copy */}
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-sage-100 text-sage-700 rounded-pill text-body-xs font-medium mb-6 border border-sage-200">
            <FlaskConical size={13} strokeWidth={2.5} />
            Clinician-designed · PubMed-grounded · Evidence-based
          </div>

          <h1 className="font-display text-display-xl font-bold text-ink leading-[1.08] tracking-[-0.03em] mb-6">
            The clinical reference
            <br />
            you can actually{' '}
            <span className="italic text-sage-600">talk to.</span>
          </h1>

          <p className="text-body-lg text-ink-secondary max-w-lg mb-8 leading-relaxed">
            Devy gives clinicians, therapists, educators, and parents instant access to evidence-based guidance — grounded in a curated clinical knowledge base and peer-reviewed PubMed research. Ask in plain language. Get answers you can trust.
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
              'Trusted by clinicians & therapists',
              'Grounded in peer-reviewed research',
              'Never guesses — always sources',
            ].map((point) => (
              <div key={point} className="flex items-center gap-2 text-body-sm text-ink-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0" />
                {point}
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div
          className="relative animate-fade-up"
          style={{ animationDelay: '150ms' }}
        >
          {/* Subtle float */}
          <div
            className="relative rounded-card-lg overflow-hidden shadow-floating bg-white"
            style={{ animation: 'heroFloat 6s ease-in-out infinite' }}
          >
            {/* Mock chat header */}
            <div className="bg-surface px-5 py-4 border-b border-border flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-sage-400" />
              <span className="text-body-xs font-medium text-ink-secondary">Devy — Evidence-based strategies</span>
            </div>

            <div className="p-5 space-y-4">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[82%] bg-sage-500 text-white text-body-sm rounded-card rounded-br-sm px-4 py-3 shadow-button leading-relaxed">
                  What does the evidence say about supporting a child with dyspraxia in the classroom?
                </div>
              </div>

              {/* AI message */}
              <div className="flex justify-start">
                <div className="max-w-[88%] space-y-3">
                  <div className="bg-surface text-ink text-body-sm rounded-card rounded-bl-sm px-4 py-3.5 shadow-card leading-relaxed border border-border/40">
                    Research consistently supports a multi-modal approach: motor skill activities embedded in daily routines, reduced fine-motor demands with alternative outputs, and explicit instruction in task sequencing. Occupational therapy collaboration is strongly recommended.
                  </div>

                  {/* Research trust badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-sage-200 bg-sage-50 rounded-full text-xs font-medium text-sage-700">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1.5C4 1.5 2 4 2 7s2 5.5 5 5.5S12 10 12 7 10 1.5 7 1.5z" stroke="currentColor" strokeWidth="1.1" fill="none"/>
                      <path d="M5 7h4M7 5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    Grounded in clinical knowledge base + PubMed
                  </div>
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="px-5 py-3 border-t border-border bg-canvas flex items-center gap-2">
              <div className="flex-1 bg-raised rounded-pill px-4 py-2 text-body-sm text-ink-tertiary">
                Ask a question…
              </div>
              <div className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center flex-shrink-0 shadow-button">
                <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8H14M8.5 3.5L14 8L8.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div
            className="absolute -bottom-5 -left-5 bg-white rounded-card shadow-floating px-4 py-3 flex items-center gap-3 border border-border"
            style={{ animation: 'heroFloat 6s ease-in-out infinite', animationDelay: '1s' }}
          >
            <div className="w-8 h-8 rounded-full bg-dblue-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-dblue-600" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-body-xs font-semibold text-ink">PubMed-grounded</p>
              <p className="text-body-xs text-ink-tertiary">Peer-reviewed research</p>
            </div>
          </div>

          <div
            className="absolute -top-4 -right-4 bg-sage-500 text-white rounded-card shadow-floating px-3.5 py-2.5 flex items-center gap-2 border border-sage-600"
            style={{ animation: 'heroFloat 6s ease-in-out infinite', animationDelay: '2s' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-body-xs font-semibold">Evidence verified</p>
          </div>
        </div>
      </div>

      {/* Float keyframes */}
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  )
}

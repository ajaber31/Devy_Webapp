import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PricingSection } from '@/components/landing/PricingSection'
import { AnimateIn } from '@/components/shared/AnimateIn'

export const metadata = {
  title: 'Pricing — Devy',
  description: 'Simple, transparent pricing for families and professionals supporting children with special needs.',
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero heading above plans */}
        <section className="pt-20 pb-4 px-6 bg-canvas">
          <div className="max-w-3xl mx-auto text-center">
            <AnimateIn>
              <h1 className="font-display text-display-xl font-bold text-ink tracking-tight mb-4">
                Transparent pricing
              </h1>
              <p className="text-body-lg text-ink-secondary leading-relaxed">
                Choose the plan that fits your situation. Start free and upgrade when you&apos;re ready.
              </p>
            </AnimateIn>
          </div>
        </section>

        <PricingSection />
      </main>
      <Footer />
    </>
  )
}

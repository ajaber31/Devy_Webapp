import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PricingSection } from '@/components/landing/PricingSection'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { getLang } from '@/lib/i18n/server'
import { getT } from '@/lib/i18n'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const t = getT(lang)
  return {
    title: t.meta.pricing.title,
    description: t.meta.pricing.description,
  }
}

export default async function PricingPage() {
  const lang = await getLang()
  const t = getT(lang)
  const p = t.landing.pricingPage

  return (
    <>
      <Navbar lang={lang} />
      <main>
        <section className="pt-20 pb-4 px-6 bg-canvas">
          <div className="max-w-3xl mx-auto text-center">
            <AnimateIn>
              <h1 className="font-display text-display-xl font-bold text-ink tracking-tight mb-4">
                {p.heroHeading}
              </h1>
              <p className="text-body-lg text-ink-secondary leading-relaxed">
                {p.heroDescription}
              </p>
            </AnimateIn>
          </div>
        </section>

        <PricingSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  )
}

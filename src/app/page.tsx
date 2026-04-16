import { getLang } from '@/lib/i18n/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { WhoItIsForSection } from '@/components/landing/WhoItIsForSection'
import { WhyUseItSection } from '@/components/landing/WhyUseItSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { TrustSection } from '@/components/landing/TrustSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { CtaSection } from '@/components/landing/CtaSection'

export default async function LandingPage() {
  const lang = await getLang()

  return (
    <>
      <Navbar lang={lang} />
      <main>
        <HeroSection lang={lang} />
        <HowItWorksSection lang={lang} />
        <WhoItIsForSection lang={lang} />
        <WhyUseItSection lang={lang} />
        <PricingSection lang={lang} />
        <TrustSection lang={lang} />
        <FAQSection lang={lang} />
        <CtaSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  )
}

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { WhoItIsForSection } from '@/components/landing/WhoItIsForSection'
import { WhyUseItSection } from '@/components/landing/WhyUseItSection'
import { TrustSection } from '@/components/landing/TrustSection'
import { CtaSection } from '@/components/landing/CtaSection'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <WhoItIsForSection />
        <WhyUseItSection />
        <TrustSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  LegalLayout,
  LegalSection,
  LegalList,
  LegalCallout,
  LegalWarning,
  LegalContact,
} from '@/components/layout/LegalLayout'

import { getLang } from '@/lib/i18n/server'
import { getT } from '@/lib/i18n'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const t = getT(lang)
  return { title: t.meta.terms.title, description: t.meta.terms.description }
}

const TOC = [
  { id: 'acceptance',    label: '1. Acceptance of Terms' },
  { id: 'service',       label: '2. Service Description' },
  { id: 'accounts',      label: '3. Accounts & Eligibility' },
  { id: 'billing',       label: '4. Subscription & Billing' },
  { id: 'acceptable',    label: '5. Acceptable Use' },
  { id: 'ai-disclaimer', label: '6. AI Disclaimer' },
  { id: 'ip',            label: '7. Intellectual Property' },
  { id: 'privacy',       label: '8. Privacy' },
  { id: 'liability',     label: '9. Limitation of Liability' },
  { id: 'indemnity',     label: '10. Indemnification' },
  { id: 'governing-law', label: '11. Governing Law' },
  { id: 'termination',   label: '12. Termination' },
  { id: 'changes',       label: '13. Changes to Terms' },
  { id: 'contact',       label: '14. Contact Us' },
]

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using Devy. By creating an account or using our platform you agree to be bound by these Terms of Service and our Privacy Policy."
      lastUpdated="April 13, 2026"
      toc={TOC}
    >

      <LegalSection id="acceptance" title="1. Acceptance of Terms">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the Devy platform, including any websites, mobile applications, and AI-powered services operated by Devy (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By accessing or using Devy, you confirm that you are at least 18 years old and agree to these Terms. If you are using Devy on behalf of an organisation, you represent that you have authority to bind that organisation.
        </p>
        <p>
          If you do not agree to these Terms, do not use the platform.
        </p>
      </LegalSection>

      <LegalSection id="service" title="2. Service Description">
        <p>
          Devy is an AI-assisted informational platform designed to help parents, caregivers, clinicians, and teachers access evidence-based information to support children with special needs. Core features include:
        </p>
        <LegalList items={[
          'AI-powered chat grounded in a curated knowledge base and peer-reviewed research (PubMed).',
          'Child and client profile management to personalise AI responses.',
          'A shared knowledge base maintained by the Devy platform administrator.',
          'Conversation history stored per user account.',
        ]} />
        <LegalCallout icon="ℹ️">
          Devy is an <strong>informational tool only</strong>. It does not provide medical advice, diagnosis, clinical assessments, or treatment recommendations. Nothing on the platform constitutes a therapeutic or professional relationship between Devy and you or any child. Always consult a qualified healthcare professional for medical or clinical guidance.
        </LegalCallout>
        <p>
          We reserve the right to modify, suspend, or discontinue any part of the service at any time with reasonable notice where possible.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="3. Accounts & Eligibility">
        <p>
          To use Devy you must create an account. You agree to:
        </p>
        <LegalList items={[
          'Provide accurate and complete information at signup and keep it up to date.',
          'Keep your password confidential and not share your account credentials.',
          'Notify us immediately at privacy@devy.app if you suspect unauthorised access to your account.',
          'Be at least 18 years of age.',
          'Use the platform only in jurisdictions where doing so is legal.',
        ]} />
        <p>
          You are responsible for all activity that occurs under your account. Devy is not liable for loss or damage arising from your failure to protect your credentials.
        </p>
        <p>
          One individual per account. Creating multiple accounts to circumvent usage limits or platform restrictions is prohibited.
        </p>
      </LegalSection>

      <LegalSection id="billing" title="4. Subscription & Billing">
        <p>
          Devy offers subscription-based access to the platform. By subscribing, you agree to the following billing terms:
        </p>

        <p className="font-medium text-ink mt-4 mb-2">Subscription Plans</p>
        <p>
          Details of available plans, pricing, and included features are listed on the{' '}
          <Link href="/#pricing" className="text-sage-600 hover:text-sage-700 underline underline-offset-2 transition-colors duration-150">
            Pricing page
          </Link>. Prices are displayed in Canadian dollars (CAD) unless otherwise stated and are inclusive of applicable taxes.
        </p>

        <p className="font-medium text-ink mt-4 mb-2">Billing Cycle</p>
        <p>
          Subscriptions are billed on a recurring monthly or annual basis, depending on the plan selected. Your subscription renews automatically at the end of each billing period unless you cancel before the renewal date.
        </p>

        <p className="font-medium text-ink mt-4 mb-2">Payment Processing</p>
        <p>
          Payments are processed by Stripe, Inc. By providing your payment details, you authorise us to charge your payment method on a recurring basis. Devy never stores your full card number — all payment data is handled directly by Stripe under their PCI DSS Level 1 certification.
        </p>

        <p className="font-medium text-ink mt-4 mb-2">Price Changes</p>
        <p>
          We may change subscription prices with at least 30 days&apos; advance notice by email and in-app notification. Continued use after the price change takes effect constitutes acceptance of the new price. If you disagree, you may cancel before the change takes effect.
        </p>

        <p className="font-medium text-ink mt-4 mb-2">Cancellation</p>
        <p>
          You may cancel your subscription at any time from <strong>Settings → Billing</strong>. Cancellation takes effect at the end of your current billing period — you retain access until then. We do not provide prorated refunds for partial billing periods unless required by applicable law or specified in our{' '}
          <Link href="/refund" className="text-sage-600 hover:text-sage-700 underline underline-offset-2 transition-colors duration-150">
            Refund Policy
          </Link>.
        </p>

        <LegalWarning>
          Failure to pay may result in suspension or termination of your account. Overdue amounts may be subject to collection.
        </LegalWarning>
      </LegalSection>

      <LegalSection id="acceptable" title="5. Acceptable Use">
        <p>You agree not to use Devy to:</p>
        <LegalList items={[
          'Violate any applicable law or regulation, including Canadian privacy law (PIPEDA).',
          'Upload or transmit content that is defamatory, abusive, harassing, threatening, or otherwise objectionable.',
          'Attempt to gain unauthorised access to other users\' accounts or to Devy\'s backend systems.',
          'Use automated scripts, bots, scrapers, or crawlers to extract data from the platform.',
          'Circumvent, disable, or otherwise interfere with security features.',
          'Share, resell, or sublicense access to the platform without our written permission.',
          'Use the platform to provide services to third parties as if Devy were your own product (white-labelling) without a separate agreement.',
          'Abuse the AI system in ways designed to generate harmful, misleading, or inappropriate content.',
          'Enter false medical or clinical information intended to manipulate AI outputs.',
        ]} />
        <p>
          We reserve the right to suspend or terminate accounts that violate this section without refund.
        </p>
      </LegalSection>

      <LegalSection id="ai-disclaimer" title="6. AI Disclaimer">
        <LegalWarning>
          <strong>Devy is not a medical device and does not provide medical advice.</strong> AI-generated responses are for informational and educational purposes only. They do not constitute diagnosis, clinical assessment, treatment recommendation, or any other form of professional health advice.
        </LegalWarning>
        <p>
          You acknowledge that:
        </p>
        <LegalList items={[
          'AI responses may contain errors, inaccuracies, or outdated information.',
          'Responses grounded in PubMed research reflect the published literature at the time of retrieval and may not reflect the most current clinical guidance.',
          'No AI system — including Devy — can replace the judgment of a qualified healthcare professional who knows the specific circumstances of a child.',
          'Devy explicitly declines to provide specific diagnoses or medication recommendations, but you are responsible for how you interpret and act on any information provided.',
        ]} />
        <p>
          Always consult a qualified physician, psychologist, speech-language pathologist, occupational therapist, or other relevant health professional before making decisions about a child&apos;s care or education.
        </p>
      </LegalSection>

      <LegalSection id="ip" title="7. Intellectual Property">
        <p>
          All content, features, and functionality of the Devy platform — including but not limited to the software, design, text, graphics, logos, and the curated knowledge base — are owned by or licensed to Devy and are protected by Canadian and international copyright, trademark, and other intellectual property laws.
        </p>
        <p>
          You retain full ownership of the content you input into Devy (your messages, child profile notes, etc.). By using the service, you grant us a limited, non-exclusive licence to process that content solely as necessary to provide the service to you.
        </p>
        <p>
          You may not copy, reproduce, modify, distribute, or create derivative works from any part of the Devy platform without our prior written consent.
        </p>
      </LegalSection>

      <LegalSection id="privacy" title="8. Privacy">
        <p>
          Your use of Devy is also governed by our{' '}
          <Link href="/privacy" className="text-sage-600 hover:text-sage-700 underline underline-offset-2 transition-colors duration-150">
            Privacy Policy
          </Link>, which is incorporated into these Terms by reference. By using the platform, you consent to the collection and use of your information as described in the Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="9. Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable Canadian law:
        </p>
        <LegalList items={[
          'Devy provides the platform "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.',
          'Devy does not warrant that the service will be uninterrupted, error-free, or completely secure.',
          'Devy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the platform.',
          'In no event shall Devy\'s total aggregate liability to you exceed the amount you paid to Devy in the 12 months immediately preceding the claim.',
        ]} />
        <p>
          Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability. In such jurisdictions, our liability is limited to the maximum extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" title="10. Indemnification">
        <p>
          You agree to indemnify, defend, and hold harmless Devy and its affiliates, officers, and employees from any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with:
        </p>
        <LegalList items={[
          'Your access to or use of the platform.',
          'Your violation of these Terms.',
          'Your violation of any third-party right, including any intellectual property or privacy right.',
          'Any content you submit through the platform that causes harm to a third party.',
        ]} />
      </LegalSection>

      <LegalSection id="governing-law" title="11. Governing Law">
        <p>
          These Terms are governed by and construed in accordance with the laws of the <strong>Province of Ontario</strong> and the federal laws of <strong>Canada</strong> applicable therein, without regard to conflict of law principles.
        </p>
        <p>
          Any dispute arising from these Terms or your use of the platform shall be resolved exclusively in the courts of Ontario, Canada, and you consent to personal jurisdiction in those courts.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="12. Termination">
        <p>
          Either party may terminate the relationship under these Terms:
        </p>
        <LegalList items={[
          'You may delete your account at any time from Settings. Your subscription will continue until the end of the current billing period.',
          'We may suspend or terminate your account immediately if you violate these Terms, engage in abusive behaviour, or if required by law.',
          'We may terminate the service with 30 days\' notice for any other reason, with a prorated refund for prepaid unused periods.',
        ]} />
        <p>
          Upon termination, your right to access the platform ends. Sections of these Terms that by their nature should survive termination (including Sections 6, 7, 9, 10, and 11) shall survive.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="13. Changes to Terms">
        <p>
          We may update these Terms from time to time. When we make material changes, we will notify you by email and/or in-app notification at least 14 days before the changes take effect. The updated Terms will be posted on this page with a revised &ldquo;Last updated&rdquo; date.
        </p>
        <p>
          Continuing to use Devy after the effective date of revised Terms constitutes acceptance. If you do not agree to the changes, you may cancel your account before they take effect.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="14. Contact Us">
        <p>For questions about these Terms of Service:</p>
        <LegalContact />
        <div className="mt-4 flex items-center gap-4 text-body-xs text-ink-tertiary">
          <Link href="/privacy" className="hover:text-ink-secondary transition-colors duration-150">Privacy Policy</Link>
          <span>·</span>
          <Link href="/refund" className="hover:text-ink-secondary transition-colors duration-150">Refund Policy</Link>
        </div>
      </LegalSection>

    </LegalLayout>
  )
}

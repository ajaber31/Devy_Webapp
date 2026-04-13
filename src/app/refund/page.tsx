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

export const metadata: Metadata = {
  title: 'Refund Policy — Devy',
  description: 'Devy\'s cancellation and refund policy for subscriptions.',
}

const TOC = [
  { id: 'overview',     label: '1. Overview' },
  { id: 'model',        label: '2. Subscription Model' },
  { id: 'cancellation', label: '3. How to Cancel' },
  { id: 'eligibility',  label: '4. Refund Eligibility' },
  { id: 'process',      label: '5. Requesting a Refund' },
  { id: 'exceptions',   label: '6. Non-Refundable Situations' },
  { id: 'disputes',     label: '7. Disputes' },
  { id: 'contact',      label: '8. Contact Us' },
]

export default function RefundPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      subtitle="We want you to feel confident subscribing to Devy. This policy explains when and how you can cancel your subscription and request a refund."
      lastUpdated="April 13, 2026"
      toc={TOC}
    >

      <LegalSection id="overview" title="1. Overview">
        <p>
          Devy operates on a subscription basis. Because the platform provides immediate access to AI-powered features and a curated knowledge base from the moment you subscribe, refunds are handled on a case-by-case basis as described below. We aim to be fair and reasonable in all refund decisions.
        </p>
        <LegalCallout icon="💳">
          All billing is processed through <strong>Stripe</strong>. Refunds, when approved, are returned to the original payment method and typically appear within 5–10 business days depending on your bank or card issuer.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="model" title="2. Subscription Model">
        <p>
          Devy subscriptions are available on a <strong>monthly</strong> or <strong>annual</strong> basis:
        </p>
        <LegalList items={[
          'Monthly plans — billed once per month on the anniversary of your subscription start date.',
          'Annual plans — billed once per year. Annual subscriptions offer a discounted effective monthly rate.',
          'Subscriptions renew automatically unless cancelled before the renewal date.',
          'You will receive an email reminder before your annual plan renews.',
        ]} />
        <p>
          Plan details and current pricing are available on the{' '}
          <Link href="/#pricing" className="text-sage-600 hover:text-sage-700 underline underline-offset-2 transition-colors duration-150">
            Pricing page
          </Link>.
        </p>
      </LegalSection>

      <LegalSection id="cancellation" title="3. How to Cancel">
        <p>
          You may cancel your subscription at any time — no phone calls, no hoops. To cancel:
        </p>
        <LegalList items={[
          'Go to Settings → Billing in your Devy account.',
          'Click "Manage Subscription" and then "Cancel Plan".',
          'You will retain full access to the platform until the end of your current billing period.',
          'Your account data is preserved after cancellation. You may resubscribe at any time.',
        ]} />
        <p>
          Cancellation stops future charges. It does not automatically trigger a refund for the current period — see Section 4 for refund eligibility.
        </p>
        <LegalCallout icon="📧">
          You will receive a cancellation confirmation email immediately. If you do not receive it within a few minutes, check your spam folder or contact us to confirm your cancellation was processed.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="eligibility" title="4. Refund Eligibility">
        <p>
          We evaluate refund requests on the following basis:
        </p>

        <p className="font-medium text-ink mt-4 mb-2">Monthly subscriptions</p>
        <p>
          Monthly plans are generally non-refundable once the billing period has started, as access to the full platform is granted immediately upon payment. However, we will consider refund requests made within <strong>48 hours</strong> of a charge if you have not meaningfully used the service during that period (assessed at our reasonable discretion).
        </p>

        <p className="font-medium text-ink mt-4 mb-2">Annual subscriptions</p>
        <p>
          For annual plans, we offer a <strong>14-day full refund window</strong> from the date of initial purchase or renewal — no questions asked. After 14 days, we may offer a prorated refund for unused months at our discretion, particularly in cases of:
        </p>
        <LegalList items={[
          'A documented technical issue that prevented meaningful use of the platform for an extended period.',
          'A material change to the service that significantly reduces the value you signed up for.',
          'A billing error on our part.',
        ]} />

        <p className="font-medium text-ink mt-4 mb-2">Free trials (if applicable)</p>
        <p>
          If you are on a free trial, no charge is made until the trial ends. You may cancel at any time during the trial without being charged. If you forget to cancel and are charged, contact us within 7 days and we will refund you in full.
        </p>

        <LegalWarning>
          Refunds are not available simply because you changed your mind after actively using the service, or because you did not use the features you paid for during a billing period.
        </LegalWarning>
      </LegalSection>

      <LegalSection id="process" title="5. Requesting a Refund">
        <p>
          To request a refund:
        </p>
        <LegalList items={[
          'Email us at privacy@devy.app with the subject line "Refund Request".',
          'Include your account email address, the date of the charge, and a brief reason for the request.',
          'We will acknowledge your request within 1 business day and resolve it within 5 business days.',
          'If approved, the refund will be processed through Stripe to your original payment method.',
        ]} />
        <p>
          You do not need to cancel your subscription before requesting a refund — but if you no longer wish to use Devy, we recommend cancelling as well to avoid future charges.
        </p>
        <LegalContact />
      </LegalSection>

      <LegalSection id="exceptions" title="6. Non-Refundable Situations">
        <p>
          Refunds will generally not be issued in the following circumstances:
        </p>
        <LegalList items={[
          'You forgot to cancel before your subscription renewed — except for annual plans within 7 days of renewal.',
          'You used the platform during the billing period for which a refund is requested.',
          'Your account was suspended or terminated due to a violation of our Terms of Service.',
          'The refund request is made for a billing period older than 60 days.',
          'Partial refunds for unused portions of a monthly billing period.',
        ]} />
        <p>
          We reserve the right to deny refund requests that appear to abuse this policy (e.g., repeated subscribe-use-refund cycles).
        </p>
      </LegalSection>

      <LegalSection id="disputes" title="7. Disputes">
        <p>
          If you believe a charge was made in error, please contact us at privacy@devy.app <em>before</em> initiating a chargeback with your bank or card issuer. Most billing issues can be resolved quickly and directly.
        </p>
        <p>
          Filing a chargeback without first contacting us may result in immediate suspension of your account pending resolution. If a chargeback is found to be made in bad faith, we reserve the right to recover the charged amount plus any associated fees incurred by Stripe.
        </p>
        <p>
          All disputes are governed by the laws of the Province of Ontario, Canada. See our{' '}
          <Link href="/terms#governing-law" className="text-sage-600 hover:text-sage-700 underline underline-offset-2 transition-colors duration-150">
            Terms of Service
          </Link>{' '}
          for full governing law details.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="8. Contact Us">
        <p>For billing questions, cancellation help, or refund requests:</p>
        <LegalContact />
        <div className="mt-4 flex items-center gap-4 text-body-xs text-ink-tertiary">
          <Link href="/privacy" className="hover:text-ink-secondary transition-colors duration-150">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-ink-secondary transition-colors duration-150">Terms of Service</Link>
        </div>
      </LegalSection>

    </LegalLayout>
  )
}

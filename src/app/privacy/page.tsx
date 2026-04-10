import Link from 'next/link'
import { ShieldCheck, Leaf, ArrowLeft } from 'lucide-react'
import { CURRENT_CONSENT_VERSION } from '@/lib/types'

export const metadata = {
  title: 'Privacy Policy — Devy',
  description: 'How Devy collects, uses, and protects your personal information in accordance with PIPEDA and PHIPA.',
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-display-md font-bold text-ink mb-4 pb-3 border-b border-border">
        {title}
      </h2>
      <div className="space-y-4 text-body-sm text-ink-secondary leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc list-outside pl-5 space-y-1.5">{children}</ul>
}

const TOC = [
  { id: 'overview',         label: '1. Overview' },
  { id: 'who-we-are',      label: '2. Who We Are' },
  { id: 'what-we-collect', label: '3. What We Collect' },
  { id: 'how-we-use',      label: '4. How We Use Your Information' },
  { id: 'no-sale',         label: '5. We Do Not Sell Your Data' },
  { id: 'ai-processing',   label: '6. AI & Third-Party Processing' },
  { id: 'health-data',     label: '7. Health-Related Information (PHIPA)' },
  { id: 'retention',       label: '8. Data Retention' },
  { id: 'your-rights',     label: '9. Your Rights' },
  { id: 'security',        label: '10. Security' },
  { id: 'children',        label: '11. Children\'s Privacy' },
  { id: 'changes',         label: '12. Changes to This Policy' },
  { id: 'contact',         label: '13. Contact Us' },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-sage-400 via-sage-500 to-dblue-500" />

      {/* Nav */}
      <header className="sticky top-0 z-20 bg-canvas/90 backdrop-blur border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group focus-ring rounded">
            <div className="w-7 h-7 rounded-md bg-sage-500 flex items-center justify-center shadow-sm">
              <Leaf size={14} className="text-white" strokeWidth={2} />
            </div>
            <span className="font-display font-bold text-ink">Devy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-body-xs text-ink-secondary hover:text-ink font-medium focus-ring rounded px-1 transition-colors"
            >
              <ArrowLeft size={13} strokeWidth={2} />
              Back to app
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-16">

          {/* Sidebar TOC — desktop sticky */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck size={16} className="text-sage-500" strokeWidth={2} />
                <span className="font-display font-semibold text-ink text-body-sm">Contents</span>
              </div>
              <nav className="space-y-1">
                {TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-body-xs text-ink-tertiary hover:text-sage-600 py-1 focus-ring rounded px-1 transition-colors leading-snug"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="mt-8 p-4 bg-sage-50 border border-sage-200 rounded-xl">
                <p className="text-body-xs text-sage-700 font-medium mb-1">Policy version</p>
                <p className="font-mono text-body-xs text-sage-600">{CURRENT_CONSENT_VERSION}</p>
                <p className="text-body-xs text-ink-tertiary mt-2">Last updated April 2026</p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="space-y-12">

            {/* Hero */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-sage-100 text-sage-700 rounded-full px-3 py-1 text-body-xs font-semibold mb-4">
                <ShieldCheck size={12} strokeWidth={2.5} />
                PIPEDA · PHIPA-sensitive design
              </div>
              <h1 className="font-display text-display-2xl font-bold text-ink tracking-tight mb-3">
                Privacy Policy
              </h1>
              <p className="text-body-md text-ink-secondary max-w-xl leading-relaxed">
                This policy explains how Devy collects, uses, and protects your personal information. We are committed to handling your data with transparency and care, especially given that Devy is used alongside sensitive information about children.
              </p>
              <p className="text-body-xs text-ink-tertiary mt-3">
                Effective date: April 10, 2026 · Version: <span className="font-mono">{CURRENT_CONSENT_VERSION}</span>
              </p>
            </div>

            <Section id="overview" title="1. Overview">
              <P>
                Devy (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is an AI-powered informational support platform for parents, caregivers, clinicians, and teachers supporting children with special needs. This Privacy Policy governs the collection, use, and disclosure of personal information in connection with the Devy platform.
              </P>
              <P>
                Devy operates in compliance with the <strong className="text-ink">Personal Information Protection and Electronic Documents Act (PIPEDA)</strong>, Canada&apos;s federal private-sector privacy law. The platform is also designed with the principles of <strong className="text-ink">Ontario&apos;s Personal Health Information Protection Act (PHIPA)</strong> in mind, recognizing that some users may discuss health-related topics in the context of supporting children.
              </P>
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
                <p className="text-body-xs text-sand-700 font-semibold mb-1">Important limitation</p>
                <p className="text-body-xs text-sand-700">
                  Devy is an <strong>informational tool only</strong>. It does not provide medical advice, clinical assessments, or diagnoses. Nothing in this platform constitutes a therapeutic, clinical, or professional relationship. Always consult a qualified health professional for medical or clinical guidance.
                </p>
              </div>
            </Section>

            <Section id="who-we-are" title="2. Who We Are">
              <P>
                Devy is operated as a centralized platform with a single global administrator managing the shared knowledge base. The organization responsible for this platform is the data controller for all personal information collected through Devy.
              </P>
              <P>
                All data is stored in <strong className="text-ink">Canada (ca-central-1 region)</strong> to meet PIPEDA data residency expectations and to facilitate PHIPA-aligned data governance for Ontario users.
              </P>
              <P>
                For all privacy-related inquiries, contact: <a href="mailto:privacy@devy.ca" className="text-dblue-600 hover:underline">privacy@devy.ca</a>
              </P>
            </Section>

            <Section id="what-we-collect" title="3. What We Collect">
              <P>We collect the following categories of personal information:</P>
              <p className="font-medium text-ink">Account information</p>
              <UL>
                <li>Name and email address (provided at signup)</li>
                <li>Account type (parent, caregiver, clinician, teacher, or other)</li>
                <li>Password (hashed and managed by Supabase Auth — we never see plaintext passwords)</li>
                <li>Account creation timestamp and last sign-in time</li>
              </UL>
              <p className="font-medium text-ink mt-4">Child/client profiles (optional)</p>
              <UL>
                <li>First name of the child or client</li>
                <li>Date of birth (optional — age is derived client-side and not stored on the server)</li>
                <li>User-defined descriptive labels (e.g. learning style preferences, interests, routines)</li>
                <li>Free-form notes you choose to enter</li>
              </UL>
              <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 mt-2">
                <p className="text-body-xs text-sage-700">
                  <strong>Child profiles do not store structured clinical diagnoses.</strong> Any descriptive labels are user-generated organizational tags, not medical records. We encourage minimal information sharing — enter only what is helpful for generating relevant guidance.
                </p>
              </div>
              <p className="font-medium text-ink mt-4">Conversations and messages</p>
              <UL>
                <li>The text of messages you send to the Devy AI assistant</li>
                <li>AI responses and citations (knowledge base sources and PubMed references)</li>
                <li>Conversation titles and metadata (timestamps, associated child profile if selected)</li>
              </UL>
              <p className="font-medium text-ink mt-4">Usage and technical data</p>
              <UL>
                <li>Authentication logs managed by Supabase (IP address, timestamps)</li>
                <li>Consent records (timestamp and version of policy accepted)</li>
                <li>Privacy audit events (data export requests, deletion requests)</li>
              </UL>
            </Section>

            <Section id="how-we-use" title="4. How We Use Your Information">
              <P>We use your personal information only for the following purposes:</P>
              <UL>
                <li><strong className="text-ink">Providing the service:</strong> Generating AI-powered responses relevant to the child profiles and questions you provide.</li>
                <li><strong className="text-ink">Account management:</strong> Authentication, session management, account recovery, and role-based access control.</li>
                <li><strong className="text-ink">Service improvement:</strong> Aggregated, de-identified analytics to understand how the platform is used. We do not use individual conversation content for this purpose.</li>
                <li><strong className="text-ink">Safety and abuse prevention:</strong> Rate limiting, fraud detection, and enforcement of our terms of service.</li>
                <li><strong className="text-ink">Legal compliance:</strong> Meeting our obligations under PIPEDA, PHIPA, and applicable Canadian law, including breach notification requirements.</li>
                <li><strong className="text-ink">Privacy audit trail:</strong> Recording consent events and data subject requests for accountability and compliance purposes.</li>
              </UL>
              <P>
                <strong className="text-ink">We do not use your conversation content or child profile data to train AI models.</strong> Conversations are processed in real-time through the OpenAI API under a data processing agreement and are not retained by OpenAI for training purposes under our agreement.
              </P>
            </Section>

            <Section id="no-sale" title="5. We Do Not Sell Your Data">
              <P>
                Devy does not sell, rent, trade, or otherwise transfer your personal information to third parties for commercial purposes. This applies to all personal information, including child profile information and conversation content.
              </P>
              <P>We share information with third parties only in the following limited circumstances:</P>
              <UL>
                <li><strong className="text-ink">Supabase Inc.:</strong> Database hosting, authentication, and file storage. Data is stored in the ca-central-1 AWS region (Canada). Supabase acts as a data processor under our data processing agreement.</li>
                <li><strong className="text-ink">OpenAI:</strong> Chat message content is transmitted to OpenAI&apos;s API to generate responses. OpenAI processes this data as a data processor under our agreement and does not use it for model training. Refer to OpenAI&apos;s enterprise data usage policies for details.</li>
                <li><strong className="text-ink">National Center for Biotechnology Information (NCBI/PubMed):</strong> Anonymized search queries may be sent to the PubMed API to retrieve research citations. No personal information is transmitted.</li>
                <li><strong className="text-ink">Legal requirements:</strong> We may disclose information if required by law, court order, or to protect the safety of individuals.</li>
              </UL>
            </Section>

            <Section id="ai-processing" title="6. AI & Third-Party Processing">
              <P>
                Devy uses OpenAI&apos;s GPT-4o model to generate responses. When you send a message:
              </P>
              <UL>
                <li>Your message text and, if selected, the child&apos;s name and descriptive labels from their profile are transmitted to OpenAI&apos;s API.</li>
                <li>Relevant excerpts from Devy&apos;s knowledge base and/or PubMed research are included as context.</li>
                <li>The AI response is returned and stored in your conversation history on our servers (in Canada).</li>
              </UL>
              <P>
                We recommend avoiding the inclusion of highly sensitive personal health identifiers (e.g., full legal names combined with specific diagnoses) in message content. Use the child profile descriptive labels sparingly and only as needed to improve response relevance.
              </P>
            </Section>

            <Section id="health-data" title="7. Health-Related Information (PHIPA)">
              <P>
                If you are an Ontario health information custodian (as defined under PHIPA — e.g., a physician, registered nurse, or regulated health professional), you should be aware of the following:
              </P>
              <UL>
                <li>Devy is not a health information custodian. It is an informational support tool.</li>
                <li>We do not store personal health information (PHI) as defined under PHIPA in structured clinical records.</li>
                <li>Child profiles are designed to hold organizational labels and notes, not clinical records. We strongly recommend against entering formal diagnoses, clinical assessments, or treatment plans.</li>
                <li>If you are subject to PHIPA obligations, you should assess whether and how Devy fits within your privacy management framework before use.</li>
              </UL>
              <div className="bg-dblue-50 border border-dblue-200 rounded-xl p-4 mt-2">
                <p className="text-body-xs text-dblue-700 font-semibold mb-1">Recommendation for health professionals</p>
                <p className="text-body-xs text-dblue-700">
                  Use Devy for general informational queries. Do not enter patient identifiers, formal diagnoses, or clinical notes. If you have questions about using Devy within a regulated clinical environment, contact us at <a href="mailto:privacy@devy.ca" className="underline">privacy@devy.ca</a> to discuss appropriate safeguards.
                </p>
              </div>
              <P>
                We maintain an internal incident log and are committed to notifying affected individuals and reporting to the applicable Commissioner (OPC for PIPEDA; IPC for PHIPA) in the event of a breach that presents a real risk of significant harm, as required by law.
              </P>
            </Section>

            <Section id="retention" title="8. Data Retention">
              <P>We retain your information for as long as your account is active or as needed to provide services. Specific retention periods:</P>
              <UL>
                <li><strong className="text-ink">Account information:</strong> Retained until account deletion, plus 30 days for backup purge cycles.</li>
                <li><strong className="text-ink">Child profiles:</strong> Deleted when you delete the profile or when your account is deleted.</li>
                <li><strong className="text-ink">Conversations and messages:</strong> Retained until you delete the conversation or your account. You may delete individual conversations at any time from the chat interface.</li>
                <li><strong className="text-ink">Privacy audit log:</strong> Retained for 7 years for compliance accountability. This log is anonymized upon account deletion (user_id set to NULL, personal identifiers removed).</li>
                <li><strong className="text-ink">Authentication logs:</strong> Managed by Supabase Auth per their retention policies (generally 90 days).</li>
              </UL>
            </Section>

            <Section id="your-rights" title="9. Your Rights">
              <P>Under PIPEDA, you have the right to:</P>
              <UL>
                <li><strong className="text-ink">Access:</strong> Request a copy of the personal information we hold about you.</li>
                <li><strong className="text-ink">Correction:</strong> Request correction of inaccurate personal information.</li>
                <li><strong className="text-ink">Withdrawal of consent:</strong> Withdraw your consent to processing (this may affect your ability to use the platform).</li>
                <li><strong className="text-ink">Deletion (erasure):</strong> Request deletion of your account and all associated personal data. You can initiate this from <strong>Settings → Privacy & Data</strong>.</li>
                <li><strong className="text-ink">Data export:</strong> Request a portable copy of your data in a structured format. Available from <strong>Settings → Privacy & Data</strong>.</li>
                <li><strong className="text-ink">Complaint:</strong> Lodge a complaint with the Office of the Privacy Commissioner of Canada (OPC) at <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer" className="text-dblue-600 hover:underline">priv.gc.ca</a> or, for Ontario health privacy matters, the Information and Privacy Commissioner of Ontario (IPC) at <a href="https://www.ipc.on.ca" target="_blank" rel="noopener noreferrer" className="text-dblue-600 hover:underline">ipc.on.ca</a>.</li>
              </UL>
              <P>
                To exercise any of these rights, use the tools in <strong className="text-ink">Settings → Privacy & Data</strong> or contact us at <a href="mailto:privacy@devy.ca" className="text-dblue-600 hover:underline">privacy@devy.ca</a>. We will respond within 30 days.
              </P>
            </Section>

            <Section id="security" title="10. Security">
              <P>We implement technical and organizational measures to protect your personal information:</P>
              <UL>
                <li>All data is encrypted in transit (TLS) and at rest (AES-256 via Supabase/AWS).</li>
                <li>Row-level security policies ensure users can only access their own records.</li>
                <li>Admin access to user data requires separate privileged authentication.</li>
                <li>API keys and service credentials are never exposed to the browser or client-side code.</li>
                <li>Rate limiting is applied to all public-facing API endpoints to prevent abuse.</li>
                <li>We maintain an internal security incident log and follow a documented breach response procedure.</li>
              </UL>
              <P>
                Despite these measures, no system is completely secure. If you discover a security vulnerability, please report it responsibly to <a href="mailto:security@devy.ca" className="text-dblue-600 hover:underline">security@devy.ca</a>.
              </P>
            </Section>

            <Section id="children" title="11. Children's Privacy">
              <P>
                Devy is a platform for adults (parents, caregivers, clinicians, and teachers). We do not knowingly collect personal information directly from children under 13. Children do not have accounts on Devy — only the adult caregivers and professionals supporting them do.
              </P>
              <P>
                Child profile information entered by adult users is subject to this Privacy Policy. We encourage entering only the minimum information needed to generate relevant AI guidance.
              </P>
            </Section>

            <Section id="changes" title="12. Changes to This Policy">
              <P>
                We may update this Privacy Policy from time to time. When we make material changes, we will:
              </P>
              <UL>
                <li>Update the version identifier and effective date at the top of this page.</li>
                <li>Require all users to re-read and re-consent to the updated policy before accessing the platform.</li>
                <li>Record the new consent event in your privacy audit log.</li>
              </UL>
              <P>
                Non-material changes (typos, clarifications, formatting) will not require re-consent but will be documented with an updated version number.
              </P>
            </Section>

            <Section id="contact" title="13. Contact Us">
              <P>
                For all privacy-related inquiries, requests, or complaints:
              </P>
              <div className="bg-surface border border-border rounded-xl p-5 not-prose">
                <p className="font-display font-semibold text-ink mb-3">Privacy Officer — Devy</p>
                <div className="space-y-1.5 text-body-sm text-ink-secondary">
                  <p>Email: <a href="mailto:privacy@devy.ca" className="text-dblue-600 hover:underline">privacy@devy.ca</a></p>
                  <p>Security: <a href="mailto:security@devy.ca" className="text-dblue-600 hover:underline">security@devy.ca</a></p>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-body-xs text-ink-tertiary">We aim to respond to all privacy requests within <strong className="text-ink-secondary">30 calendar days</strong> in accordance with PIPEDA requirements.</p>
                </div>
              </div>
            </Section>

            {/* Footer nav */}
            <div className="pt-8 border-t border-border flex items-center justify-between">
              <Link
                href="/consent"
                className="text-body-xs text-ink-secondary hover:text-ink focus-ring rounded px-1 transition-colors"
              >
                ← Back to consent
              </Link>
              <p className="text-body-xs text-ink-tertiary">
                Policy version <span className="font-mono">{CURRENT_CONSENT_VERSION}</span>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

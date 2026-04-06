import type { Message } from '@/lib/types'

export const mockMessages: Message[] = [
  {
    id: 'm1',
    conversationId: 'c1',
    role: 'user',
    content: 'What are the best ways to introduce weighted blankets for a 7-year-old with sensory processing differences? She tends to resist new sensory tools at first.',
    createdAt: '2026-04-06T10:10:00Z',
  },
  {
    id: 'm2',
    conversationId: 'c1',
    role: 'assistant',
    content: `Introducing weighted blankets to a child who is initially resistant to sensory tools requires a gradual, child-led approach. Here are evidence-based strategies that tend to work well:

**Start with choice and control.** Let her choose where the blanket goes first — perhaps over her legs during a quiet activity she already enjoys, rather than at bedtime when resistance may be highest.

**Pair it with preferred activities.** Introduce the blanket during screen time, a puzzle, or story time. The positive association helps reduce the novelty response.

**Begin with shorter durations.** Start with 5–10 minutes and build up. Remove the blanket if she signals discomfort — this builds trust in the tool rather than creating a negative association.

**Consider weight selection carefully.** The commonly cited guideline is approximately 10% of body weight, though individual responses vary. Consult with her occupational therapist for a personalized recommendation.`,
    createdAt: '2026-04-06T10:11:00Z',
    sources: [
      {
        id: 's1',
        title: 'Weighted Blanket Use in Pediatric Sensory Processing',
        documentName: 'ASHA SPD Clinical Guidelines 2024.pdf',
        pageNumber: 47,
        excerpt: 'Child-led introduction with preferred activity pairing showed a 73% acceptance rate versus 41% for caregiver-initiated introduction in children ages 5–10 with SPD.',
      },
      {
        id: 's2',
        title: 'Sensory Diet Activity Handbook — Sleep Tools Section',
        documentName: 'Sensory Diet Activity Handbook.pdf',
        pageNumber: 112,
        excerpt: 'Graduated exposure using a desensitization ladder is recommended for children who exhibit initial aversion to deep pressure tools.',
      },
    ],
  },
  {
    id: 'm3',
    conversationId: 'c1',
    role: 'user',
    content: 'Should we involve her occupational therapist in this, or is it something we can try at home first?',
    createdAt: '2026-04-06T10:14:00Z',
  },
  {
    id: 'm4',
    conversationId: 'c1',
    role: 'assistant',
    content: `Both approaches have merit, and the best path depends on a few factors.

**Trying at home first** is reasonable if her OT has already assessed her sensory profile and given general guidance around deep pressure tools. Many families start independently with weighted lap pads (a lower-commitment option) before committing to a full blanket.

**Involving her OT first** is recommended if:
- She has a complex sensory profile with mixed sensitivities (both seeking and avoiding behaviors)
- You're unsure about weight selection
- Previous sensory tool introductions have been distressing for her

In either case, I'd suggest briefly mentioning it to her OT at the next appointment — they can confirm the approach fits her current sensory diet and flag any contraindications.`,
    createdAt: '2026-04-06T10:16:00Z',
    sources: [
      {
        id: 's3',
        title: 'OT Collaboration in Home Sensory Programs',
        documentName: 'ASHA SPD Clinical Guidelines 2024.pdf',
        pageNumber: 62,
        excerpt: 'Home implementation with OT guidance demonstrated better outcomes than either professional-only or unsupported home introduction.',
      },
    ],
    notFoundNote: 'Specific guidelines on home-versus-clinic introduction sequencing were not found in the current materials. The above is based on general clinical principles in the uploaded documents.',
  },
]

export const mockResponses: Message[] = [
  {
    id: 'r1',
    conversationId: 'active',
    role: 'assistant',
    content: `That's a thoughtful question. Based on the materials in this knowledge base, here's what the evidence suggests:

The approach depends on the child's individual profile, but some general principles apply across most situations. Starting with the least restrictive, most naturalistic intervention tends to yield better long-term outcomes.

It's also worth noting that consistency across environments — home, school, and therapy settings — is consistently identified as one of the strongest predictors of success.`,
    createdAt: new Date().toISOString(),
    sources: [
      {
        id: 'rs1',
        title: 'Evidence-Based Practice Framework',
        documentName: 'ASHA SPD Clinical Guidelines 2024.pdf',
        pageNumber: 18,
        excerpt: 'Consistency of strategy implementation across environments was the single strongest predictor of behavioral outcomes across 12 longitudinal studies reviewed.',
      },
    ],
  },
  {
    id: 'r2',
    conversationId: 'active',
    role: 'assistant',
    content: `There are several well-supported strategies in the literature for this. The key is individualization — what works for one child may not work for another, even with similar diagnoses.

Here are the main approaches supported by the documents in this knowledge base:

1. **Environmental modifications** — adjusting the physical space to reduce triggering stimuli
2. **Visual supports** — structured schedules and advance warning of transitions
3. **Regulation strategies** — proactive sensory diet activities earlier in the day
4. **Communication supports** — ensuring the child has a reliable way to signal distress before it escalates`,
    createdAt: new Date().toISOString(),
    sources: [
      {
        id: 'rs2',
        title: 'Behavior Support Planning Essentials',
        documentName: 'Behavior Support Plans — Template Library.pdf',
        pageNumber: 34,
        excerpt: 'Multi-component intervention plans that address antecedents, teaching replacement behaviors, and environmental modifications show significantly better outcomes than single-strategy approaches.',
      },
    ],
    notFoundNote: 'Medication-related questions fall outside the scope of the current knowledge base materials.',
  },
]

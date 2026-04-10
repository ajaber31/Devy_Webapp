# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Next.js dev server at http://localhost:3000
npm run build    # Production build (type-checks + exports)
npm run lint     # ESLint via next lint
```

TypeScript type-check without building: `npx tsc --noEmit`

## App Structure

**Next.js 14 App Router** with two route groups:
- `src/app/(dashboard)/` — authenticated user routes (dashboard, chat, children, resources, settings). Shared layout: `Sidebar` + `MobileSidebar`.
- `src/app/(admin)/` — admin-only routes (`/admin/documents`, `/admin/users`). Layout checks `getProfile()` and redirects non-admins.
- `src/app/` root — public pages (`/`, `/login`, `/signup`) and API routes under `src/app/api/`.

**Key architectural split:**
- Pages are Server Components; data-fetching at page level via Server Actions.
- Client interactivity in `*Client.tsx` co-located files or `src/components/`.
- `src/middleware.ts` — session refresh + auth redirect for all protected routes.

**Component folders under `src/components/`:**
- `chat/` — ChatArea, ConversationSidebar, ProfileSelector, MessageBubble, ResearchBadge
- `children/` — AddChildModal, ChildCard, ChildProfileHeader
- `dashboard/` — WelcomeBanner, QuickActions, RecentConversations, StatCard, PrivacyNotice
- `admin/` — DocumentUploadZone, DocumentTable, StatusBadge, UserTable
- `settings/` — ProfileSection, AppearanceSection, AiTrustSection
- `landing/` — HeroSection, WhoItIsForSection, HowItWorksSection, TrustSection, CtaSection
- `layout/` — Navbar, Sidebar, Footer, MobileSidebar
- `shared/` — DevyLogo, EmptyState, NoiseTexture, PageHeader
- `ui/` — shadcn/radix primitives (button, dialog, select, tabs, etc.)

## Brand Tokens (Tailwind)

**Color palette** (never use default Tailwind indigo/blue):
- `sage` (50–900) — primary green brand color; `sage-500` = `#5C8651`
- `dblue` (50–900) — secondary blue; `dblue-500` = `#4F739F`
- `sand` (100–500) — warm accent; `sand-500` = `#B87333`
- `canvas` / `surface` / `raised` / `border` / `muted` — neutral surface scale
- `ink` / `ink-secondary` / `ink-tertiary` — text scale

**Typography:**
- `font-display` → Lora (serif, headings)
- `font-body` → Inter (sans, body)
- Use `text-display-2xl` through `text-display-sm` for headings (custom scale with tight tracking pre-applied)

**Named shadows:** `shadow-card`, `shadow-card-hover`, `shadow-elevated`, `shadow-floating`, `shadow-input`, `shadow-button`

**Named gradients:** `bg-gradient-hero`, `bg-gradient-cta`, `bg-gradient-sidebar`, `bg-gradient-card`

**Easing:** `ease-spring` (overshoot), `ease-smooth` (standard)

**Animations:** `animate-bounce-dot`, `animate-fade-up`, `animate-fade-in`

---

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.
- **Invoke the `ui-ux-pro-max` skill** (if available) alongside `frontend-design` for enhanced design quality.

## Product Model
Devy is a **centralized platform** — one global admin manages the shared knowledge base for all users. Regular users are parents, caregivers, clinicians, and teachers. The core UX centers around **child profiles**.

## Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login |
| `/signup` | Signup with account type selector |
| `/dashboard` | User dashboard |
| `/children` | Children list (regular users) |
| `/children/[id]` | Individual child profile |
| `/chat` | Conversations (accepts `?childId` + `?childName` + `?conversationId` query params) |
| `/resources` | Internal — not linked from nav |
| `/settings` | Profile, appearance, AI & Trust |
| `/admin/documents` | Global Knowledge Base (admin only) |
| `/admin/users` | Platform Users (admin only) |

## Reference Images
- If provided: match layout, spacing, typography, and color exactly. Use `https://placehold.co/` for images. Do not improve or add to the design.
- If none: design from scratch with high craft (see guardrails below).
- Screenshot → compare → fix → re-screenshot. Minimum 2 rounds. Stop only when no visible differences remain.

## Local Server
- Always serve on localhost — never screenshot a `file:///` URL.
- `npm run dev` runs at `http://localhost:3000`. Do not start a second instance if already running.

---

## Supabase

**Project:** `sitzizsdkcfywflbcwar` · Region: `ca-central-1` (PIPEDA) · URL: `https://sitzizsdkcfywflbcwar.supabase.co`

### Database Schema
| Table | Purpose |
|-------|---------|
| `profiles` | Extends `auth.users`. Stores name, role, status. |
| `children` | User-owned child profiles. `context_labels` (freeform strings, not diagnoses). DOB optional. |
| `conversations` | Per-user chat sessions, optionally linked to a child. |
| `messages` | Per-conversation messages. JSONB `sources` field. |
| `documents` | Uploaded file metadata, status, storage path, tags. |
| `document_chunks` | Text chunks + `vector(1536)` embeddings for semantic search. |

### Auth Flow
- Signup → email confirmation → login → session cookie via `@supabase/ssr` → middleware refreshes each request
- Admin role check in `(admin)/layout.tsx` via `getProfile()` (not middleware)

### Server Actions (`src/lib/actions/`)
`auth.ts` · `profile.ts` · `children.ts` · `conversations.ts` · `documents.ts`

### Supabase Client Files
| File | Usage |
|------|-------|
| `src/lib/supabase/client.ts` | Browser components (`createBrowserClient`) |
| `src/lib/supabase/server.ts` | Server components & Actions (`createServerClient`) |
| `src/lib/supabase/middleware.ts` | Middleware only |
| `src/lib/supabase/database.types.ts` | TypeScript DB types |

### User Roles
- `parent` / `caregiver` / `clinician` / `teacher` — regular users
- `admin` — global platform admin, unlocks `/admin/*`
- Set at signup from `accountType`, stored in `profiles.role`

### RLS Rule — `public.get_user_role()`
Any RLS policy on `profiles` checking the user's role **must** use `public.get_user_role()`, never a bare `SELECT FROM profiles` subquery — causes `42P17: infinite recursion`.

```sql
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;
```

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://sitzizsdkcfywflbcwar.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<in .env.local>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OPENAI_API_KEY=sk-...                   # embeddings + chat completions
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # server-only — NEVER prefix NEXT_PUBLIC_
```

---

## AI Architecture

### Document Ingestion
```
Admin uploads → Storage bucket "documents" → createDocumentRecord() → POST /api/documents/[id]/process
  → extractText() (pdf-parse / mammoth / utf-8)
  → chunkText() (paragraph-aware sliding window)
  → generateEmbeddings() (text-embedding-3-small)
  → INSERT document_chunks in batches of 50 → status: ready
```

### Chat Flow
```
POST /api/chat { message, conversationId, childId, childName }
  → Auth check → load last 6 messages history
  → searchChunks(message, { topK: 8 }) via match_chunks RPC (threshold: 0.10)
  → if 0 KB results + not conversational → searchPubMed(toPubMedQuery(message))
      → grounded response from PubMed context
      → fire-and-forget ingestPubMedSources() → grows KB for future queries
  → buildSystemPrompt(childName?) + buildContextBlock(chunks)
  → gpt-4o (temperature: 0.1 with context, 0.3 without)
  → return { content, sources, notFoundNote? } → insertMessage() → persisted to DB
```

### AI Philosophy — "Knowledgeable Friend"
- Always gives a real, useful response — never refuses
- With KB/PubMed context: answer from that research (temp 0.1)
- Without context: answer from GPT-4o trained knowledge (temp 0.3)
- Hard limits: no specific diagnosis, no medication prescribing, clinical disclaimer on health topics
- `ResearchBadge` shows trust signal: sage = KB source, dblue = PubMed

### Key AI Files
| File | Purpose |
|------|---------|
| `src/lib/ai/prompt-builder.ts` | System prompt, context block, source deduplication |
| `src/lib/ai/pubmed.ts` | PubMed E-utilities + PMC full-text fetch |
| `src/lib/ai/pubmed-ingest.ts` | Dedup + chunk + embed + store PubMed results to KB |
| `src/lib/document-processing/` | parser, chunker, embedder, retrieval |
| `src/app/api/chat/route.ts` | Chat endpoint |
| `src/app/api/documents/[id]/process/route.ts` | Ingestion pipeline endpoint |

### PubMed Ingestion Notes
- Dedup by `pmid:XXXXX` tag — skips if already `status='ready'`
- Tagged: `['pubmed-auto', 'peer-reviewed', 'pmid:{pmid}']`
- Attempts PMC full text first, falls back to abstract
- **Action needed:** Tag existing KB documents as `peer-reviewed` in admin UI to enable KB-priority retrieval

---

## Role Terminology (Dynamic)
- `parent`, `caregiver`, `admin` → "Children" / "My Children" / "Child Profiles" / "Add Child"
- `clinician`, `teacher` → "Clients" / "My Clients" / "Client Profiles" / "Add Client"

`src/lib/role-terminology.ts` — `getRoleTerminology(role)`. Consumed by `Sidebar.tsx`, `children/page.tsx`, `dashboard/page.tsx`, `AddChildButton.tsx`.

---

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.).
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never same font for headings and body. Tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Spring easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Gradient overlay (`bg-gradient-to-t from-black/60`) + color treatment with `mix-blend-multiply`.
- **Depth:** Base → elevated → floating surface layering system.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

---

## Next Steps
- Tag existing knowledge base documents as `peer-reviewed` in admin UI
- Admin view of conversations + document usage analytics
- Monetization via Stripe (subscriptions, billing, plan limits)

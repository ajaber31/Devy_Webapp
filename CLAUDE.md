# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.
- **Invoke the `ui-ux-pro-max` skill** (if available) alongside `frontend-design` for enhanced design quality.

## Product Model (V2)
Devy is a **centralized platform** — not an organization-tenant model.
- One global admin manages the shared knowledge base for all users.
- Regular users are parents, caregivers, clinicians, and teachers.
- The core user experience centers around **child profiles**, not generic users or organizations.

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
| `/resources` | Curated resources from knowledge base |
| `/settings` | Profile, notifications, appearance, AI & Trust |
| `/admin/documents` | Global Knowledge Base (admin only) |
| `/admin/users` | Platform Users (admin only) |

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `npm run dev` (runs Next.js at `http://localhost:3000`)
- If the server is already running, do not start a second instance.

## Supabase Integration (Phase 1 — Complete)

### Project
- **Project ID:** `sitzizsdkcfywflbcwar`
- **Region:** `ca-central-1` (Canada — required for PIPEDA compliance)
- **URL:** `https://sitzizsdkcfywflbcwar.supabase.co`
- **Status:** Active

### Database Schema (4 tables)
| Table | Purpose |
|-------|---------|
| `profiles` | Extends `auth.users`. Stores name, role, status. Email lives in auth only. |
| `children` | User-owned child profiles. Privacy-conscious: no mandatory health fields. |
| `conversations` | Per-user chat sessions, optionally linked to a child. |
| `messages` | Individual messages per conversation. JSONB sources field for future RAG. |

**Privacy note:** `children.context_labels` replaces the old `diagnoses` field. These are user-defined freeform strings, not structured clinical records. Date of birth is optional/nullable.

### Auth Flow
- Signup → Supabase sends confirmation email → user confirms → can login
- Login → session cookie set by `@supabase/ssr` → middleware refreshes on every request
- Logout → `signOut()` server action → redirects to `/login`
- Protected routes: middleware redirects unauthenticated users to `/login`
- Admin routes: middleware checks `profiles.role = 'admin'`

### Server Actions Pattern
All data mutations use Next.js Server Actions in `src/lib/actions/`:
- `auth.ts` — signIn, signUp, signOut
- `profile.ts` — getProfile, updateProfile
- `children.ts` — getChildren, getChild, createChild, updateChild, deleteChild
- `conversations.ts` — getConversations, createConversation, getMessages, insertMessage

### Supabase Client Files
| File | Usage |
|------|-------|
| `src/lib/supabase/client.ts` | Browser/client components (`createBrowserClient`) |
| `src/lib/supabase/server.ts` | Server components & Server Actions (`createServerClient`) |
| `src/lib/supabase/middleware.ts` | Middleware only (reads/writes request+response cookies) |
| `src/lib/supabase/database.types.ts` | TypeScript types for the DB schema |

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://sitzizsdkcfywflbcwar.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<in .env.local>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### User Roles
- `parent` / `caregiver` / `clinician` / `teacher` — regular users
- `admin` — global platform admin, unlocks `/admin/*` routes
- Role is set at signup from `accountType` selection and stored in `profiles.role`

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

## What Was Done (Phase 1 Foundation)
- Supabase project created, schema migrated, RLS policies applied
- Real auth: signup, login, logout, email confirmation, protected routes
- Real user profiles: fetched from DB, shown in sidebar/header/settings
- Real children: create (modal), list, view profile — all persisted to DB
- Real conversations: created on first chat send, messages persisted
- Mock AI responses remain for now — real AI is next phase
- `contextLabels` replaces `diagnoses` throughout (privacy-conscious design)
- `ageFromDob()` utility replaces stored `age` field

## Next Phase
The next session should focus on the **AI/RAG pipeline**:
1. Install `pgvector` extension in Supabase
2. Create a `document_chunks` table with vector embeddings column
3. Set up Supabase Storage bucket for document uploads
4. Build the admin document upload flow (real — not mock)
5. Wire document chunking + embedding pipeline (Edge Function or API route)
6. Connect the chat `handleSend` flow to a real AI endpoint (Claude API via `@anthropic-ai/sdk`)
7. Implement semantic retrieval from the knowledge base
8. Display real source citations in chat responses

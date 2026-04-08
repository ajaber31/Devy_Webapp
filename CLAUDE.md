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
- Admin routes: middleware enforces authentication only; admin role check is handled by `(admin)/layout.tsx` via `getProfile()`

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

### RLS Policy Convention — `public.get_user_role()`
The `profiles` table has a `SECURITY DEFINER` helper function to avoid infinite recursion:
```sql
-- Created to break recursive RLS: policies on `profiles` cannot SELECT from `profiles` directly
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;
```
**Rule:** Any RLS policy on `profiles` that needs to check the user's role MUST use `public.get_user_role()`, never a bare `SELECT FROM profiles` subquery (causes `42P17: infinite recursion`).

Current admin policies on `profiles`:
```sql
CREATE POLICY "admin read all profiles" ON public.profiles FOR SELECT USING ( public.get_user_role() = 'admin' );
CREATE POLICY "admin update all profiles" ON public.profiles FOR UPDATE USING ( public.get_user_role() = 'admin' );
```

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

## Role Terminology (Dynamic)

Regular users see role-dependent labels for the children/clients section:
- `parent`, `caregiver`, `admin` → "Children" / "My Children" / "Child Profiles" / "Add Child"
- `clinician`, `teacher` → "Clients" / "My Clients" / "Client Profiles" / "Add Client"

Implementation: `src/lib/role-terminology.ts` — pure `getRoleTerminology(role)` utility.
Consumed by: `Sidebar.tsx`, `children/page.tsx`, `dashboard/page.tsx`, `AddChildButton.tsx`.
No duplicate pages — all role-aware logic is data-driven from the profile.

---

## Phase 2: Knowledge Base Ingestion (Complete)

### Architecture

**Document ingestion flow:**
```
Admin uploads file (browser)
  → Supabase Storage bucket "documents"
  → createDocumentRecord() server action → status: uploaded
  → POST /api/documents/[id]/process (fire-and-forget)
      → status: parsing   → extractText() (pdf-parse v2 / mammoth / utf-8)
      → status: chunking  → chunkText() (paragraph-aware sliding window)
      → status: embedding → generateEmbeddings() (OpenAI text-embedding-3-small)
      → INSERT document_chunks in batches of 50
      → status: ready
```

**Retrieval flow (foundation only — not connected to chat yet):**
```
searchChunks(query, options)
  → generateEmbeddings([query])
  → match_chunks() Postgres RPC (cosine similarity via pgvector)
  → returns RetrievedChunk[] with documentTitle, similarity, metadata
```

### New Database Tables

| Table | Purpose |
|-------|---------|
| `documents` | Metadata, status, storage path, tags for each uploaded file |
| `document_chunks` | Parsed text chunks + vector(1536) embeddings for semantic search |

**RLS:** `documents` — admin-only. `document_chunks` — read by all authenticated users, insert/delete by admin.

### match_chunks RPC
Postgres function `public.match_chunks(query_embedding, match_threshold, match_count, filter_tags)`.
Returns top-K chunks above threshold with `document_title` and `original_filename` for citation.
Supports optional tag filtering (e.g., `filter_tags: ['peer-reviewed']`).

### New Source Files

| File | Purpose |
|------|---------|
| `src/lib/role-terminology.ts` | Maps role → UI labels |
| `src/lib/get-base-url.ts` | Server-to-server fetch base URL (avoids localhost deadlock) |
| `src/lib/supabase/storage.ts` | Storage helpers (signed URLs, delete) — server-only, uses service role key |
| `src/lib/document-processing/parser.ts` | Text extraction (pdf-parse v2 / mammoth / txt) |
| `src/lib/document-processing/chunker.ts` | Paragraph-aware sliding window chunker |
| `src/lib/document-processing/embedder.ts` | OpenAI text-embedding-3-small, batched, with retry |
| `src/lib/document-processing/retrieval.ts` | `searchChunks()` — embed query + call match_chunks RPC |
| `src/lib/actions/documents.ts` | Server actions: getDocuments, createDocumentRecord, deleteDocument, reprocessDocument |
| `src/app/api/documents/[id]/process/route.ts` | POST — full pipeline (auth-gated, service role DB client) |

### Peer-Reviewed Sources
No special table — peer-reviewed docs are tagged `'peer-reviewed'` in `documents.tags`.
Filter via `searchChunks(query, { tags: ['peer-reviewed'] })`.
The system only uses knowledge from indexed documents; no external runtime queries.

### Environment Variables (Phase 2 additions)
```bash
OPENAI_API_KEY=sk-...                    # For text-embedding-3-small
SUPABASE_SERVICE_ROLE_KEY=eyJ...         # Service role — NEVER prefix with NEXT_PUBLIC_
```

### Manual Setup Steps

1. **Enable pgvector extension:**
   Supabase Dashboard → Database → Extensions → search "vector" → Enable

2. **Run the migration SQL:**
   Supabase Dashboard → SQL Editor → paste contents of `supabase/migrations/002_knowledge_base.sql`

3. **Create the Storage bucket:**
   Supabase Dashboard → Storage → New Bucket
   Name: `documents`   Access: Private (Restricted)

4. **Add env vars to `.env.local`:**
   ```
   OPENAI_API_KEY=sk-...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

### Admin UI
- `DocumentUploadZone` — real upload to Storage + record creation + fire-and-forget processing trigger
- `DocumentTable` — real data from DB, polls every 3s while any document is in-progress, stops when all done
- `StatusBadge` — 6 states: Queued / Parsing / Chunking / Embedding / Ready / Failed

---

## Phase 3: Grounded AI Chat (Complete)

### Architecture

**Chat flow:**
```
User sends message (ChatArea)
  → POST /api/chat { message, conversationId, childId, childName }
      → Auth check (getUser)
      → Load last 6 messages as conversation history
      → searchChunks(message, { topK: 8, tags: ['peer-reviewed'] })
          → if < 2 peer-reviewed results → searchChunks(message, { topK: 8 }) (all docs)
          → if 0 results → return noKbResponse immediately (no OpenAI call)
      → buildSystemPrompt(childName?) + buildContextBlock(chunks)
      → gpt-4o completion (temperature: 0.1, max_tokens: 1000)
      → detectNotFoundNote(content)
      → return { content, sources: Source[], notFoundNote? }
  → insertMessage (assistant) → persisted to DB
  → MessageBubble renders content + SourceCitationCards
```

### Safety Design Decisions

- **No general knowledge**: System prompt explicitly forbids answering outside the provided context. Temperature 0.1 minimises hallucination.
- **Hard not-found path**: If `searchChunks` returns 0 results, OpenAI is never called. The "no information" response is deterministic, not AI-generated.
- **Soft not-found detection**: `detectNotFoundNote()` parses the model's response for "I don't have enough information…" patterns and surfaces a UI disclaimer if triggered.
- **Clinical disclaimer**: The system prompt requires the model to append `⚠️ This information comes from Devy's knowledge base…` on any clinical/medical topic.
- **No diagnosis rule**: Explicitly stated in the system prompt as a non-negotiable constraint.
- **Peer-reviewed priority**: Retrieval tries peer-reviewed documents first. Falls back to all documents only if fewer than 2 peer-reviewed chunks are found.

### New Source Files (Phase 3)

| File | Purpose |
|------|---------|
| `src/lib/ai/prompt-builder.ts` | System prompt, context block assembly, source deduplication, not-found detection |
| `src/app/api/chat/route.ts` | POST /api/chat — auth, retrieval, OpenAI call, response |

### Key Behaviour

- **Source citations**: `chunksToSources()` deduplicates by document (highest-similarity chunk per doc). Rendered as expandable `SourceCitationCard` components.
- **Conversation history**: Last 6 messages (3 exchanges) sent to OpenAI as context for follow-up questions.
- **Token budget**: Context capped at ~14 000 chars (~3 500 tokens). Chunks are truncated to fit if the result set is large.
- **Error handling**: Network/OpenAI errors surface as a polite in-chat error message (not a crash).
- **`OPENAI_API_KEY`** is shared between embeddings (Phase 2) and chat completions (Phase 3) — no new env vars required.

---

## What Was Done (Phase 1 Foundation)
- Supabase project created, schema migrated, RLS policies applied
- Real auth: signup, login, logout, email confirmation, protected routes
- Real user profiles: fetched from DB, shown in sidebar/header/settings
- Real children: create (modal), list, view profile — all persisted to DB
- Real conversations: created on first chat send, messages persisted
- `contextLabels` replaces `diagnoses` throughout (privacy-conscious design)
- `ageFromDob()` utility replaces stored `age` field

## Next Steps
- Add peer-reviewed toggle per conversation (UI setting in ChatArea header)
- Stream responses for faster perceived latency (replace fetch-and-wait pattern)
- Admin view of conversations + document usage analytics
- `/resources` page wired to knowledge base (curated doc listing)

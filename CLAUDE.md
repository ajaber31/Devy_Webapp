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
| `/chat` | Conversations (accepts `?childId` + `?childName` query params) |
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

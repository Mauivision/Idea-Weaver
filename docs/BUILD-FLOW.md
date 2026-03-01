# Idea Weaver — Build Flow: Front, Middle, Backend

This doc maps **what exists**, **what’s next**, and **who does what**: you (steps you must take) vs. what the AI can implement.

---

## Current state

| Layer        | Status | What’s there |
|-------------|--------|--------------|
| **Frontend** | ✅ Built | React + TypeScript, MUI, CRA. Views: Board, List, Graph, Mind Map, Analytics, Weave. Voice, templates, export/import, keyboard shortcuts. |
| **Middle**   | ⚠️ Partial | No your-own API yet. Weave uses **OpenAI from the browser** (key in localStorage). Payment is a **placeholder** (no real Stripe call). |
| **Backend**  | ❌ None | All persistence is **localStorage**. No DB, no auth, no sync. |

So today: **frontend-only app** that works offline; “premium” and “sync” are UI-only until you add middle + backend.

---

## Full stack flow (target)

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (React app — you have this)                            │
│  • UI, views, voice, Weave, onboarding                          │
│  • Reads/writes via API client (to be added for sync)           │
│  • Falls back to localStorage when no backend / offline         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  MIDDLE (API / BFF — to add)                                     │
│  • REST or serverless routes (e.g. Vercel / Next API / Express)  │
│  • Auth: session or JWT (e.g. Supabase Auth, Clerk)             │
│  • Stripe: create-checkout-session, webhook                     │
│  • Optional: proxy OpenAI so API key stays server-side          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND (Data + Auth — to add for premium/sync)                 │
│  • DB: Supabase (Postgres), Firebase, or Convex                 │
│  • Stores: users, ideas, templates (when “synced”)              │
│  • Sync: load on login, push on change, conflict handling       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Steps you must take (your responsibility)

These require **your decisions, accounts, or secrets**; the AI can’t do them for you.

1. **Choose backend**
   - Pick one: **Supabase** (recommended), Firebase, or Convex.
   - Create the project and get URL + anon key (and service role if you add server-side logic).

2. **Auth**
   - Enable auth in that backend (e.g. Supabase Auth: email, magic link, or OAuth).
   - Decide: “premium” = after payment only, or “account” = anyone who signs up gets sync.

3. **Payments (if you want real $1.99)**
   - Stripe (or Gumroad / Lemon Squeezy) account.
   - Create product/price for one-time $1.99.
   - Add **secret key** only on the server; never in the frontend.

4. **Environment and deploy**
   - Add env vars (e.g. `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, and backend-only Stripe secret).
   - Connect repo to Vercel (or your host), set env in dashboard, then deploy.

5. **OpenAI (optional)**
   - If you want **Weave** to use a **server-held** API key instead of the user’s, create an OpenAI key and add it only on the server; the AI can add a small API route that calls OpenAI and the frontend calls that instead.

6. **Testing and go-live**
   - Test login, sync, and payment on staging; then flip to production when ready.

---

## Steps the AI can cover (implementation)

Once you’ve chosen backend and (optionally) Stripe, the AI can implement the following in the repo.

### Frontend

- **API client**  
  - A small `src/lib/api.ts` (or `sync.ts`) that:
    - Uses `REACT_APP_API_URL` or Supabase/Firebase client.
    - Exposes: `loadIdeas()`, `saveIdeas(ideas)`, `getUser()`, `isPremium()`.
  - **useIdeas** (or a sync hook) can be updated to: use backend when logged in + premium, else use localStorage (and optionally one-way “export to cloud” or “import from cloud”).

- **Auth UI**  
  - Sign in / sign up / sign out buttons and optional “Sync” section in settings or header, wired to your chosen auth (e.g. Supabase Auth).

- **Premium gate**  
  - After real Stripe success (or webhook), set premium flag from API (e.g. Supabase profile or a small “entitlements” table) and show “Synced” state and enable sync in the client.

- **Weave (optional server proxy)**  
  - If you want Weave to use a server-held OpenAI key: add one API route (e.g. `POST /api/weave/summary`) that calls OpenAI and returns the summary; frontend calls that instead of `weaveApi.ts` with user key. The AI can add the route and switch the client to use it when `REACT_APP_API_URL` is set.

### Middle (API / serverless)

- **Stripe**
  - `POST /api/create-checkout-session`: create session with your $1.99 price, return `sessionId`.
  - `POST /api/webhook`: Stripe webhook to confirm payment; update “premium” in DB and (if needed) set cookie/flag for the frontend.

- **Auth**
  - If you use Supabase/Firebase/Convex, auth is usually client-side; the “middle” is just your backend rules or a thin “get me” endpoint. The AI can add a minimal “get current user / premium status” endpoint if you want a single backend to call.

- **Weave proxy (optional)**
  - Single route that accepts `{ ideas }`, calls OpenAI with server key, returns `{ summary }` (and optionally category suggestions). Frontend then uses this when configured.

### Backend (schema + rules)

- **Schema**
  - Tables/collections: e.g. `users` (id, email, premium_until), `ideas` (user_id, payload JSON, updated_at). The AI can propose exact Supabase/Firebase/Convex schema and migrations or SQL.

- **Security**
  - Row-level security (Supabase) or rules (Firebase) so each user only sees their own ideas. The AI can draft the RLS policies or Firestore rules.

- **Sync strategy**
  - Simple “last-write-wins” or “merge by updated_at” for MVP; the AI can implement the client logic and server writes once you pick one.

---

## Suggested order of work

| Phase | You | AI |
|-------|-----|----|
| **1. Backend + Auth** | Create Supabase (or other) project, enable Auth, get keys | Add `api.ts` / Supabase client, auth UI, and “sync” toggle that reads/writes ideas to DB when logged in; keep localStorage as fallback when not. |
| **2. Premium** | Create Stripe product, get keys, set webhook URL | Add create-checkout-session + webhook, “Unlock” button → Stripe → success URL; set premium in DB and show “Synced” in app. |
| **3. Polish** | Set env in Vercel, test full flow | Optional: Weave proxy, conflict handling, export/import from cloud. |

---

## Quick reference: key files

| Purpose | File(s) |
|--------|--------|
| Persistence (current) | `src/hooks/useIdeas.ts` (localStorage key `ideaWeaverIdeas`) |
| Weave AI (client) | `src/lib/weaveApi.ts`, `src/components/IdeaWeave.tsx` |
| Payment placeholder | `src/lib/payment.ts`, OnboardingScreen “Unlock” |
| Config / env | `REACT_APP_API_URL` (in DEPLOYMENT.md); add `REACT_APP_SUPABASE_*` when you add Supabase |
| Project overview | `docs/PROJECT.md`, `docs/ROADMAP.md` |

---

## One-line summary

- **You:** Choose backend (e.g. Supabase), set up auth and (if you want) Stripe, add env vars and deploy.
- **AI:** Implement API client, auth UI, sync logic, Stripe routes + webhook, DB schema and rules, and optional Weave proxy so the front stays the same and the “middle” and backend are fully wired.

When you’re ready, say which backend you picked (and whether you want Stripe and/or server-side Weave), and we can start with Phase 1 step-by-step in the repo.

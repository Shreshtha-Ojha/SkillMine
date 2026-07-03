# SkillMine

Technical interview prep platform: company-wise DSA question banks, AI mock interviews, learning roadmaps, resume/ATS tooling, and skill certifications.

## Tech stack

- **Framework:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Data:** MongoDB via Mongoose (`src/models/*`, connection helper in `src/dbConfig/dbConfig.ts`)
- **Auth:** NextAuth (Google OAuth) + a parallel hand-rolled JWT layer (see below)
- **LLM:** Google Gemini (`@google/genai`) via `src/lib/gemini.ts`, used for mock interview Q&A/feedback and resume/ATS analysis
- **Error tracking:** Sentry (`sentry.*.config.ts`)
- **Testing:** Vitest (unit), Cypress (E2E), k6 (load/perf)

## Auth flow

Two auth mechanisms exist side by side and both terminate in the same JWT shape:

1. **NextAuth** (`src/lib/authOptions.ts`) handles Google OAuth sign-in, upserts a `User` document, then mints a JWT with `jsonwebtoken` (`{ id, username, email, isAdmin }`, signed with `TOKEN_SECRET`, 1 day expiry) and stores it on the session as `accessToken`.
2. **Manual email/password flows** (`src/app/auth/*`, `src/helpers/getToken.ts`) issue the same shape of JWT directly, stored in an httpOnly `token` cookie.

Server-side, routes verify identity in one of two ways — prefer the shared helper over hand-rolling a new one:
- `src/lib/getUserFromRequest.ts` — reads the `token` cookie or `Authorization: Bearer` header, verifies with `TOKEN_SECRET`, and returns the full `User` document (or `null`).
- `src/middleware.ts` — route-level gate for pages (not APIs): decodes the JWT payload (no signature check, just presence/shape) to redirect unauthenticated/non-admin users away from protected and admin routes before the page renders.

**Rule of thumb:** never trust a client-supplied user id in a request body for anything that writes data — always derive identity from the verified token via `getUserFromRequest`. (`/api/interview/feedback` used to trust a client-supplied `user` field; see git history for the fix.)

## LLM integration pattern

All Gemini calls go through `src/lib/gemini.ts`:
- `generateContent(prompt)` — simple, no retry/timeout, throws on error.
- `generateContentWithConfig(prompt, config)` — production path: races the request against `GEMINI_TIMEOUT_MS` (default 25000ms), retries transient 429/503/overload errors up to `GEMINI_RETRIES` times (default 2) with exponential backoff, and strips markdown code fences from the response.

**LLM output is untrusted input.** Every route that parses a Gemini response should assume it may be malformed JSON, out-of-range numbers, or empty text, and validate/clamp before persisting or rendering:
- Prefer `parseLLMJson` (`src/lib/llmParse.ts`) for anything beyond a single field — it has a 3-stage fallback (strict JSON → JSON5 → balanced-brace extraction) and normalizes score fields into a consistent shape/range.
- Simpler routes (e.g. `src/app/api/interview/*`) roll their own regex-based extraction; when touching these, clamp numeric scores and cap/validate text length rather than trusting the LLM's stated range.

## Roadmap content

Roadmaps are seeded via standalone scripts in `scripts/seed-*-roadmap.mjs`, not through the admin UI. Each script:
1. Loads `.env.local` for `MONGO_URL`.
2. Defines an inline Mongoose schema matching `src/models/roadmapModel.ts` (title, description, createdBy, phases[] → tasks[]/assignments[]).
3. Upserts by `title` (safe to re-run).

To add a new roadmap topic, copy an existing script (e.g. `scripts/seed-dbms-roadmap.mjs`) and follow its ~10-phase structure. Run with `node scripts/seed-<topic>-roadmap.mjs`.

## Testing

- **Unit tests** (`vitest run` / `npm run test`): pure business logic only — `src/**/*.test.ts` next to the file under test. Good candidates are files with no DB/network calls (e.g. `src/lib/llmParse.ts`, `src/lib/atsUtils.ts`, `src/lib/priceUtils.ts`).
- **E2E tests** (`cypress/e2e/*.cy.ts`, `npm run cy:run`): page-level smoke checks plus API-level auth/rate-limit assertions via `cy.request`, and mocked-network UI checks via `cy.intercept`. These do not exercise real Gemini/Mongo — no live credentials are wired into CI.
- **Load tests** (`test/k6/*.js`, `npm run perf:k6:*`): manual-dispatch only (`.github/workflows/k6-smoke.yml`), needs a deployed `BASE_URL`.
- **CI** (`.github/workflows/ci.yml`): runs lint + typecheck + unit tests on every PR/push to `main`. Cypress and k6 are intentionally not in this gate yet — they need live secrets (Mongo, Gemini) provisioned in Actions first.

## Required env vars

| Var | Used by |
|---|---|
| `MONGO_URL` | `src/dbConfig/dbConfig.ts` — all DB access |
| `TOKEN_SECRET` | JWT signing/verification (both auth paths) |
| `GEMINI_API_KEY` | `src/lib/gemini.ts` |
| `GEMINI_TIMEOUT_MS`, `GEMINI_RETRIES` | optional, tune Gemini retry/timeout behavior |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | NextAuth Google OAuth |
| `ADMINS` | comma-separated admin emails, checked in both `authOptions.ts` and `middleware.ts` |

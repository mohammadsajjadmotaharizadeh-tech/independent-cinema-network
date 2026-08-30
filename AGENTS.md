# AGENTS.md — independent-cinema-network

## Project overview

ICN (Independent Cinema Network) v3.0.0 — AI-powered indie cinema distribution platform.
Single-page app (HTML/CSS/JS, no build step) deployed via Vercel serverless functions.
Persian/RTL interface. Two films managed: "sudden" (Sudden Rise) and "battle" (Battle of the Shadows).

## Module system quirk

- `package.json` has `"type": "module"` (ESM).
- `festival-registry.js`, `category-detection.js`, and `data-layer.js` use `require()` alongside ESM `import` — this works in Node but is fragile. If you add new files, use ESM `import`/`export` consistently; do not mix `require`.
- `test-phase2.cjs` is CommonJS (`.cjs` extension) using `require`; `test-phase4.js` is ESM using `import`. Both are test-only, not imported by the app.

## Auth

- `_auth.js` — HMAC-SHA256 token, 12h expiry. **Bug on line 3**: `error("SESSION_SECRET required…")` — `error` is not defined; should be `throw new Error(...)`.
- Production requires `SESSION_SECRET`, `SUDDEN_USERNAME`/`PASSWORD`, `BATTLE_USERNAME`/`PASSWORD` env vars.
- Dev fallback: `SESSION_SECRET="dev-fallback-secret-change-me"`, passwords default to hardcoded values in `login.js` and `index.html`.
- **Never commit real passwords** — `index.html` has demo credentials (`SR-ICN-2026!`, `BOS-ICN-2026!`) for local preview only.

## Deploy & env

- Vercel serverless: `vercel.json` routes `/api/(.*)` with `Cache-Control: no-store`.
- Required env vars: `OPENAI_API_KEY`, `OPENAI_MODEL` (set to `gpt-5.6`), `SESSION_SECRET`, `SUDDEN_USERNAME`, `SUDDEN_PASSWORD`, `BATTLE_USERNAME`, `BATTLE_PASSWORD`.
- **GitHub Pages does NOT run the API backend** — only static HTML. For chat and secure login, deploy to Vercel or a Node serverless host.
- `chat.js` returns 503 if `OPENAI_API_KEY` or `OPENAI_MODEL` is missing.

## Data architecture

- `film-data.json` is the source of truth (loaded via `import … with {type:"json"}` in `data-layer.js`).
- `data-layer.js` maintains an in-memory `filmCache` and `CACHE_VERSION` counter for invalidation.
- `portal.html` has a hardcoded `const DATA = {…}` `<script>` block — it does not load from `film-data.json` at runtime.
- `agent-prompts.json` holds per-film system prompts for the OpenAI agent.

## Key modules (do not modify boundaries)

| File | Role |
|---|---|
| `data-layer.js` | Film CRUD, cache, persistence |
| `festival-registry.js` | History records, duplicate detection, blocking |
| `eligibility-engine.js` | Rule-based eligibility evaluation |
| `distribution-forensics.js` | 5 confidence states: VERIFIED, CLAIMED_NEEDS_EVIDENCE, UNKNOWN, HOLD, RED_FLAG |
| `premiere-map.js` | Premiere type detection, `canScreenWithoutBurning` |
| `category-detection.js` | Genre vs section mismatch detection |
| `agent-decision-layer.js` | Deterministic strategy (never calls AI for core decisions) |
| `sudden-rise-recovery.js` | Recovery workflow for Sudden Rise |
| `battle-forensics.js` | Forensic workflow for Battle of the Shadows |

## Testing

- No `npm test` script in `package.json`.
- Run `test-phase2.cjs` with Node directly: `node test-phase2.cjs` (CommonJS).
- Run `test-phase4.js` with Node: `node test-phase4.js` (ESM).
- `TEST_REPORT.txt` lists 13 manual verification checks; all must pass after changes.
- Both test files are self-contained (they `require` modules directly); they don't use a test runner like Jest/Mocha.

## Deterministic design rule

The agent decision layer (`agent-decision-layer.js`) is explicitly **never dependent on AI API** for core decisions. AI (`chat.js`) is only for natural-language interaction, guided by `agent-prompts.json`. All eligibility, duplicate, premiere, and category logic is rule-based and local.

## Filing new festival records

- Always use `addFestivalRecord(filmKey, record, entry)` from `festival-registry.js`.
- Records with no `sourceProof` get `FORENSIC_CONFIDENCE.UNKNOWN` — this blocks submission until verified.
- Exact duplicate = same name + edition + result. Probable duplicate = normalized name + edition match.
- `RED_FLAG` and `HOLD` confidence states block submissions.

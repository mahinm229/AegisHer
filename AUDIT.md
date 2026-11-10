# AegisHer repository audit — 10 November 2026

## Scope and identity check

The supplied archive was `aegisher_iot_safety.zip`. It contained an AegisHer static HTML dashboard, a README, a license, and one PNG image. It did **not** contain the PayPal/StagePay settlement application implied by the 12 requested checks. There was no server, payment adapter, API router, operator authentication, AI tool gateway, PostgreSQL schema, Render manifest, test suite, package manifest, or CI workflow.

Accordingly, checks 2–6 and 8–9 and 11 cannot be treated as implemented payment functionality. They are marked **not present / not applicable**, rather than being invented or represented as repaired. This package remains a front-end concept simulator.

## Twelve checks

| # | Requested check | Result in supplied project | Action / evidence |
|---:|---|---|---|
| 1 | Root upload; `npm start`, `npm test`, `npm run benchmark`; workflow path | **Fixed.** The original archive had no `package.json`, scripts, or CI workflow. | Added a dependency-free Node setup, root scripts, and `.github/workflows/ci.yml`. Startup is a local static server; tests use Node's built-in test runner. |
| 2 | Operator authentication on `/api/state`, `/api/ai/*`, mutations; Render auth token | **Not present.** There are no API routes, server-side mutations, or `render.yaml`. | No backend authentication or Render token can be validly added to this static frontend-only application. |
| 3 | Official upstream payment provider schemas | **Not present.** The app makes no live payment-provider API calls. | External script/style CDN requests are present, but they are not settlement API integrations. |
| 4 | Pending versus completed settlement and GET witness endpoint | **Not present.** No payment state machine or provider witness endpoint exists. | Not applicable to this repository. |
| 5 | AI tool gateway and signed human approval | **Not present.** There are no AI tool calls, gateway adapter, or approval records. | The risk-score logic is local deterministic browser-side arithmetic, not an AI agent or payment tool. |
| 6 | PostgreSQL advisory locks, OS lockfiles, optimistic version checks | **Not present at distributed-system level.** No backend, PostgreSQL, or multi-user session store exists. | The local evidence ledger now serializes concurrent writes within its JavaScript instance. That is not a substitute for cross-process or distributed locking. |
| 7 | Genuine SHA-256 | **Fixed.** The original `computeFastHexHash` used a custom 32-bit non-cryptographic calculation repeated to 64 characters. | Replaced with Web Crypto SHA-256. Tests cover the empty string, `abc`, and `hello world` standard vectors; generated hashes are 64 lowercase hex characters. |
| 8 | Sequential payment-step and temporal guards with audit logging | **Not present.** No Capture, Void, Payout, six-stage journey, or stage audit log exists. | Cannot test out-of-order payment actions in this project. |
| 9 | Reversible expiry / time-travel of an active hold | **Not present.** No payment hold, expiry clock, settlement KPI, or timeline exists. | Not applicable to this project. |
| 10 | Sticky header and table word wrapping | **Partially verified from source.** Header has `position: sticky` via `sticky top-0`. Evidence table is inside an `overflow-x-auto` wrapper; natural words are not forced to break mid-token. | Kept the sticky header; added a minimum-width table inside a contained horizontal scroller and explicit `word-break: normal` / `hyphens: none`. A browser scroll-at-850-px test could not be run in this environment. |
| 11 | Instant Judge Tour buttons | **Not present.** There are no Judge Tour buttons or stage tours. | Not applicable to this project. |
| 12 | 390 × 844 mobile overflow | **Source-level safeguards added; runtime metric not certified.** | Evidence actions wrap, the table scrolls inside its own container, and mobile overflow clipping is applied. A real 390 × 844 browser `scrollWidth` measurement could not be completed in this environment, so this is not claimed as a verified runtime pass. |

## Additional defects found and fixed

1. **DOM XSS:** guardian name, relation, and phone fields were interpolated into `innerHTML`. The contact and evidence renderers now create DOM nodes and assign user-controlled strings through `textContent`.
2. **False device telemetry:** the motion-sensor timeout used to inject a synthetic `2.40G` value while calling it a simulated/live sensor read, and its event listener was not removed on fallback. The fallback was removed; permission is requested where required; listeners are cleaned up on success or timeout.
3. **Misleading emergency capability claims:** the UI implied that GPS, guardian notifications, phone calls, audio recording, police dispatch, TinyML wake-word detection, CCTV, and LoRaWAN controls were live. The supplied source contains no such integrations. A persistent demo-only safety disclosure and accurate copy now make that explicit.
4. **Misleading evidence claims:** the app described browser-local hashes as signed, immutable, tamper-proof, and legally admissible. It now uses genuine SHA-256 and a verifiable previous-hash chain, but the README and UI explicitly state that the browser-memory ledger is not digitally signed, externally anchored, or legal evidence.
5. **Concurrent local ledger writes:** two rapid append operations could derive the same next block number. Ledger appends now run through a promise queue, and verification detects edits to stored payloads.
6. **Seed ledger:** initial example entries had no previous-hash field and did not form a verifiable chain. They now use real SHA-256 digests and pass the same chain verifier as new entries.

## Verification performed

- `npm test`: regression suite result is recorded in the delivery response.
- `npm run benchmark`: exercised 5,000 Web Crypto SHA-256 digests and validated the 64-character output shape.
- `npm start`: HTTP smoke-tested the built-in static server and confirmed that `/` serves `index.html`.
- JavaScript syntax: helper scripts and extracted inline script checked with Node's parser.
- Full interactive browser checks: not completed; this execution environment blocked the Chromium navigation attempt. Therefore no claim is made that the live 390 px `scrollWidth` or scroll position was measured.

## Deployment boundary

This package is a browser-only simulator. It is **not** a safety-critical product and is not the StagePay/PayPal payment repository. Do not deploy it as an operational emergency-response service. The missing backend integrations require a separate backend implementation, security review, provider-specific contract tests, and hardware/field validation.

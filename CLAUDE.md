# memelli-site — the front-end (Next.js 14)

A normal local website. Build it like one. Run: `npm run dev` → **http://localhost:3000**.

## How it's built (don't re-derive)
- Route `/` and `/app` → **`public/app.html`** (the one build; the old `/v3` route was removed — there is no `/v1` `/v2` `/v3`).
- The UI is **plain-JS modules in `public/mod/*.js`** loaded by `app.html` via `<script src="/api/home/mod?f=X.js&v=N">`. NOT React components. Reuse these — don't rewrite into React.
  - `scene.js` = particle wall + the `openWindow`/`__winRender` window system + Master Controls.
  - `journey.js` = client credit funnel (report, disputes, decision, prequal, funding).
  - `adminreview.js` = admin Credit Review (pick client → report → bureau logins → generate letters → file).
  - plus `bar.js`, `login.js`, `rightmenu.js` (auth drawer), `schema.js`, `crm.js`, etc.
- `next.config.js`: `/api/home/mod?f=X.js` → local `public/mod/X.js`; **all other `/api/*` → the backend** `https://memelli-bar-control.up.railway.app` for data.
- **Dev loop:** edit a mod → bump its `&v=` in `public/app.html` → hard-refresh (Ctrl+Shift+R). Verify the RENDERED page, not just a 200.

## Rules
- Do exactly what Mel asks; don't decide for him; don't shorten his work; build local, don't drift to the backend.
- Glass/transparent windows are intentional (so the wall shows through); each window has its own controls via `window.__winControls`, persisted per-user.
- Auth lives in the right menu (`rightmenu.js`). Scope every data read by `customer_id`.
- **Live site = www.memelli.io — no push without Mel's explicit go.**

## Open gaps (backend, data-only)
- `api_inquiry_history` / `api_public_records` 500 on GET (unguarded `req.body.__selftest`) AND their backing tables (`inquiry_history` / `public_records`) were never created — but these are unused helpers: the report reads `api_credit_report_full`, which DOES return inquiries (~20) + public records (2 bankruptcies), so those sections show fine.
- `api_credit_generate_disputes` outputs JSON not finished letters (front-end assembles the prose per bureau).
- (Closed: cross-client IDOR endpoints incl. `prequal_outcomes` are now session-scoped / 401-403; the 55-customer junk is purged.)

Full status: `C:\Users\memel\Downloads\MEMELLI_PROJECT_BRIEF_for_help.md`.

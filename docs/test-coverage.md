# FusionBanking — Test Coverage Report

**Date:** 2026-10-28 · **Scope:** frontend quality gate for the local development environment

This report records what was actually executed. Manual browser testing was performed with in-browser automation against the running local stack; no test suite or end-to-end framework exists in the repository (see "Automated checks" below), so all functional coverage is manual.

---

## 1. Local environment

| Item | Value |
|---|---|
| Frontend | Vite dev server, `http://localhost:5176` (port 5173 was occupied by an unrelated project) |
| Backend | `php artisan serve`, `http://localhost:8010` (port 8000 was occupied) |
| Proxy | `/api` → `http://localhost:8010` via `BACKEND_URL` env override in `vite.config.ts` (default remains `http://localhost:8000`) |
| Database | Local MySQL 8 (`fusionbanking` schema), all migrations ran, seeded demo data (3 customers, 2 admins, 3 accounts, 15 transactions, 4 loans, 6 FDs, 4 promotions, 7 applications) |
| Mail | `MAIL_MAILER=log` + `QUEUE_CONNECTION=database`; OTP mails were delivered by running `php artisan queue:work --stop-when-empty` |
| Sessions used | `CUS1000001` (customer, password `customer123` + email OTP), `admin` (admin, `admin123` + bank token + token email), `masteradmin` (`master123` + `MASTER-ACCESS-TOKEN-2024` + token email) |

**Route inventory:** 44 declared routes — 12 public, 6 guest-only, 13 customer (protected), 13 admin (protected, one dynamic `/admin/applications/:id`) — plus the `*` → `/` catch-all.

---

## 2. Automated checks

| Check | Command | Result |
|---|---|---|
| TypeScript | `npm run typecheck` | ✅ Pass (before and after all changes) |
| Lint | `npm run lint` | ✅ Pass after fixing the script (the pre-existing script was broken — see `ui-audit.md` M4) |
| Production build | `npm run build` | ✅ Pass (~1.6 s, 43 chunks) |
| Unit tests | `npm test` | ❌ No test files exist (`vitest` reports "No test files found"). **Pre-existing condition** — no tests were added or removed |
| Backend tests | `./vendor/bin/pest` (documented in README) | ⚪ Not run — backend out of scope for this audit |

---

## 3. Route-by-route results (desktop, 1440×900)

Legend: ✅ rendered + primary interactions verified · ⚠️ rendered with a documented backend blocker · 🔒 intentionally not exercised end-to-end (see §5).

### Public site (guest)

| Route | Result | Notes |
|---|---|---|
| `/` | ✅ | Hero, stats, features, FAQ accordion, CTA; product-card links fixed (H3) and re-verified |
| `/personal-banking` | ✅ | Hero contrast fixed (M2) |
| `/products` | ✅ | All card links resolve to real routes |
| `/products/savings` | ✅ | Hero contrast fixed (M2) |
| `/products/current` | ✅ | Hero contrast fixed (M2); lint cleanup (L1) |
| `/loans` | ✅ | Loan cards, EMI CTA, security section, footer |
| `/deposits` | ✅ | Deposit options render |
| `/security` | ✅ | Content sections render |
| `/help` | ✅ | FAQ content renders |
| `/contact` | ✅ | Empty-submit shows 4 zod errors with `role="alert"`; valid submit now calls the real API (H2); guest submission fails honestly (B4) |
| `/privacy` | ✅ | |
| `/terms` | ✅ | |
| `*` (unknown) | ✅ | Redirects to `/` |

### Guest-only flows

| Route | Result | Notes |
|---|---|---|
| `/netbanking/login` | ✅ | Wrong password → "Invalid credentials"; correct credentials → 6-digit OTP step (fixed in C3/C2/C1) |
| `/netbanking/activate` | ✅ | Renders (full activation not exercised — requires a real seeded customer without NetBanking) |
| `/netbanking/password/reset` | ✅ | Renders |
| `/admin/login` | ✅ | Wrong password → "Invalid credentials"; correct credentials + bank token → 16-char token step (fixed in C4/C5) |
| `/open-account` | ✅ / 🔒 | Steps 1–4 verified end-to-end with real API saves (201/200s) incl. invalid-input validation on every step; address-step deadlock fixed (C6); **document upload blocked by backend 500 (B1)** → Review/Submit steps unreachable |
| `/track-application` | ✅ | Unknown reference → honest "Application not found" toast (L6); real acknowledgement `FBK-2026-T2MZZXK8` → full status page with step tracker |

### Customer NetBanking (authenticated as CUS1000001)

| Route | Result | Notes |
|---|---|---|
| `/customer/dashboard` | ✅ | Account summary, quick actions, recent transactions; stats computed client-side (H4) |
| `/customer/accounts/overview` | ✅ | |
| `/customer/accounts/details` | ✅ | Masked account number, IFSC, balances |
| `/customer/payments/send` | ✅ / 🔒 | Recipient validation: 200 for a seeded account, 422 for a bogus one (H1). **Transfer submission/OTP not executed** — see §5 |
| `/customer/payments/beneficiaries` | ✅ | List renders |
| `/customer/payments/transactions` | ✅ | Server-side search verified (`search=Salary` → matching row); filters/pagination UI present |
| `/customer/payments/statements` | ✅ | Statement view renders |
| `/customer/products/loans` | ✅ | Loans + loan products load (200) |
| `/customer/products/fd` | ✅ | FDs + FD products load (200) |
| `/customer/profile` | ✅ | Profile renders; addresses card shows empty state (B6) |
| `/customer/security` | ⚠️ | Security events load (200); sessions section fails (B3) with visible error note |
| `/customer/notifications` | ⚠️ | Empty state shown; backend endpoint 500s (B2) |
| `/customer/support` | ✅ | Ticket list loads (200) |
| Logout | ✅ | `POST /api/logout` → 200, token cleared, redirect to login |

### Admin portal (authenticated as `admin`, then `masteradmin`)

| Route | Result | Notes |
|---|---|---|
| `/admin` | ✅ | Stats, quick actions, recent applications/activity |
| `/admin/applications` | ✅ | Queue list |
| `/admin/applications/2` | ✅ | Detail: applicant info, masked Aadhaar, verification steps, timeline; **one step review executed** (personal_info → approve, 200, status updated — see §5) |
| `/admin/customers` | ✅ | |
| `/admin/accounts` | ✅ | |
| `/admin/transactions` | ✅ | |
| `/admin/loans` | ✅ | |
| `/admin/fd` | ✅ | |
| `/admin/audit-logs` | ✅ | |
| `/admin/support` | ✅ | |
| `/admin/promotions` | ✅ | |
| `/admin/administration/settings` | ✅ | |
| `/admin/administration/users` | ✅ (master) / ✅ (admin sees honest 403 error state) | "New admin" button now hidden for non-masters (L5) |
| Logout (admin) | ✅ | |

---

## 4. Responsive testing

Viewport coverage: **1440×900** (every route), **390×844** (every public + customer + admin route), **768×1024** (spot checks: home, dashboards, tables, open-account).

| Check | Result |
|---|---|
| Horizontal page overflow at 390px (44 routes, measured `scrollWidth − clientWidth`) | ✅ 0px on every route |
| Horizontal page overflow at 768px (spot checks) | ✅ 0px |
| Mobile navigation (public hamburger drawer) | ✅ Opens/closes, all links present |
| Mobile navigation (customer + admin sidebar drawers) | ✅ Verified via DOM (`role="dialog"`, full nav + logout) |
| Wide tables at mobile | ✅ Scroll horizontally inside their card wrappers, page does not overflow (e.g. admin transactions) |
| Forms at mobile | ✅ Stack to single column; open-account, login, contact verified visually |
| Touch targets | ✅ Buttons/inputs ≥ ~40px effective height in captured views |

Screenshots: 53 files under `docs/screenshots/` — see `screenshot-index.md`.

---

## 5. Deliberately not exercised (safe-testing boundary)

| Item | Reason | What was verified instead |
|---|---|---|
| Executing a real money transfer (review → OTP → confirm) | Would mutate the seeded ledger/balances used by the documentation screenshots | The full pre-transfer path: recipient validation (200/422), form validation, step tracker, transfer-limit display. The `POST /transfers`, `/transfers/verify` endpoints exist and are wired (routes + `SendMoneyPage` handlers) |
| Admin approve/reject/disburse of loans, account freeze/close, FD premature close, customer restrict, promotion delete | Destructive/consequential admin actions against the seeded demo dataset | The ConfirmDialog contract was fixed (M3) and verified through one **non-financial** action: approving the `personal_info` review step of application `FBK-2026-7NRDWUIY` (200, status → verified, toast, list refresh) |
| Document upload completing the account-opening flow | Backend 500 (B1) — outside the frontend boundary | The upload UI, file-type restrictions, and error toast; the 500 is reproduced and logged |
| NetBanking activation end-to-end | Would create credentials for a seeded customer | Page renders; API contract verified against `routes/api.php` |
| Full accessibility audit (screen readers, keyboard-only) | Out of scope for this pass | Structural checks listed in `ui-audit.md` |

---

## 6. Console / network observations

- After the C1 fix, no failing API calls remain on the tested paths except the documented backend 500s (B1–B3) and the intentional 4xx validation checks.
- The pre-audit build logged no 404s except the favicon (L2, fixed).
- Vite/React reports no runtime warnings beyond React Query's expected query retries on the failing notification/session endpoints.

---

## 7. Summary

| Metric | Count |
|---|---|
| Routes discovered | 44 + catch-all |
| Routes rendered successfully | 44 |
| Routes with backend-blocked sections | 3 (`notifications`, `security/sessions`, open-account documents step) |
| Frontend defects found | 21 (6 critical, 4 high, 4 medium, 7 low) — all fixed, see `ui-audit.md` |
| Backend blockers documented | 6 (not modified) |
| Viewports audited | 1440×900, 768×1024, 390×844 |
| Automated checks | typecheck ✅ · lint ✅ · build ✅ · unit tests — none exist (pre-existing) |
| Manual browser interactions verified | ~30 distinct interactions (logins, OTP, wizard steps, validation, search, menus, admin review) |

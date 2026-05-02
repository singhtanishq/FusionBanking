# FusionBanking — Frontend UI/UX Audit

**Scope:** `frontend/` (React 18 + TypeScript + Tailwind CSS), audited against the running local stack (Vite dev server → Laravel API).

**Date:** 2026-10-28 · **Auditor:** automated browser + source audit (see `test-coverage.md` for how each finding was verified)

Every finding below was reproduced in the browser (or proven directly in source) before being fixed. Findings are grouped by severity. Issues that were **not** fixed because they originate in the backend are listed at the end as known limitations.

---

## Critical issues fixed

### C1. Every API call missed the `/v1` route prefix — the app could not talk to its own backend

- **Location:** `frontend/src/services/api.ts`
- **Observed:** Every request (login, accounts, transfers, applications, admin endpoints) returned 404/405. The Laravel API registers all routes under `Route::prefix('v1')` (`backend/routes/api.php`), while the axios client used `baseURL: '/api'`. Example: `POST /api/applications` → *405 "The POST method is not supported for route api/applications"*.
- **Impact:** The entire application was non-functional: login, dashboard, transfers, admin tooling — everything.
- **Fix:** The versioned client now uses `baseURL: '/api/v1'` (derived from `VITE_API_URL`, which stays the API root). A second `apiRoot` client was added for the one endpoint registered outside the version group (`POST /api/logout`), used by `useAuth.logout`. `frontend/.env.example` documents the semantics.
- **Verified:** Customer login (credentials + email OTP), admin login (username + 16-char token), dashboard data, transfer recipient validation, admin application review all return 200.

### C2. Open-account draft response shape mismatch

- **Location:** `frontend/src/services/application.ts` (`createDraft`)
- **Observed:** The service expected `response.data.data.application` but `ApplicationController@store` returns `{ application_id, acknowledgement_number }`. The wizard crashed with *"Cannot read properties of undefined (reading 'id')"* after the backend had already created the draft (201).
- **Fix:** Map the identifier response onto the `Application` shape.
- **Verified:** Draft creation → personal info → contact info → KYC → address all save (200) and the wizard advances.

### C3. Customer OTP verification never sent the customer ID

- **Location:** `frontend/src/pages/auth/NetBankingLoginPage.tsx`
- **Observed:** `verify-otp` posted only `{ otp }`; the backend requires `customer_id` + `otp`. Every login failed at the OTP step with *"The customer id field is required."*
- **Fix:** Include `customer_id` from the stored credentials.
- **Verified:** Full login with OTP lands on `/customer/dashboard`.

### C4. Admin OTP verification never sent the username

- **Location:** `frontend/src/pages/auth/AdminLoginPage.tsx`
- **Observed:** Same defect as C3 for the admin portal (`username` is required by the backend).
- **Fix:** Include `username` from the stored credentials.
- **Verified:** Admin and master-admin logins land on `/admin`.

### C5. Admin sessions could never be restored — the admin portal always bounced back to login

- **Location:** `frontend/src/hooks/useAuth.ts`
- **Observed:** `fetchUser()` called `GET /admin/me`, an endpoint that does not exist anywhere in `backend/routes/api.php` (only `GET /customer/me` exists). After a successful OTP verification the `ProtectedRoute` revalidation failed, cleared the session, and redirected back to `/admin/login`. The admin portal was unusable even with correct credentials.
- **Fix:** Admin sessions are rehydrated from the stored login payload (the login response already contains the full admin profile). Customer sessions still revalidate server-side via `/customer/me`.
- **Verified:** Admin and master-admin sessions survive navigation and refresh.

### C6. Address step silently blocked the account-opening wizard

- **Location:** `frontend/src/pages/public/OpenAccountPage.tsx` (`addressSchema`)
- **Observed:** The zod schema required all `permanent_*` fields, but those inputs are only rendered when "Permanent address is the same as residential address" is **unchecked** — and the checkbox defaults to **checked**. Validation failed on invisible fields, so clicking *Continue* did nothing: no errors were shown, no request was made. The default path of the flagship onboarding flow was impassable.
- **Fix:** `permanent_*` fields are optional in the base schema; a `superRefine` enforces them only when the checkbox is unchecked. The submit handler already copies residential values into the payload when the box is checked.
- **Verified:** The wizard passes the address step and reaches Documents; unchecking the box still enforces the permanent-address rules in the browser.

---

## High-severity issues fixed

### H1. Transfer endpoints called the wrong paths

- **Location:** `frontend/src/pages/customer/SendMoneyPage.tsx`, `BeneficiariesPage.tsx`
- **Observed:** Four calls posted to `/transfers/*`; the backend mounts them at `/customer/transfers/*`. `validate-recipient` returned 405 and the UI masked it as "Invalid account details".
- **Fix:** All four call sites repointed to `/customer/transfers/...`.
- **Verified:** Recipient validation returns 200 "Recipient found" for a seeded account and 422 with an honest message for a bogus one.

### H2. Contact form faked a successful submission

- **Location:** `frontend/src/pages/public/ContactPage.tsx`
- **Observed:** `onSubmit` ran `setTimeout(1000)` and showed a success toast — no API call was ever made (`performance` entries confirmed zero requests). The public backend endpoint `POST /api/v1/support/tickets` exists.
- **Fix:** The form now posts to the real endpoint (message + sender contact details combined into the ticket description, category `general`). Success toast and alert only appear on a real 2xx; failures render an honest error alert with the published phone/email fallback channels. The duplicated "Send us a message" heading was also de-duplicated.
- **Verified:** Guest submission reaches the API; the backend rejects guest tickets (see limitation B4) and the UI shows the honest failure state.

### H3. Homepage product cards linked to non-existent routes

- **Location:** `frontend/src/pages/public/HomePage.tsx`
- **Observed:** 4 of 6 "Our Banking Products" cards pointed to `/products/fd`, `/products/loans`, `/products/education-loan`, `/products/business`. None exist in the router, so the catch-all silently dumped users back on the homepage.
- **Fix:** Cards now link to the real pages: Fixed Deposit → `/deposits`, Personal/Education Loan → `/loans`, Business Banking → `/products/current`.
- **Verified:** Every homepage href resolves to a declared route.

### H4. Dashboard statistics came from a non-existent endpoint

- **Location:** `frontend/src/pages/customer/DashboardPage.tsx`
- **Observed:** The "Sent This Month / Received This Month / Active Products" cards queried `GET /customer/stats`, which the backend does not implement. The cards silently showed ₹0.00 and 0 — misleading on a banking dashboard.
- **Fix:** The stats are now derived client-side from real endpoints (`/customer/transactions?date_from=…&status=completed`, `/customer/loans`, `/customer/fixed-deposits`).
- **Verified:** Dashboard renders with real totals; the values react to the signed-in account's data.

---

## Medium-severity issues fixed

### M1. Cross-portal redirect loop

- **Location:** `frontend/src/App.tsx` (`ProtectedRoute`, `PublicOnlyRoute`)
- **Observed:** An admin opening a customer route was redirected *to the customer dashboard*, which itself requires the customer role — producing a self-redirect loop that rendered a broken customer shell around an admin session.
- **Fix:** Unauthorized cross-portal access now redirects to the portal matching the **session's** own type (`/admin` for admins, `/customer/dashboard` for customers); guest-only pages send authenticated admins to `/admin` instead of the customer dashboard.
- **Verified:** Admin → customer route lands on `/admin`; customer → admin route lands on the customer dashboard.

### M2. Illegible hero buttons on three public pages

- **Location:** `PersonalBankingPage.tsx`, `SavingsAccountPage.tsx`, `CurrentAccountPage.tsx`
- **Observed:** `btn-outline` (navy-700 text, designed for light backgrounds) was used on the dark `bg-navy-900` heroes — "Explore Products" / "View All Products" were nearly invisible.
- **Fix:** Applied the white-outline treatment already used elsewhere in the same codebase (`border-white text-white hover:bg-navy-800`).
- **Verified:** All three heroes show a legible secondary button.

### M3. Confirm dialogs closed instantly, hiding destructive-action progress

- **Location:** `frontend/src/components/ui/Modal.tsx` (`ConfirmDialog`)
- **Observed:** `onClick={() => { onConfirm(); onClose(); }}` closed the dialog the instant confirm was pressed, so the `loading` prop never displayed for any of the 8 destructive flows that use it (freeze account, reject loan, close FD, delete beneficiary, …). Users got no in-flight feedback and no retry surface on failure.
- **Fix:** The dialog now stays open while `loading` and lets the caller close it — all 8 call sites already close on success (`setXTarget(null)` in their mutation `onSuccess`).
- **Verified:** Admin step-review flow shows the pending state and closes on the 200 response.

### M4. `npm run lint` was broken

- **Location:** `frontend/package.json`
- **Observed:** The lint script used `--ext ts,tsx`, which flat-config ESLint (8.57, auto-enabled by `eslint.config.js`) rejects — `npm run lint` failed for every invocation.
- **Fix:** Dropped `--ext`; the flat config's `files` glob already scopes to `src/**/*.{ts,tsx}`.
- **Verified:** `npm run lint` runs and passes with 0 warnings (it also surfaced F1 below).

---

## Low-severity issues fixed

### L1. `@ts-ignore` comments and unused imports

- **Location:** `frontend/src/pages/public/CurrentAccountPage.tsx`
- **Observed:** Four `@ts-ignore` comments (flagged as errors by `@typescript-eslint/ban-ts-comment`) and unused `Card`/`CardContent` imports.
- **Fix:** Removed the comments and the dead import.

### L2. Missing favicon

- **Location:** `frontend/index.html` referenced `/favicon.svg`; no `public/` directory existed, so the browser logged a 404 on every page.
- **Fix:** Created `frontend/public/favicon.svg` (brand mark using `primary-600`).

### L3. Invalid monospace font-family

- **Location:** `frontend/src/assets/styles/index.css` (`.masked-account`)
- **Observed:** `font-family: 'Monospace', monospace` — the quoted name matches no font.
- **Fix:** Replaced with a real monospace stack (`ui-monospace, SFMono-Regular, Menlo, …`).

### L4. Dead transition classes in the admin sidebar

- **Location:** `frontend/src/layouts/AdminLayout.tsx`
- **Observed:** Submenu animation used `height-0` / `height-auto`, which are not Tailwind classes (no-ops).
- **Fix:** Switched to the same opacity/translate pattern the customer layout uses.

### L5. "New admin" button offered to admins who cannot use it

- **Location:** `frontend/src/pages/master/AdminsPage.tsx`
- **Observed:** The master-only page rendered its create button for any admin; the API returns 403 for non-masters, so the button could only ever produce an error.
- **Fix:** The button renders only for `is_master` users. The page keeps its clear "Master admin access required" error state with a Retry button either way.

### L6. Raw axios error text in the tracking toast

- **Location:** `frontend/src/pages/public/TrackApplicationPage.tsx`
- **Observed:** An unknown acknowledgement number produced the toast *"Request failed with status code 404"* instead of the API's *"Application not found"*.
- **Fix:** Uses `handleApiError` to surface the backend message.

---

## Accessibility notes

Verified in the rendered DOM during the audit (no dedicated screen-reader pass was performed):

- The shared `Input`/`Textarea`/`Select` components associate labels via `htmlFor`/`id`, set `aria-invalid` and `aria-describedby`, and render field errors with `role="alert"`.
- Modals/dialogs are Headless UI `Dialog` instances (`role="dialog"`, Escape + backdrop close).
- Icon-only controls (menu toggles, notification bell, modal close) carry `aria-label`s.
- Headings follow a sane per-page order (single `h1` per page, sectioned `h2/h3`).
- Forms show visible focus rings (`:focus-visible` ring utility) and disabled states during submission.

Known gaps that would need a dedicated effort: no automated a11y test suite, contrast of muted `text-navy-400` metadata text is borderline at small sizes.

---

## Known limitations (backend — not modified, documented instead)

Per the engagement boundary these backend defects were **not** fixed in backend code. The frontend handles each one gracefully where possible.

| # | Blocker | Evidence | Frontend behavior |
|---|---|---|---|
| B1 | `POST /api/v1/applications/{id}/documents` returns **500** — `Call to private method App\Services\ApplicationService::checkStepDocumentsComplete() from scope ApplicationController` (`ApplicationController.php:201`) | `storage/logs/laravel.log`, reproduced twice via the real upload UI | Upload shows an error toast; the document step cannot be completed, so the Review/Submit steps of account opening are unreachable in the UI |
| B2 | `GET /api/v1/customer/notifications` returns **500** — `notifications` table lacks Laravel's `notifiable_type`/`notifiable_id` columns | `storage/logs/laravel.log` | Notifications page shows its empty state; the unread badge silently stays hidden (`retry: false`) |
| B3 | `GET /api/v1/customer/security/sessions` returns **500** — the `sessions` table does not exist while `SESSION_DRIVER=database` | `storage/logs/laravel.log` (repeated on every stateful request) | Security page shows the events section (works, 200) and a "failed to load" note for sessions |
| B4 | Public `POST /api/v1/support/tickets` requires a `customer_id` FK, so guest submissions fail | `support_tickets` migration (`foreignId('customer_id')->constrained()`) | Contact page shows the honest error alert with phone/email fallbacks; submission succeeds for signed-in customers |
| B5 | No `GET /api/v1/admin/me` endpoint exists | `backend/routes/api.php` | Worked around client-side (see C5); server-side revalidation of admin sessions is therefore not possible |
| B6 | No endpoint exposes customer addresses for the profile page | `backend/routes/api.php` | Profile page renders the addresses card with its "No addresses found" empty state |

## Environmental notes

- The default dev ports (5173/8000) were occupied by another project during the audit, so the app was exercised on ports **5176 (Vite) → 8010 (Laravel)** using the `BACKEND_URL` override added to `vite.config.ts` (default behavior unchanged: `/api` → `http://localhost:8000`).
- `MAIL_MAILER=log` with `QUEUE_CONNECTION=database`: OTP emails sit in the `jobs` table until a worker runs. During testing `php artisan queue:work --stop-when-empty` was used to deliver queued OTP mails; no application code depends on this.

# FusionBanking

A full-stack digital banking demo platform: a public marketing site, a multi-step account-opening flow with KYC, a two-factor customer NetBanking area, and a role-based admin portal — built with **Laravel 11** (API) and **React 18 + TypeScript** (SPA).

![FusionBanking application preview](docs/screenshots/01-public-site/home-desktop.png)

The application is a **demo/development platform**. It implements realistic banking *workflows* (applications, transfers, fixed deposits, loan review) against a seeded local database — it is not connected to any real money movement.

Every one of the **53 screenshots** in `docs/screenshots/` is embedded in the [Visual showcase](#visual-showcase) below. Companion reports: [UI audit](docs/ui-audit.md) · [Test coverage report](docs/test-coverage.md)

---

## Highlights

- **Public marketing site** — 12 pages covering products, loans, deposits, security, help, contact, privacy and terms
- **Account opening** — guided 6-step wizard (personal → contact → KYC → address → documents → review) with per-step server-side persistence and a public acknowledgement-number tracker
- **Customer NetBanking** — 2FA login (password + email OTP), dashboard, transfers with recipient validation and OTP confirmation, beneficiaries, transaction history with server-side search/filter/pagination, statements, loans, fixed deposits, profile, security center, support tickets
- **Admin portal** — application review workflow (per-step approve / request-correction / reject), customer and account management, bank-wide transactions, loan approval pipeline, FD book, audit logs, support ticket handling, promotions, system settings, and master-only admin user management
- **Layered security presentation** — masked PAN/Aadhaar/account numbers, rate limiting, verification tokens, and audit logging (implemented on the backend; see [Security](#security))

## Features in detail

### Public website
Twelve routes under a shared layout with a sticky header, mobile drawer navigation, and a four-column footer. The homepage links every product card to a real page (`/products/savings`, `/products/current`, `/deposits`, `/loans`). The contact page posts to the backend's support-ticket endpoint when a customer is signed in and shows an honest error with phone/email fallbacks for guests.

### Account opening (`/open-account`)
A 6-step wizard using a `StepTracker` component. Each step validates locally with **zod** and persists to the backend:

1. **Personal information** — creates a draft application on first submit (`POST /applications`)
2. **Contact details** — mobile/email/address validation
3. **KYC** — PAN and Aadhaar format validation
4. **Address** — with a "permanent address is the same as residential" toggle that conditionally validates permanent fields
5. **Documents** — identity + address proof upload (PDF/JPG/PNG ≤ 5 MB) — *currently blocked by a backend defect, see [Known limitations](#known-limitations)*
6. **Review & submit** — issues an acknowledgement number (`FBK-YYYY-XXXXXXXX`)

The acknowledgement number works on `/track-application`, which renders a live status page with a 7-stage progress tracker.

### Customer NetBanking (`/customer/*`)
Login is two-factor: customer ID + password, then a 6-digit OTP emailed to the registered address. Behind the token-protected layout:

- **Dashboard** — primary account card (masked number, IFSC, available balance), quick stats (total balance, month-to-date sent/received, active products), quick actions, and recent transactions
- **Send money** — three-step wizard (details → review → OTP verification) with recipient account validation against the bank's own accounts
- **Transactions** — server-side search, type/direction/date/amount filters, sorting, and pagination against `GET /customer/transactions`
- **Statements** — date-range statement generation with download
- **Loans / Fixed deposits** — product catalogue, applications, EMI calculation, FD creation and premature closure (with confirmation dialogs)
- **Security center** — security events and session management
- **Profile, notifications, support** — profile editing, notification inbox, and a ticketed support center

### Admin portal (`/admin/*`)
Login requires username + password + a bank access token, then a 16-character verification token from email. Role-based access separates `admin` from `master_admin`:

- **Application review** — queue with status filters; detail view with applicant data, masked KYC, per-step approve / request-correction / reject (each requiring a documented reason), and a full review timeline
- **Customer & account management** — profiles, account freeze/unfreeze/close, restrict/unrestrict
- **Loans & FDs** — approval pipeline (approve → disburse) and the FD book
- **Operations** — audit logs, support tickets (assign/status/message), promotions CRUD, system settings
- **Master-only administration** — admin user management (`/admin/administration/users`); non-master admins see an honest "Master admin access required" state

## Route reference

| Route | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/personal-banking` | Personal banking overview | Public |
| `/products`, `/products/savings`, `/products/current` | Product pages | Public |
| `/loans`, `/deposits` | Loan & deposit products | Public |
| `/security`, `/help`, `/contact`, `/privacy`, `/terms` | Informational pages | Public |
| `/open-account` | Account-opening wizard | Guest only |
| `/track-application` | Public application tracker | Guest only |
| `/netbanking/login` | Customer 2FA login | Guest only |
| `/netbanking/activate` | NetBanking activation | Guest only |
| `/netbanking/password/reset` | Password reset | Guest only |
| `/admin/login` | Admin portal login | Guest only |
| `/customer/dashboard` | Customer dashboard | Customer |
| `/customer/accounts/overview` · `/details` | Account views | Customer |
| `/customer/payments/send` · `/beneficiaries` · `/transactions` · `/statements` | Payments area | Customer |
| `/customer/products/loans` · `/fd` | Financial products | Customer |
| `/customer/profile` · `/security` · `/notifications` · `/support` | Account management | Customer |
| `/admin` | Admin dashboard | Admin |
| `/admin/applications`, `/admin/applications/:id` | Application review | Admin |
| `/admin/customers`, `/admin/accounts`, `/admin/transactions` | Operations | Admin |
| `/admin/loans`, `/admin/fd`, `/admin/audit-logs`, `/admin/support`, `/admin/promotions` | Operations | Admin |
| `/admin/administration/settings`, `/admin/administration/users` | Administration (users is master-only) | Admin / Master admin |
| `*` | Redirects to `/` | — |

Cross-portal access is handled gracefully: an admin opening a customer route lands on `/admin`, and a customer opening an admin route lands on the customer dashboard.

## Technology stack

### Backend
- **Laravel 11** (PHP 8.3+) — REST API under `/api/v1`, service-layer architecture (`AccountService`, `TransferService`, `LedgerService`, …)
- **MySQL 8** — primary datastore
- **Laravel Sanctum** — token authentication
- **Database queue + log mailer** — OTP and notification emails (dev defaults)
- **Spatie Activity Log** — audit trail

### Frontend
- **React 18** + **TypeScript** — route-level code-split SPA
- **Vite 5** — dev server and build tool
- **Tailwind CSS 3** — styling with a custom `primary`/`navy` palette and shared component classes (`btn-*`, `card`, `badge-*`)
- **React Router v6** — routing with lazy routes, protected-route wrappers, and guest-only wrappers
- **TanStack Query** — server state (queries + mutations)
- **React Hook Form + zod** — form state and validation
- **Headless UI + Heroicons** — accessible dialogs/transitions and icons
- **react-hot-toast** — user feedback
- **Vitest** — configured, but no test files exist yet

## Architecture

```
FusionBanking/
├── backend/                     # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # API controllers (root, Admin/, Master/)
│   │   ├── Http/Middleware/        # Admin / Customer / MasterAdmin / rate-limit middleware
│   │   ├── Models/                 # 30+ Eloquent models (Customer, BankAccount, Transfer, …)
│   │   ├── Services/               # Business logic (TransferService, LedgerService, FDService, …)
│   │   ├── Enums/                  # AccountStatus, LoanStatus, TransactionType, …
│   │   └── Notifications/          # OTP / welcome / transfer emails
│   ├── database/migrations/        # Custom schema (applications, bank_accounts, transfers, …)
│   ├── routes/api.php              # /api/v1 route groups (public, customer, admin, master)
│   └── tests/                      # Pest tests
│
├── frontend/                    # React 18 + TypeScript SPA
│   ├── src/
│   │   ├── components/ui/          # Button, Input, Card, Modal, Table, Badge, OTPInput, …
│   │   ├── components/forms/       # StepTracker
│   │   ├── layouts/                # PublicLayout, CustomerLayout, AdminLayout
│   │   ├── pages/                  # public/ (12), auth/ (4), customer/ (13), admin/ (12), master/ (1)
│   │   ├── services/               # axios clients (api → /api/v1, apiRoot → /api) + ApplicationService
│   │   ├── hooks/                  # useAuth (session bootstrap, login/logout)
│   │   ├── lib/utils.ts            # cn(), INR currency/date formatting, masking helpers
│   │   └── assets/styles/          # Tailwind layers + component classes
│   ├── public/                     # favicon.svg
│   └── vite.config.ts              # /api proxy (BACKEND_URL override supported)
│
├── docker-compose.yml           # mysql, mailpit, redis, backend, frontend
├── docs/                        # screenshots + audit/test documentation
└── README.md
```

```mermaid
flowchart TD
    A[index.html / main.tsx] --> B[React Router v6]
    B --> C1[PublicLayout]
    B --> C2[CustomerLayout + ProtectedRoute]
    B --> C3[AdminLayout + ProtectedRoute]
    C1 --> D1[Public pages]
    C2 --> D2[Customer NetBanking pages]
    C3 --> D3[Admin & Master pages]
    D1 & D2 & D3 --> E[Services layer — axios + TanStack Query + RHF/zod]
    E -->|"/api/v1 via Vite proxy"| F[Laravel 11 API]
    F --> G[(MySQL 8)]
    F --> H[Queue → Log/Mailpit emails]
```

## Prerequisites

- **Docker & Docker Compose** (for the containerised stack) *or* **PHP 8.3+ / Composer** and **Node.js 20+** for local development
- A running **MySQL 8** server
- Optional: **Mailpit** for local email testing

## Installation & local setup

The repository is already local. From the project root:

### Backend

```bash
cd backend
composer install
cp .env.example .env          # adjust DB_*, MAIL_* as needed
php artisan key:generate
php artisan migrate --seed    # creates schema + demo data
php artisan serve             # serves http://localhost:8000 by default
```

If port 8000 is taken, serve elsewhere and point the frontend proxy at it:

```bash
php artisan serve --port=8010
# then, for the frontend:
BACKEND_URL=http://localhost:8010 npm run dev
```

Because `QUEUE_CONNECTION=database`, notification emails (including login OTPs) sit in the `jobs` table until a worker runs:

```bash
php artisan queue:work --stop-when-empty   # drain queued emails once
```

### Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173; /api proxies to the backend
```

`frontend/.env` is optional — `VITE_API_URL` defaults to `/api` (the Vite proxy). Point it at a different origin when the API is not colocated.

### Demo accounts (after seeding)

| Role | Identifier | Password |
|---|---|---|
| Master admin | `masteradmin` | `master123` (bank access token: `MASTER-ACCESS-TOKEN-2024`) |
| Admin | `admin` | `admin123` (bank access token: `ADMIN-ACCESS-TOKEN-2024`) |
| Customer | `CUS1000001` … `CUS1000003` | `customer123` |

All logins complete with an emailed verification code — with the log mailer, read it from `backend/storage/logs/laravel.log` (or Mailpit at `http://localhost:8025` if configured).

### Docker alternative

```bash
docker-compose up -d
docker-compose exec backend php artisan migrate --seed
# frontend: http://localhost:5173 · backend: http://localhost:8000 · Mailpit: http://localhost:8025
```

## Available scripts (frontend)

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server with `/api` proxy |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint over `src/**/*.{ts,tsx}` (0-warning policy) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `npm run test:ui` | Vitest (no test files exist yet — see [Testing](#testing-and-quality-checks)) |

## Configuration

Backend environment (`backend/.env`) — never commit real values:

| Variable | Purpose |
|---|---|
| `APP_URL`, `APP_FRONTEND_URL` | Canonical URLs used by the API |
| `DB_*` | MySQL connection |
| `SESSION_DRIVER`, `CACHE_STORE`, `QUEUE_CONNECTION` | All `database` in the default dev config |
| `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT` | `log`/`smtp` + Mailpit in development |
| `FUSION_*` | Bank name/code, demo IFSC, initial deposit amount |
| `DEMO_ADMIN_*`, `DEMO_MASTER_PASSWORD` | Seeded demo credentials (development only) |

Frontend environment (`frontend/.env`):

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API root; the client appends `/v1` for the versioned route group. Defaults to `/api` (Vite proxy) |

`vite.config.ts` also honours a `BACKEND_URL` environment variable to retarget the dev proxy without editing files.

## User workflows

### Open an account (public)
1. `/open-account` → fill personal info → draft application created server-side
2. Contact → KYC → address steps persist incrementally (each validates with zod before the API call)
3. Upload identity + address proofs *(blocked by backend defect — see limitations)*
4. Review & submit → acknowledgement number issued
5. Track progress any time at `/track-application`

### Customer login and transfer
1. `/netbanking/login` → customer ID + password
2. 6-digit OTP from email completes login
3. Dashboard → **Send Money** → validate recipient account → review → OTP verification confirms the transfer
4. Transfer appears in the transaction history with a running balance

### Admin application review
1. `/admin/login` → username + password + bank access token → emailed 16-character token
2. Applications queue → open an application → approve / request correction / reject **per verification step** (reason required)
3. Timeline records every action; final approval creates the account

> Transfers and destructive admin actions (freeze, close, reject, delete) were **not executed** during the documentation pass to keep the seeded dataset intact — their presentation, validation, and confirmation flows were verified up to the final confirm step. See `docs/test-coverage.md` §5.

## Visual showcase

All 53 screenshots captured from the running local application (1440×900 desktop unless noted), grouped by module. Screenshots showing demo data use the seeded accounts (`CUS1000001` Rahul Sharma, `CUS1000002` Priya Patel, `CUS1000003` Amit Kumar) — no real personal data appears anywhere.

### Public website

#### 1. Home page

The public landing page: hero with primary calls-to-action, key banking statistics, a six-item feature grid, product cards that link to real product pages, an expandable FAQ, and the closing call-to-action band.

![Home page](docs/screenshots/01-public-site/home-desktop.png)

#### 2. Personal banking overview

The personal banking page with its "Banking that puts you first" hero, a trust-statistics band, and the "Banking designed for your life" feature section.

![Personal banking overview](docs/screenshots/01-public-site/personal-banking-desktop.png)

#### 3. Products catalogue

The catalogue page: a "Banking products built around your needs" hero above six product cards — Savings, Current, Fixed Deposits, Personal Loan, Education Loan and Business Banking — each with a category tag and a Learn-more link to its detail page.

![Products catalogue](docs/screenshots/01-public-site/products-desktop.png)

#### 4. Savings account product page

Savings product detail: the "Digital Savings Account" hero (zero balance, up to 4.5% p.a.) above a key-features grid covering minimum balance, interest rates and instant digital opening.

![Savings account product page](docs/screenshots/01-public-site/savings-account-desktop.png)

#### 5. Current account product page

Business current account detail: the "Current Account for Business" hero plus key features covering higher transaction limits, an overdraft facility and bulk payments.

![Current account product page](docs/screenshots/01-public-site/current-account-desktop.png)

#### 6. Loans overview

The public loans page: a "Loans designed around your goals" hero, three product cards (Personal, Education, Business) with feature lists and Apply-now links, a "Plan your repayments" EMI-planner call-to-action, and a closing security section.

![Loans overview](docs/screenshots/01-public-site/loans-desktop.png)

#### 7. Deposits overview

The deposit options page ("Make your savings work harder") presenting Fixed, Short-Term and Growth deposit cards with tenure and maturity features.

![Deposits overview](docs/screenshots/01-public-site/deposits-desktop.png)

#### 8. Security page

The public security centre: a "Security built into your banking experience" hero above a "Security controls that matter" card grid covering authentication, transactions and sensitive data.

![Security page](docs/screenshots/01-public-site/security-desktop.png)

#### 9. Help center

The help centre landing: a "How can we help?" hero above four support-topic cards — Account & Login, Accounts & Cards, Payments & Transfers and Support.

![Help center](docs/screenshots/01-public-site/help-center-desktop.png)

#### 10. Contact page

Contact channels and message form: three support cards (General Support, Business Banking, Complaints & Grievances) with published emails, phone numbers and hours, office locations, and a fully validated "Send us a message" form that posts to the support-ticket API for signed-in customers.

![Contact page](docs/screenshots/01-public-site/contact-desktop.png)

#### 11. Privacy policy

The privacy policy page: a "Your Privacy Matters" hero with the last-updated date and a ten-section table of contents, from Information We Collect through Children's Privacy.

![Privacy policy](docs/screenshots/01-public-site/privacy-policy-desktop.png)

#### 12. Terms of service

The terms of service page with its own ten-section table of contents beginning at Acceptance of Terms, rendered as individual content sections below.

![Terms of service](docs/screenshots/01-public-site/terms-of-service-desktop.png)

### Authentication & onboarding

#### 13. NetBanking login

The customer sign-in card: Customer ID and password fields, a remember-me toggle, forgot-password link, and a pointer to account opening for new users.

![NetBanking login](docs/screenshots/02-authentication/netbanking-login-desktop.png)

#### 14. NetBanking login — OTP step

The second authentication factor: after correct credentials the form switches to six single-digit boxes for the emailed OTP, with Verify & Login, back-to-login and resend actions. The "Verification code sent to your registered email" toast is visible top-right.

![NetBanking login OTP step](docs/screenshots/02-authentication/netbanking-login-otp-step.png)

#### 15. Admin portal login

The restricted admin sign-in, requiring username, password and a bank access token, with an explicit "Unauthorized access is prohibited and monitored" warning banner.

![Admin portal login](docs/screenshots/02-authentication/admin-login-desktop.png)

#### 16. NetBanking activation

The first-time activation form verifying Customer ID, account number, registered mobile number and date of birth before NetBanking credentials can be set up.

![NetBanking activation](docs/screenshots/02-authentication/netbanking-activate-desktop.png)

#### 17. Password reset

The reset flow accepting the customer ID plus the 16-character reset token delivered by email, with new-password and confirmation fields (minimum 10 characters) and a back-to-login link.

![Password reset](docs/screenshots/02-authentication/password-reset-desktop.png)

#### 18. Account opening — personal information (step 1)

Step 1 of the six-step account-opening wizard: the StepTracker spanning Personal Information → Review & Submit, above the personal-details form (names, date of birth, gender, marital status, nationality, occupation, annual income, preferred account type).

![Account opening step 1](docs/screenshots/02-authentication/open-account-step1-personal.png)

#### 19. Account opening — document upload (step 5)

Step 5 of the wizard: separate identity-proof (PAN card) and address-proof (utility bill) upload dropzones with document-type selectors. "Continue to Review" stays disabled until both files are uploaded — this is the step currently blocked by the backend upload defect.

![Account opening documents step](docs/screenshots/02-authentication/open-account-step5-documents.png)

#### 20. Track application

The public acknowledgement-number lookup: entering an `FBK-2026-XXXX` number renders the application's live status page with a seven-stage progress tracker.

![Track application](docs/screenshots/02-authentication/track-application-desktop.png)

### Customer NetBanking

#### 21. Customer dashboard

The NetBanking dashboard for the signed-in customer: greeting and customer ID, the primary account card with available balance and masked account number, month-to-date quick stats, quick-action tiles, and the most recent transactions with running balances.

![Customer dashboard](docs/screenshots/03-customer-netbanking/dashboard-desktop.png)

#### 22. Accounts overview

The account overview listing the customer's savings account with balance, status badge, masked number and IFSC, plus Transfer and Transactions shortcuts.

![Accounts overview](docs/screenshots/03-customer-netbanking/accounts-overview-desktop.png)

#### 23. Account details

The full account detail view: account number, type, IFSC, status, current and available balances, opening date, and a four-tile "Account Actions" grid (Send Money, Beneficiaries, Transactions, Statements).

![Account details](docs/screenshots/03-customer-netbanking/account-details-desktop.png)

#### 24. Send money

Step 1 of the three-step transfer wizard: recipient account validation with its Validate action, IFSC and amount fields, a remark box, and the published transfer limits (per-transaction and daily caps).

![Send money](docs/screenshots/03-customer-netbanking/send-money-desktop.png)

#### 25. Beneficiaries

The beneficiaries manager shown in its empty state with "Add Beneficiary" actions — payees added here can be reused for faster transfers.

![Beneficiaries](docs/screenshots/03-customer-netbanking/beneficiaries-desktop.png)

#### 26. Transaction history

The customer's transaction table: server-side search, a filter panel, Export CSV, coloured type badges, signed amounts, running balance and completion status per row.

![Transaction history](docs/screenshots/03-customer-netbanking/transaction-history-desktop.png)

#### 27. Account statements

The statement view, which shares the transaction engine: search and filters above the table with a Download CSV action for date-range exports.

![Account statements](docs/screenshots/03-customer-netbanking/account-statements-desktop.png)

#### 28. Customer loans

The loan overview for the signed-in customer: Active/Pending/Completed stat cards, Active Loans and History tabs, and the active loan's number, purpose, principal and EMI.

![Customer loans](docs/screenshots/03-customer-netbanking/loans-desktop.png)

#### 29. Customer fixed deposits

The FD book with two active deposits (rate, tenure, maturity value and a "Close early" action per deposit). Note: the "Total Invested" and "Est. Maturity Value" summary cards render as ₹NaN in this capture — a value-formatting bug in the FD summary cards; the deposit list data shown below them is correct.

![Customer fixed deposits](docs/screenshots/03-customer-netbanking/fixed-deposits-desktop.png)

#### 30. Profile

The customer profile page (personal information, KYC, contact details and addresses). This capture caught the frame before its content painted, so the image appears blank here; the page itself was verified live in the browser during testing.

![Profile](docs/screenshots/03-customer-netbanking/profile-desktop.png)

#### 31. Security center

The security centre: status tiles (strong password, 2FA enabled, email and mobile verified), the change-password card, and a recent security-events feed with event types, IP addresses and timestamps.

![Security center](docs/screenshots/03-customer-netbanking/security-center-desktop.png)

#### 32. Notifications

The notification inbox with All/Unread/Read tabs shown in its empty state. The backing endpoint currently returns a 500 (documented limitation), which the page handles gracefully.

![Notifications](docs/screenshots/03-customer-netbanking/notifications-desktop.png)

#### 33. Support center

The ticketed support area: quick-help tiles (FAQs, live chat, phone, email) above the customer's ticket list with create-ticket actions.

![Support center](docs/screenshots/03-customer-netbanking/support-center-desktop.png)

### Admin portal

#### 34. Admin dashboard

The bank-wide operations overview: ten stat tiles (total customers, pending applications, pending KYC, active accounts, loans pending review, loans disbursed, total deposits, transactions and transfers today, FD portfolio value), quick-action tiles, and recent applications and activity panels.

![Admin dashboard](docs/screenshots/04-admin-portal/dashboard-desktop.png)

#### 35. Applications queue

The account-opening application queue: acknowledgement-number search, status filter pills (Submitted → Rejected), per-application progress bars, status badges, submission dates and Review links.

![Applications queue](docs/screenshots/04-admin-portal/applications-list-desktop.png)

#### 36. Application detail

The review workspace for a single application: applicant personal information, contact and masked KYC details, the per-step verification list (approve / request correction / reject — each requiring a documented reason), a final Approve action, and the full review timeline.

![Application detail](docs/screenshots/04-admin-portal/application-detail-desktop.png)

#### 37. Customers

The customer management table: contact details, masked primary account with balance, KYC and status badges, and view/restrict action icons per row.

![Customers](docs/screenshots/04-admin-portal/customers-desktop.png)

#### 38. Accounts

Account administration with status filter pills (All/Active/Frozen/Closed) and a table of accounts showing masked numbers, holder, type, balance, opening date and Freeze actions.

![Accounts](docs/screenshots/04-admin-portal/accounts-desktop.png)

#### 39. Bank transactions

All customer transactions across the bank: reference number, masked account with holder name, transaction type, description, signed coloured amounts and timestamps.

![Bank transactions](docs/screenshots/04-admin-portal/transactions-desktop.png)

#### 40. Admin loans

The loan review pipeline: status filter pills and a table of principal, rate/tenure, EMI and status — under-review loans expose Approve/Reject, approved loans expose Disburse.

![Admin loans](docs/screenshots/04-admin-portal/loans-desktop.png)

#### 41. Admin fixed deposits

The admin FD book page. This capture caught the frame before its content painted, so the image appears blank here; the page itself (status filters plus the FD table) was verified to load during testing.

![Admin fixed deposits](docs/screenshots/04-admin-portal/fixed-deposits-desktop.png)

#### 42. Audit logs

The sensitive-action audit trail: an action-name filter above a table recording the action, actor, affected resource, source IP address and timestamp — here showing the `application_step_reviewed` entry recorded during the test pass.

![Audit logs](docs/screenshots/04-admin-portal/audit-logs-desktop.png)

#### 43. Admin support tickets

The support-ticket administration page. This capture caught the frame before its content painted, so the image appears blank here; the ticket list was verified to load (HTTP 200) during testing.

![Admin support tickets](docs/screenshots/04-admin-portal/support-tickets-desktop.png)

#### 44. Promotions

Marketing-banner management: the four seeded promotions with active badges and position numbers, each with deactivate, edit and delete controls, plus a New promotion button.

![Promotions](docs/screenshots/04-admin-portal/promotions-desktop.png)

#### 45. System settings

Bank-wide operational configuration grouped into Fixed Deposits, Loans and Security cards — each setting (amount limits, lockout duration, maximum failed logins) shown with its key, description, current value and an Edit action.

![System settings](docs/screenshots/04-admin-portal/system-settings-desktop.png)

#### 46. Admin users

Master-only administrator management: the admin roster with role badges (Admin / Master Admin), status and creation dates, per-row delete for non-master accounts, and the New admin action — which is hidden entirely from non-master sign-ins.

![Admin users](docs/screenshots/04-admin-portal/admin-users-desktop.png)

### Responsive views

#### 47. Home page — mobile (390×844)

The landing page at mobile width: the hero stacks with full-width calls-to-action and the navigation collapses to a hamburger.

![Home mobile](docs/screenshots/05-responsive/home-mobile.png)

#### 48. Home page — mobile menu open

The public navigation drawer open at mobile width, listing all site sections plus the Track Application, NetBanking Login and Open an Account actions.

![Home mobile menu open](docs/screenshots/05-responsive/home-mobile-menu-open.png)

#### 49. NetBanking login — mobile

The login card stacked full-width at mobile size, with the same fields and actions as the desktop form.

![NetBanking login mobile](docs/screenshots/05-responsive/netbanking-login-mobile.png)

#### 50. Account opening form — mobile

The account-opening wizard at mobile width. This capture caught the frame before its content painted, so the image appears blank here; the wizard's mobile layout was verified live in the browser during testing.

![Open account form mobile](docs/screenshots/05-responsive/open-account-form-mobile.png)

#### 51. Customer dashboard — mobile

The customer dashboard at 390px: stat cards stack in a single column and the account card's Transfer/Statement actions wrap below the balance.

![Customer dashboard mobile](docs/screenshots/05-responsive/customer-dashboard-mobile.png)

#### 52. Customer dashboard — tablet (768×1024)

The dashboard at tablet width: a two-column stat grid with the sidebar collapsed to the hamburger drawer.

![Customer dashboard tablet](docs/screenshots/05-responsive/customer-dashboard-tablet.png)

#### 53. Transactions table — mobile

The customer transaction table at mobile width, scrolling horizontally inside its card wrapper so the page itself never overflows.

![Transactions table mobile](docs/screenshots/05-responsive/transactions-table-mobile.png)

## Responsive design

Tested at 1440×900 (desktop), 768×1024 (tablet), and 390×844 (mobile); no horizontal overflow on any of the 44 routes at any tested width.

- Public site: hamburger drawer navigation below `md`
- App areas: fixed desktop sidebar below `lg` becomes a slide-in drawer; tables scroll horizontally inside card wrappers; stat grids collapse to single column
- Forms stack with full-width actions on mobile

All seven responsive captures are embedded in the [Responsive views](#responsive-views) group of the visual showcase above.

## Testing and quality checks

- **Automated:** `npm run typecheck`, `npm run lint`, and `npm run build` all pass. Vitest is configured but the repository contains **no unit tests** yet; backend Pest tests exist under `backend/tests` (out of scope for the frontend audit that produced these docs).
- **Manual:** every route was opened, refreshed, and exercised at three viewports with browser automation; findings and fixes are itemised in the audit report.
- Full evidence: [docs/test-coverage.md](docs/test-coverage.md) · [docs/ui-audit.md](docs/ui-audit.md) · [docs/screenshot-index.md](docs/screenshot-index.md)

## Known limitations

Documented honestly rather than patched over. Details and evidence in [`docs/ui-audit.md`](docs/ui-audit.md).

1. **Document upload 500s** — `POST /api/v1/applications/{id}/documents` calls a private method (`ApplicationController.php:201`), so the account-opening flow cannot pass the documents step. Backend fix required.
2. **Notifications 500** — the `notifications` table lacks Laravel's `notifiable_type`/`notifiable_id` columns; the customer notifications endpoints fail (the UI degrades to an empty state).
3. **Security sessions 500** — `SESSION_DRIVER=database` but no `sessions` table exists; the sessions section of the Security center fails (events work).
4. **Guest support tickets fail** — `support_tickets.customer_id` is a required FK, so the public contact form only succeeds for signed-in customers; guests get an honest error with contact fallbacks.
5. **No `GET /api/v1/admin/me`** — admin sessions are rehydrated client-side from the stored login payload instead of server-side revalidation.
6. **No frontend unit tests** — Vitest is configured but unused.
7. **Default ports collide easily** — if 5173/8000 are occupied, use `BACKEND_URL` + `--port` as shown above.

## Security

Implemented at the backend and reflected in the UI: Sanctum token auth, two-factor logins with hashed single-use verification tokens, rate limiting on auth endpoints, database transactions with row locking for transfers, idempotency keys, MIME/size-validated uploads, masked PAN/Aadhaar/account numbers in API responses, and activity logging. These claims describe the *code*, not a certified production posture — this is a demo platform.

## Development guidelines

- Keep controllers thin; business logic lives in `app/Services` (backend convention)
- Frontend: shared UI primitives in `components/ui`, compose pages from them, validate with zod schemas colocated with pages, and use TanStack Query for all server state
- Run `npm run typecheck && npm run lint && npm run build` before considering frontend work done
- The API is versioned: **all** new endpoints belong under `Route::prefix('v1')` in `backend/routes/api.php`, and the frontend axios client already targets `/api/v1`

## License

Proprietary — FusionBanking demo platform. No license file is present in the repository.

## Additional documentation

- [docs/screenshot-index.md](docs/screenshot-index.md) — a compact tabular index of the same 53 screenshots (all embedded inline above)
- [docs/ui-audit.md](docs/ui-audit.md) — every frontend defect found and fixed, plus backend blockers
- [docs/test-coverage.md](docs/test-coverage.md) — what was tested, how, and what was deliberately skipped

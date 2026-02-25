# FusionBanking — Screenshot Index

53 captured screenshots of the running local application (after the UI fixes documented in `ui-audit.md`). All images live under `docs/screenshots/` and are referenced with relative paths.

Demo data shown: seeded accounts (CUS1000001 Rahul Sharma, CUS1000002 Priya Patel, CUS1000003 Amit Kumar), demo admins (`admin`, `masteradmin`). No real credentials, tokens, or personal data are exposed.

---

## 1. Public website (`01-public-site/`)

| Screenshot | What it shows |
|---|---|
| ![Home — desktop](screenshots/01-public-site/home-desktop.png) | Landing page: hero, key stats, feature grid, product cards, FAQ accordion, CTA |
| ![Personal Banking — desktop](screenshots/01-public-site/personal-banking-desktop.png) | Personal banking landing page with hero and feature sections |
| ![Products — desktop](screenshots/01-public-site/products-desktop.png) | Product catalogue cards (savings, current, FDs, loans, business) |
| ![Savings Account — desktop](screenshots/01-public-site/savings-account-desktop.png) | Savings product detail page |
| ![Current Account — desktop](screenshots/01-public-site/current-account-desktop.png) | Current account product detail page |
| ![Loans — desktop](screenshots/01-public-site/loans-desktop.png) | Loan products with per-loan feature lists and EMI planner CTA |
| ![Deposits — desktop](screenshots/01-public-site/deposits-desktop.png) | Deposit options (fixed/short-term/growth) |
| ![Security — desktop](screenshots/01-public-site/security-desktop.png) | Public security page |
| ![Help Center — desktop](screenshots/01-public-site/help-center-desktop.png) | Help center FAQs and support channels |
| ![Contact — desktop](screenshots/01-public-site/contact-desktop.png) | Contact channels, offices, and the message form (submits to the support-ticket API) |
| ![Privacy Policy — desktop](screenshots/01-public-site/privacy-policy-desktop.png) | Privacy policy page |
| ![Terms of Service — desktop](screenshots/01-public-site/terms-of-service-desktop.png) | Terms of service page |

## 2. Authentication & onboarding (`02-authentication/`)

| Screenshot | What it shows |
|---|---|
| ![NetBanking Login — desktop](screenshots/02-authentication/netbanking-login-desktop.png) | Customer login form (customer ID + password) |
| ![NetBanking Login — OTP step](screenshots/02-authentication/netbanking-login-otp-step.png) | 6-digit email-OTP verification step of the 2FA login |
| ![Admin Login — desktop](screenshots/02-authentication/admin-login-desktop.png) | Admin portal login (username, password, bank access token) |
| ![NetBanking Activate — desktop](screenshots/02-authentication/netbanking-activate-desktop.png) | First-time NetBanking activation page |
| ![Password Reset — desktop](screenshots/02-authentication/password-reset-desktop.png) | Password reset page |
| ![Open Account — Step 1 Personal](screenshots/02-authentication/open-account-step1-personal.png) | Multi-step account opening: personal information form with step tracker |
| ![Open Account — Documents step](screenshots/02-authentication/open-account-step5-documents.png) | Document upload step (identity + address proof) — cannot complete due to backend blocker B1 |
| ![Track Application — desktop](screenshots/02-authentication/track-application-desktop.png) | Public acknowledgement-number lookup form |

## 3. Customer NetBanking (`03-customer-netbanking/`)

| Screenshot | What it shows |
|---|---|
| ![Dashboard — desktop](screenshots/03-customer-netbanking/dashboard-desktop.png) | Account summary card, balance, quick stats, quick actions, recent transactions |
| ![Accounts Overview — desktop](screenshots/03-customer-netbanking/accounts-overview-desktop.png) | All accounts with balances and status |
| ![Account Details — desktop](screenshots/03-customer-netbanking/account-details-desktop.png) | Full account information (masked number, IFSC, balances) and account actions |
| ![Send Money — desktop](screenshots/03-customer-netbanking/send-money-desktop.png) | 3-step transfer wizard with recipient validation and transfer limits |
| ![Beneficiaries — desktop](screenshots/03-customer-netbanking/beneficiaries-desktop.png) | Payee management |
| ![Transaction History — desktop](screenshots/03-customer-netbanking/transaction-history-desktop.png) | Filterable, searchable transaction table with running balance |
| ![Account Statements — desktop](screenshots/03-customer-netbanking/account-statements-desktop.png) | Date-range statement view |
| ![Loans — desktop](screenshots/03-customer-netbanking/loans-desktop.png) | Customer loans and available loan products |
| ![Fixed Deposits — desktop](screenshots/03-customer-netbanking/fixed-deposits-desktop.png) | FD holdings and FD products |
| ![Profile — desktop](screenshots/03-customer-netbanking/profile-desktop.png) | Personal information, KYC (masked), contact details |
| ![Security Center — desktop](screenshots/03-customer-netbanking/security-center-desktop.png) | Security events; sessions section shows the documented backend failure state |
| ![Notifications — desktop](screenshots/03-customer-netbanking/notifications-desktop.png) | Notifications page with empty state (endpoint currently 500s — backend blocker B2) |
| ![Support Center — desktop](screenshots/03-customer-netbanking/support-center-desktop.png) | Support tickets list |

## 4. Admin portal (`04-admin-portal/`)

| Screenshot | What it shows |
|---|---|
| ![Admin Dashboard — desktop](screenshots/04-admin-portal/dashboard-desktop.png) | Bank-wide stats, quick actions, recent applications/activity |
| ![Applications — desktop](screenshots/04-admin-portal/applications-list-desktop.png) | Application queue with filters |
| ![Application Detail — desktop](screenshots/04-admin-portal/application-detail-desktop.png) | Applicant profile, masked KYC, per-step verification actions, timeline |
| ![Customers — desktop](screenshots/04-admin-portal/customers-desktop.png) | Customer management table |
| ![Accounts — desktop](screenshots/04-admin-portal/accounts-desktop.png) | Account administration table |
| ![Transactions — desktop](screenshots/04-admin-portal/transactions-desktop.png) | Bank-wide transaction ledger |
| ![Loans — desktop](screenshots/04-admin-portal/loans-desktop.png) | Loan review queue with approve/reject/disburse actions |
| ![Fixed Deposits — desktop](screenshots/04-admin-portal/fixed-deposits-desktop.png) | FD book |
| ![Audit Logs — desktop](screenshots/04-admin-portal/audit-logs-desktop.png) | Immutable audit trail |
| ![Support Tickets — desktop](screenshots/04-admin-portal/support-tickets-desktop.png) | Support ticket administration |
| ![Promotions — desktop](screenshots/04-admin-portal/promotions-desktop.png) | Promotions management |
| ![System Settings — desktop](screenshots/04-admin-portal/system-settings-desktop.png) | Configurable limits, rates, security parameters |
| ![Admin Users — desktop](screenshots/04-admin-portal/admin-users-desktop.png) | Master-only admin management (role badges, delete action) |

## 5. Responsive views (`05-responsive/`)

| Screenshot | What it shows |
|---|---|
| ![Home — mobile](screenshots/05-responsive/home-mobile.png) | Landing page at 390×844: stacked hero and CTAs |
| ![Home — mobile menu](screenshots/05-responsive/home-mobile-menu-open.png) | Mobile navigation drawer open |
| ![NetBanking Login — mobile](screenshots/05-responsive/netbanking-login-mobile.png) | Login form at mobile width |
| ![Open Account — mobile](screenshots/05-responsive/open-account-form-mobile.png) | Account-opening form at mobile width |
| ![Customer Dashboard — mobile](screenshots/05-responsive/customer-dashboard-mobile.png) | Dashboard cards stacked at 390px |
| ![Customer Dashboard — tablet](screenshots/05-responsive/customer-dashboard-tablet.png) | Two-column dashboard grid at 768px |
| ![Transactions Table — mobile](screenshots/05-responsive/transactions-table-mobile.png) | Admin transactions table scrolling inside its wrapper at mobile width |

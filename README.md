# FusionBanking - Modern Digital Banking Platform

A complete, production-grade digital banking web application built with Laravel (backend) and React + TypeScript (frontend).

## Features

### Core Banking
- **Multi-step Account Opening** - Guided 7-step application process with progress tracking
- **KYC Verification** - PAN, Aadhaar, document upload with secure storage
- **Admin Review Workflow** - Granular stage-by-stage approval/rejection with correction flow
- **Email Verification Tokens** - 16-character secure tokens for sensitive operations
- **Account Creation** - Automatic customer ID, account number, IFSC generation
- **Initial Deposit** - ₹1,00,000 welcome deposit with proper ledger entry

### NetBanking
- **Secure Authentication** - Customer ID + password + email OTP (2FA)
- **Dashboard** - Real-time balance, recent transactions, quick actions
- **Money Transfers** - Internal transfers with recipient validation, preview, and OTP confirmation
- **Transaction History** - Filterable, searchable, paginated with export options
- **Account Statements** - Date range statements with CSV/PDF download
- **Beneficiaries** - Manage payees with validation and cooling periods
- **Profile Management** - View/update permitted profile information
- **Security Center** - Login history, active sessions, password management

### Financial Products
- **Loans** - Personal, Education, Business loans with EMI calculator
- **Fixed Deposits** - Multiple tenure/rate options with maturity tracking
- **Loan Admin Review** - Income analysis, repayment ratio, approval workflow

### Administration
- **Role-based Access** - Master Admin, Admin, Customer with granular permissions
- **Application Queue** - Filterable, sortable, paginated application management
- **Customer Management** - Full customer profiles, accounts, transactions, KYC
- **Audit Logging** - Immutable audit trail for all critical actions
- **System Settings** - Configurable limits, rates, security parameters

### Security
- **Atomic Transactions** - Database transactions with row locking for transfers
- **Idempotency Keys** - Prevent duplicate submissions
- **Rate Limiting** - Login, OTP, transfer verification endpoints
- **Input Validation** - Server-side validation with Zod/Laravel
- **Secure File Upload** - MIME validation, size limits, private storage
- **Data Masking** - PAN, Aadhaar, account numbers masked in UI
- **Session Management** - Secure cookies, timeout, concurrent session control

## Tech Stack

### Backend
- **Laravel 11** - PHP 8.3+
- **MySQL 8** - Primary database
- **Redis** - Caching, sessions, queues
- **Laravel Sanctum** - API authentication
- **Spatie Laravel Permission** - RBAC
- **Spatie Activity Log** - Audit trails
- **Mailpit** - Local email testing

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Routing
- **TanStack Query** - Server state management
- **React Hook Form + Zod** - Form handling/validation
- **Headless UI** - Accessible components
- **Lucide Icons** - Icon system
- **Framer Motion** - Animations

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend development)
- PHP 8.3+ & Composer (for local backend development)

### Using Docker (Recommended)

```bash
# Clone and navigate
cd FusionBanking

# Start all services
docker-compose up -d

# Wait for services to be healthy, then run migrations
docker-compose exec backend php artisan migrate --seed

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# Mailpit UI: http://localhost:8025
```

### Local Development

#### Backend
```bash
cd backend

# Install dependencies
composer install

# Copy environment
cp .env.example .env

# Configure database and mail in .env
# Generate app key
php artisan key:generate

# Run migrations with seeders
php artisan migrate --seed

# Start development server
php artisan serve
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Configuration

### Backend (.env)
```env
APP_NAME="FusionBanking"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_FRONTEND_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fusionbanking
DB_USERNAME=fusionbanking
DB_PASSWORD=secret

MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="no-reply@fusionbanking.local"
MAIL_FROM_NAME="FusionBanking"

# FusionBanking Configuration
FUSION_BANK_NAME="FusionBanking"
FUSION_BANK_CODE="FUSION"
FUSION_COUNTRY="India"
FUSION_CURRENCY="INR"
FUSION_DEMO_IFSC="FUSB0001001"
FUSION_INITIAL_DEPOSIT=100000

# Demo Credentials (development only)
DEMO_ADMIN_EMAIL=admin@fusionbanking.local
DEMO_ADMIN_PASSWORD=admin123
DEMO_MASTER_PASSWORD=master123
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## Default Accounts (After Seeding)

### Master Admin
- **Username:** `masteradmin`
- **Password:** `master123` (from DEMO_MASTER_PASSWORD)
- **Bank Access Token:** `MASTER-ACCESS-TOKEN-2024`

### Admin
- **Username:** `admin`
- **Password:** `admin123` (from DEMO_ADMIN_PASSWORD)
- **Bank Access Token:** `ADMIN-ACCESS-TOKEN-2024`

### Demo Customers
- 3 pre-created customers with active accounts
- Customer IDs: `CUS1000001`, `CUS1000002`, `CUS1000003`
- Password: `customer123`

## API Structure

```
/api/auth              # Authentication endpoints
/api/applications      # Account opening applications
/api/track             # Public application tracking
/api/customer          # Customer banking (protected)
  /accounts            # Account management
  /transfers           # Money transfers
  /transactions        # Transaction history
  /beneficiaries       # Payee management
  /loans               # Loan applications
  /fixed-deposits      # FD management
  /profile             # Profile & security
/api/admin             # Admin operations (protected)
  /applications        # Application review
  /customers           # Customer management
  /loans               # Loan review
  /dashboard           # Statistics & reports
/api/master            # Master admin only
```

## Key API Endpoints

### Public
- `POST /api/applications` - Create draft application
- `POST /api/applications/{id}/personal-info` - Save personal info
- `POST /api/applications/{id}/contact-info` - Save contact info
- `POST /api/applications/{id}/kyc-info` - Save KYC info
- `POST /api/applications/{id}/address-info` - Save address info
- `POST /api/applications/{id}/documents` - Upload documents
- `POST /api/applications/{id}/submit` - Submit application
- `GET /api/track/{acknowledgement}` - Track application

### Customer (requires auth)
- `POST /api/auth/customer/login` - Login (returns requires_otp)
- `POST /api/auth/customer/verify-otp` - Verify login OTP
- `GET /api/customer/me` - Current user profile
- `GET /api/customer/accounts` - List accounts
- `POST /api/transfers` - Initiate transfer
- `POST /api/transfers/verify` - Verify transfer OTP
- `GET /api/customer/transactions` - Transaction history
- `POST /api/customer/beneficiaries` - Add beneficiary

### Admin (requires auth + admin role)
- `GET /api/admin/applications` - List applications (filterable)
- `GET /api/admin/applications/{id}` - Application detail
- `POST /api/admin/applications/{id}/review` - Review step
- `POST /api/admin/applications/{id}/approve` - Final approval
- `GET /api/admin/dashboard/stats` - Dashboard statistics

## Testing

```bash
# Backend tests
cd backend
./vendor/bin/pest
./vendor/bin/pest --coverage

# Frontend tests
cd frontend
npm run test
npm run test:ui
```

## Project Structure

```
FusionBanking/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Api/         # API controllers
│   │   │   ├── Auth/        # Authentication
│   │   │   ├── Admin/       # Admin controllers
│   │   │   └── Customer/    # Customer controllers
│   │   ├── Models/          # Eloquent models
│   │   ├── Services/        # Business logic
│   │   ├── Notifications/   # Email notifications
│   │   ├── Enums/           # PHP enums
│   │   └── Policies/        # Authorization policies
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   ├── seeders/         # Database seeders
│   │   └── factories/       # Model factories
│   ├── routes/
│   │   ├── api.php          # API routes
│   │   └── web.php          # Web routes
│   └── tests/               # Pest tests
│
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # Base components
│   │   │   ├── forms/       # Form components
│   │   │   ├── layout/      # Layout components
│   │   │   └── banking/     # Banking-specific
│   │   ├── layouts/         # Page layouts
│   │   ├── pages/           # Page components
│   │   ├── features/        # Feature modules
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── lib/             # Utilities
│   │   ├── types/           # TypeScript types
│   │   └── contexts/        # React contexts
│   └── public/
│
├── docker-compose.yml       # Docker orchestration
└── README.md               # This file
```

## Development Guidelines

### Backend
- Use Service classes for business logic (AccountService, TransferService, etc.)
- Thin controllers - delegate to services
- Database transactions for all financial operations
- API Resources for consistent responses
- Policies for authorization
- Enums for all status fields

### Frontend
- Component-based architecture
- Custom hooks for data fetching (React Query)
- Form validation with Zod schemas
- Tailwind utility classes
- TypeScript for type safety
- Responsive design (mobile-first)

## Security Considerations

- All financial operations use database transactions with row locking
- Verification tokens are hashed at rest, single-use, time-limited
- Passwords hashed with bcrypt (Laravel default)
- CSRF protection on all forms
- Rate limiting on sensitive endpoints
- Input sanitization and validation
- Secure file upload with validation
- Audit logging for all critical actions
- No sensitive data in logs or frontend state

## License

Proprietary - FusionBanking Demo Platform

## Support

For issues and questions, please check the documentation or create an issue in the repository.
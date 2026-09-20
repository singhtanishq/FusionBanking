import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { useRequireAuth } from '@/hooks/useAuth'

// Route-level code splitting: each page is its own chunk.
const HomePage = lazy(() => import('@/pages/public/HomePage').then(m => ({ default: m.HomePage })))
const OpenAccountPage = lazy(() => import('@/pages/public/OpenAccountPage').then(m => ({ default: m.OpenAccountPage })))
const TrackApplicationPage = lazy(() => import('@/pages/public/TrackApplicationPage').then(m => ({ default: m.TrackApplicationPage })))
const ProductsPage = lazy(() => import('@/pages/public/ProductsPage').then(m => ({ default: m.ProductsPage })))
const PublicLoansPage = lazy(() => import('@/pages/public/LoansPage').then(m => ({ default: m.LoansPage })))
const DepositsPage = lazy(() => import('@/pages/public/DepositsPage').then(m => ({ default: m.DepositsPage })))
const PublicSecurityPage = lazy(() => import('@/pages/public/SecurityPage').then(m => ({ default: m.SecurityPage })))
const HelpPage = lazy(() => import('@/pages/public/HelpPage').then(m => ({ default: m.HelpPage })))
const PersonalBankingPage = lazy(() => import('@/pages/public/PersonalBankingPage').then(m => ({ default: m.PersonalBankingPage })))
const SavingsAccountPage = lazy(() => import('@/pages/public/SavingsAccountPage').then(m => ({ default: m.SavingsAccountPage })))
const CurrentAccountPage = lazy(() => import('@/pages/public/CurrentAccountPage').then(m => ({ default: m.CurrentAccountPage })))
const ContactPage = lazy(() => import('@/pages/public/ContactPage').then(m => ({ default: m.ContactPage })))
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('@/pages/public/TermsPage').then(m => ({ default: m.TermsPage })))

const NetBankingLoginPage = lazy(() => import('@/pages/auth/NetBankingLoginPage').then(m => ({ default: m.NetBankingLoginPage })))
const NetBankingActivatePage = lazy(() => import('@/pages/auth/NetBankingActivatePage').then(m => ({ default: m.NetBankingActivatePage })))
const PasswordResetPage = lazy(() => import('@/pages/auth/PasswordResetPage').then(m => ({ default: m.PasswordResetPage })))
const AdminLoginPage = lazy(() => import('@/pages/auth/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })))

const CustomerDashboardPage = lazy(() => import('@/pages/customer/DashboardPage').then(m => ({ default: m.CustomerDashboardPage })))
const AccountOverviewPage = lazy(() => import('@/pages/customer/AccountOverviewPage').then(m => ({ default: m.AccountOverviewPage })))
const AccountDetailsPage = lazy(() => import('@/pages/customer/AccountDetailsPage').then(m => ({ default: m.AccountDetailsPage })))
const SendMoneyPage = lazy(() => import('@/pages/customer/SendMoneyPage').then(m => ({ default: m.SendMoneyPage })))
const BeneficiariesPage = lazy(() => import('@/pages/customer/BeneficiariesPage').then(m => ({ default: m.BeneficiariesPage })))
const TransactionsPage = lazy(() => import('@/pages/customer/TransactionsPage').then(m => ({ default: m.TransactionsPage })))
const StatementsPage = lazy(() => import('@/pages/customer/StatementsPage').then(m => ({ default: m.StatementsPage })))
const LoansPage = lazy(() => import('@/pages/customer/LoansPage').then(m => ({ default: m.LoansPage })))
const FDPage = lazy(() => import('@/pages/customer/FDPage').then(m => ({ default: m.FDPage })))
const ProfilePage = lazy(() => import('@/pages/customer/ProfilePage').then(m => ({ default: m.ProfilePage })))
const SecurityPage = lazy(() => import('@/pages/customer/SecurityPage').then(m => ({ default: m.SecurityPage })))
const NotificationsPage = lazy(() => import('@/pages/customer/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const SupportPage = lazy(() => import('@/pages/customer/SupportPage').then(m => ({ default: m.SupportPage })))

const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const AdminApplicationsPage = lazy(() => import('@/pages/admin/ApplicationsPage').then(m => ({ default: m.AdminApplicationsPage })))
const AdminApplicationDetailPage = lazy(() => import('@/pages/admin/ApplicationDetailPage').then(m => ({ default: m.AdminApplicationDetailPage })))
const AdminCustomersPage = lazy(() => import('@/pages/admin/CustomersPage').then(m => ({ default: m.AdminCustomersPage })))
const AdminAccountsPage = lazy(() => import('@/pages/admin/AccountsPage').then(m => ({ default: m.AdminAccountsPage })))
const AdminTransactionsPage = lazy(() => import('@/pages/admin/TransactionsPage').then(m => ({ default: m.AdminTransactionsPage })))
const AdminLoansPage = lazy(() => import('@/pages/admin/LoansPage').then(m => ({ default: m.AdminLoansPage })))
const AdminFixedDepositsPage = lazy(() => import('@/pages/admin/FixedDepositsPage').then(m => ({ default: m.AdminFixedDepositsPage })))
const AdminAuditLogsPage = lazy(() => import('@/pages/admin/AuditLogsPage').then(m => ({ default: m.AdminAuditLogsPage })))
const AdminSupportPage = lazy(() => import('@/pages/admin/SupportPage').then(m => ({ default: m.AdminSupportPage })))
const AdminPromotionsPage = lazy(() => import('@/pages/admin/PromotionsPage').then(m => ({ default: m.AdminPromotionsPage })))
const AdminSettingsPage = lazy(() => import('@/pages/admin/SettingsPage').then(m => ({ default: m.AdminSettingsPage })))
const MasterAdminsPage = lazy(() => import('@/pages/master/AdminsPage').then(m => ({ default: m.MasterAdminsPage })))

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
    </div>
  )
}

function ProtectedRoute({ userType = 'customer' }: { userType?: 'customer' | 'admin' }) {
  const { authorized, loading, isAuthenticated } = useRequireAuth(userType)

  if (loading) {
    return <FullScreenLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to={userType === 'admin' ? '/admin/login' : '/netbanking/login'} replace />
  }

  if (!authorized) {
    return <Navigate to={userType === 'admin' ? '/admin/login' : '/customer/dashboard'} replace />
  }

  return <Outlet />
}

function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useRequireAuth()

  if (loading) {
    return <FullScreenLoader />
  }

  if (isAuthenticated) {
    return <Navigate to="/customer/dashboard" replace />
  }

  return <Outlet />
}

export default function App() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        {/* Public marketing routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/personal-banking" element={<PersonalBankingPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/savings" element={<SavingsAccountPage />} />
          <Route path="/products/current" element={<CurrentAccountPage />} />
          <Route path="/loans" element={<PublicLoansPage />} />
          <Route path="/deposits" element={<DepositsPage />} />
          <Route path="/security" element={<PublicSecurityPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Guest-only routes */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/open-account" element={<OpenAccountPage />} />
            <Route path="/track-application" element={<TrackApplicationPage />} />
            <Route path="/netbanking/login" element={<NetBankingLoginPage />} />
            <Route path="/netbanking/activate" element={<NetBankingActivatePage />} />
            <Route path="/netbanking/password/reset" element={<PasswordResetPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
          </Route>
        </Route>

        {/* Customer protected routes */}
        <Route element={<CustomerLayout />}>
          <Route element={<ProtectedRoute userType="customer" />}>
            <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/customer/accounts/overview" element={<AccountOverviewPage />} />
            <Route path="/customer/accounts/details" element={<AccountDetailsPage />} />
            <Route path="/customer/payments/send" element={<SendMoneyPage />} />
            <Route path="/customer/payments/beneficiaries" element={<BeneficiariesPage />} />
            <Route path="/customer/payments/transactions" element={<TransactionsPage />} />
            <Route path="/customer/payments/statements" element={<StatementsPage />} />
            <Route path="/customer/products/loans" element={<LoansPage />} />
            <Route path="/customer/products/fd" element={<FDPage />} />
            <Route path="/customer/profile" element={<ProfilePage />} />
            <Route path="/customer/security" element={<SecurityPage />} />
            <Route path="/customer/notifications" element={<NotificationsPage />} />
            <Route path="/customer/support" element={<SupportPage />} />
          </Route>
        </Route>

        {/* Admin protected routes */}
        <Route element={<AdminLayout />}>
          <Route element={<ProtectedRoute userType="admin" />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/applications" element={<AdminApplicationsPage />} />
            <Route path="/admin/applications/:id" element={<AdminApplicationDetailPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
            <Route path="/admin/accounts" element={<AdminAccountsPage />} />
            <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
            <Route path="/admin/loans" element={<AdminLoansPage />} />
            <Route path="/admin/fd" element={<AdminFixedDepositsPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="/admin/support" element={<AdminSupportPage />} />
            <Route path="/admin/promotions" element={<AdminPromotionsPage />} />
            <Route path="/admin/administration/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/administration/users" element={<MasterAdminsPage />} />
          </Route>
        </Route>

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

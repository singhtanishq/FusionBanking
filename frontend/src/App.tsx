import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { useRequireAuth } from '@/hooks/useAuth'
import { HomePage } from '@/pages/public/HomePage'
import { OpenAccountPage } from '@/pages/public/OpenAccountPage'
import { TrackApplicationPage } from '@/pages/public/TrackApplicationPage'
import { ProductsPage } from '@/pages/public/ProductsPage'
import { LoansPage as PublicLoansPage } from '@/pages/public/LoansPage'
import { DepositsPage } from '@/pages/public/DepositsPage'
import { SecurityPage as PublicSecurityPage } from '@/pages/public/SecurityPage'
import { HelpPage } from '@/pages/public/HelpPage'
import { NetBankingLoginPage } from '@/pages/auth/NetBankingLoginPage'
import { NetBankingActivatePage } from '@/pages/auth/NetBankingActivatePage'
import { PasswordResetPage } from '@/pages/auth/PasswordResetPage'
import { AdminLoginPage } from '@/pages/auth/AdminLoginPage'
import { CustomerDashboardPage } from '@/pages/customer/DashboardPage'
import { AccountOverviewPage } from '@/pages/customer/AccountOverviewPage'
import { AccountDetailsPage } from '@/pages/customer/AccountDetailsPage'
import { SendMoneyPage } from '@/pages/customer/SendMoneyPage'
import { BeneficiariesPage } from '@/pages/customer/BeneficiariesPage'
import { TransactionsPage } from '@/pages/customer/TransactionsPage'
import { StatementsPage } from '@/pages/customer/StatementsPage'
import { LoansPage } from '@/pages/customer/LoansPage'
import { FDPage } from '@/pages/customer/FDPage'
import { ProfilePage } from '@/pages/customer/ProfilePage'
import { SecurityPage } from '@/pages/customer/SecurityPage'
import { NotificationsPage } from '@/pages/customer/NotificationsPage'
import { SupportPage } from '@/pages/customer/SupportPage'
import { AdminDashboardPage } from '@/pages/admin/DashboardPage'
import { AdminApplicationsPage } from '@/pages/admin/ApplicationsPage'
import { AdminApplicationDetailPage } from '@/pages/admin/ApplicationDetailPage'
import { AdminCustomersPage } from '@/pages/admin/CustomersPage'
import { AdminAccountsPage } from '@/pages/admin/AccountsPage'
import { AdminTransactionsPage } from '@/pages/admin/TransactionsPage'
import { AdminLoansPage } from '@/pages/admin/LoansPage'
import { AdminFixedDepositsPage } from '@/pages/admin/FixedDepositsPage'
import { AdminAuditLogsPage } from '@/pages/admin/AuditLogsPage'
import { AdminSupportPage } from '@/pages/admin/SupportPage'
import { AdminPromotionsPage } from '@/pages/admin/PromotionsPage'
import { AdminSettingsPage } from '@/pages/admin/SettingsPage'
import { MasterAdminsPage } from '@/pages/master/AdminsPage'

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
    <Routes>
      {/* Public marketing routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/loans" element={<PublicLoansPage />} />
        <Route path="/deposits" element={<DepositsPage />} />
        <Route path="/security" element={<PublicSecurityPage />} />
        <Route path="/help" element={<HelpPage />} />

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
  )
}

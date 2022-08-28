import { Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { useRequireAuth } from '@/hooks/useAuth'
import { HomePage } from '@/pages/public/HomePage'
import { OpenAccountPage } from '@/pages/public/OpenAccountPage'
import { TrackApplicationPage } from '@/pages/public/TrackApplicationPage'
import { ProductsPage } from '@/pages/public/ProductsPage'
import { LoansPage } from '@/pages/public/LoansPage'
import { DepositsPage } from '@/pages/public/DepositsPage'
import { SecurityPage } from '@/pages/public/SecurityPage'
import { HelpPage } from '@/pages/public/HelpPage'
import { NetBankingLoginPage } from '@/pages/auth/NetBankingLoginPage'
import { NetBankingActivatePage } from '@/pages/auth/NetBankingActivatePage'
import { PasswordResetPage } from '@/pages/auth/PasswordResetPage'
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

function ProtectedRoute({ children, userType = 'customer' }: { children: React.ReactNode; userType?: 'customer' | 'admin' }) {
  const { authorized, loading } = useRequireAuth(userType)
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }
  
  if (!authorized) {
    return <Navigate to={userType === 'admin' ? '/admin/login' : '/netbanking/login'} replace />
  }
  
  return <>{children}</>
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useRequireAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }
  
  if (isAuthenticated) {
    return <Navigate to="/customer/dashboard" replace />
  }
  
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/deposits" element={<DepositsPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/help" element={<HelpPage />} />
        
        {/* Public auth routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/open-account" element={<OpenAccountPage />} />
          <Route path="/track-application" element={<TrackApplicationPage />} />
          <Route path="/netbanking/login" element={<NetBankingLoginPage />} />
          <Route path="/netbanking/activate" element={<NetBankingActivatePage />} />
          <Route path="/netbanking/password/reset" element={<PasswordResetPage />} />
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
          <Route path="/customer/products/loans" element={<LoansCustomerPage />} />
          <Route path="/customer/products/fd" element={<FDCustomerPage />} />
          <Route path="/customer/profile" element={<ProfilePage />} />
          <Route path="/customer/security" element={<SecurityCustomerPage />} />
          <Route path="/customer/notifications" element={<NotificationsPage />} />
          <Route path="/customer/support" element={<SupportPage />} />
        </Route>
      </Route>

      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
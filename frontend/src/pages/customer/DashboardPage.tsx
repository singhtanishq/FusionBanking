import { Link } from 'react-router-dom'
import { 
  CreditCardIcon, 
  ArrowPathIcon, 
  BanknotesIcon, 
  ChartBarIcon,
  PlusIcon,
  ArrowRightIcon,
  EyeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'

interface Account {
  id: string
  account_number: string
  account_type: string
  balance: number
  available_balance: number
  status: string
  ifsc_code: string
  opening_date: string
}

interface Transaction {
  id: string
  reference_number: string
  type: string
  direction: string
  amount: number
  description: string
  created_at: string
  closing_balance: number
}

interface CustomerStats {
  total_balance: number
  sent_this_month: number
  received_this_month: number
  active_loans: number
  active_fds: number
}

export function CustomerDashboardPage() {
  const { user } = useAuth()

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await api.get('/customer/accounts')
      return response.data.data as Account[]
    },
  })

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const response = await api.get('/customer/transactions', { params: { per_page: 5 } })
      return response.data.data as Transaction[]
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: async () => {
      const response = await api.get('/customer/stats')
      return response.data.data as CustomerStats
    },
  })

  const primaryAccount = accounts?.[0]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-primary-600">
              {user?.full_name?.split(' ')[0] || 'Customer'}
            </span>
          </h1>
          <p className="text-navy-600 mt-1">Customer ID: <span className="font-mono font-medium text-navy-900">{user?.customer_id}</span></p>
        </div>
        <div className="flex gap-3">
          <Link to="/customer/payments/send">
            <Button>
              <PlusIcon className="h-5 w-5" />
              Send Money
            </Button>
          </Link>
          <Link to="/customer/accounts/overview">
            <Button variant="outline">
              <EyeIcon className="h-5 w-5" />
              View Accounts
            </Button>
          </Link>
        </div>
      </div>

      {/* Account Summary Card */}
      {primaryAccount && (
        <Card className="bg-gradient-to-br from-navy-900 to-navy-800 border-navy-700">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-navy-300 text-sm mb-2">
                  <CreditCardIcon className="h-5 w-5" />
                  <span className="font-medium">FusionBanking {primaryAccount.account_type.charAt(0).toUpperCase() + primaryAccount.account_type.slice(1)} Account</span>
                  <Badge variant="success" className="ml-2">{primaryAccount.status.toUpperCase()}</Badge>
                </div>
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-4xl font-bold text-white tabular-nums">
                    {formatCurrency(primaryAccount.available_balance)}
                  </span>
                  <span className="text-navy-300">Available Balance</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-navy-300">
                  <span className="flex items-center gap-1">
                    <span className="font-mono text-white">{primaryAccount.account_number.slice(-4).padStart(primaryAccount.account_number.length, 'X')}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    IFSC: <span className="font-mono text-white">{primaryAccount.ifsc_code}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    Opened: <span className="font-mono text-white">{formatDate(primaryAccount.opening_date)}</span>
                  </span>
                </div>
              </div>
              <div className="flex gap-3 sm:ml-auto">
                <Link to="/customer/payments/send">
                  <Button className="bg-white text-navy-900 hover:bg-navy-100">
                    <ArrowPathIcon className="h-5 w-5" />
                    Transfer
                  </Button>
                </Link>
                <Link to="/customer/accounts/details">
                  <Button variant="outline" className="border-navy-600 text-navy-200 hover:bg-navy-700">
                    <DocumentTextIcon className="h-5 w-5" />
                    Statement
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-500">Total Balance</p>
              <p className="text-2xl font-bold text-navy-900 tabular-nums">{formatCurrency(stats?.total_balance || primaryAccount?.balance || 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <CreditCardIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-500">Sent This Month</p>
              <p className="text-2xl font-bold text-red-600 tabular-nums">{formatCurrency(stats?.sent_this_month || 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <ArrowPathIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-500">Received This Month</p>
              <p className="text-2xl font-bold text-emerald-600 tabular-nums">{formatCurrency(stats?.received_this_month || 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <BanknotesIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-500">Active Products</p>
              <p className="text-2xl font-bold text-navy-900 tabular-nums">
                {(stats?.active_loans || 0) + (stats?.active_fds || 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/customer/payments/send" className="card-hover p-4 flex flex-col items-center gap-3 text-center group">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <ArrowPathIcon className="h-6 w-6 text-primary-600" />
              </div>
              <span className="font-medium text-navy-900">Send Money</span>
              <span className="text-sm text-navy-500">Transfer to anyone</span>
            </Link>

            <Link to="/customer/payments/beneficiaries" className="card-hover p-4 flex flex-col items-center gap-3 text-center group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <ChartBarIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="font-medium text-navy-900">Beneficiaries</span>
              <span className="text-sm text-navy-500">Manage payees</span>
            </Link>

            <Link to="/customer/products/loans" className="card-hover p-4 flex flex-col items-center gap-3 text-center group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <BanknotesIcon className="h-6 w-6 text-amber-600" />
              </div>
              <span className="font-medium text-navy-900">Apply Loan</span>
              <span className="text-sm text-navy-500">Personal & Education</span>
            </Link>

            <Link to="/customer/products/fd" className="card-hover p-4 flex flex-col items-center gap-3 text-center group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <CreditCardIcon className="h-6 w-6 text-purple-600" />
              </div>
              <span className="font-medium text-navy-900">Fixed Deposit</span>
              <span className="text-sm text-navy-500">Grow your savings</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader 
          title="Recent Transactions" 
          action={
            <Link to="/customer/payments/transactions" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View All
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          }
        />
        <CardContent>
          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <Link key={txn.id} to={`/customer/payments/transactions/${txn.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-navy-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', 
                      txn.direction === 'credit' ? 'bg-emerald-100' : 'bg-red-100'
                    )}>
                      {txn.direction === 'credit' ? (
                        <ArrowPathIcon className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <ArrowPathIcon className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-navy-900">{txn.description}</p>
                      <p className="text-sm text-navy-500">{formatDateTime(txn.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn('font-semibold', txn.direction === 'credit' ? 'text-emerald-600' : 'text-red-600')}>
                      {txn.direction === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                    <p className="text-xs text-navy-500">Bal: {formatCurrency(txn.closing_balance)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ArrowPathIcon className="h-12 w-12 text-navy-300 mx-auto mb-3" />
              <p className="text-navy-600">No transactions yet</p>
              <p className="text-sm text-navy-500 mt-1">Your recent transactions will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

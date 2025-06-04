import { Link } from 'react-router-dom'
import {
  CreditCardIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, maskAccountNumber } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

interface Account {
  id: string
  account_number: string
  account_type: string
  balance: number
  available_balance: number
  status: string
  ifsc_code: string
  opening_date: string
  is_primary: boolean
  customer_id: string
}

export function AccountDetailsPage() {
  const { data: accounts, isLoading, isError } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await api.get('/customer/accounts')
      return response.data.data as Account[]
    },
  })

  const primaryAccount = accounts?.find(a => a.is_primary) || accounts?.[0]

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-56 bg-white rounded-xl border border-navy-200" />
        <div className="animate-pulse h-40 bg-white rounded-xl border border-navy-200" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-3">Failed to load account details.</p>
        <Link to="/customer/dashboard" className="text-primary-600 hover:underline">Back to dashboard</Link>
      </div>
    )
  }

  if (!primaryAccount) {
    return (
      <div className="p-8 text-center">
        <p className="text-navy-600 mb-2">No accounts found.</p>
        <p className="text-sm text-navy-500">Your account will appear here once it has been approved and activated.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Account Details</h1>
          <p className="text-navy-600">Complete account information and settings</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader title="Primary Account" description="Your main FusionBanking account" />
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm text-navy-500 mb-1">Account Number</label>
              <p className="font-mono text-lg text-navy-900 font-bold">{maskAccountNumber(primaryAccount.account_number)}</p>
            </div>
            <div>
              <label className="block text-sm text-navy-500 mb-1">Account Type</label>
              <p className="font-medium text-navy-900 capitalize">{primaryAccount.account_type}</p>
            </div>
            <div>
              <label className="block text-sm text-navy-500 mb-1">IFSC Code</label>
              <p className="font-mono text-navy-900">{primaryAccount.ifsc_code}</p>
            </div>
            <div>
              <label className="block text-sm text-navy-500 mb-1">Status</label>
              <Badge variant={primaryAccount.status === 'active' ? 'success' : 'warning'}>
                {primaryAccount.status.toUpperCase()}
              </Badge>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-navy-500 mb-1">Current Balance</label>
              <p className="font-bold text-2xl text-navy-900 tabular-nums">{formatCurrency(primaryAccount.balance)}</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-navy-500 mb-1">Available Balance</label>
              <p className="font-bold text-2xl text-emerald-600 tabular-nums">{formatCurrency(primaryAccount.available_balance)}</p>
            </div>
            <div>
              <label className="block text-sm text-navy-500 mb-1">Opening Date</label>
              <p className="font-medium text-navy-900">{formatDate(primaryAccount.opening_date)}</p>
            </div>
            <div>
              <label className="block text-sm text-navy-500 mb-1">Customer ID</label>
              <p className="font-mono text-navy-900">{primaryAccount.customer_id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {accounts && accounts.length > 1 && (
        <Card>
          <CardHeader title="All Accounts" />
          <CardContent>
            <div className="space-y-4">
              {accounts.filter(a => !a.is_primary).map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 rounded-lg border border-navy-100 hover:bg-navy-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                      <CreditCardIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-navy-900 capitalize">{account.account_type} Account</p>
                      <p className="text-sm text-navy-500 font-mono">{maskAccountNumber(account.account_number)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={account.status === 'active' ? 'success' : 'warning'}>
                      {account.status.toUpperCase()}
                    </Badge>
                    <span className="font-semibold text-navy-900 tabular-nums">{formatCurrency(account.available_balance)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader title="Account Actions" />
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/customer/payments/send" className="card-hover p-6 flex flex-col items-center gap-3 text-center group">
              <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <ArrowPathIcon className="h-7 w-7 text-primary-600" />
              </div>
              <span className="font-medium text-navy-900">Send Money</span>
              <span className="text-sm text-navy-500">Transfer to anyone</span>
            </Link>

            <Link to="/customer/payments/beneficiaries" className="card-hover p-6 flex flex-col items-center gap-3 text-center group">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <UserCircleIcon className="h-7 w-7 text-emerald-600" />
              </div>
              <span className="font-medium text-navy-900">Beneficiaries</span>
              <span className="text-sm text-navy-500">Manage payees</span>
            </Link>

            <Link to="/customer/payments/transactions" className="card-hover p-6 flex flex-col items-center gap-3 text-center group">
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <DocumentTextIcon className="h-7 w-7 text-amber-600" />
              </div>
              <span className="font-medium text-navy-900">Transactions</span>
              <span className="text-sm text-navy-500">View history</span>
            </Link>

            <Link to="/customer/payments/statements" className="card-hover p-6 flex flex-col items-center gap-3 text-center group">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <ChartBarIcon className="h-7 w-7 text-purple-600" />
              </div>
              <span className="font-medium text-navy-900">Statements</span>
              <span className="text-sm text-navy-500">Download reports</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

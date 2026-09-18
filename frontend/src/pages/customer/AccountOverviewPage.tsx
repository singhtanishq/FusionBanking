import { Link } from 'react-router-dom'
import { 
  CreditCardIcon, 
  ArrowPathIcon, 
  PlusIcon,
  EyeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
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
}

export function AccountOverviewPage() {
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await api.get('/customer/accounts')
      return response.data.data as Account[]
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Account Overview</h1>
          <p className="text-navy-600">View and manage your FusionBanking accounts</p>
        </div>
        <Link to="/customer/accounts/details">
          <Button variant="outline">
            <EyeIcon className="h-5 w-5" />
            View Details
          </Button>
        </Link>
      </div>

      {accounts && accounts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <Card key={account.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                      <CreditCardIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900">
                        {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)} Account
                      </h3>
                      {account.is_primary && <Badge variant="primary" className="ml-2 text-xs">Primary</Badge>}
                    </div>
                  </div>
                  <Badge variant={account.status === 'active' ? 'success' : 'warning'}>
                    {account.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-baseline gap-4">
                    <span className="text-3xl font-bold text-navy-900 tabular-nums">
                      {formatCurrency(account.available_balance)}
                    </span>
                    <span className="text-navy-500">Available Balance</span>
                  </div>
                  <div className="text-sm text-navy-500">
                    <p className="flex items-center gap-1 font-mono">
                      <EyeIcon className="h-4 w-4" />
                      {account.account_number.slice(-4).padStart(account.account_number.length, 'X')}
                    </p>
                    <p className="flex items-center gap-1 font-mono">
                      IFSC: {account.ifsc_code}
                    </p>
                    <p className="flex items-center gap-1">
                      Opened: <span className="font-mono text-navy-900">{formatDate(account.opening_date)}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-navy-100 bg-navy-50">
                <div className="flex gap-3">
                  <Link to="/customer/payments/send" className="btn-primary flex-1 text-center">
                    <ArrowPathIcon className="h-5 w-5" />
                    Transfer
                  </Link>
                  <Link to={`/customer/payments/transactions?account=${account.id}`} className="btn-outline flex-1 text-center">
                    <DocumentTextIcon className="h-5 w-5" />
                    Transactions
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <CurrencyDollarIcon className="h-16 w-16 text-navy-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-navy-900 mb-2">No Accounts Found</h3>
            <p className="text-navy-600 mb-6">You don't have any accounts yet.</p>
            <Link to="/customer/payments/send">
              <Button>
                <PlusIcon className="h-5 w-5" />
                Send Money
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
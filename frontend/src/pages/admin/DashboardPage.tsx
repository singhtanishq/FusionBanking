import { Link } from 'react-router-dom'
import { 
  DocumentTextIcon, 
  UserCircleIcon, 
  CreditCardIcon, 
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

interface DashboardStats {
  total_customers: number
  pending_applications: number
  pending_kyc: number
  active_accounts: number
  loans_pending_review: number
  loans_disbursed: number
  total_deposits: number
  transactions_today: number
  transfers_today: number
  fd_value: number
  recent_applications: Array<{
    id: string
    acknowledgement_number: string
    applicant_name: string
    status: string
    created_at: string
  }>
  recent_activities: Array<{
    id: string
    action: string
    description: string
    created_at: string
    actor_name: string
  }>
}

const statCards = [
  { 
    name: 'Total Customers', 
    key: 'total_customers', 
    icon: UserCircleIcon, 
    color: 'primary',
    format: (v: number) => formatNumber(v),
  },
  { 
    name: 'Pending Applications', 
    key: 'pending_applications', 
    icon: DocumentTextIcon, 
    color: 'amber',
    format: (v: number) => formatNumber(v),
    link: '/admin/applications?status=pending'
  },
  { 
    name: 'Pending KYC', 
    key: 'pending_kyc', 
    icon: ShieldCheckIcon, 
    color: 'amber',
    format: (v: number) => formatNumber(v),
  },
  { 
    name: 'Active Accounts', 
    key: 'active_accounts', 
    icon: CreditCardIcon, 
    color: 'emerald',
    format: (v: number) => formatNumber(v),
  },
  { 
    name: 'Loans Pending Review', 
    key: 'loans_pending_review', 
    icon: BanknotesIcon, 
    color: 'amber',
    format: (v: number) => formatNumber(v),
    link: '/admin/loans?status=under_review'
  },
  { 
    name: 'Loans Disbursed', 
    key: 'loans_disbursed', 
    icon: ChartBarIcon, 
    color: 'emerald',
    format: (v: number) => formatNumber(v),
  },
  { 
    name: 'Total Deposits', 
    key: 'total_deposits', 
    icon: CreditCardIcon, 
    color: 'primary',
    format: (v: number) => formatCurrency(v),
  },
  { 
    name: 'Transactions Today', 
    key: 'transactions_today', 
    icon: ArrowPathIcon, 
    color: 'primary',
    format: (v: number) => formatNumber(v),
  },
  { 
    name: 'Transfers Today', 
    key: 'transfers_today', 
    icon: ArrowPathIcon, 
    color: 'blue',
    format: (v: number) => formatNumber(v),
  },
  { 
    name: 'FD Portfolio Value', 
    key: 'fd_value', 
    icon: BanknotesIcon, 
    color: 'purple',
    format: (v: number) => formatCurrency(v),
  },
]

const iconColors = {
  primary: 'bg-primary-100 text-primary-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
}

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard/stats')
      return response.data.data as DashboardStats
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Admin Dashboard</h1>
          <p className="text-navy-600">Overview of FusionBanking operations</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <ClockIcon className="h-5 w-5" />
            Refresh
          </Button>
          <Button>
            <ArrowPathIcon className="h-5 w-5" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.key} to={stat.link || '#'} className="card-hover">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-navy-500">{stat.name}</p>
                    <p className="text-2xl font-bold text-navy-900 mt-1">
                      {isLoading ? (
                        <span className="animate-pulse bg-navy-200 h-8 w-24 rounded inline-block" />
                      ) : (
                        stat.format((stats as any)?.[stat.key] || 0)
                      )}
                    </p>
                  </div>
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColors[stat.color as keyof typeof iconColors] || iconColors.primary)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                {stat.link && (
                  <div className="mt-4 flex items-center justify-between text-sm text-primary-600">
                    <span>View Details</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader title="Quick Actions" />
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/applications?status=pending" className="card-hover p-4 flex flex-col items-center gap-3 text-center group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <DocumentTextIcon className="h-6 w-6 text-amber-600" />
              </div>
              <span className="font-medium text-navy-900">Review Applications</span>
              <span className="text-sm text-navy-500">Pending approvals</span>
            </Link>

            <Link to="/admin/loans?status=under_review" className="card-hover p-4 flex flex-col items-center gap-3 text-center group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <BanknotesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-medium text-navy-900">Review Loans</span>
              <span className="text-sm text-navy-500">Pending decisions</span>
            </Link>

            <Link to="/admin/customers" className="card-hover p-4 flex flex-col items-center gap-3 text-center group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <UserCircleIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="font-medium text-navy-900">Manage Customers</span>
              <span className="text-sm text-navy-500">View & edit profiles</span>
            </Link>

            <Link to="/admin/administration/settings" className="card-hover p-4 flex flex-col items-center gap-3 text-center group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <ChevronRightIcon className="h-6 w-6 text-purple-600" />
              </div>
              <span className="font-medium text-navy-900">System Settings</span>
              <span className="text-sm text-navy-500">Configure limits</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Applications */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader 
            title="Recent Applications" 
            action={
              <Link to="/admin/applications" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                View All
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            }
          />
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse h-12 bg-navy-100 rounded" />
                ))}
              </div>
            ) : stats?.recent_applications?.length === 0 ? (
              <p className="text-center py-8 text-navy-500">No recent applications</p>
            ) : (
              <div className="space-y-3">
                {stats?.recent_applications?.slice(0, 5).map((app) => (
                  <Link key={app.id} to={`/admin/applications/${app.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-navy-50 transition-colors">
                    <div>
                      <p className="font-medium text-navy-900">{app.applicant_name}</p>
                      <p className="text-sm text-navy-500 font-mono">{app.acknowledgement_number}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        app.status === 'approved' ? 'success' : 
                        app.status === 'rejected' ? 'danger' : 
                        app.status === 'correction_required' ? 'danger' : 'warning'
                      }>
                        {app.status.replace('_', ' ')}
                      </Badge>
                      <ChevronRightIcon className="h-4 w-4 text-navy-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader 
            title="Recent Activity" 
            action={
              <Link to="/admin/audit-logs" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                View All
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            }
          />
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse h-12 bg-navy-100 rounded" />
                ))}
              </div>
            ) : stats?.recent_activities?.length === 0 ? (
              <p className="text-center py-8 text-navy-500">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {stats?.recent_activities?.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-navy-50">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <ExclamationTriangleIcon className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-900">{activity.action}</p>
                      <p className="text-sm text-navy-600">{activity.description}</p>
                      <p className="text-xs text-navy-400 mt-1">
                        {activity.actor_name} • {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
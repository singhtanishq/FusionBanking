import { Fragment, useState, useEffect } from 'react'
import { Link, useLocation, NavLink, Outlet } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import { useQuery } from '@tanstack/react-query'
import {
  HomeIcon,
  CreditCardIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
  XMarkIcon,
  Bars3Icon,
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/services/api'

interface CustomerLike {
  customer_id: string
}

function isCustomerUser(user: unknown): user is CustomerLike {
  return typeof user === 'object' && user !== null && 'customer_id' in user
}

const navigation = [
  { name: 'Dashboard', href: '/customer/dashboard', icon: HomeIcon, current: false },
  { name: 'Accounts', href: '/customer/accounts', icon: CreditCardIcon, current: false, children: [
    { name: 'Overview', href: '/customer/accounts/overview' },
    { name: 'Details', href: '/customer/accounts/details' },
  ]},
  { name: 'Payments', href: '/customer/payments', icon: BanknotesIcon, current: false, children: [
    { name: 'Send Money', href: '/customer/payments/send' },
    { name: 'Beneficiaries', href: '/customer/payments/beneficiaries' },
    { name: 'Transactions', href: '/customer/payments/transactions' },
    { name: 'Statements', href: '/customer/payments/statements' },
  ]},
  { name: 'Products', href: '/customer/products', icon: BanknotesIcon, current: false, children: [
    { name: 'Loans', href: '/customer/products/loans' },
    { name: 'Fixed Deposits', href: '/customer/products/fd' },
  ]},
  { name: 'Profile', href: '/customer/profile', icon: UserCircleIcon, current: false },
  { name: 'Security', href: '/customer/security', icon: ShieldCheckIcon, current: false },
  { name: 'Notifications', href: '/customer/notifications', icon: BellIcon, current: false },
  { name: 'Support', href: '/customer/support', icon: ChatBubbleLeftRightIcon, current: false },
]

export function CustomerLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    // Auto-expand the section matching the current route on first render
    const active = navigation.find(n =>
      n.children?.some(c => location.pathname.startsWith(c.href))
    )
    return active ? [active.name] : []
  })

  const unreadCountQuery = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: async (): Promise<number> => {
      const response = await api.get<{ success: boolean; data: Array<{ read_at: string | null }> }>('/customer/notifications')
      return response.data.data.filter(n => n.read_at === null).length
    },
    staleTime: 30_000,
    retry: false,
  })
  const unreadCount = unreadCountQuery.data ?? 0

  // Keep the active section expanded when navigating
  useEffect(() => {
    const active = navigation.find(n =>
      n.children?.some(c => location.pathname.startsWith(c.href))
    )
    if (active && !expandedSections.includes(active.name)) {
      setExpandedSections(prev => [...prev, active.name])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const isSectionExpanded = (section: string) => expandedSections.includes(section)

  const handleLogout = async () => {
    await logout()
  }

  const customerId = isCustomerUser(user) ? user.customer_id : ''

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Mobile sidebar backdrop */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={() => setSidebarOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative w-64 flex-1 bg-white shadow-xl">
                <div className="flex items-center justify-between h-16 px-4 border-b border-navy-100">
                  <Link to="/customer/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                      </svg>
                    </div>
                    <span className="text-xl font-bold text-navy-900">FusionBanking</span>
                  </Link>
                  <button
                    type="button"
                    className="btn-ghost p-2"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {navigation.map((item) => (
                    <NavSection
                      key={item.name}
                      item={item}
                      isExpanded={isSectionExpanded(item.name)}
                      onToggle={() => toggleSection(item.name)}
                    />
                  ))}
                  <div className="pt-4 border-t border-navy-100">
                    <button
                      type="button"
                      className="btn-danger w-full justify-start"
                      onClick={handleLogout}
                    >
                      <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                      Logout
                    </button>
                  </div>
                </nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-white border-r border-navy-100">
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between h-16 px-4 border-b border-navy-100">
            <Link to="/customer/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-navy-900">FusionBanking</span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Sidebar">
            {navigation.map((item) => (
              <NavSection
                key={item.name}
                item={item}
                isExpanded={isSectionExpanded(item.name)}
                onToggle={() => toggleSection(item.name)}
              />
            ))}

            <div className="pt-4 border-t border-navy-100 mt-auto">
              <button
                type="button"
                className="btn-danger w-full justify-start"
                onClick={handleLogout}
              >
                <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-navy-100">
            <div className="flex items-center gap-3">
              <Avatar
                name={user?.full_name || 'Customer'}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-900 truncate">
                  {user?.full_name || 'Customer'}
                </p>
                <p className="text-xs text-navy-500 truncate font-mono">
                  {customerId || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-navy-100">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="lg:hidden btn-ghost p-2"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="text-lg font-semibold text-navy-900">
                {[...navigation]
                  .sort((a, b) => b.href.length - a.href.length)
                  .find(n => location.pathname === n.href || location.pathname.startsWith(n.href + '/'))?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/customer/notifications" className="relative btn-ghost p-2" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
                <BellIcon className="h-5 w-5 text-navy-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-navy-500">Customer ID</p>
                  <p className="text-sm font-medium text-navy-900 font-mono">{customerId || '—'}</p>
                </div>
                <Avatar name={user?.full_name || 'User'} size="sm" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

interface NavSectionProps {
  item: (typeof navigation)[number]
  isExpanded: boolean
  onToggle: () => void
}

function NavSection({ item, isExpanded, onToggle }: NavSectionProps) {
  const hasChildren = item.children && item.children.length > 0
  const location = useLocation()
  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')

  if (!hasChildren) {
    return (
      <NavLink
        to={item.href}
        className={({ isActive }) => cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-50 text-primary-600'
            : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        {item.name}
      </NavLink>
    )
  }

  return (
    <div>
      <button
        type="button"
        className={cn(
          'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-50 text-primary-600'
            : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
        )}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          {item.name}
        </div>
        <ChevronDownIcon
          className={cn('h-5 w-5 flex-shrink-0 transition-transform', isExpanded && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      <Transition
        show={isExpanded}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <div className="overflow-hidden pl-10 mt-1 space-y-1">
          {item.children?.map((child) => (
            <NavLink
              key={child.name}
              to={child.href}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
              )}
            >
              <span className="w-5 h-5 flex-shrink-0" />
              {child.name}
            </NavLink>
          ))}
        </div>
      </Transition>
    </div>
  )
}

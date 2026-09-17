import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navigation = [
  { name: 'Personal Banking', to: '#', current: false },
  { name: 'Products', to: '/products', current: false },
  { name: 'Loans', to: '/loans', current: false },
  { name: 'Deposits', to: '/deposits', current: false },
  { name: 'Security', to: '/security', current: false },
  { name: 'Help', to: '/help', current: false },
]

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <Fragment>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-navy-100">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Global">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2" aria-label="FusionBanking Home">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold text-navy-900">FusionBanking</span>
              </Link>
            </div>

            <div className="hidden md:flex md:items-center md:gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    item.current
                      ? 'text-primary-600'
                      : 'text-navy-600 hover:text-navy-900'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex md:items-center md:gap-3">
              <Link to="/track-application" className="btn-ghost text-sm">
                Track Application
              </Link>
              <Link to="/netbanking/login" className="btn-outline text-sm">
                NetBanking Login
              </Link>
              <Link to="/open-account" className="btn-primary text-sm">
                Open an Account
              </Link>
            </div>

            <div className="flex md:hidden">
              <button
                type="button"
                className="btn-ghost p-2"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-16 min-h-screen">
        {children}
      </main>

      <footer className="bg-navy-900 text-navy-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">FusionBanking</span>
              </Link>
              <p className="mt-4 text-sm">Secure digital banking for the modern world.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Products</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/products/savings" className="text-sm hover:text-white">Savings Account</Link></li>
                <li><Link to="/products/current" className="text-sm hover:text-white">Current Account</Link></li>
                <li><Link to="/products/fd" className="text-sm hover:text-white">Fixed Deposits</Link></li>
                <li><Link to="/products/loans" className="text-sm hover:text-white">Personal Loans</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/help" className="text-sm hover:text-white">Help Center</Link></li>
                <li><Link to="/contact" className="text-sm hover:text-white">Contact Us</Link></li>
                <li><Link to="/track-application" className="text-sm hover:text-white">Track Application</Link></li>
                <li><Link to="/security" className="text-sm hover:text-white">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/privacy" className="text-sm hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm hover:text-white">Terms of Service</Link></li>
                <li><Link to="/security" className="text-sm hover:text-white">Security Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-navy-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} FusionBanking. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Menu */}
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={setMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
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
              <Dialog.Panel className="relative w-full max-w-xs flex-1 bg-white shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-navy-100">
                  <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                      </svg>
                    </div>
                    <span className="text-xl font-bold text-navy-900">FusionBanking</span>
                  </Link>
                  <button
                    type="button"
                    className="btn-ghost p-2"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <XIcon className="h-6 w-6" />
                  </button>
                </div>
                <nav className="p-4 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.to}
                      className={cn(
                        'block px-3 py-2 rounded-lg text-base font-medium',
                        item.current
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-navy-100 space-y-3">
                    <Link to="/track-application" className="btn-secondary w-full" onClick={() => setMobileMenuOpen(false)}>
                      Track Application
                    </Link>
                    <Link to="/netbanking/login" className="btn-outline w-full" onClick={() => setMobileMenuOpen(false)}>
                      NetBanking Login
                    </Link>
                    <Link to="/open-account" className="btn-primary w-full" onClick={() => setMobileMenuOpen(false)}>
                      Open an Account
                    </Link>
                  </div>
                </nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </Fragment>
  )
}
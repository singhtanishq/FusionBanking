import { cn } from '@/lib/utils'

interface BadgeProps {
  className?: string
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'primary'
  size?: 'sm' | 'md'
  dot?: boolean
}

export function Badge({ className, children, variant = 'gray', size = 'md', dot = false }: BadgeProps) {
  const variantClasses = {
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-primary-100 text-primary-800',
    gray: 'bg-navy-100 text-navy-800',
    primary: 'bg-primary-100 text-primary-800',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
  }

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-primary-500',
    gray: 'bg-navy-500',
    primary: 'bg-primary-500',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  status: string
  type?: 'application' | 'step' | 'account' | 'transfer' | 'loan' | 'fd'
}

const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
  // Application statuses
  draft: { variant: 'gray', label: 'Draft' },
  submitted: { variant: 'info', label: 'Submitted' },
  under_review: { variant: 'warning', label: 'Under Review' },
  partially_approved: { variant: 'warning', label: 'Partially Approved' },
  correction_required: { variant: 'danger', label: 'Correction Required' },
  kyc_review: { variant: 'warning', label: 'KYC Review' },
  final_review: { variant: 'warning', label: 'Final Review' },
  approved: { variant: 'success', label: 'Approved' },
  account_creation_pending: { variant: 'info', label: 'Account Creation Pending' },
  account_active: { variant: 'success', label: 'Account Active' },
  rejected: { variant: 'danger', label: 'Rejected' },

  // Step statuses
  pending: { variant: 'gray', label: 'Pending' },
  in_review: { variant: 'warning', label: 'In Review' },
  verified: { variant: 'success', label: 'Verified' },
  correction_submitted: { variant: 'info', label: 'Correction Submitted' },
  completed: { variant: 'success', label: 'Completed' },

  // Account statuses
  active: { variant: 'success', label: 'Active' },
  frozen: { variant: 'danger', label: 'Frozen' },
  restricted: { variant: 'warning', label: 'Restricted' },
  closed: { variant: 'gray', label: 'Closed' },

  // Transfer statuses
  pending_verification: { variant: 'warning', label: 'Pending Verification' },
  processing: { variant: 'info', label: 'Processing' },
  transfer_completed: { variant: 'success', label: 'Completed' },
  failed: { variant: 'danger', label: 'Failed' },
  expired: { variant: 'gray', label: 'Expired' },
  cancelled: { variant: 'gray', label: 'Cancelled' },

  // Loan statuses
  additional_info_required: { variant: 'warning', label: 'Additional Info Required' },
  disbursed: { variant: 'info', label: 'Disbursed' },

  // FD statuses
  matured: { variant: 'info', label: 'Matured' },
  premature_closed: { variant: 'warning', label: 'Prematurely Closed' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'gray', label: status }
  return <Badge variant={config.variant} dot>{config.label}</Badge>
}
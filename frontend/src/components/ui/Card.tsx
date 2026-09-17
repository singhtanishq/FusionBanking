import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ className, children, hover = false, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-navy-200 shadow-sm',
        hover && 'transition-shadow duration-200 hover:shadow-md',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  className?: string
  children: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function CardHeader({ className, children, title, description, action }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div>
        <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-navy-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface CardContentProps {
  className?: string
  children: React.ReactNode
}

export function CardContent({ className, children }: CardContentProps) {
  return <div className={cn('', className)}>{children}</div>
}

interface CardFooterProps {
  className?: string
  children: React.ReactNode
}

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={cn('mt-6 pt-4 border-t border-navy-100 flex items-center justify-end gap-3', className)}>
      {children}
    </div>
  )
}
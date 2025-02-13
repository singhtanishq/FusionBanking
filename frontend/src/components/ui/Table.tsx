import { cn } from '@/lib/utils'

interface TableProps {
  className?: string
  children: React.ReactNode
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
}

export function Table({ className, children, striped = true, hoverable = true, bordered = true }: TableProps) {
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table
        className={cn(
          'w-full text-sm min-w-[640px]',
          bordered && 'border border-navy-200 rounded-lg overflow-hidden',
          striped && '[&_tbody>tr:nth-child(even)]:bg-navy-50/50',
          hoverable && '[&_tbody>tr]:transition-colors [&_tbody>tr:hover]:bg-navy-50',
          className
        )}
      >
        {children}
      </table>
    </div>
  )
}

interface TableHeaderProps {
  className?: string
  children: React.ReactNode
}

export function TableHeader({ className, children }: TableHeaderProps) {
  return (
    <thead className={cn('bg-navy-50 border-b border-navy-200', className)}>
      {children}
    </thead>
  )
}

interface TableBodyProps {
  className?: string
  children: React.ReactNode
}

export function TableBody({ className, children }: TableBodyProps) {
  return (
    <tbody className={cn('divide-y divide-navy-100', className)}>
      {children}
    </tbody>
  )
}

interface TableRowProps {
  className?: string
  children: React.ReactNode
  clickable?: boolean
  onClick?: () => void
}

export function TableRow({ className, children, clickable = false, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        'transition-colors',
        clickable && 'cursor-pointer hover:bg-navy-50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

interface TableHeadProps {
  className?: string
  children: React.ReactNode
  scope?: 'col' | 'row'
  width?: string
  align?: 'left' | 'center' | 'right'
  onClick?: () => void
}

export function TableHead({ className, children, scope = 'col', width, align = 'left', onClick }: TableHeadProps) {
  return (
    <th
      scope={scope}
      className={cn(
        'px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        onClick && 'cursor-pointer select-none hover:text-navy-900',
        className
      )}
      style={width ? { width } : undefined}
      onClick={onClick}
    >
      {children}
    </th>
  )
}

interface TableCellProps {
  className?: string
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
  style?: React.CSSProperties
}

export function TableCell({ className, children, align = 'left', width, style }: TableCellProps) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-navy-900',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
      style={width ? { width, ...style } : style}
    >
      {children}
    </td>
  )
}

interface TableFooterProps {
  className?: string
  children: React.ReactNode
}

export function TableFooter({ className, children }: TableFooterProps) {
  return (
    <tfoot className={cn('bg-navy-50 border-t border-navy-200', className)}>
      {children}
    </tfoot>
  )
}
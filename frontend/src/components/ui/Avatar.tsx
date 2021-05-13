import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  name?: string
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
}

export function Avatar({ name, src, alt, size = 'md', className }: AvatarProps) {
  const initials = name ? getInitials(name) : '?'

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  // Generate consistent color based on name
  const colorIndex = name 
    ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10
    : 0
  
  const colors = [
    'bg-primary-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ]

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white',
        colors[colorIndex],
        sizeClasses[size],
        className
      )}
      aria-label={name || 'User avatar'}
    >
      {initials}
    </div>
  )
}
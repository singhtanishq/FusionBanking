import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface StepTrackerProps {
  steps: { key: string; label: string; href?: string }[]
  currentStep: number
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function StepTracker({ steps, currentStep, orientation = 'horizontal', className }: StepTrackerProps) {
  return (
    <nav aria-label="Application progress" className={cn('w-full', className)}>
      {orientation === 'horizontal' ? (
        <div className="relative overflow-x-auto pb-1">
          <div className="relative min-w-[480px]">
            {/* Connecting line */}
            <div className="absolute top-5 left-5 right-5 h-1 bg-navy-200" aria-hidden="true">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${steps.length > 1 ? (Math.min(currentStep, steps.length - 1) / (steps.length - 1)) * 100 : 0}%` }}
              />
            </div>

            <ol className="relative flex items-start justify-between" role="list">
              {steps.map((step, index) => {
                const isCompleted = index < currentStep
                const isCurrent = index === currentStep
                return (
                  <li key={step.key} className="flex flex-col items-center">
                    <div
                      className={cn(
                        'relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                        isCompleted && 'bg-emerald-500 border-emerald-500',
                        isCurrent && 'bg-white border-primary-500',
                        !isCompleted && !isCurrent && 'bg-white border-navy-300'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      ) : isCurrent ? (
                        <div className="w-3 h-3 rounded-full bg-primary-500" aria-hidden="true" />
                      ) : (
                        <span className="text-sm font-medium text-navy-400">{index + 1}</span>
                      )}
                    </div>
                    <span className={cn(
                      'mt-2 text-xs font-medium text-center max-w-[100px]',
                      isCurrent ? 'text-primary-600' : isCompleted ? 'text-navy-700' : 'text-navy-400'
                    )}>
                      {step.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      ) : (
        <ol className="space-y-6" role="list">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            return (
              <li key={step.key} className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                      isCompleted && 'bg-emerald-500 border-emerald-500',
                      isCurrent && 'bg-white border-primary-500',
                      !isCompleted && !isCurrent && 'bg-white border-navy-300'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    ) : isCurrent ? (
                      <div className="w-3 h-3 rounded-full bg-primary-500" aria-hidden="true" />
                    ) : (
                      <span className="text-sm font-medium text-navy-400">{index + 1}</span>
                    )}
                  </div>
                  {/* Vertical connecting line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-navy-200" aria-hidden="true">
                      <div className="h-full bg-primary-600" style={{ height: isCompleted ? '100%' : '0%' }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <span className={cn('text-sm font-medium', isCurrent ? 'text-primary-600' : 'text-navy-900')}>{step.label}</span>
                  <p className="text-xs text-navy-500 mt-1">
                    {isCompleted ? 'Completed' : isCurrent ? 'In progress' : 'Pending'}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </nav>
  )
}

import { cn } from '@/lib/utils'
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline'

interface StepTrackerProps {
  steps: { key: string; label: string; href: string }[]
  currentStep: number
  orientation?: 'horizontal' | 'vertical'
}

const stepStatusConfig = {
  completed: { icon: CheckCircleIcon, color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Completed' },
  current: { icon: MinusCircleIcon, color: 'text-primary-500', bg: 'bg-primary-500', label: 'Current' },
  pending: { icon: XCircleIcon, color: 'text-navy-300', bg: 'bg-navy-300', label: 'Pending' },
  error: { icon: XCircleIcon, color: 'text-red-500', bg: 'bg-red-500', label: 'Error' },
}

export function StepTracker({ steps, currentStep, orientation = 'horizontal' }: StepTrackerProps) {
  return (
    <nav aria-label="Application progress" className="w-full">
      {orientation === 'horizontal' ? (
        <div className="relative overflow-hidden">
          {/* Connecting line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-navy-200" aria-hidden="true">
            <div 
              className="h-full bg-primary-600 transition-all duration-300" 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} 
            />
          </div>
          
          <ol className="relative flex items-center justify-between" role="list">
            {steps.map((step, index) => (
              <li key={step.key} className="flex flex-col items-center">
                <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300"
                  style={{
                    borderColor: index <= currentStep ? 'var(--step-border-color)' : '#e2e8f0',
                    backgroundColor: index < currentStep ? 'var(--step-bg-color)' : index === currentStep ? 'white' : 'white',
                  }}
                >
                  {index < currentStep ? (
                    <CheckCircleIcon className="h-6 w-6 text-emerald-500" aria-hidden="true" />
                  ) : index === currentStep ? (
                    <div className="w-3 h-3 rounded-full bg-primary-500" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-medium text-navy-400">{index + 1}</span>
                  )}
                </div>
                <span className="mt-2 text-xs font-medium text-center text-navy-600 max-w-[100px]">
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <ol className="space-y-6" role="list">
          {steps.map((step, index) => (
            <li key={step.key} className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300"
                  style={{
                    borderColor: index <= currentStep ? 'var(--step-border-color)' : '#e2e8f0',
                    backgroundColor: index < currentStep ? 'var(--step-bg-color)' : index === currentStep ? 'white' : 'white',
                  }}
                >
                  {index < currentStep ? (
                    <CheckCircleIcon className="h-6 w-6 text-emerald-500" aria-hidden="true" />
                  ) : index === currentStep ? (
                    <div className="w-3 h-3 rounded-full bg-primary-500" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-medium text-navy-400">{index + 1}</span>
                  )}
                </div>
                {/* Vertical connecting line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-navy-200" aria-hidden="true">
                    <div className="h-full bg-primary-600" style={{ height: index < currentStep ? '100%' : '0%' }} />
                  </div>
                )}
              </div>
              <div className="flex-1 pt-1">
                <span className="text-sm font-medium text-navy-900">{step.label}</span>
                <p className="text-xs text-navy-500 mt-1">
                  {index < currentStep ? 'Completed' : index === currentStep ? 'In progress' : 'Pending'}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </nav>
  )
}
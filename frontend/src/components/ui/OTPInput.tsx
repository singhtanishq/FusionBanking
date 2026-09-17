import { useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: boolean
  autoFocus?: boolean
}

export function OTPInput({ length = 6, value, onChange, onComplete, disabled = false, error = false, autoFocus = false }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const values = value.padEnd(length, '').split('')

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (disabled) return

    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }, [disabled, length, values])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (disabled) return

    const newValue = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    const newValues = [...values]
    newValues[index] = newValue
    const newString = newValues.join('')
    
    onChange(newString)
    
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    
    if (newString.length === length && onComplete) {
      onComplete(newString)
    }
  }, [disabled, length, onChange, onComplete, values])

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return
    
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').replace(/[^A-Z0-9]/gi, '').toUpperCase()
    const chars = pasteData.split('')
    
    const newValues = [...values]
    chars.forEach((char, i) => {
      if (i < length) newValues[i] = char
    })
    
    const newString = newValues.join('')
    onChange(newString)
    
    if (newString.length >= length) {
      if (onComplete) onComplete(newString)
      inputRefs.current[length - 1]?.focus()
    } else {
      inputRefs.current[newString.length]?.focus()
    }
  }, [disabled, length, onChange, onComplete, values])

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  return (
    <div className="flex items-center gap-2" role="group" aria-label="One-time password input">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="text"
          autoComplete="one-time-code"
          maxLength={1}
          value={values[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-12 h-12 text-center text-lg font-semibold rounded-lg border transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            disabled ? 'bg-navy-100 cursor-not-allowed' : 'bg-white',
            error ? 'border-red-500' : 'border-navy-300',
            values[index] ? 'border-primary-500 bg-primary-50' : ''
          )}
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  )
}
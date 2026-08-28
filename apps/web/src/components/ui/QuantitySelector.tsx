import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 20,
  disabled = false,
  size = 'md',
}: QuantitySelectorProps) {
  const box = size === 'sm' ? 'h-9 w-8 sm:h-10 sm:w-10' : 'h-11 w-10 sm:h-12 sm:w-12'
  const label = size === 'sm' ? 'min-w-6 text-sm sm:min-w-8' : 'min-w-7 text-sm sm:min-w-10 sm:text-base'

  return (
    <div className="inline-flex shrink-0 items-center rounded-full border border-cream-dark bg-paper">
      <button
        type="button"
        className={`${box} inline-flex items-center justify-center rounded-full text-ink disabled:text-ink-soft`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Disminuir cantidad"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className={`${label} text-center font-semibold tabular-nums`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={`${box} inline-flex items-center justify-center rounded-full text-ink disabled:text-ink-soft`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Aumentar cantidad"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

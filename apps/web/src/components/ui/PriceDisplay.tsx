import { formatMoney } from '../../lib/money'

interface PriceDisplayProps {
  cents: number
  compareAtCents?: number | null
  currency?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
}

export function PriceDisplay({
  cents,
  compareAtCents,
  currency,
  size = 'md',
  className = '',
}: PriceDisplayProps) {
  const showCompare =
    typeof compareAtCents === 'number' && compareAtCents > cents && compareAtCents > 0

  return (
    <div className={`flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className={`font-semibold text-atelier-gold ${sizeClasses[size]}`}>
        {formatMoney(cents, currency)}
      </span>
      {showCompare ? (
        <span className="text-sm text-atelier-gray line-through">
          {formatMoney(compareAtCents, currency)}
        </span>
      ) : null}
    </div>
  )
}

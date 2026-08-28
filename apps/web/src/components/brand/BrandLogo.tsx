import { Link } from 'react-router-dom'

type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl'
type BrandLogoVariant = 'full' | 'mark'

interface BrandLogoProps {
  size?: BrandLogoSize
  variant?: BrandLogoVariant
  to?: string | null
  className?: string
  glow?: boolean
  float?: boolean
}

const heights: Record<BrandLogoSize, string> = {
  sm: 'h-8 sm:h-10',
  md: 'h-11 max-w-[9.5rem] sm:h-14 sm:max-w-[14rem]',
  lg: 'h-16 sm:h-20',
  xl: 'h-24 sm:h-32',
}

const markHeights: Record<BrandLogoSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
}

export function BrandLogo({
  size = 'md',
  variant = 'full',
  to = '/',
  className = '',
  glow = false,
  float = false,
}: BrandLogoProps) {
  const src = variant === 'mark' ? '/favicon.png' : '/logo.png'
  const sizeClass = variant === 'mark' ? markHeights[size] : `${heights[size]} w-auto max-w-[min(100%,18rem)]`

  const image = (
    <img
      src={src}
      alt="Atelier"
      className={`${sizeClass} object-contain ${glow ? 'logo-glow' : ''} ${float ? 'logo-float' : ''} ${className}`}
      decoding="async"
    />
  )

  if (!to) return image

  return (
    <Link to={to} className="inline-flex items-center justify-center" aria-label="Atelier — inicio">
      {image}
    </Link>
  )
}

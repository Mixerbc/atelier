import type { ReactNode } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useTilt3d } from '../../hooks/useTilt3d'

interface Tilt3DProps {
  children: ReactNode
  className?: string
  maxTilt?: number
  scale?: number
  disabled?: boolean
}

export function Tilt3D({
  children,
  className = '',
  maxTilt = 10,
  scale = 1.02,
  disabled = false,
}: Tilt3DProps) {
  const isMobile = useIsMobile()
  const off = disabled || isMobile
  const { ref, tiltHandlers } = useTilt3d({ maxTilt, scale, disabled: off })

  return (
    <div
      ref={ref}
      className={`tilt-3d ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
      {...(off ? {} : tiltHandlers)}
    >
      {children}
    </div>
  )
}

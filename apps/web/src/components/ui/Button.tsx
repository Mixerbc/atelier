import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger' | 'whatsapp'
type ButtonSize = 'md' | 'sm'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-atelier-dark text-atelier-white hover:bg-atelier-dark/90 disabled:bg-atelier-blush disabled:text-atelier-gray',
  secondary:
    'bg-atelier-gold text-atelier-white hover:bg-atelier-gold/90 disabled:bg-atelier-blush disabled:text-atelier-gray',
  soft:
    'bg-atelier-soft-pink text-atelier-dark hover:bg-atelier-blush disabled:opacity-50',
  ghost:
    'bg-transparent text-atelier-dark border border-atelier-soft-gold/70 hover:border-atelier-gold hover:bg-atelier-white disabled:text-atelier-gray',
  danger:
    'bg-transparent text-atelier-danger border border-atelier-danger/30 hover:bg-atelier-danger/5',
  whatsapp:
    'bg-[#25D366] text-white hover:bg-[#1ebe57] disabled:bg-atelier-blush disabled:text-atelier-gray',
}

const sizes: Record<ButtonSize, string> = {
  md: 'min-h-12 px-5 text-sm',
  sm: 'min-h-10 px-4 text-xs',
}

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
  children: ReactNode
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button'
    to?: never
  }

type ButtonAsLink = CommonProps &
  Omit<LinkProps, 'className' | 'children'> & {
    as: 'link'
    to: string
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    children,
  } = props

  const classes = `btn-atelier inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`

  if (props.as === 'link') {
    const { as: _as, variant: _v, size: _s, fullWidth: _f, className: _c, children: _ch, ...linkProps } =
      props
    return (
      <Link className={classes} {...linkProps}>
        {children}
      </Link>
    )
  }

  const { as: _as, type = 'button', ...buttonProps } = props
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  )
}

import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { BrandLogo } from '../brand/BrandLogo'
import { useCartPulse } from '../../hooks/useCartPulse'
import { useCartCount } from '../../store/cartStore'

export function Header() {
  const count = useCartCount()
  const pulse = useCartPulse()

  return (
    <header className="store-header sticky top-0 z-40">
      <div className="header-bloom" />
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:h-[4.75rem] sm:px-4">
        <BrandLogo size="md" />

        <Link
          to="/carrito"
          className={`header-cart ${pulse ? 'cart-pop' : ''}`}
          aria-label={`Carrito, ${count} artículos`}
        >
          <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
          {count > 0 ? <span className="header-cart-count">{count}</span> : null}
          <span className="hidden text-xs font-semibold tracking-[0.08em] uppercase sm:inline">
            Carrito
          </span>
        </Link>
      </div>
    </header>
  )
}

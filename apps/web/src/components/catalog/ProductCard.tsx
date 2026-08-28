import { Link } from 'react-router-dom'
import {
  displayPriceCents,
  getAttributeValues,
  isOnSale,
  isProductAvailable,
  primaryImageUrl,
  productHasOptions,
  remainingStock,
  salePercent,
} from '../../lib/product'
import { formatMoney } from '../../lib/money'
import { useCartStore } from '../../store/cartStore'
import { toast } from '../../store/toastStore'
import type { Product } from '../../types'
import { Tilt3D } from '../ui/Tilt3D'
import { ProductImage } from './ProductImage'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const available = isProductAvailable(product)
  const onSale = isOnSale(product)
  const hasOptions = productHasOptions(product)
  const href = `/producto/${product.slug}`
  const price = displayPriceCents(product)
  const discount = salePercent(product)
  const stock = remainingStock(product)
  const lowStock = available && product.trackInventory && stock > 0 && stock <= 6
  const colors = getAttributeValues(product, 'color').slice(0, 4)
  const addItem = useCartStore((state) => state.addItem)

  const quickAdd = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!available || hasOptions) return
    addItem({ product, quantity: 1 })
    toast('success', `${product.name} se agregó al carrito`)
  }

  return (
    <Tilt3D maxTilt={10} scale={1.03} className="shop-card-float h-full min-w-0">
      <article
        className="shop-card fade-up group flex h-full min-w-0 flex-col"
        style={{ animationDelay: `${220 + index * 140}ms` }}
      >
        <Link
          to={href}
          className="shop-card-media product-card-shine relative block aspect-[3/4] overflow-hidden bg-[#f3f1ef]"
        >
          <ProductImage
            src={primaryImageUrl(product)}
            alt={product.name}
            className="shop-card-image h-full w-full object-cover"
          />
          <div className="shop-card-badges">
            {discount ? <span className="pill-sale">-{discount}%</span> : null}
            {product.isNew ? <span className="pill-new">Nuevo</span> : null}
            {!available ? <span className="pill-out">Agotado</span> : null}
          </div>
          {lowStock ? <span className="shop-card-stock">Últimas {stock}</span> : null}
          <div className="shop-card-overlay">
            <span>{hasOptions ? 'Ver y comprar' : 'Agregar al carrito'}</span>
          </div>
        </Link>

        <div className="flex flex-1 flex-col px-0.5 pt-3 text-center sm:pt-4">
          <Link to={href} className="block">
            <h3 className="line-clamp-2 font-display text-[1.15rem] leading-tight text-atelier-dark transition-colors group-hover:text-atelier-gold sm:text-[1.35rem]">
              {product.name}
            </h3>
          </Link>

          {colors.length > 0 ? (
            <div className="mt-2 flex items-center justify-center gap-1.5" aria-label="Colores">
              {colors.map((color) => {
                const hex = (color.hexCode || '').toLowerCase()
                return (
                  <span
                    key={color.id}
                    title={color.name}
                    className={`h-3.5 w-3.5 rounded-full border ${
                      hex === '#ffffff' || hex === '#fff'
                        ? 'border-atelier-gray/40'
                        : 'border-black/10'
                    }`}
                    style={{ backgroundColor: color.hexCode || '#d4d4d4' }}
                  />
                )
              })}
            </div>
          ) : null}

          <div className="mt-2 flex flex-col items-center">
            {onSale ? (
              <>
                <span className="text-[12px] text-atelier-gray line-through">
                  {formatMoney(product.basePriceCents)}
                </span>
                <p className="flex items-baseline gap-1.5">
                  <span className="text-[16px] font-bold break-all tabular-nums text-atelier-gold sm:text-[18px]">
                    {formatMoney(price)}
                  </span>
                </p>
              </>
            ) : (
              <span className="max-w-full text-[16px] font-bold break-all tabular-nums text-atelier-dark sm:text-[18px]">
                {formatMoney(price)}
              </span>
            )}
          </div>

          <div className="mt-auto min-w-0 w-full pt-3">
            {available ? (
              hasOptions ? (
                <Link to={href} className="shop-buy-btn shop-buy-btn-fill">
                  Comprar ahora
                </Link>
              ) : (
                <button type="button" onClick={quickAdd} className="shop-buy-btn shop-buy-btn-fill">
                  <span className="sm:hidden">Agregar</span>
                  <span className="hidden sm:inline">Agregar al carrito</span>
                </button>
              )
            ) : (
              <span className="shop-buy-btn shop-buy-btn--disabled">Agotado</span>
            )}
          </div>
        </div>
      </article>
    </Tilt3D>
  )
}

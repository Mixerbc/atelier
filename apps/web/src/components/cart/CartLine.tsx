import { Trash2 } from 'lucide-react'
import { formatMoney } from '../../lib/money'
import { computeLineAmountCents } from '../../lib/cart'
import { useCartStore } from '../../store/cartStore'
import type { CartItem } from '../../types'
import { QuantitySelector } from '../ui/QuantitySelector'
import { ProductImage } from '../catalog/ProductImage'

interface CartLineProps {
  item: CartItem
}

export function CartLine({ item }: CartLineProps) {
  const increment = useCartStore((state) => state.increment)
  const decrement = useCartStore((state) => state.decrement)
  const setNotes = useCartStore((state) => state.setNotes)
  const remove = useCartStore((state) => state.remove)
  const lineTotal = computeLineAmountCents(item.unitPriceCents, item.quantity)

  const meta = [item.colorName, item.sizeName, item.sku ? `SKU ${item.sku}` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className="grid grid-cols-[4.75rem_1fr] gap-2.5 rounded-2xl bg-paper p-2.5 sm:grid-cols-[6.5rem_1fr] sm:gap-4 sm:rounded-3xl sm:p-4">
      <div className="aspect-[3/4] overflow-hidden rounded-xl sm:rounded-2xl">
        <ProductImage src={item.image} alt={item.name} />
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-lg leading-tight sm:text-2xl">{item.name}</h3>
            {meta ? <p className="truncate text-xs text-ink-soft sm:text-sm">{meta}</p> : null}
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums sm:text-base">{formatMoney(lineTotal)}</p>
        </div>

        {item.extras.length > 0 ? (
          <ul className="mt-2 text-sm text-ink-soft">
            {item.extras.map((extra) => (
              <li key={extra.id}>
                {extra.name} +{formatMoney(extra.priceCents)}
              </li>
            ))}
          </ul>
        ) : null}

        <label className="mt-3 block">
          <span className="sr-only">Observación de {item.name}</span>
          <input
            value={item.notes}
            onChange={(event) => setNotes(item.id, event.target.value)}
            placeholder="Nota del producto…"
            className="h-11 w-full rounded-2xl border border-cream-dark bg-cream/50 px-3 text-sm"
          />
        </label>

        <div className="mt-3 flex items-center justify-between gap-3">
          <QuantitySelector
            size="sm"
            value={item.quantity}
            onChange={(next) => {
              if (next > item.quantity) increment(item.id)
              if (next < item.quantity) decrement(item.id)
            }}
          />
          <button
            type="button"
            onClick={() => remove(item.id)}
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-brand"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  )
}

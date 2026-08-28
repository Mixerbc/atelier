import { useMemo, useState } from 'react'
import { mediaUrl } from '../../lib/api'
import {
  findVariant,
  getAttributeValues,
  isLowStock,
  isProductAvailable,
  isVariantSellable,
  resolveVariantUnitPrice,
} from '../../lib/product'
import { formatMoney, multiplyCents } from '../../lib/money'
import { useCartStore } from '../../store/cartStore'
import { toast } from '../../store/toastStore'
import type { Product } from '../../types'
import { Button } from '../ui/Button'
import { QuantitySelector } from '../ui/QuantitySelector'

interface ProductConfiguratorProps {
  product: Product
  onImageChange?: (url: string) => void
}

export function ProductConfigurator({ product, onImageChange }: ProductConfiguratorProps) {
  const colors = getAttributeValues(product, 'color')
  const sizes = getAttributeValues(product, 'talla')
  const requiresVariants = product.hasVariants || product.variants.length > 0

  const [colorId, setColorId] = useState<string>('')
  const [sizeId, setSizeId] = useState<string>('')
  const [extraIds, setExtraIds] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const selectedVariant = useMemo(
    () => findVariant(product.variants, colorId || null, sizeId || null),
    [colorId, product.variants, sizeId],
  )

  const selectedExtras = (product.extras ?? []).filter((extra) => extraIds.includes(extra.id))
  const unitPriceCents = useMemo(
    () => resolveVariantUnitPrice(product, selectedVariant, selectedExtras),
    [product, selectedExtras, selectedVariant],
  )

  const available = isProductAvailable(product)
  const variantOk = !requiresVariants || isVariantSellable(product, selectedVariant)
  const selectionComplete =
    !requiresVariants ||
    ((colors.length === 0 || Boolean(colorId)) && (sizes.length === 0 || Boolean(sizeId)))

  const stock = selectedVariant?.stock ?? product.stock
  const minStock = selectedVariant?.minStock ?? product.minStock
  const lowStock = selectionComplete && isLowStock(product, stock, minStock)

  const sizeDisabled = (sizeValueId: string) => {
    if (!colorId && colors.length > 0) return false
    const variant = findVariant(product.variants, colorId || null, sizeValueId)
    return !isVariantSellable(product, variant)
  }

  const colorDisabled = (colorValueId: string) => {
    if (!sizeId && sizes.length > 0) {
      return !product.variants.some((variant) => {
        const hasColor = variant.attributes.some(
          (row) => row.attributeValue.id === colorValueId && row.attributeValue.attribute.slug === 'color',
        )
        return hasColor && isVariantSellable(product, variant)
      })
    }
    const variant = findVariant(product.variants, colorValueId, sizeId || null)
    return !isVariantSellable(product, variant)
  }

  const selectColor = (id: string) => {
    setColorId(id)
    const variant = findVariant(product.variants, id, sizeId || null)
    if (variant?.imageUrl) onImageChange?.(mediaUrl(variant.imageUrl))
  }

  const toggleExtra = (id: string) => {
    setExtraIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const handleAdd = () => {
    if (!available) return
    if (requiresVariants) {
      if (colors.length > 0 && !colorId) {
        toast('error', 'Selecciona un color')
        return
      }
      if (sizes.length > 0 && !sizeId) {
        toast('error', 'Selecciona una talla')
        return
      }
      if (!selectedVariant || !variantOk) {
        toast('error', 'Esa combinación no está disponible')
        return
      }
    }

    addItem({
      product,
      quantity,
      variant: selectedVariant,
      extras: selectedExtras.map((extra) => ({ ...extra })),
      notes,
      imageOverride: selectedVariant?.imageUrl ? mediaUrl(selectedVariant.imageUrl) : undefined,
    })
    toast('success', `${product.name} se agregó al carrito`)
  }

  const canAdd = available && selectionComplete && variantOk
  const totalLabel = formatMoney(multiplyCents(unitPriceCents, quantity))
  const ctaLabel = available
    ? requiresVariants && !selectionComplete
      ? 'Selecciona color y talla'
      : `Agregar · ${totalLabel}`
    : 'Producto agotado'

  return (
    <div className="product-config">
      {colors.length > 0 ? (
        <fieldset>
          <legend>
            Color{colorId ? `: ${colors.find((c) => c.id === colorId)?.name ?? ''}` : ''}
          </legend>
          <div className="product-swatches">
            {colors.map((color) => {
              const disabled = colorDisabled(color.id)
              const selected = colorId === color.id
              return (
                <button
                  key={color.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectColor(color.id)}
                  className={`product-swatch ${selected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
                  title={color.name}
                  aria-pressed={selected}
                >
                  <span
                    className={`product-swatch-dot ${
                      (color.hexCode || '').toLowerCase() === '#ffffff' ||
                      (color.hexCode || '').toLowerCase() === '#fff'
                        ? 'is-light'
                        : ''
                    }`}
                    style={{ backgroundColor: color.hexCode || '#ccc' }}
                    aria-hidden
                  />
                  <span>{color.name}</span>
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : null}

      {sizes.length > 0 ? (
        <fieldset>
          <legend>Talla</legend>
          <div className="product-sizes">
            {sizes.map((size) => {
              const disabled = sizeDisabled(size.id)
              const selected = sizeId === size.id
              return (
                <button
                  key={size.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSizeId(size.id)}
                  className={`product-size ${selected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
                  aria-pressed={selected}
                  aria-label={disabled ? `${size.name}, no disponible` : size.name}
                >
                  {size.abbreviation || size.name}
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : null}

      {product.extras && product.extras.length > 0 ? (
        <fieldset>
          <legend>Extras</legend>
          <div className="grid gap-1.5">
            {product.extras.map((extra) => (
              <label
                key={extra.id}
                className={`flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 text-sm ${
                  extraIds.includes(extra.id)
                    ? 'border-atelier-gold bg-atelier-soft-pink'
                    : 'border-atelier-blush bg-atelier-white'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={extraIds.includes(extra.id)}
                    onChange={() => toggleExtra(extra.id)}
                  />
                  <span className="truncate">{extra.name}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">+{formatMoney(extra.priceCents)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {lowStock ? (
        <p className="rounded-xl bg-gold/15 px-3 py-1.5 text-xs font-medium text-ink">
          Quedan pocas unidades ({stock})
        </p>
      ) : null}

      <div className="product-meta">
        {selectedVariant?.sku ? <span className="break-all">Código: {selectedVariant.sku}</span> : null}
        <button type="button" onClick={() => setShowNotes((value) => !value)}>
          {showNotes ? 'Ocultar nota' : 'Agregar nota'}
        </button>
      </div>

      {showNotes ? (
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Ej. Regalo, empaque especial…"
          className="min-h-16 w-full rounded-xl border border-cream-dark bg-paper px-3 py-2 text-sm"
        />
      ) : null}

      <div className="product-buy">
        <QuantitySelector value={quantity} onChange={setQuantity} disabled={!canAdd} size="sm" />
        <Button
          className="product-add-btn min-w-0 flex-1"
          variant="primary"
          onClick={handleAdd}
          disabled={!canAdd}
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}

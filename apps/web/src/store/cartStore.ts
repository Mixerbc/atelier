import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  addOrMergeItem,
  computeShippingCents,
  computeSubtotalCents,
  computeTotalCents,
  createCartItemId,
  createLineKey,
  getCartItemCount,
  removeItem,
  updateItemNotes,
  updateItemQuantity,
} from '../lib/cart'
import { mediaUrl } from '../lib/api'
import { primaryImageUrl, resolveVariantUnitPrice, variantColorSize } from '../lib/product'
import type { CartItem, CartItemExtra, DeliveryType, Product, ProductVariant } from '../types'

export interface AddToCartInput {
  product: Product
  quantity: number
  variant?: ProductVariant | null
  extras?: CartItemExtra[]
  notes?: string
  imageOverride?: string | null
}

interface CartState {
  items: CartItem[]
  addItem: (input: AddToCartInput) => CartItem
  increment: (id: string) => void
  decrement: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  setNotes: (id: string, notes: string) => void
  remove: (id: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (input) => {
        const quantity = Math.max(1, Math.floor(input.quantity))
        const extras = input.extras ?? []
        const variant = input.variant ?? null
        const { colorName, sizeName } = variantColorSize(variant)
        const unitPriceCents = resolveVariantUnitPrice(input.product, variant, extras)
        const image =
          input.imageOverride ||
          (variant?.imageUrl ? mediaUrl(variant.imageUrl) : primaryImageUrl(input.product))

        const incoming: CartItem = {
          id: createCartItemId(),
          lineKey: createLineKey({
            productId: input.product.id,
            variantId: variant?.id,
            colorName,
            sizeName,
            extraIds: extras.map((extra) => extra.id),
            notes: input.notes ?? '',
          }),
          productId: input.product.id,
          variantId: variant?.id ?? null,
          name: input.product.name,
          image,
          colorName,
          sizeName,
          sku: variant?.sku ?? input.product.sku ?? null,
          unitPriceCents,
          quantity,
          extras: extras.map((extra) => ({ ...extra })),
          notes: (input.notes ?? '').trim(),
        }

        set({ items: addOrMergeItem(get().items, incoming) })
        return incoming
      },
      increment: (id) => {
        const current = get().items.find((item) => item.id === id)
        if (!current) return
        set({ items: updateItemQuantity(get().items, id, current.quantity + 1) })
      },
      decrement: (id) => {
        const current = get().items.find((item) => item.id === id)
        if (!current || current.quantity <= 1) return
        set({ items: updateItemQuantity(get().items, id, current.quantity - 1) })
      },
      setQuantity: (id, quantity) => {
        set({ items: updateItemQuantity(get().items, id, quantity) })
      },
      setNotes: (id, notes) => {
        set({ items: updateItemNotes(get().items, id, notes) })
      },
      remove: (id) => {
        set({ items: removeItem(get().items, id) })
      },
      clear: () => {
        set({ items: [] })
      },
    }),
    {
      name: 'atelier-cart',
      partialize: (state) => ({ items: state.items }),
      version: 2,
      migrate: (persisted) => {
        const state = persisted as { items?: unknown[] } | undefined
        if (!state?.items || !Array.isArray(state.items)) return { items: [] }
        const items = state.items
          .map((raw) => {
            const item = raw as Record<string, unknown>
            if (!item || typeof item.productId !== 'string') return null
            const extras = Array.isArray(item.extras)
              ? (item.extras as CartItemExtra[])
              : []
            const variantId =
              typeof item.variantId === 'string'
                ? item.variantId
                : item.variant && typeof item.variant === 'object' && item.variant && 'id' in item.variant
                  ? String((item.variant as { id: unknown }).id)
                  : null
            const colorName = typeof item.colorName === 'string' ? item.colorName : null
            const sizeName = typeof item.sizeName === 'string' ? item.sizeName : null
            const notes = typeof item.notes === 'string' ? item.notes : ''
            return {
              id: typeof item.id === 'string' ? item.id : createCartItemId(),
              lineKey:
                typeof item.lineKey === 'string'
                  ? item.lineKey
                  : createLineKey({
                      productId: item.productId,
                      variantId,
                      colorName,
                      sizeName,
                      extraIds: extras.map((e) => e.id),
                      notes,
                    }),
              productId: item.productId,
              variantId,
              name: typeof item.name === 'string' ? item.name : 'Producto',
              image: typeof item.image === 'string' ? item.image : '/logo.svg',
              colorName,
              sizeName,
              sku: typeof item.sku === 'string' ? item.sku : null,
              unitPriceCents:
                typeof item.unitPriceCents === 'number' ? item.unitPriceCents : 0,
              quantity: typeof item.quantity === 'number' ? item.quantity : 1,
              notes,
              extras,
            } satisfies CartItem
          })
          .filter((item): item is CartItem => Boolean(item))
        return { items }
      },
    },
  ),
)

export function useCartItems(): CartItem[] {
  return useCartStore((state) => state.items)
}

export function useCartCount(): number {
  return useCartStore((state) => getCartItemCount(state.items))
}

export function getCartTotals(
  items: CartItem[],
  deliveryType: DeliveryType | '' | null | undefined,
  deliveryFeeCents: number,
) {
  const subtotalCents = computeSubtotalCents(items)
  const shippingCents = computeShippingCents(deliveryType, deliveryFeeCents)
  const totalCents = computeTotalCents(subtotalCents, shippingCents)
  return { subtotalCents, shippingCents, totalCents }
}

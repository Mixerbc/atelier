import type { CartItem, CartItemExtra, DeliveryType } from '../types'
import { multiplyCents } from './money'

export function createLineKey(input: {
  productId: string
  variantId?: string | null
  colorName?: string | null
  sizeName?: string | null
  extraIds: string[]
  notes: string
}): string {
  const extras = [...input.extraIds].sort().join(',')
  const notes = input.notes.trim().toLowerCase()
  const color = (input.colorName ?? '').trim().toLowerCase()
  const size = (input.sizeName ?? '').trim().toLowerCase()
  return `${input.productId}|${input.variantId ?? ''}|${color}|${size}|${extras}|${notes}`
}

export function computeUnitPriceCents(
  basePriceCents: number,
  extras: Pick<CartItemExtra, 'priceCents'>[],
): number {
  return extras.reduce((sum, extra) => sum + extra.priceCents, basePriceCents)
}

export function computeLineAmountCents(unitPriceCents: number, quantity: number): number {
  const safeQuantity = Math.max(0, Math.floor(quantity))
  return multiplyCents(unitPriceCents, safeQuantity)
}

export function computeSubtotalCents(
  items: Pick<CartItem, 'unitPriceCents' | 'quantity'>[],
): number {
  return items.reduce(
    (sum, item) => sum + computeLineAmountCents(item.unitPriceCents, item.quantity),
    0,
  )
}

export function computeShippingCents(
  deliveryType: DeliveryType | '' | null | undefined,
  deliveryFeeCents: number,
): number {
  return deliveryType === 'delivery' ? deliveryFeeCents : 0
}

export function computeTotalCents(subtotalCents: number, shippingCents: number): number {
  return subtotalCents + shippingCents
}

export function computeChangeCents(cashAmountCents: number, totalCents: number): number {
  return cashAmountCents - totalCents
}

export function getCartItemCount(items: Pick<CartItem, 'quantity'>[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function addOrMergeItem(items: CartItem[], incoming: CartItem): CartItem[] {
  const existing = items.find((item) => item.lineKey === incoming.lineKey)
  if (!existing) {
    return [...items, { ...incoming, quantity: Math.max(1, incoming.quantity) }]
  }

  return items.map((item) =>
    item.lineKey === incoming.lineKey
      ? { ...item, quantity: item.quantity + Math.max(1, incoming.quantity) }
      : item,
  )
}

export function updateItemQuantity(
  items: CartItem[],
  id: string,
  quantity: number,
): CartItem[] {
  const nextQuantity = Math.floor(quantity)
  if (nextQuantity <= 0) {
    return items.filter((item) => item.id !== id)
  }

  return items.map((item) => (item.id === id ? { ...item, quantity: nextQuantity } : item))
}

export function updateItemNotes(items: CartItem[], id: string, notes: string): CartItem[] {
  return items.map((item) => {
    if (item.id !== id) return item
    const nextNotes = notes.trim()
    const extraIds = item.extras.map((extra) => extra.id)
    return {
      ...item,
      notes: nextNotes,
      lineKey: createLineKey({
        productId: item.productId,
        variantId: item.variantId,
        colorName: item.colorName,
        sizeName: item.sizeName,
        extraIds,
        notes: nextNotes,
      }),
    }
  })
}

export function removeItem(items: CartItem[], id: string): CartItem[] {
  return items.filter((item) => item.id !== id)
}

export function createCartItemId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

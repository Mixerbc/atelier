import type { ApiOrder, CartItem, CartItemExtra, Customer, Order, OrderItem } from '../types'
import {
  computeChangeCents,
  computeLineAmountCents,
  computeShippingCents,
  computeSubtotalCents,
  computeTotalCents,
} from './cart'
import { generateFolio } from './folio'

function parseExtras(value: unknown): CartItemExtra[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as { id?: unknown; name?: unknown; priceCents?: unknown }
      if (typeof row.id !== 'string' || typeof row.name !== 'string') return null
      return {
        id: row.id,
        name: row.name,
        priceCents: typeof row.priceCents === 'number' ? row.priceCents : 0,
      }
    })
    .filter((item): item is CartItemExtra => Boolean(item))
}

export function toOrderItem(item: CartItem): OrderItem {
  return {
    name: item.name,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    extras: item.extras.map((extra) => ({ ...extra })),
    notes: item.notes,
    amountCents: computeLineAmountCents(item.unitPriceCents, item.quantity),
    colorName: item.colorName,
    sizeName: item.sizeName,
    sku: item.sku,
  }
}

export function buildOrder(input: {
  items: CartItem[]
  customer: Customer
  deliveryFeeCents: number
  createdAt?: Date
  folio?: string
}): Order {
  const createdAt = input.createdAt ?? new Date()
  const subtotalCents = computeSubtotalCents(input.items)
  const shippingCents = computeShippingCents(
    input.customer.deliveryType,
    input.deliveryFeeCents,
  )
  const totalCents = computeTotalCents(subtotalCents, shippingCents)
  const changeCents =
    input.customer.paymentMethod === 'cash' && input.customer.cashAmountCents !== null
      ? computeChangeCents(input.customer.cashAmountCents, totalCents)
      : null

  return {
    folio: input.folio ?? generateFolio(createdAt),
    createdAt: createdAt.toISOString(),
    customer: { ...input.customer },
    items: input.items.map(toOrderItem),
    subtotalCents,
    shippingCents,
    totalCents,
    changeCents,
  }
}

export function mapApiOrderToTicketOrder(apiOrder: ApiOrder): Order {
  const deliveryType = apiOrder.deliveryType === 'PICKUP' ? 'pickup' : 'delivery'
  const paymentMethod =
    apiOrder.paymentMethod === 'MOBILE'
      ? 'mobile'
      : apiOrder.paymentMethod === 'OTHER'
        ? 'other'
        : 'cash'

  return {
    id: apiOrder.id,
    folio: apiOrder.folio,
    createdAt: apiOrder.createdAt,
    status: apiOrder.status,
    customer: {
      fullName: apiOrder.customer.fullName,
      phone: apiOrder.customer.phone,
      deliveryType,
      address: apiOrder.address ?? '',
      zone: apiOrder.zone ?? '',
      references: apiOrder.references ?? '',
      mapsUrl: apiOrder.mapsUrl ?? '',
      paymentMethod,
      cashAmountCents: apiOrder.cashAmountCents,
      paymentNote: apiOrder.paymentNote ?? '',
      notes: apiOrder.notes ?? '',
    },
    items: apiOrder.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      extras: parseExtras(item.extrasJson),
      notes: item.notes ?? '',
      amountCents: item.lineTotalCents,
      colorName: item.colorName,
      sizeName: item.sizeName,
      sku: item.sku,
      variantLabel: item.variantLabel,
    })),
    subtotalCents: apiOrder.subtotalCents,
    shippingCents: apiOrder.shippingCents,
    totalCents: apiOrder.totalCents,
    changeCents: apiOrder.changeCents,
  }
}

export function toCreateOrderPayload(customer: Customer, items: CartItem[]) {
  return {
    customer: {
      fullName: customer.fullName.trim(),
      phone: customer.phone,
    },
    deliveryType: (customer.deliveryType === 'pickup' ? 'PICKUP' : 'DELIVERY') as
      | 'DELIVERY'
      | 'PICKUP',
    address: customer.address,
    zone: customer.zone,
    references: customer.references,
    mapsUrl: customer.mapsUrl.trim(),
    paymentMethod: (customer.paymentMethod === 'mobile'
      ? 'MOBILE'
      : customer.paymentMethod === 'other'
        ? 'OTHER'
        : 'CASH') as 'CASH' | 'MOBILE' | 'OTHER',
    cashAmountCents: customer.paymentMethod === 'cash' ? customer.cashAmountCents : null,
    paymentNote:
      customer.paymentMethod === 'other' || customer.paymentMethod === 'mobile'
        ? customer.paymentNote.trim()
        : '',
    notes: customer.notes,
    items: items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      notes: item.notes,
      extraIds: item.extras.map((extra) => extra.id),
    })),
  }
}

import type { Order } from '../types'
import { formatMoney } from './money'

export function formatTicketDateParts(date: Date): { fecha: string; hora: string } {
  const fecha = new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)

  const hora = new Intl.DateTimeFormat('es-VE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)

  return { fecha, hora }
}

function deliveryLabel(type: Order['customer']['deliveryType']): string {
  if (type === 'pickup') return 'Recoger en tienda'
  if (type === 'delivery') return 'Envío a domicilio'
  return 'No especificada'
}

function paymentLabel(method: Order['customer']['paymentMethod']): string {
  if (method === 'cash') return 'Efectivo'
  if (method === 'mobile') return 'Pago móvil'
  if (method === 'other') return 'Otro pago'
  return 'No especificada'
}

export function confirmationMessage(businessName: string): string {
  return [
    '✅ *CONFIRMACIÓN DEL PEDIDO*',
    `Confirmo este pedido con ${businessName}.`,
    'Este mensaje es mi ticket y mi confirmación.',
    'No necesito contestar más. Quedo pendiente de su confirmación de entrega.',
  ].join('\n')
}

export function generateTicket(
  order: Order,
  businessName: string,
  currency: string,
  footer?: string,
): string {
  const createdAt = new Date(order.createdAt)
  const { fecha, hora } = formatTicketDateParts(createdAt)
  const customer = order.customer

  const lines: string[] = [
    `Hola, confirmo mi pedido en *${businessName}*.`,
    '',
    `🧾 *TICKET – ${businessName}*`,
    '',
    `*Folio:* ${order.folio}`,
    `*Fecha:* ${fecha}`,
    `*Hora:* ${hora}`,
    '',
    '👤 *DATOS DEL CLIENTE*',
    `Nombre: ${customer.fullName}`,
    `Teléfono: ${customer.phone.replace(/\D/g, '')}`,
    `Entrega: ${deliveryLabel(customer.deliveryType)}`,
  ]

  if (customer.deliveryType === 'delivery') {
    if (customer.address.trim()) {
      lines.push(`Dirección: ${customer.address.trim()}`)
    }
    if (customer.zone.trim()) {
      lines.push(`Colonia: ${customer.zone}`)
    }
    if (customer.mapsUrl?.trim()) {
      lines.push(`Ubicación Google Maps: ${customer.mapsUrl.trim()}`)
    }
    if (customer.references.trim()) {
      lines.push(`Referencias: ${customer.references.trim()}`)
    }
  }

  lines.push('', '🛒 *PRODUCTOS*', '')

  order.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name}`)
    if (item.colorName) lines.push(`Color: ${item.colorName}`)
    if (item.sizeName) lines.push(`Talla: ${item.sizeName}`)
    if (item.sku) lines.push(`SKU: ${item.sku}`)
    if (item.variantLabel && !item.colorName && !item.sizeName) {
      lines.push(`Variante: ${item.variantLabel}`)
    }
    lines.push(`Cantidad: ${item.quantity}`)
    lines.push(`Precio unitario: ${formatMoney(item.unitPriceCents, currency)}`)

    if (item.extras.length > 0) {
      const extrasText = item.extras
        .map((extra) => `${extra.name} +${formatMoney(extra.priceCents, currency)}`)
        .join(', ')
      lines.push(`Extras: ${extrasText}`)
    }

    if (item.notes.trim()) {
      lines.push(`Observación: ${item.notes.trim()}`)
    }

    lines.push(`Importe: ${formatMoney(item.amountCents, currency)}`)
    lines.push('')
  })

  lines.push('💵 *RESUMEN*')
  lines.push(`Subtotal: ${formatMoney(order.subtotalCents, currency)}`)
  lines.push(`Envío: ${formatMoney(order.shippingCents, currency)}`)
  lines.push(`*TOTAL: ${formatMoney(order.totalCents, currency)}*`)
  lines.push('')
  lines.push(`Forma de pago: ${paymentLabel(customer.paymentMethod)}`)

  if (customer.paymentMethod === 'cash' && customer.cashAmountCents !== null) {
    lines.push(`Pagará con: ${formatMoney(customer.cashAmountCents, currency)}`)
    if (order.changeCents !== null) {
      lines.push(`Cambio estimado: ${formatMoney(order.changeCents, currency)}`)
    }
  }

  if (customer.paymentMethod === 'mobile' && customer.paymentNote.trim()) {
    lines.push(`Referencia pago móvil: ${customer.paymentNote.trim()}`)
  }

  if (customer.paymentMethod === 'other') {
    lines.push(`Detalle del pago: ${customer.paymentNote.trim() || 'Sin detalle'}`)
  }

  if (customer.notes.trim()) {
    lines.push('')
    lines.push('📝 Observaciones:')
    lines.push(customer.notes.trim())
  }

  lines.push('', confirmationMessage(businessName))

  if (footer?.trim()) {
    lines.push('', footer.trim())
  }

  return lines.join('\n').trim()
}

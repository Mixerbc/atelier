import { describe, expect, it } from 'vitest'
import type { Order } from '../types'
import { formatMoney } from './money'
import { formatTicketDateParts, generateTicket } from './ticket'
import { buildWhatsAppUrl } from './whatsapp'

const order: Order = {
  folio: 'PED-20260823-A7K3',
  createdAt: '2026-08-23T20:35:00.000Z',
  customer: {
    fullName: 'Juan Pérez',
    phone: '4421234567',
    deliveryType: 'delivery',
    address: 'Calle Ejemplo 123',
    zone: 'Zakia',
    references: 'Portón negro',
    mapsUrl: 'https://maps.app.goo.gl/example',
    paymentMethod: 'cash',
    cashAmountCents: 50000,
    paymentNote: '',
    notes: 'Favor de llamar al llegar.',
  },
  items: [
    {
      name: 'Playera básica',
      quantity: 2,
      unitPriceCents: 18500,
      extras: [{ id: 'extra-gift', name: 'Envoltorio', priceCents: 3000 }],
      notes: 'Talla justa',
      amountCents: 40000,
      colorName: 'Negro',
      sizeName: 'M',
      sku: 'TEE-NEGRO-M',
    },
    {
      name: 'Gorra',
      quantity: 1,
      unitPriceCents: 4000,
      extras: [],
      notes: '',
      amountCents: 4000,
      colorName: 'Blanco',
      sizeName: null,
      sku: 'CAP-BLANCO',
    },
  ],
  subtotalCents: 44000,
  shippingCents: 3500,
  totalCents: 47500,
  changeCents: 2500,
}

describe('ticket', () => {
  it('genera el ticket con color, talla y sku', () => {
    const ticket = generateTicket(order, 'Atelier', 'Bs')
    const createdAt = new Date(order.createdAt)
    const { fecha, hora } = formatTicketDateParts(createdAt)

    expect(ticket).toContain('Hola, confirmo mi pedido en *Atelier*.')
    expect(ticket).toContain('🧾 *TICKET – Atelier*')
    expect(ticket).toContain('*Folio:* PED-20260823-A7K3')
    expect(ticket).toContain(`*Fecha:* ${fecha}`)
    expect(ticket).toContain(`*Hora:* ${hora}`)
    expect(ticket).toContain('Nombre: Juan Pérez')
    expect(ticket).toContain('Teléfono: 4421234567')
    expect(ticket).toContain('Entrega: Envío a domicilio')
    expect(ticket).toContain('Dirección: Calle Ejemplo 123')
    expect(ticket).toContain('Colonia: Zakia')
    expect(ticket).toContain('Referencias: Portón negro')
    expect(ticket).toContain('Ubicación Google Maps: https://maps.app.goo.gl/example')
    expect(ticket).toContain('1. Playera básica')
    expect(ticket).toContain('Color: Negro')
    expect(ticket).toContain('Talla: M')
    expect(ticket).toContain('SKU: TEE-NEGRO-M')
    expect(ticket).toContain('Cantidad: 2')
    expect(ticket).toContain(`Precio unitario: ${formatMoney(18500)}`)
    expect(ticket).toContain(`Extras: Envoltorio +${formatMoney(3000)}`)
    expect(ticket).toContain('Observación: Talla justa')
    expect(ticket).toContain(`Importe: ${formatMoney(40000)}`)
    expect(ticket).toContain('2. Gorra')
    expect(ticket).toContain(`Subtotal: ${formatMoney(44000)}`)
    expect(ticket).toContain(`Envío: ${formatMoney(3500)}`)
    expect(ticket).toContain(`*TOTAL: ${formatMoney(47500)}*`)
    expect(ticket).toContain('Forma de pago: Efectivo')
    expect(ticket).toContain(`Pagará con: ${formatMoney(50000)}`)
    expect(ticket).toContain(`Cambio estimado: ${formatMoney(2500)}`)
    expect(ticket).toContain('Favor de llamar al llegar.')
    expect(ticket).toContain('✅ *CONFIRMACIÓN DEL PEDIDO*')
    expect(ticket).toContain('No necesito contestar más.')
  })

  it('codifica el mensaje para la URL de WhatsApp', () => {
    const ticket = generateTicket(order, 'Atelier', 'Bs')
    const url = buildWhatsAppUrl('+52 1 442-123-4567', ticket)

    expect(url.startsWith('https://wa.me/5214421234567?text=')).toBe(true)
    expect(url).toBe(`https://wa.me/5214421234567?text=${encodeURIComponent(ticket)}`)
    expect(url.includes('+')).toBe(false)
    expect(url.includes(' ')).toBe(false)
  })
})

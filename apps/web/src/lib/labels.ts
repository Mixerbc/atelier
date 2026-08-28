import type { OrderStatus, ProductStatus } from '../types'

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  SOLD_OUT: 'Agotado',
  DISABLED: 'Desactivado',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'Nuevo',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  READY: 'Listo',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

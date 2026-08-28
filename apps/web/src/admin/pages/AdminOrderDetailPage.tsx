import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, ordersApi } from '../../lib/api'
import { ORDER_STATUS_LABELS } from '../../lib/labels'
import { formatMoney } from '../../lib/money'
import { toast } from '../../store/toastStore'
import type { ApiOrder, OrderStatus } from '../../types'

const statusOptions: OrderStatus[] = [
  'NEW',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

export function AdminOrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<ApiOrder | null>(null)
  const [status, setStatus] = useState<OrderStatus>('NEW')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    ordersApi
      .getAdmin(id)
      .then((data) => {
        setOrder(data)
        setStatus(data.status)
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id])

  const saveStatus = async () => {
    if (!id) return
    try {
      const updated = await ordersApi.updateStatus(id, status)
      setOrder(updated)
      toast('success', 'Estado actualizado')
    } catch (error) {
      toast('error', error instanceof ApiError ? error.message : 'No se pudo actualizar')
    }
  }

  if (loading) return <p className="text-sm text-slate-600">Cargando…</p>
  if (!order) {
    return (
      <div>
        <p>Pedido no encontrado.</p>
        <Link to="/admin/orders" className="underline">
          Volver
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/admin/orders" className="text-sm text-slate-600 underline">
            ← Pedidos
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{order.folio}</h1>
          <p className="text-sm text-slate-600">
            {new Date(order.createdAt).toLocaleString('es-VE')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
          >
            {statusOptions.map((item) => (
              <option key={item} value={item}>
                {ORDER_STATUS_LABELS[item]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void saveStatus()}
            className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            Actualizar estado
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <h2 className="font-semibold">Cliente</h2>
          <p className="mt-2">{order.customer.fullName}</p>
          <p>{order.customer.phone}</p>
          <p className="mt-3">Entrega: {order.deliveryType}</p>
          {order.deliveryType === 'DELIVERY' ? (
            <>
              <p>{order.address}</p>
              <p>{order.zone}</p>
              {order.mapsUrl ? (
                <p className="mt-2">
                  <a
                    href={order.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-atelier-gold underline"
                  >
                    Ver ubicación en Google Maps
                  </a>
                </p>
              ) : null}
              {order.references ? <p>Refs: {order.references}</p> : null}
            </>
          ) : null}
          <p className="mt-3">
            Pago:{' '}
            {order.paymentMethod === 'CASH'
              ? 'Efectivo'
              : order.paymentMethod === 'MOBILE'
                ? 'Pago móvil'
                : order.paymentMethod === 'OTHER'
                  ? 'Otro pago'
                  : order.paymentMethod}
          </p>
          {order.paymentNote ? <p className="mt-1">Detalle: {order.paymentNote}</p> : null}
          {order.notes ? <p className="mt-2">Notas: {order.notes}</p> : null}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <h2 className="font-semibold">Totales</h2>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatMoney(order.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Envío</dt>
              <dd>{formatMoney(order.shippingCents)}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>{formatMoney(order.totalCents)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Artículos</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="rounded-lg bg-slate-50 p-3">
              <p className="font-medium">{item.productName}</p>
              <p className="text-slate-600">
                {[item.colorName, item.sizeName, item.sku].filter(Boolean).join(' · ')}
              </p>
              <p>
                {item.quantity} × {formatMoney(item.unitPriceCents)} ={' '}
                {formatMoney(item.lineTotalCents)}
              </p>
              {item.notes ? <p>Nota: {item.notes}</p> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

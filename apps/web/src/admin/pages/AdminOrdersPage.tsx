import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordersApi } from '../../lib/api'
import { ORDER_STATUS_LABELS } from '../../lib/labels'
import { formatMoney } from '../../lib/money'
import type { ApiOrder, OrderStatus } from '../../types'

const statuses: Array<OrderStatus | ''> = [
  '',
  'NEW',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    ordersApi
      .listAdmin(status || undefined)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [status])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Pedidos</h1>
          <p className="text-sm text-slate-600">Listado y seguimiento de órdenes.</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
        >
          {statuses.map((item) => (
            <option key={item || 'all'} value={item}>
              {item ? ORDER_STATUS_LABELS[item] : 'Todos'}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-4 text-sm text-slate-600">Cargando…</p>
        ) : orders.length === 0 ? (
          <p className="p-4 text-sm text-slate-600">Sin pedidos.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Folio</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{order.folio}</td>
                  <td className="px-4 py-3">{order.customer.fullName}</td>
                  <td className="px-4 py-3">{ORDER_STATUS_LABELS[order.status] ?? order.status}</td>
                  <td className="px-4 py-3">{formatMoney(order.totalCents)}</td>
                  <td className="px-4 py-3">
                    {new Date(order.createdAt).toLocaleString('es-VE')}
                  </td>
                  <td className="px-4 py-3">
                    <Link className="underline" to={`/admin/orders/${order.id}`}>
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

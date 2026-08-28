import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../lib/api'
import { formatMoney } from '../../lib/money'
import type { DashboardData } from '../../types'

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setData)
      .catch(() => setError('No se pudo cargar el resumen'))
  }, [])

  if (error) return <p className="text-red-600">{error}</p>
  if (!data) return <p className="text-sm text-slate-600">Cargando…</p>

  const cards = [
    { label: 'Publicados', value: String(data.publishedProducts) },
    { label: 'Agotados', value: String(data.soldOutProducts) },
    { label: 'Pedidos nuevos', value: String(data.newOrders) },
    { label: 'Pedidos hoy', value: String(data.ordersToday) },
    { label: 'Ventas hoy', value: formatMoney(data.salesTodayCents) },
    { label: 'Ventas totales', value: formatMoney(data.totalSalesCents) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Resumen</h1>
          <p className="text-sm text-atelier-gray">Pedidos y ventas de la tienda.</p>
        </div>
        <Link
          to="/admin/orders"
          className="inline-flex min-h-11 items-center rounded-full bg-atelier-dark px-5 text-sm font-semibold text-white"
        >
          Ver pedidos
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-atelier-blush bg-atelier-white p-4">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {card.label}
            </p>
            <p className="mt-2 text-xl font-semibold break-all tabular-nums sm:text-2xl">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Pocas piezas</h2>
        {data.lowStockVariants.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Sin alertas de existencias.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Producto</th>
                  <th className="py-2 pr-4">Código</th>
                  <th className="py-2 pr-4">Piezas</th>
                  <th className="py-2">Aviso</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockVariants.map((variant) => (
                  <tr key={variant.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{variant.product?.name ?? '—'}</td>
                    <td className="py-2 pr-4">{variant.sku}</td>
                    <td className="py-2 pr-4">{variant.stock}</td>
                    <td className="py-2">{variant.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Top productos</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {data.topProducts.map((item) => (
            <li key={item.productName} className="flex justify-between gap-3">
              <span>{item.productName}</span>
              <span className="text-slate-600">
                {item._sum.quantity ?? 0} uds · {formatMoney(item._sum.lineTotalCents ?? 0)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

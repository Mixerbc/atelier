import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, ApiError } from '../../lib/api'
import { formatMoney } from '../../lib/money'
import { PRODUCT_STATUS_LABELS } from '../../lib/labels'
import { primaryImageUrl } from '../../lib/product'
import { toast } from '../../store/toastStore'
import type { Product } from '../../types'

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      setProducts(await adminApi.getProducts())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await adminApi.deleteProduct(id)
      toast('success', 'Producto eliminado')
      await load()
    } catch (error) {
      toast('error', error instanceof ApiError ? error.message : 'No se pudo eliminar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Productos</h1>
          <p className="text-sm text-atelier-gray">Catálogo, fotos, variantes y stock.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex min-h-11 items-center rounded-full bg-atelier-dark px-5 text-sm font-semibold text-white"
        >
          Nuevo producto
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-atelier-gray">Cargando…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-2xl border border-atelier-blush bg-atelier-white"
            >
              <div className="aspect-[4/3] bg-atelier-soft-pink">
                <img
                  src={primaryImageUrl(product)}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-[10px] font-semibold tracking-wide text-atelier-gold uppercase">
                  {PRODUCT_STATUS_LABELS[product.status] ?? product.status}
                </p>
                <h2 className="mt-1 font-display text-2xl leading-tight">{product.name}</h2>
                <p className="mt-1 text-sm font-semibold">{formatMoney(product.basePriceCents)}</p>
                <p className="mt-1 text-xs text-atelier-gray">
                  {product.variants?.length ?? 0} variantes
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    className="text-sm font-semibold text-atelier-dark underline-offset-4 hover:underline"
                    to={`/admin/products/${product.id}/edit`}
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="text-sm font-semibold text-atelier-danger"
                    onClick={() => void remove(product.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

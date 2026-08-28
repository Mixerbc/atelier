import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageCircle, Sparkles, Truck } from 'lucide-react'
import { FloralFlourish, RoseMark } from '../components/brand/FloralFlourish'
import { CatalogToolbar } from '../components/catalog/CatalogToolbar'
import { ProductCard } from '../components/catalog/ProductCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ProductCardSkeleton } from '../components/ui/Skeleton'
import { useCategories, useProducts } from '../hooks/useCatalog'
import { filterProducts } from '../services/catalog'
import type { AvailabilityFilter } from '../types'

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const [searchOpen, setSearchOpen] = useState(false)
  const { products, loading, error } = useProducts()
  const { categories } = useCategories()

  const query = params.get('q') ?? ''
  const categoryId = params.get('categoria') ?? ''
  const availability = (params.get('disponibilidad') as AvailabilityFilter) || 'all'

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const visible = useMemo(
    () => filterProducts(products, { query, categoryId, availability }),
    [availability, categoryId, products, query],
  )
  const boutique = !loading && products.length <= 3 && !query && !categoryId

  return (
    <div className="pb-28 sm:pb-16">
      <section className="catalog-banner">
        <div className="banner-bloom banner-bloom-left" />
        <div className="banner-bloom banner-bloom-right" />
        <div className="catalog-banner-inner">
          <RoseMark className="rose-spin mx-auto h-12 w-12 sm:h-14 sm:w-14" />
          <p className="catalog-banner-kicker">Colección lista para pedir</p>
          <h1>Enamórate y cómpralo hoy</h1>
          <FloralFlourish className="mx-auto mt-3 h-7 w-44" />
          <p className="catalog-banner-copy">
            Tres piezas de temporada. Elige la tuya y confírmala por WhatsApp.
          </p>
        </div>
      </section>

      <div className="trust-row">
        <span>
          <Sparkles className="h-3.5 w-3.5" /> Ofertas activas
        </span>
        <span>
          <MessageCircle className="h-3.5 w-3.5" /> Pedido por WhatsApp
        </span>
        <span>
          <Truck className="h-3.5 w-3.5" /> Envío a tu zona
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-3 pt-4 sm:px-4 sm:pt-8">
        {boutique ? (
          <p className="collection-label">Piezas de la semana</p>
        ) : (
          <CatalogToolbar
            open={searchOpen}
            onToggle={() => setSearchOpen((value) => !value)}
            query={query}
            categoryId={categoryId}
            availability={availability}
            categories={categories}
            onQueryChange={(value) => updateParam('q', value)}
            onCategoryChange={(value) => updateParam('categoria', value)}
            onAvailabilityChange={(value) =>
              updateParam('disponibilidad', value === 'all' ? '' : value)
            }
          />
        )}

        {error ? <p className="mt-6 text-atelier-danger">{error}</p> : null}

        {loading ? (
          <div className="mt-5 grid grid-cols-1 gap-8 sm:mt-8 sm:grid-cols-3 sm:gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Sin resultados"
              description="Prueba otra categoría o limpia la búsqueda."
            />
          </div>
        ) : (
          <div
            className={
              boutique
                ? 'mt-5 grid grid-cols-1 gap-8 sm:mt-8 sm:grid-cols-3 sm:gap-7'
                : 'mt-5 grid grid-cols-2 gap-x-3 gap-y-7 sm:mt-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3'
            }
          >
            {visible.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

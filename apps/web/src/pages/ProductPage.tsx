import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProductImage } from '../components/catalog/ProductImage'
import { ProductCard } from '../components/catalog/ProductCard'
import { ProductConfigurator } from '../components/product/ProductConfigurator'
import { ProductBadges } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { FloralFlourish } from '../components/brand/FloralFlourish'
import { useProduct, useProducts } from '../hooks/useCatalog'
import { mediaUrl } from '../lib/api'
import { formatMoney } from '../lib/money'
import {
  displayPriceCents,
  galleryImageUrls,
  isOnSale,
  isProductAvailable,
  productTags,
  remainingStock,
  salePercent,
} from '../lib/product'

export function ProductPage() {
  const { slug } = useParams()
  const { product, loading } = useProduct(slug)
  const { products } = useProducts()
  const [activeUrl, setActiveUrl] = useState<string | null>(null)

  const related = useMemo(
    () =>
      products
        .filter((item) => item.id !== product?.id && item.categoryId === product?.categoryId)
        .slice(0, 3),
    [product?.categoryId, product?.id, products],
  )

  if (loading) {
    return (
      <div className="product-stage">
        <Skeleton className="h-64 rounded-[1.4rem]" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="font-display text-4xl">Producto no encontrado</h1>
        <Link to="/" className="mt-4 inline-block font-semibold text-brand">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  const available = isProductAvailable(product)
  const onSale = isOnSale(product)
  const discount = salePercent(product)
  const stock = remainingStock(product)
  const gallery = galleryImageUrls(product)
  const src = activeUrl || gallery[0] || ''
  const showing = mediaUrl(src)
  const price = displayPriceCents(product)

  return (
    <div className="product-page">
      <div className="product-stage">
        <div className="product-gallery fade-up">
          <div className="product-photo">
            <ProductImage src={src} alt={product.name} className="h-full w-full object-cover" />
            {discount ? <span className="pill-sale absolute top-3 left-3">-{discount}%</span> : null}
          </div>
          {gallery.length > 1 ? (
            <div className="product-thumbs no-scrollbar">
              {gallery.map((url) => (
                <button
                  key={url}
                  type="button"
                  className={`product-thumb ${showing === mediaUrl(url) ? 'is-active' : ''}`}
                  onClick={() => setActiveUrl(url)}
                  aria-label="Ver foto"
                >
                  <ProductImage src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="product-info fade-up glass-panel" style={{ animationDelay: '80ms' }}>
          <div className="product-info-head">
            <ProductBadges tags={productTags(product)} available={available} onSale={onSale} />
            <h1>{product.name}</h1>
            <FloralFlourish className="h-4 w-28" />
            <p className="product-info-copy">
              {product.shortDescription || product.description}
            </p>
            <div className="product-price-row">
              {onSale ? (
                <>
                  <span className="product-price-old">{formatMoney(product.basePriceCents)}</span>
                  <span className="product-price-now">{formatMoney(price)}</span>
                </>
              ) : (
                <span className="product-price-now text-atelier-dark">{formatMoney(price)}</span>
              )}
              <span className="product-stock">
                {available
                  ? stock <= 6
                    ? `Quedan ${stock}`
                    : 'Disponible'
                  : 'Agotado'}
              </span>
            </div>
          </div>

          <ProductConfigurator product={product} onImageChange={setActiveUrl} />
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mx-auto max-w-6xl px-3 pb-8 sm:px-4">
          <h2 className="font-display text-2xl text-atelier-dark sm:text-3xl">También te puede gustar</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {related.map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

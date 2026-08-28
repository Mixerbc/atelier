import { useEffect, useState } from 'react'
import {
  getCategories,
  getFeaturedProducts,
  getProductBySlug,
  getProducts,
} from '../services/catalog'
import type { Category, Product } from '../types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    getProducts()
      .then((items) => {
        if (active) {
          setProducts(items)
          setError(null)
        }
      })
      .catch(() => {
        if (active) setError('No pudimos cargar el catálogo. Intenta de nuevo.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { products, loading, error }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getCategories()
      .then((items) => {
        if (active) setCategories(items)
      })
      .catch(() => {
        if (active) setCategories([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { categories, loading }
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getFeaturedProducts()
      .then((items) => {
        if (active) setProducts(items)
      })
      .catch(() => {
        if (active) setProducts([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { products, loading }
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setProduct(null)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    getProductBySlug(slug)
      .then((item) => {
        if (active) setProduct(item)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug])

  return { product, loading }
}

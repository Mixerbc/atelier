import type {
  ApiOrder,
  Attribute,
  AttributeValue,
  BusinessSettings,
  Category,
  CreateOrderPayload,
  DashboardData,
  Product,
  AdminUser,
} from '../types'

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  auth?: boolean
}

function needsCredentials(path: string, auth: boolean): boolean {
  return (
    auth ||
    path.startsWith('/api/admin') ||
    path.startsWith('/api/auth') ||
    path.startsWith('/api/orders/admin')
  )
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, headers, ...rest } = options
  const init: RequestInit = {
    ...rest,
    credentials: needsCredentials(path, auth) ? 'include' : (rest.credentials ?? 'same-origin'),
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  }

  if (body !== undefined) {
    init.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE}${path}`, init)
  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'error' in data
        ? String((data as { error: unknown }).error)
        : `Error ${response.status}`
    throw new ApiError(response.status, message, data)
  }

  return data as T
}

function authRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(path, { ...options, auth: true, credentials: 'include' })
}

// ——— Public store ———

export const storeApi = {
  getSettings: () => request<BusinessSettings>('/api/store/settings'),
  getCategories: () => request<Category[]>('/api/store/categories'),
  getProducts: (params?: { q?: string; category?: string; featured?: boolean }) => {
    const search = new URLSearchParams()
    if (params?.q) search.set('q', params.q)
    if (params?.category) search.set('category', params.category)
    if (params?.featured) search.set('featured', 'true')
    const qs = search.toString()
    return request<Product[]>(`/api/store/products${qs ? `?${qs}` : ''}`)
  },
  getProductBySlug: (slug: string) => request<Product>(`/api/store/products/${encodeURIComponent(slug)}`),
}

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    request<ApiOrder>('/api/orders', { method: 'POST', body: payload }),
  listAdmin: (status?: string) =>
    authRequest<ApiOrder[]>(`/api/orders/admin${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  getAdmin: (id: string) => authRequest<ApiOrder>(`/api/orders/admin/${id}`),
  updateStatus: (id: string, status: string) =>
    authRequest<ApiOrder>(`/api/orders/admin/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),
}

export const authApi = {
  login: (email: string, password: string) =>
    authRequest<AdminUser>('/api/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => authRequest<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  me: () => authRequest<AdminUser>('/api/auth/me'),
}

export const adminApi = {
  dashboard: () => authRequest<DashboardData>('/api/admin/dashboard'),

  getCategories: () => authRequest<Category[]>('/api/admin/categories'),
  createCategory: (data: Partial<Category> & { name: string }) =>
    authRequest<Category>('/api/admin/categories', { method: 'POST', body: data }),
  updateCategory: (id: string, data: Partial<Category> & { name: string }) =>
    authRequest<Category>(`/api/admin/categories/${id}`, { method: 'PUT', body: data }),
  deleteCategory: (id: string) =>
    authRequest<{ ok: boolean }>(`/api/admin/categories/${id}`, { method: 'DELETE' }),

  getAttributes: () => authRequest<Attribute[]>('/api/admin/attributes'),
  createAttribute: (data: { name: string; slug?: string; sortOrder?: number; isActive?: boolean }) =>
    authRequest<Attribute>('/api/admin/attributes', { method: 'POST', body: data }),
  updateAttribute: (
    id: string,
    data: { name: string; slug?: string; sortOrder?: number; isActive?: boolean },
  ) => authRequest<Attribute>(`/api/admin/attributes/${id}`, { method: 'PUT', body: data }),
  createAttributeValue: (
    attributeId: string,
    data: {
      name: string
      slug?: string
      abbreviation?: string | null
      hexCode?: string | null
      sortOrder?: number
      isActive?: boolean
    },
  ) =>
    authRequest<AttributeValue>(`/api/admin/attributes/${attributeId}/values`, {
      method: 'POST',
      body: data,
    }),
  ensurePaletteColors: (
    attributeId: string,
    colors: Array<{ name: string; hexCode: string }>,
  ) =>
    authRequest<AttributeValue[]>(`/api/admin/attributes/${attributeId}/values/ensure`, {
      method: 'POST',
      body: { colors },
    }),
  updateAttributeValue: (
    id: string,
    data: {
      name: string
      slug?: string
      abbreviation?: string | null
      hexCode?: string | null
      sortOrder?: number
      isActive?: boolean
    },
  ) =>
    authRequest<AttributeValue>(`/api/admin/attribute-values/${id}`, {
      method: 'PUT',
      body: data,
    }),

  getProducts: () => authRequest<Product[]>('/api/admin/products'),
  getProduct: (id: string) => authRequest<Product>(`/api/admin/products/${id}`),
  createProduct: (data: unknown) =>
    authRequest<Product>('/api/admin/products', { method: 'POST', body: data }),
  updateProduct: (id: string, data: unknown) =>
    authRequest<Product>(`/api/admin/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id: string) =>
    authRequest<{ ok: boolean }>(`/api/admin/products/${id}`, { method: 'DELETE' }),
  generateVariants: (
    productId: string,
    data: { attributeValueGroups: string[][]; skuPrefix: string; defaultStock?: number },
  ) =>
    authRequest<Product['variants']>(`/api/admin/products/${productId}/generate-variants`, {
      method: 'POST',
      body: data,
    }),
  updateVariantStock: (variantId: string, stock: number, note?: string) =>
    authRequest(`/api/admin/variants/${variantId}/stock`, {
      method: 'PATCH',
      body: { stock, note: note ?? '' },
    }),

  getSettings: () => authRequest<BusinessSettings>('/api/admin/settings'),
  updateSettings: (data: Partial<BusinessSettings> & { storeName: string; whatsappNumber: string }) =>
    authRequest<BusinessSettings>('/api/admin/settings', { method: 'PUT', body: data }),

  upload: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const response = await fetch(`${API_BASE}/api/admin/uploads`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new ApiError(
        response.status,
        typeof data?.error === 'string' ? data.error : 'Error al subir archivo',
        data,
      )
    }
    return data as { url: string; filename?: string }
  },
}

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return '/logo.png'
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  if (path.startsWith('/uploads')) return `${API_BASE}${path}`
  if (path.startsWith('/')) return path
  return `${API_BASE}/${path}`
}

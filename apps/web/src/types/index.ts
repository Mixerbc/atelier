export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'SOLD_OUT' | 'DISABLED'

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export interface AttributeValue {
  id: string
  name: string
  slug: string
  hexCode?: string | null
  abbreviation?: string | null
  imageUrl?: string | null
  sortOrder?: number
  isActive?: boolean
  attributeId?: string
}

export interface Attribute {
  id: string
  name: string
  slug: string
  sortOrder?: number
  isActive?: boolean
  values: AttributeValue[]
}

export interface ProductImage {
  id?: string
  url: string
  alt?: string
  isPrimary?: boolean
  sortOrder?: number
}

export interface ProductExtra {
  id: string
  name: string
  priceCents: number
  isActive?: boolean
}

export interface VariantAttributeRow {
  attributeValue: AttributeValue & {
    attribute: { id?: string; slug: string; name: string }
  }
}

export interface ProductVariant {
  id: string
  sku: string
  priceCents?: number | null
  priceDeltaCents?: number
  stock: number
  minStock: number
  imageUrl?: string | null
  isActive?: boolean
  attributes: VariantAttributeRow[]
}

export interface ProductAttributeLink {
  attribute: Attribute
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  imageUrl?: string | null
  sortOrder?: number
  isActive?: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  categoryId: string
  category?: Category
  basePriceCents: number
  salePriceCents?: number | null
  displayPriceCents?: number
  status: ProductStatus
  isFeatured: boolean
  isNew: boolean
  hasVariants: boolean
  trackInventory: boolean
  stock: number
  minStock: number
  sku?: string | null
  brand?: string | null
  sortOrder?: number
  images: ProductImage[]
  extras: ProductExtra[]
  attributes: ProductAttributeLink[]
  variants: ProductVariant[]
}

export interface CartItemExtra {
  id: string
  name: string
  priceCents: number
}

export interface CartItem {
  id: string
  lineKey: string
  productId: string
  variantId: string | null
  name: string
  image: string
  colorName: string | null
  sizeName: string | null
  sku: string | null
  unitPriceCents: number
  quantity: number
  notes: string
  extras: CartItemExtra[]
}

export type DeliveryType = 'delivery' | 'pickup'
export type PaymentMethod = 'cash' | 'mobile' | 'other'

export interface Customer {
  fullName: string
  phone: string
  deliveryType: DeliveryType | ''
  address: string
  zone: string
  references: string
  mapsUrl: string
  paymentMethod: PaymentMethod | ''
  cashAmountCents: number | null
  paymentNote: string
  notes: string
}

export interface OrderItem {
  name: string
  quantity: number
  unitPriceCents: number
  extras: CartItemExtra[]
  notes: string
  amountCents: number
  colorName?: string | null
  sizeName?: string | null
  sku?: string | null
  variantLabel?: string | null
}

export interface Order {
  id?: string
  folio: string
  createdAt: string
  customer: Customer
  items: OrderItem[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
  changeCents: number | null
  status?: OrderStatus
}

export interface ApiOrderItem {
  id: string
  productName: string
  variantLabel: string
  sku: string | null
  colorName: string | null
  sizeName: string | null
  imageUrl: string | null
  unitPriceCents: number
  quantity: number
  lineTotalCents: number
  notes: string
  extrasJson: CartItemExtra[] | unknown
}

export interface ApiOrder {
  id: string
  folio: string
  createdAt: string
  status: OrderStatus
  deliveryType: 'DELIVERY' | 'PICKUP'
  address: string | null
  zone: string | null
  references: string | null
  mapsUrl?: string | null
  paymentMethod: 'CASH' | 'MOBILE' | 'OTHER'
  cashAmountCents: number | null
  paymentNote?: string | null
  changeCents: number | null
  subtotalCents: number
  shippingCents: number
  totalCents: number
  notes: string
  customer: {
    id: string
    fullName: string
    phone: string
  }
  items: ApiOrderItem[]
}

export interface SocialLink {
  name: string
  url: string
}

export interface BusinessHours {
  days: string
  hours: string
}

export interface BusinessSettings {
  id?: string
  storeName: string
  tagline: string
  logoUrl: string | null
  whatsappNumber: string
  address: string
  phone: string
  email: string
  currency: string
  deliveryFeeCents: number
  minimumOrderCents: number
  hoursJson: BusinessHours[]
  deliveryZonesJson: string[]
  paymentMethodsJson: string[]
  socialJson: SocialLink[]
  ticketFooter: string
  cardPaymentAvailable: boolean
}

/** @deprecated Prefer BusinessSettings from API */
export interface BusinessConfig {
  name: string
  tagline: string
  logo: string
  whatsappNumber: string
  currency: string
  deliveryFee: number
  minimumOrder: number
  deliveryZones: string[]
  address: string
  phone: string
  email: string
  hours: BusinessHours[]
  social: SocialLink[]
  cardPaymentAvailable: boolean
}

export type AvailabilityFilter = 'all' | 'available' | 'soldout'

export interface CatalogFilters {
  query: string
  categoryId: string
  availability: AvailabilityFilter
}

export interface AdminUser {
  id: string
  email: string
  name: string
}

export interface DashboardData {
  publishedProducts: number
  soldOutProducts: number
  lowStockVariants: Array<
    ProductVariant & {
      product: Pick<Product, 'id' | 'name' | 'slug'>
    }
  >
  newOrders: number
  ordersToday: number
  salesTodayCents: number
  totalSalesCents: number
  topProducts: Array<{
    productName: string
    _sum: { quantity: number | null; lineTotalCents: number | null }
  }>
}

export interface CreateOrderPayload {
  customer: { fullName: string; phone: string }
  deliveryType: 'DELIVERY' | 'PICKUP'
  address?: string
  zone?: string
  references?: string
  mapsUrl?: string
  paymentMethod: 'CASH' | 'MOBILE' | 'OTHER'
  cashAmountCents?: number | null
  paymentNote?: string
  notes?: string
  items: Array<{
    productId: string
    variantId?: string | null
    quantity: number
    notes?: string
    extraIds?: string[]
  }>
}

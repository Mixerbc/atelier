import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().optional().default(''),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
})

export const attributeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
})

export const attributeValueSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  abbreviation: z.string().nullable().optional(),
  hexCode: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/)
    .nullable()
    .optional(),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
})

export const ensurePaletteSchema = z.object({
  colors: z
    .array(
      z.object({
        name: z.string().min(1),
        hexCode: z.string().regex(/^#([0-9A-Fa-f]{6})$/),
      }),
    )
    .min(1),
})

export const productExtraSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  isActive: z.boolean().optional().default(true),
})

export const variantInputSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1),
  priceCents: z.number().int().nonnegative().nullable().optional(),
  priceDeltaCents: z.number().int().optional().default(0),
  stock: z.number().int().nonnegative().default(0),
  minStock: z.number().int().nonnegative().default(0),
  weightGrams: z.number().int().nonnegative().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
  attributeValueIds: z.array(z.string()).min(1),
})

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  shortDescription: z.string().optional().default(''),
  description: z.string().optional().default(''),
  categoryId: z.string().min(1),
  basePriceCents: z.number().int().positive(),
  salePriceCents: z.number().int().positive().nullable().optional(),
  costCents: z.number().int().nonnegative().nullable().optional(),
  sku: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'DISABLED']).default('DRAFT'),
  isFeatured: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(false),
  hasVariants: z.boolean().optional().default(false),
  trackInventory: z.boolean().optional().default(true),
  stock: z.number().int().nonnegative().optional().default(0),
  minStock: z.number().int().nonnegative().optional().default(0),
  sortOrder: z.number().int().optional().default(0),
  attributeIds: z.array(z.string()).optional().default([]),
  extras: z.array(productExtraSchema).optional().default([]),
  variants: z.array(variantInputSchema).optional().default([]),
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.string().min(1),
        alt: z.string().optional().default(''),
        isPrimary: z.boolean().optional().default(false),
        sortOrder: z.number().int().optional().default(0),
      }),
    )
    .optional()
    .default([]),
})

export const generateVariantsSchema = z.object({
  attributeValueGroups: z.array(z.array(z.string()).min(1)).min(1),
  skuPrefix: z.string().min(1),
  defaultStock: z.number().int().nonnegative().optional().default(0),
})

export const stockAdjustSchema = z.object({
  stock: z.number().int().nonnegative(),
  note: z.string().optional().default(''),
})

export const createOrderSchema = z.object({
  customer: z.object({
    fullName: z.string().min(3),
    phone: z.string().min(10),
  }),
  deliveryType: z.enum(['DELIVERY', 'PICKUP']),
  address: z.string().optional().default(''),
  zone: z.string().optional().default(''),
  references: z.string().optional().default(''),
  mapsUrl: z.string().optional().default(''),
  paymentMethod: z.enum(['CASH', 'MOBILE', 'OTHER']),
  cashAmountCents: z.number().int().positive().nullable().optional(),
  paymentNote: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().nullable().optional(),
        quantity: z.number().int().positive(),
        notes: z.string().optional().default(''),
        extraIds: z.array(z.string()).optional().default([]),
      }),
    )
    .min(1),
})

export const orderStatusSchema = z.object({
  status: z.enum(['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})

export const settingsSchema = z.object({
  storeName: z.string().min(2),
  tagline: z.string().optional().default(''),
  logoUrl: z.string().nullable().optional(),
  whatsappNumber: z.string().min(10),
  address: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().optional().default(''),
  currency: z.string().default('Bs'),
  deliveryFeeCents: z.number().int().nonnegative(),
  minimumOrderCents: z.number().int().nonnegative(),
  hoursJson: z.any().optional(),
  deliveryZonesJson: z.any().optional(),
  paymentMethodsJson: z.any().optional(),
  socialJson: z.any().optional(),
  ticketFooter: z.string().optional().default(''),
  cardPaymentAvailable: z.boolean().optional().default(true),
})

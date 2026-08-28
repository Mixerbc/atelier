import 'dotenv/config'
import { PrismaClient, type ProductStatus } from '@prisma/client'
import { hashPassword } from '../src/lib/auth.js'
import { DEFAULT_COLOR_PALETTE } from '../src/lib/colorPalette.js'
import { toSlug } from '../src/lib/helpers.js'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@atelier.mx'
  const password = process.env.ADMIN_PASSWORD ?? 'AtelierAdmin123!'

  await prisma.adminUser.upsert({
    where: { email },
    update: { isActive: true, name: 'Administrador' },
    create: {
      email,
      name: 'Administrador',
      passwordHash: await hashPassword(password),
    },
  })

  await prisma.businessSettings.upsert({
    where: { id: 'default' },
    update: {
      storeName: 'Atelier',
      tagline: 'Ropa y estilo contemporáneo',
      currency: 'Bs',
    },
    create: {
      id: 'default',
      storeName: 'Atelier',
      tagline: 'Ropa y estilo contemporáneo',
      whatsappNumber: process.env.WHATSAPP_NUMBER ?? '5214421234567',
      address: 'Av. Antea 1088, Juriquilla, Querétaro',
      phone: '4421234567',
      email: 'hola@atelier.mx',
      currency: 'Bs',
      deliveryFeeCents: 8000,
      minimumOrderCents: 35000,
      hoursJson: [
        { days: 'Lunes a viernes', hours: '11:00 – 20:00' },
        { days: 'Sábado', hours: '11:00 – 18:00' },
        { days: 'Domingo', hours: 'Cerrado' },
      ],
      deliveryZonesJson: ['Zakia', 'Zibatá', 'Juriquilla', 'El Refugio', 'Centro Sur'],
      paymentMethodsJson: ['Efectivo', 'Pago móvil', 'Otro pago'],
      socialJson: [
        { name: 'Instagram', url: 'https://instagram.com' },
        { name: 'Facebook', url: 'https://facebook.com' },
      ],
      ticketFooter: 'Gracias por tu compra. Este mensaje confirma el pedido; no es necesario que el cliente responda.',
      cardPaymentAvailable: true,
    },
  })

  // Solo 3 productos de prueba: desactivar el resto
  const keepSlugs = ['playera-clasica', 'jean-tapered', 'vestido-midi']
  await prisma.product.updateMany({
    where: { slug: { notIn: keepSlugs } },
    data: { deletedAt: new Date(), status: 'DISABLED' },
  })
  await prisma.category.updateMany({
    where: {
      slug: { in: ['arroces', 'entradas', 'especialidades', 'bebidas', 'accesorios', 'abrigos'] },
    },
    data: { deletedAt: new Date(), isActive: false },
  })

  const colorAttr = await prisma.attribute.upsert({
    where: { slug: 'color' },
    update: { name: 'Color', isActive: true },
    create: { name: 'Color', slug: 'color', sortOrder: 1 },
  })
  const sizeAttr = await prisma.attribute.upsert({
    where: { slug: 'talla' },
    update: { name: 'Talla', isActive: true },
    create: { name: 'Talla', slug: 'talla', sortOrder: 2 },
  })

  const colors = DEFAULT_COLOR_PALETTE.map((color, index) => ({
    name: color.name,
    slug: toSlug(color.name),
    hexCode: color.hexCode,
    sortOrder: index + 1,
  }))
  const sizes = [
    { name: 'Extra chica', slug: 'xs', abbreviation: 'XS', sortOrder: 1 },
    { name: 'Chica', slug: 's', abbreviation: 'S', sortOrder: 2 },
    { name: 'Mediana', slug: 'm', abbreviation: 'M', sortOrder: 3 },
    { name: 'Grande', slug: 'l', abbreviation: 'L', sortOrder: 4 },
    { name: 'Extra grande', slug: 'xl', abbreviation: 'XL', sortOrder: 5 },
    { name: '2XL', slug: 'xxl', abbreviation: 'XXL', sortOrder: 6 },
    { name: '3XL', slug: '3xl', abbreviation: '3XL', sortOrder: 7 },
    { name: '28', slug: '28', abbreviation: '28', sortOrder: 20 },
    { name: '30', slug: '30', abbreviation: '30', sortOrder: 21 },
    { name: '32', slug: '32', abbreviation: '32', sortOrder: 22 },
    { name: '34', slug: '34', abbreviation: '34', sortOrder: 23 },
    { name: '36', slug: '36', abbreviation: '36', sortOrder: 24 },
    { name: '38', slug: '38', abbreviation: '38', sortOrder: 25 },
    { name: '4', slug: '4', abbreviation: '4', sortOrder: 30 },
    { name: '6', slug: '6', abbreviation: '6', sortOrder: 31 },
    { name: '8', slug: '8', abbreviation: '8', sortOrder: 32 },
    { name: '10', slug: '10', abbreviation: '10', sortOrder: 33 },
    { name: '12', slug: '12', abbreviation: '12', sortOrder: 34 },
    { name: '14', slug: '14', abbreviation: '14', sortOrder: 35 },
    { name: 'Talla única', slug: 'unica', abbreviation: 'U', sortOrder: 40 },
  ]

  const colorValues = []
  for (const color of colors) {
    colorValues.push(
      await prisma.attributeValue.upsert({
        where: { attributeId_slug: { attributeId: colorAttr.id, slug: color.slug } },
        update: { ...color, isActive: true },
        create: { ...color, attributeId: colorAttr.id },
      }),
    )
  }
  await prisma.attributeValue.updateMany({
    where: {
      attributeId: colorAttr.id,
      slug: { notIn: colors.map((color) => color.slug) },
    },
    data: { isActive: false },
  })
  const sizeValues = []
  for (const size of sizes) {
    sizeValues.push(
      await prisma.attributeValue.upsert({
        where: { attributeId_slug: { attributeId: sizeAttr.id, slug: size.slug } },
        update: { ...size, isActive: true },
        create: { ...size, attributeId: sizeAttr.id },
      }),
    )
  }

  const categories = [
    {
      name: 'Playeras',
      slug: 'playeras',
      description: 'Básicos',
      imageUrl: '/images/categories/playeras.svg',
    },
    {
      name: 'Pantalones',
      slug: 'pantalones',
      description: 'Denim',
      imageUrl: '/images/categories/pantalones.svg',
    },
    {
      name: 'Vestidos',
      slug: 'vestidos',
      description: 'Prendas de vestir',
      imageUrl: '/images/categories/playeras.svg',
    },
  ]
  const categoryMap: Record<string, string> = {}
  for (const [index, category] of categories.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { ...category, sortOrder: index + 1, isActive: true, deletedAt: null },
      create: { ...category, sortOrder: index + 1 },
    })
    categoryMap[category.slug] = row.id
  }

  async function upsertSimpleProduct(input: {
    name: string
    categorySlug: string
    price: number
    salePrice?: number
    shortDescription?: string
    status?: ProductStatus
    featured?: boolean
    isNew?: boolean
    stock?: number
    image: string
    sortOrder?: number
  }) {
    const slug = toSlug(input.name)
    const existing = await prisma.product.findUnique({ where: { slug }, include: { images: true } })
    const shortDescription =
      input.shortDescription ?? `${input.name} de la colección Atelier.`
    if (existing) {
      await prisma.productImage.deleteMany({ where: { productId: existing.id } })
      return prisma.product.update({
        where: { id: existing.id },
        data: {
          name: input.name,
          shortDescription,
          description: `${input.name}. Confección cuidadosa y materiales seleccionados para uso diario.`,
          categoryId: categoryMap[input.categorySlug],
          basePriceCents: input.price,
          salePriceCents: input.salePrice ?? null,
          status: input.status ?? 'PUBLISHED',
          isFeatured: input.featured ?? false,
          isNew: input.isNew ?? false,
          hasVariants: false,
          trackInventory: true,
          stock: input.stock ?? 12,
          minStock: 2,
          deletedAt: null,
          sortOrder: input.sortOrder ?? 0,
          images: {
            create: [{ url: input.image, alt: input.name, isPrimary: true, sortOrder: 0 }],
          },
        },
      })
    }

    return prisma.product.create({
      data: {
        name: input.name,
        slug,
        shortDescription,
        description: `${input.name}. Confección cuidadosa y materiales seleccionados para uso diario.`,
        categoryId: categoryMap[input.categorySlug],
        basePriceCents: input.price,
        salePriceCents: input.salePrice ?? null,
        status: input.status ?? 'PUBLISHED',
        isFeatured: input.featured ?? false,
        isNew: input.isNew ?? false,
        hasVariants: false,
        trackInventory: true,
        stock: input.stock ?? 12,
        minStock: 2,
        sortOrder: input.sortOrder ?? 0,
        images: {
          create: [{ url: input.image, alt: input.name, isPrimary: true, sortOrder: 0 }],
        },
      },
    })
  }

  await upsertSimpleProduct({
    name: 'Vestido midi',
    categorySlug: 'vestidos',
    price: 98000,
    salePrice: 85000,
    shortDescription: 'Vestido midi elegante en tono rosa con corte fluido.',
    isNew: true,
    featured: true,
    image: '/images/products/vestido.png',
    sortOrder: 1,
  })

  async function upsertApparel(input: {
    name: string
    categorySlug: string
    price: number
    salePrice?: number
    shortDescription?: string
    skuPrefix: string
    colorSlugs: string[]
    sizeSlugs: string[]
    stocks: Record<string, number>
    image: string
    featured?: boolean
    sortOrder?: number
  }) {
    const slug = toSlug(input.name)
    let product = await prisma.product.findUnique({
      where: { slug },
      include: { variants: true, images: true, attributes: true },
    })
    const shortDescription =
      input.shortDescription ?? `${input.name} con color y talla.`

    if (!product) {
      product = await prisma.product.create({
        data: {
          name: input.name,
          slug,
          shortDescription,
          description: `${input.name}. Elige color y talla para ver disponibilidad y precio.`,
          categoryId: categoryMap[input.categorySlug],
          basePriceCents: input.price,
          salePriceCents: input.salePrice ?? null,
          status: 'PUBLISHED',
          isFeatured: input.featured ?? false,
          isNew: true,
          hasVariants: true,
          trackInventory: true,
          stock: 0,
          minStock: 2,
          sortOrder: input.sortOrder ?? 0,
          images: {
            create: [{ url: input.image, alt: input.name, isPrimary: true }],
          },
          attributes: {
            create: [{ attributeId: colorAttr.id }, { attributeId: sizeAttr.id }],
          },
        },
        include: { variants: true, images: true, attributes: true },
      })
    } else {
      await prisma.productImage.deleteMany({ where: { productId: product.id } })
      await prisma.productAttribute.deleteMany({ where: { productId: product.id } })
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          name: input.name,
          shortDescription,
          description: `${input.name}. Elige color y talla para ver disponibilidad y precio.`,
          categoryId: categoryMap[input.categorySlug],
          basePriceCents: input.price,
          salePriceCents: input.salePrice ?? null,
          status: 'PUBLISHED',
          isFeatured: input.featured ?? false,
          isNew: true,
          hasVariants: true,
          trackInventory: true,
          deletedAt: null,
          sortOrder: input.sortOrder ?? 0,
          images: {
            create: [{ url: input.image, alt: input.name, isPrimary: true }],
          },
          attributes: {
            create: [{ attributeId: colorAttr.id }, { attributeId: sizeAttr.id }],
          },
        },
        include: { variants: true, images: true, attributes: true },
      })
    }

    const selectedColors = colorValues.filter((c) => input.colorSlugs.includes(c.slug))
    const selectedSizes = sizeValues.filter((s) => input.sizeSlugs.includes(s.slug))

    for (const color of selectedColors) {
      for (const size of selectedSizes) {
        const key = `${color.slug}-${size.slug}`
        const sku =
          `${input.skuPrefix}-${color.slug.slice(0, 3)}-${size.abbreviation ?? size.slug}`.toUpperCase()
        const stock = input.stocks[key] ?? 5
        const existingVariant = await prisma.productVariant.findUnique({ where: { sku } })
        if (existingVariant) {
          await prisma.productVariant.update({
            where: { sku },
            data: { stock, isActive: true, productId: product.id },
          })
        } else {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              sku,
              stock,
              minStock: 2,
              attributes: {
                create: [{ attributeValueId: color.id }, { attributeValueId: size.id }],
              },
            },
          })
        }
      }
    }
    return product
  }

  await upsertApparel({
    name: 'Playera clásica',
    categorySlug: 'playeras',
    price: 42000,
    salePrice: 35000,
    shortDescription: 'Playera clásica de algodón suave, ideal para el día a día.',
    skuPrefix: 'PLAYERA',
    colorSlugs: ['negro', 'blanco', 'rojo'],
    sizeSlugs: ['s', 'm', 'l'],
    stocks: {
      'negro-s': 5,
      'negro-m': 10,
      'negro-l': 0,
      'blanco-s': 3,
      'blanco-m': 8,
      'blanco-l': 4,
      'rojo-s': 2,
      'rojo-m': 2,
      'rojo-l': 1,
    },
    image: '/images/products/playera-clasica.png',
    featured: true,
    sortOrder: 2,
  })

  await upsertApparel({
    name: 'Jean tapered',
    categorySlug: 'pantalones',
    price: 110000,
    salePrice: 92000,
    shortDescription: 'Jean tapered de tiro medio con lavado contemporáneo.',
    skuPrefix: 'JEAN',
    colorSlugs: ['negro', 'azul'],
    sizeSlugs: ['s', 'm', 'l', 'xl'],
    stocks: {
      'negro-s': 2,
      'negro-m': 4,
      'negro-l': 0,
      'negro-xl': 1,
      'azul-s': 2,
      'azul-m': 5,
      'azul-l': 4,
      'azul-xl': 2,
    },
    image: '/images/products/jean.png',
    featured: true,
    sortOrder: 3,
  })

  const existingOrder = await prisma.order.findUnique({ where: { folio: 'PED-20260823-DEMO' } })
  if (!existingOrder) {
    const customer = await prisma.customer.create({
      data: { fullName: 'Juan Pérez', phone: '4421234567' },
    })
    const playera = await prisma.product.findUnique({
      where: { slug: 'playera-clasica' },
      include: {
        variants: { include: { attributes: { include: { attributeValue: true } } } },
      },
    })
    const variant = playera?.variants.find((v) => v.stock > 0)
    if (playera && variant) {
      await prisma.order.create({
        data: {
          folio: 'PED-20260823-DEMO',
          customerId: customer.id,
          status: 'NEW',
          deliveryType: 'DELIVERY',
          address: 'Calle Ejemplo 123',
          zone: 'Zakia',
          references: 'Portón negro',
          paymentMethod: 'MOBILE',
          paymentNote: 'Pago móvil 0414-1234567',
          subtotalCents: 70000,
          shippingCents: 8000,
          totalCents: 78000,
          notes: 'Pedido de ejemplo',
          items: {
            create: [
              {
                productId: playera.id,
                variantId: variant.id,
                productName: playera.name,
                variantLabel: 'Color: Negro / Talla: M',
                sku: variant.sku,
                colorName: 'Negro',
                sizeName: 'M',
                imageUrl: '/images/products/playera-clasica.png',
                unitPriceCents: 35000,
                quantity: 2,
                lineTotalCents: 70000,
              },
            ],
          },
        },
      })
    }
  }

  console.log('Seed de ropa listo')
  console.log(`Admin: ${email}`)
  console.log(`Password: ${password}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

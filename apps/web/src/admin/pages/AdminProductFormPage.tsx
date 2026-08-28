import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import { adminApi, ApiError, mediaUrl } from '../../lib/api'
import { PRODUCT_STATUS_LABELS } from '../../lib/labels'
import { fromCents, parseMoneyInput } from '../../lib/money'
import { toast } from '../../store/toastStore'
import type { Attribute, Category, Product, ProductStatus } from '../../types'
import { ColorPalettePicker } from '../components/ColorPalettePicker'
import { Field } from '../components/Field'
import { COLOR_PALETTE, matchSizeGroup, SIZE_GROUPS, sizeLabelsForGroup } from '../../lib/catalogOptions'

type VariantDraft = {
  id?: string
  sku: string
  priceCents: string
  priceDeltaCents: string
  stock: string
  minStock: string
  imageUrl: string
  isActive: boolean
  attributeValueIds: string[]
}

type ExtraDraft = { id?: string; name: string; priceCents: string; isActive: boolean }

const statuses: ProductStatus[] = ['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'DISABLED']

function emptyForm() {
  return {
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    basePriceCents: '',
    salePriceCents: '',
    status: 'DRAFT' as ProductStatus,
    isFeatured: false,
    isNew: false,
    hasVariants: true,
    trackInventory: true,
    stock: '0',
    minStock: '0',
    sku: '',
    brand: '',
    sortOrder: '0',
    imageUrl: '',
    extraImages: [] as string[],
    attributeIds: [] as string[],
    extras: [] as ExtraDraft[],
    variants: [] as VariantDraft[],
    selectedColors: [] as string[],
    selectedSizes: [] as string[],
    sizeGroupId: 'ropa',
    skuPrefix: '',
    defaultStock: '5',
  }
}

export function AdminProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState<Category[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [paletteHex, setPaletteHex] = useState('#111111')
  const [colorName, setColorName] = useState('Negro')
  const [customTone, setCustomTone] = useState(false)

  const colorAttr = attributes.find((a) => a.slug === 'color')
  const sizeAttr = attributes.find((a) => a.slug === 'talla')

  useEffect(() => {
    void Promise.all([adminApi.getCategories(), adminApi.getAttributes()]).then(
      ([cats, attrs]) => {
        setCategories(cats)
        setAttributes(attrs)
      },
    )
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    adminApi
      .getProduct(id)
      .then((product) => hydrate(product))
      .catch(() => toast('error', 'No se pudo cargar el producto'))
      .finally(() => setLoading(false))
  }, [id])

  const hydrate = (product: Product) => {
    const colorIds =
      product.variants?.flatMap((v) =>
        v.attributes
          .filter((a) => a.attributeValue.attribute.slug === 'color')
          .map((a) => a.attributeValue.id),
      ) ?? []
    const sizeIds =
      product.variants?.flatMap((v) =>
        v.attributes
          .filter((a) => a.attributeValue.attribute.slug === 'talla')
          .map((a) => a.attributeValue.id),
      ) ?? []
    const sizeSlugs =
      product.variants?.flatMap((v) =>
        v.attributes
          .filter((a) => a.attributeValue.attribute.slug === 'talla')
          .map((a) => a.attributeValue.slug),
      ) ?? []

    setForm({
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription ?? '',
      description: product.description ?? '',
      categoryId: product.categoryId,
      basePriceCents: String(fromCents(product.basePriceCents)),
      salePriceCents: product.salePriceCents != null ? String(fromCents(product.salePriceCents)) : '',
      status: product.status,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      hasVariants: product.hasVariants,
      trackInventory: product.trackInventory,
      stock: String(product.stock),
      minStock: String(product.minStock),
      sku: product.sku ?? '',
      brand: product.brand ?? '',
      sortOrder: String(product.sortOrder ?? 0),
      imageUrl: (product.images?.find((image) => image.isPrimary) ?? product.images?.[0])?.url ?? '',
      extraImages: (() => {
        const primary =
          (product.images?.find((image) => image.isPrimary) ?? product.images?.[0])?.url ?? ''
        return [...new Set((product.images ?? []).map((image) => image.url).filter((url) => url && url !== primary))]
      })(),
      attributeIds: product.attributes?.map((a) => a.attribute.id) ?? [],
      extras: (product.extras ?? []).map((extra) => ({
        id: extra.id,
        name: extra.name,
        priceCents: String(fromCents(extra.priceCents)),
        isActive: extra.isActive ?? true,
      })),
      variants: (product.variants ?? []).map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        priceCents: variant.priceCents != null ? String(fromCents(variant.priceCents)) : '',
        priceDeltaCents: String(fromCents(variant.priceDeltaCents ?? 0)),
        stock: String(variant.stock),
        minStock: String(variant.minStock),
        imageUrl: variant.imageUrl ?? '',
        isActive: variant.isActive ?? true,
        attributeValueIds: variant.attributes.map((a) => a.attributeValue.id),
      })),
      selectedColors: [...new Set(colorIds)],
      selectedSizes: [...new Set(sizeIds)],
      sizeGroupId: matchSizeGroup(sizeSlugs),
      skuPrefix: product.sku || product.slug.toUpperCase().slice(0, 8),
      defaultStock: '5',
    })
  }

  const applySizeGroup = (groupId: string) => {
    const group = SIZE_GROUPS.find((item) => item.id === groupId)
    if (!group) return
    const ids = group.slugs
      .map((slug) => sizeAttr?.values.find((value) => value.slug === slug)?.id)
      .filter((id): id is string => Boolean(id))
    if (ids.length === 0) {
      toast('error', 'Ese grupo de tallas aún no está en el sistema. Reinicia el seed.')
      return
    }
    setForm((prev) => ({
      ...prev,
      sizeGroupId: groupId,
      selectedSizes: ids,
      hasVariants: true,
    }))
  }

  const removeSelectedColor = (valueId: string) => {
    setForm((prev) => ({
      ...prev,
      selectedColors: prev.selectedColors.filter((id) => id !== valueId),
    }))
  }

  const addColorFromPalette = async (picked?: { name: string; hex: string; id?: string }) => {
    if (!colorAttr) {
      toast('error', 'No hay atributo de color')
      return
    }
    const name = (picked?.name ?? colorName).trim()
    if (!name) {
      toast('error', 'Escribe el nombre del color')
      return
    }
    const hex = (picked?.hex ?? paletteHex).toUpperCase()
    const existing =
      (picked?.id ? colorAttr.values.find((value) => value.id === picked.id) : undefined) ??
      colorAttr.values.find((value) => value.name.toLowerCase() === name.toLowerCase()) ??
      colorAttr.values.find((value) => (value.hexCode || '').toUpperCase() === hex)

    if (existing && form.selectedColors.includes(existing.id)) {
      removeSelectedColor(existing.id)
      return
    }

    try {
      let valueId = existing?.id
      if (existing && (existing.hexCode || '').toUpperCase() !== hex) {
        await adminApi.updateAttributeValue(existing.id, {
          name: existing.name,
          hexCode: hex,
          abbreviation: existing.abbreviation ?? name.slice(0, 3).toUpperCase(),
        })
      }
      if (!valueId) {
        const created = await adminApi.createAttributeValue(colorAttr.id, {
          name,
          hexCode: hex,
          abbreviation: name.slice(0, 3).toUpperCase(),
          slug: `${name}-${hex.replace('#', '')}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        })
        valueId = created.id
      }
      const attrs = await adminApi.getAttributes()
      setAttributes(attrs)
      setForm((prev) => ({
        ...prev,
        selectedColors: prev.selectedColors.includes(valueId!)
          ? prev.selectedColors
          : [...prev.selectedColors, valueId!],
        hasVariants: true,
      }))
      setCustomTone(false)
      toast('success', `${name} se agregó al producto`)
    } catch (error) {
      toast('error', error instanceof ApiError ? error.message : 'No se pudo agregar el color')
    }
  }

  useEffect(() => {
    if (isEdit || !sizeAttr) return
    setForm((prev) => {
      if (prev.selectedSizes.length > 0) return prev
      const group = SIZE_GROUPS.find((item) => item.id === prev.sizeGroupId) ?? SIZE_GROUPS[0]
      const ids = (group?.slugs ?? [])
        .map((slug) => sizeAttr.values.find((value) => value.slug === slug)?.id)
        .filter((id): id is string => Boolean(id))
      if (ids.length === 0) return prev
      return { ...prev, selectedSizes: ids }
    })
  }, [isEdit, sizeAttr])

  const attributeIds = useMemo(() => {
    const ids = new Set(form.attributeIds)
    if (form.selectedColors.length && colorAttr) ids.add(colorAttr.id)
    if (form.selectedSizes.length && sizeAttr) ids.add(sizeAttr.id)
    return [...ids]
  }, [colorAttr, form.attributeIds, form.selectedColors.length, form.selectedSizes.length, sizeAttr])

  const buildPayload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    shortDescription: form.shortDescription,
    description: form.description,
    categoryId: form.categoryId,
    basePriceCents: parseMoneyInput(form.basePriceCents) ?? 0,
    salePriceCents: form.salePriceCents.trim() ? parseMoneyInput(form.salePriceCents) : null,
    status: form.status,
    isFeatured: form.isFeatured,
    isNew: form.isNew,
    hasVariants: form.hasVariants || form.variants.length > 0,
    trackInventory: form.trackInventory,
    stock: Number(form.stock) || 0,
    minStock: Number(form.minStock) || 0,
    sku: form.sku || null,
    brand: form.brand || null,
    sortOrder: Number(form.sortOrder) || 0,
    attributeIds,
    extras: form.extras.map((extra) => ({
      id: extra.id,
      name: extra.name,
      priceCents: parseMoneyInput(extra.priceCents) ?? 0,
      isActive: extra.isActive,
    })),
    variants: form.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      priceCents: variant.priceCents.trim() ? parseMoneyInput(variant.priceCents) : null,
      priceDeltaCents: parseMoneyInput(variant.priceDeltaCents) ?? 0,
      stock: Number(variant.stock) || 0,
      minStock: Number(variant.minStock) || 0,
      imageUrl: variant.imageUrl || null,
      isActive: variant.isActive,
      attributeValueIds: variant.attributeValueIds,
    })),
    images: [
      ...(form.imageUrl.trim()
        ? [{ url: form.imageUrl.trim(), isPrimary: true, sortOrder: 0 }]
        : []),
      ...form.extraImages
        .map((url) => url.trim())
        .filter((url) => url && url !== form.imageUrl.trim())
        .map((url, index) => ({ url, isPrimary: false, sortOrder: index + 1 })),
    ],
  })

  const save = async () => {
    if (!form.name.trim() || !form.categoryId) {
      toast('error', 'Nombre y categoría son obligatorios')
      return
    }
    if (!parseMoneyInput(form.basePriceCents)) {
      toast('error', 'Pon el precio en bolívares. Ejemplo: 150')
      return
    }
    setSaving(true)
    try {
      const payload = buildPayload()
      if (isEdit && id) {
        await adminApi.updateProduct(id, payload)
        toast('success', 'Producto actualizado')
      } else {
        const created = await adminApi.createProduct(payload)
        toast('success', 'Producto creado')
        navigate(`/admin/products/${created.id}/edit`, { replace: true })
        return
      }
      if (id) {
        const refreshed = await adminApi.getProduct(id)
        hydrate(refreshed)
      }
    } catch (error) {
      toast('error', error instanceof ApiError ? error.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const generateLocalCombos = () => {
    const colors = form.selectedColors
    const sizes = form.selectedSizes
    if (!colors.length || !sizes.length) {
      toast('error', 'Selecciona al menos un color y una talla')
      return
    }
    const prefix = (form.skuPrefix || form.slug || form.name || 'PROD')
      .toUpperCase()
      .replace(/\s+/g, '-')
      .slice(0, 16)
    const colorMap = new Map(colorAttr?.values.map((v) => [v.id, v]) ?? [])
    const sizeMap = new Map(sizeAttr?.values.map((v) => [v.id, v]) ?? [])
    const next: VariantDraft[] = []
    for (const colorId of colors) {
      for (const sizeId of sizes) {
        const existing = form.variants.find(
          (v) =>
            v.attributeValueIds.includes(colorId) && v.attributeValueIds.includes(sizeId),
        )
        if (existing) {
          next.push(existing)
          continue
        }
        const color = colorMap.get(colorId)
        const size = sizeMap.get(sizeId)
        const label = [color?.abbreviation || color?.slug, size?.abbreviation || size?.slug]
          .filter(Boolean)
          .join('-')
        next.push({
          sku: `${prefix}-${label}`.toUpperCase(),
          priceCents: '',
          priceDeltaCents: '0',
          stock: form.defaultStock,
          minStock: '2',
          imageUrl: '',
          isActive: true,
          attributeValueIds: [colorId, sizeId],
        })
      }
    }
    setForm((prev) => ({
      ...prev,
      hasVariants: true,
      variants: next,
      attributeIds: [
        ...new Set([
          ...prev.attributeIds,
          ...(colorAttr ? [colorAttr.id] : []),
          ...(sizeAttr ? [sizeAttr.id] : []),
        ]),
      ],
    }))
    toast('success', `Se generaron ${next.length} combinaciones`)
  }

  const generateOnServer = async () => {
    if (!id) {
      toast('error', 'Guarda el producto primero para armar las combinaciones')
      return
    }
    if (!form.selectedColors.length || !form.selectedSizes.length) {
      toast('error', 'Selecciona colores y tallas')
      return
    }
    try {
      await adminApi.generateVariants(id, {
        attributeValueGroups: [form.selectedColors, form.selectedSizes],
        skuPrefix: form.skuPrefix || form.slug || 'PROD',
        defaultStock: Number(form.defaultStock) || 0,
      })
      const refreshed = await adminApi.getProduct(id)
      hydrate(refreshed)
      toast('success', 'Combinaciones listas')
    } catch (error) {
      toast('error', error instanceof ApiError ? error.message : 'No se pudieron generar')
    }
  }

  const updateVariantStock = async (variantId: string, stock: number) => {
    try {
      await adminApi.updateVariantStock(variantId, stock)
      toast('success', 'Existencias actualizadas')
    } catch (error) {
      toast('error', error instanceof ApiError ? error.message : 'No se pudieron actualizar las existencias')
    }
  }

  const uploadImage = async (file: File, kind: 'primary' | 'extra') => {
    try {
      const result = await adminApi.upload(file)
      setForm((prev) =>
        kind === 'primary'
          ? { ...prev, imageUrl: result.url }
          : { ...prev, extraImages: [...prev.extraImages, result.url] },
      )
      toast('success', kind === 'primary' ? 'Imagen principal subida' : 'Imagen adicional subida')
    } catch (error) {
      toast('error', error instanceof ApiError ? error.message : 'Error al subir')
    }
  }

  if (loading) return <p className="text-sm text-atelier-gray">Cargando…</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/admin/products" className="text-sm text-atelier-gold underline-offset-4 hover:underline">
            ← Productos
          </Link>
          <h1 className="mt-2 font-display text-3xl">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </h1>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="min-h-11 rounded-full bg-atelier-dark px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      <section className="grid gap-4 rounded-2xl border border-atelier-blush bg-atelier-white p-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="mb-1 text-sm font-semibold text-atelier-dark">Imágenes</p>
          <p className="mb-3 text-xs text-atelier-gray">
            La primera es la principal. Las demás salen abajo en la ficha del producto.
          </p>
          <div className="flex flex-nowrap items-start gap-3 overflow-x-auto pb-1">
            <label className="block w-24 shrink-0 cursor-pointer sm:w-28">
              <span className="mb-1 flex h-4 items-center text-[10px] font-bold tracking-wide text-atelier-gold uppercase">
                Principal
              </span>
              <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-atelier-gold bg-atelier-soft-pink">
                {form.imageUrl ? (
                  <img
                    src={mediaUrl(form.imageUrl)}
                    alt="Imagen principal"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 text-atelier-dark">
                    <ImagePlus className="h-6 w-6" />
                    <span className="px-1 text-center text-[10px] font-semibold">Agregar</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void uploadImage(file, 'primary')
                  e.currentTarget.value = ''
                }}
              />
            </label>

            {form.extraImages.map((url, index) => (
              <div key={`${url}-${index}`} className="relative w-24 shrink-0 sm:w-28">
                <span className="mb-1 flex h-4 items-center text-[10px] font-bold tracking-wide text-atelier-gray uppercase">
                  Foto {index + 2}
                </span>
                <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-atelier-soft-pink">
                  <img src={mediaUrl(url)} alt="" className="h-full w-full object-cover" />
                </div>
                <button
                  type="button"
                  className="absolute top-5 -right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-atelier-danger text-xs font-bold text-white"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      extraImages: prev.extraImages.filter((_, i) => i !== index),
                    }))
                  }
                  aria-label="Quitar imagen"
                >
                  ×
                </button>
              </div>
            ))}

            <label className="block w-24 shrink-0 cursor-pointer sm:w-28">
              <span className="mb-1 flex h-4 items-center text-[10px] font-bold tracking-wide text-atelier-gray uppercase">
                Otra
              </span>
              <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-2xl border border-dashed border-atelier-gold bg-atelier-soft-pink text-atelier-dark">
                <ImagePlus className="h-6 w-6" />
                <span className="mt-1 px-1 text-center text-[10px] font-semibold">Agregar</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = [...(e.target.files ?? [])]
                  files.forEach((file) => void uploadImage(file, 'extra'))
                  e.currentTarget.value = ''
                }}
              />
            </label>
          </div>
        </div>
        <Field
          label="Nombre"
          hint="Cómo se llama la prenda en la tienda. Ejemplo: Vestido midi."
        >
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. Vestido midi"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field
          label="Enlace"
          hint="Texto de la dirección en internet. Si lo dejas vacío, se arma solo con el nombre."
        >
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. vestido-midi"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </Field>
        <Field label="Categoría" hint="Dónde aparece en el catálogo: playeras, vestidos, pantalones…">
          <select
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Elige una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Estado"
          hint="Publicado se ve en la tienda. Borrador es solo para ti. Agotado o desactivado lo ocultan de la venta."
        >
          <select
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {PRODUCT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Precio (Bs)"
          hint="Cuánto cuesta, en bolívares. Solo el número, sin Bs. Ejemplo: 150"
        >
          <input
            inputMode="decimal"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. 150"
            value={form.basePriceCents}
            onChange={(e) => setForm({ ...form, basePriceCents: e.target.value })}
          />
        </Field>
        <Field
          label="Precio de oferta (Bs)"
          hint="Opcional. Si está en descuento, pon el precio rebajado. Ejemplo: 120"
        >
          <input
            inputMode="decimal"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. 120"
            value={form.salePriceCents}
            onChange={(e) => setForm({ ...form, salePriceCents: e.target.value })}
          />
        </Field>
        <Field
          className="md:col-span-2"
          label="Descripción corta"
          hint="Una o dos frases para la tarjeta del catálogo."
        >
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. Vestido fluido, ideal para el día."
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
          />
        </Field>
        <Field
          className="md:col-span-2"
          label="Descripción"
          hint="Detalles de tela, corte o cuidado. El cliente lo lee en la ficha."
        >
          <textarea
            className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ej. Tela ligera, forro interior, cierre invisible."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
          Destacado
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
          />
          Nuevo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.hasVariants}
            onChange={(e) => setForm({ ...form, hasVariants: e.target.checked })}
          />
          Tiene tallas y colores
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.trackInventory}
            onChange={(e) => setForm({ ...form, trackInventory: e.target.checked })}
          />
          Controlar existencias
        </label>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Colores y tallas</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">Grupo de tallas</p>
            <p className="mt-1 text-xs text-slate-500">Elige el set. Las tallas se asignan solas.</p>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-atelier-blush px-3 text-sm"
              value={form.sizeGroupId}
              onChange={(e) => applySizeGroup(e.target.value)}
            >
              {SIZE_GROUPS.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-atelier-gray">
              {SIZE_GROUPS.find((group) => group.id === form.sizeGroupId)?.hint} ·{' '}
              {sizeLabelsForGroup(form.sizeGroupId)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.selectedSizes.map((id) => {
                const value = sizeAttr?.values.find((item) => item.id === id)
                if (!value) return null
                return (
                  <span
                    key={id}
                    className="rounded-full bg-atelier-soft-pink px-3 py-1 text-xs font-semibold text-atelier-dark"
                  >
                    {value.abbreviation || value.name}
                  </span>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Colores</p>
            <p className="mt-1 text-xs text-slate-500">
              Los 5 de siempre. Si quieres otro, ármalo abajo.
            </p>
            <div className="mt-3">
              <ColorPalettePicker
                selectedHexes={form.selectedColors.map((id) => {
                  const value = colorAttr?.values.find((item) => item.id === id)
                  return (value?.hexCode || '').toUpperCase()
                })}
                extraColors={(colorAttr?.values ?? [])
                  .filter((value) => {
                    const hex = (value.hexCode || '').toLowerCase()
                    return !COLOR_PALETTE.some(
                      (color) =>
                        color.hex.toLowerCase() === hex ||
                        color.name.toLowerCase() === value.name.toLowerCase(),
                    )
                  })
                  .map((value) => ({
                    id: value.id,
                    name: value.name,
                    hex: value.hexCode || '#CCCCCC',
                  }))}
                customHex={paletteHex}
                onPick={(color, source) => {
                  setPaletteHex(color.hex)
                  setColorName(color.name)
                  if (source === 'preset') {
                    setCustomTone(false)
                    void addColorFromPalette(color)
                    return
                  }
                  setCustomTone(true)
                  setColorName('')
                }}
              />
            </div>
            {customTone ? (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <input
                  className="h-11 min-w-0 flex-1 rounded-xl border border-atelier-blush px-3 text-sm"
                  placeholder="Nombre del tono. Ej. Amarillo"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => void addColorFromPalette({ name: colorName, hex: paletteHex })}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-atelier-dark px-5 text-sm font-semibold text-white sm:w-auto"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-white/40"
                    style={{ backgroundColor: paletteHex }}
                  />
                  Agregar
                </button>
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {form.selectedColors.map((id) => {
                const value = colorAttr?.values.find((item) => item.id === id)
                if (!value) return null
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => removeSelectedColor(id)}
                    className="inline-flex items-center gap-2 rounded-full border border-atelier-blush bg-atelier-cream px-3 py-1.5 text-xs font-semibold"
                    title="Quitar color"
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: value.hexCode || '#ccc' }}
                    />
                    {value.name}
                    <span className="text-atelier-gray">×</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
          <Field
            label="Prefijo del código"
            hint="Letras para armar el código de cada talla y color. Ejemplo: VESTIDO"
          >
            <input
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              placeholder="Ej. VESTIDO"
              value={form.skuPrefix}
              onChange={(e) => setForm({ ...form, skuPrefix: e.target.value })}
            />
          </Field>
          <Field
            label="Piezas"
            hint="Cuántas hay de cada combinación al armarla."
          >
            <input
              inputMode="numeric"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              placeholder="Ej. 5"
              value={form.defaultStock}
              onChange={(e) => setForm({ ...form, defaultStock: e.target.value })}
            />
          </Field>
          <div className="flex flex-wrap gap-2 pb-0.5">
            <button
              type="button"
              onClick={generateLocalCombos}
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
            >
              Armar combinaciones
            </button>
            {isEdit ? (
              <button
                type="button"
                onClick={() => void generateOnServer()}
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold"
              >
                Guardar combinaciones
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Combinaciones ({form.variants.length})</h2>
        <p className="mt-1 text-xs text-atelier-gray">
          Cada fila es un color con una talla. Código, piezas y, si hace falta, un extra de precio en Bs.
        </p>
        <div className="mt-3 space-y-3">
          {form.variants.map((variant, index) => (
            <div
              key={variant.id || `${variant.sku}-${index}`}
              className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 md:grid-cols-6"
            >
              <Field className="col-span-2" label="Código" hint="Identificador de esta combinación.">
                <input
                  className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
                  placeholder="Ej. VESTIDO-NEG-M"
                  value={variant.sku}
                  onChange={(e) => {
                    const variants = [...form.variants]
                    variants[index] = { ...variant, sku: e.target.value }
                    setForm({ ...form, variants })
                  }}
                />
              </Field>
              <Field label="Piezas" hint="Cuántas hay de esta talla y color.">
                <input
                  inputMode="numeric"
                  className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
                  placeholder="Ej. 5"
                  value={variant.stock}
                  onChange={(e) => {
                    const variants = [...form.variants]
                    variants[index] = { ...variant, stock: e.target.value }
                    setForm({ ...form, variants })
                  }}
                />
              </Field>
              <Field label="Aviso" hint="Cuando queden estas o menos, avisa.">
                <input
                  inputMode="numeric"
                  className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
                  placeholder="Ej. 2"
                  value={variant.minStock}
                  onChange={(e) => {
                    const variants = [...form.variants]
                    variants[index] = { ...variant, minStock: e.target.value }
                    setForm({ ...form, variants })
                  }}
                />
              </Field>
              <Field label="Suma (Bs)" hint="Si esta talla o color cuesta más, pon cuánto se suma. Si no, 0.">
                <input
                  inputMode="decimal"
                  className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
                  placeholder="Ej. 0"
                  value={variant.priceDeltaCents}
                  onChange={(e) => {
                    const variants = [...form.variants]
                    variants[index] = { ...variant, priceDeltaCents: e.target.value }
                    setForm({ ...form, variants })
                  }}
                />
              </Field>
              {variant.id ? (
                <button
                  type="button"
                  className="col-span-2 h-9 self-end rounded border border-slate-300 text-xs font-semibold md:col-span-1"
                  onClick={() => void updateVariantStock(variant.id!, Number(variant.stock) || 0)}
                >
                  Guardar piezas
                </button>
              ) : (
                <span className="col-span-2 flex h-9 items-end text-xs text-slate-500 md:col-span-1">Nueva</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

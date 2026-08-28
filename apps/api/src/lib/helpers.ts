export function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Express 5 types route params as `string | string[]`. */
export function routeParam(value: string | string[] | undefined): string {
  if (value == null) return ''
  return Array.isArray(value) ? (value[0] ?? '') : value
}

export function generateFolio(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const token = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `PED-${y}${m}${d}-${token}`
}

export function cartesianProduct<T>(lists: T[][]): T[][] {
  if (lists.length === 0) return [[]]
  return lists.reduce<T[][]>(
    (acc, list) => acc.flatMap((prefix) => list.map((item) => [...prefix, item])),
    [[]],
  )
}

export function effectivePriceCents(input: {
  basePriceCents: number
  salePriceCents?: number | null
  variantPriceCents?: number | null
  priceDeltaCents?: number
}): number {
  if (input.variantPriceCents != null) return input.variantPriceCents
  return (input.salePriceCents ?? input.basePriceCents) + (input.priceDeltaCents ?? 0)
}

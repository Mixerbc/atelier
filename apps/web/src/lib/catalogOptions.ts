export interface SizeGroup {
  id: string
  name: string
  hint: string
  slugs: string[]
}

export interface SizeOption {
  slug: string
  name: string
  abbreviation: string
}

export interface PaletteColor {
  name: string
  hex: string
}

export const SIZE_OPTIONS: SizeOption[] = [
  { slug: 'xs', name: 'Extra chica', abbreviation: 'XS' },
  { slug: 's', name: 'Chica', abbreviation: 'S' },
  { slug: 'm', name: 'Mediana', abbreviation: 'M' },
  { slug: 'l', name: 'Grande', abbreviation: 'L' },
  { slug: 'xl', name: 'Extra grande', abbreviation: 'XL' },
  { slug: 'xxl', name: '2XL', abbreviation: 'XXL' },
  { slug: '3xl', name: '3XL', abbreviation: '3XL' },
  { slug: '28', name: '28', abbreviation: '28' },
  { slug: '30', name: '30', abbreviation: '30' },
  { slug: '32', name: '32', abbreviation: '32' },
  { slug: '34', name: '34', abbreviation: '34' },
  { slug: '36', name: '36', abbreviation: '36' },
  { slug: '38', name: '38', abbreviation: '38' },
  { slug: '4', name: '4', abbreviation: '4' },
  { slug: '6', name: '6', abbreviation: '6' },
  { slug: '8', name: '8', abbreviation: '8' },
  { slug: '10', name: '10', abbreviation: '10' },
  { slug: '12', name: '12', abbreviation: '12' },
  { slug: '14', name: '14', abbreviation: '14' },
  { slug: 'unica', name: 'Talla única', abbreviation: 'U' },
]

export const SIZE_GROUPS: SizeGroup[] = [
  {
    id: 'ropa',
    name: 'Ropa (XS–XL)',
    hint: 'Playeras, vestidos, blusas y chaquetas',
    slugs: ['xs', 's', 'm', 'l', 'xl'],
  },
  {
    id: 'ropa-plus',
    name: 'Ropa plus (S–3XL)',
    hint: 'Tallas extendidas',
    slugs: ['s', 'm', 'l', 'xl', 'xxl', '3xl'],
  },
  {
    id: 'pantalon',
    name: 'Pantalón (28–38)',
    hint: 'Jeans y pantalones numéricos',
    slugs: ['28', '30', '32', '34', '36', '38'],
  },
  {
    id: 'nino',
    name: 'Niños (4–14)',
    hint: 'Ropa infantil',
    slugs: ['4', '6', '8', '10', '12', '14'],
  },
  {
    id: 'unica',
    name: 'Talla única',
    hint: 'Un solo corte o accesorios',
    slugs: ['unica'],
  },
]

export const COLOR_PALETTE: PaletteColor[] = [
  { name: 'Negro', hex: '#000000' },
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Rojo', hex: '#DC2626' },
  { name: 'Azul', hex: '#2563EB' },
  { name: 'Beige', hex: '#D2B48C' },
]

export function matchSizeGroup(slugs: string[]): string {
  const unique = [...new Set(slugs)]
  let bestId = SIZE_GROUPS[0]?.id ?? 'ropa'
  let bestExtra = Number.POSITIVE_INFINITY

  for (const group of SIZE_GROUPS) {
    const groupSet = new Set(group.slugs)
    if (!unique.every((slug) => groupSet.has(slug))) continue
    const extra = group.slugs.length - unique.length
    if (extra < bestExtra) {
      bestExtra = extra
      bestId = group.id
    }
  }

  return bestId
}

export function sizeLabelsForGroup(groupId: string): string {
  const group = SIZE_GROUPS.find((item) => item.id === groupId)
  if (!group) return ''
  return group.slugs
    .map((slug) => SIZE_OPTIONS.find((item) => item.slug === slug)?.abbreviation ?? slug.toUpperCase())
    .join(' · ')
}

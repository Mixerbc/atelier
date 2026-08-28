import { Search } from 'lucide-react'
import type { AvailabilityFilter, Category } from '../../types'

interface ProductFiltersProps {
  query: string
  categoryId: string
  availability: AvailabilityFilter
  categories: Category[]
  onQueryChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onAvailabilityChange: (value: AvailabilityFilter) => void
}

export function ProductFilters({
  query,
  categoryId,
  availability,
  categories,
  onQueryChange,
  onCategoryChange,
  onAvailabilityChange,
}: ProductFiltersProps) {
  return (
    <div className="space-y-4">
      <label className="relative block">
        <span className="sr-only">Buscar productos</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar productos"
          className="h-12 w-full rounded-full border border-atelier-blush/80 bg-atelier-white/90 pr-4 pl-11 text-base backdrop-blur-sm"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Filtrar por categoría</span>
          <select
            value={categoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="h-12 w-full rounded-full border border-atelier-blush/80 bg-atelier-white/90 px-4 backdrop-blur-sm"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex-1">
          <span className="sr-only">Filtrar por disponibilidad</span>
          <select
            value={availability}
            onChange={(event) => onAvailabilityChange(event.target.value as AvailabilityFilter)}
            className="h-12 w-full rounded-full border border-atelier-blush/80 bg-atelier-white/90 px-4 backdrop-blur-sm"
          >
            <option value="all">Todos</option>
            <option value="available">Disponibles</option>
            <option value="soldout">Agotados</option>
          </select>
        </label>
      </div>
    </div>
  )
}

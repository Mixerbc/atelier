import { SlidersHorizontal, X } from 'lucide-react'
import type { AvailabilityFilter, Category } from '../../types'

interface CatalogToolbarProps {
  open: boolean
  onToggle: () => void
  query: string
  categoryId: string
  availability: AvailabilityFilter
  categories: Category[]
  onQueryChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onAvailabilityChange: (value: AvailabilityFilter) => void
}

export function CatalogToolbar({
  open,
  onToggle,
  query,
  categoryId,
  availability,
  categories,
  onQueryChange,
  onCategoryChange,
  onAvailabilityChange,
}: CatalogToolbarProps) {
  return (
    <>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onCategoryChange('')}
          className={`catalog-chip ${categoryId === '' ? 'catalog-chip-active' : ''}`}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.id)}
            className={`catalog-chip ${categoryId === category.id ? 'catalog-chip-active' : ''}`}
          >
            {category.name}
          </button>
        ))}
        <button type="button" onClick={onToggle} className="catalog-chip catalog-chip-tool">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Buscar
        </button>
      </div>

      {open ? (
        <div className="catalog-search-sheet" role="dialog" aria-label="Buscar y filtrar">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-atelier-dark">Buscar</p>
            <button type="button" onClick={onToggle} className="header-icon" aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Nombre del producto"
            autoFocus
            className="mt-3 h-11 w-full rounded-xl border border-atelier-blush/80 bg-atelier-white px-4 text-sm"
          />
          <label className="mt-3 block">
            <span className="mb-1 block text-xs font-semibold tracking-wide text-atelier-gray uppercase">
              Disponibilidad
            </span>
            <select
              value={availability}
              onChange={(event) => onAvailabilityChange(event.target.value as AvailabilityFilter)}
              className="h-11 w-full rounded-xl border border-atelier-blush/80 bg-atelier-white px-3 text-sm"
            >
              <option value="all">Todos</option>
              <option value="available">Disponibles</option>
              <option value="soldout">Agotados</option>
            </select>
          </label>
        </div>
      ) : null}
    </>
  )
}

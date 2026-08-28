import { Link } from 'react-router-dom'
import { mediaUrl } from '../../lib/api'
import type { Category } from '../../types'

interface CategoryPillsProps {
  categories: Category[]
}

export function CategoryPills({ categories }: CategoryPillsProps) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/?categoria=${category.id}`}
          className="group min-w-[220px] overflow-hidden rounded-[1.5rem] border border-atelier-blush/70 bg-atelier-white shadow-atelier-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-atelier sm:min-w-0"
        >
          <img
            src={mediaUrl(category.imageUrl) || '/logo.svg'}
            alt=""
            className="h-28 w-full object-cover transition duration-250 group-hover:scale-[1.03]"
          />
          <div className="p-4">
            <h3 className="font-display text-2xl text-atelier-dark">{category.name}</h3>
            <p className="mt-1 text-sm text-atelier-gray">{category.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

import type { ReactNode } from 'react'
import { SearchX } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-cream-dark bg-paper px-6 py-16 text-center">
      <SearchX className="mb-4 h-10 w-10 text-ink-soft" aria-hidden="true" />
      <h2 className="font-display text-3xl">{title}</h2>
      <p className="mt-2 max-w-md text-ink-soft">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

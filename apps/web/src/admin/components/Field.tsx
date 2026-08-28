import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  hint?: string
  className?: string
  children: ReactNode
}

export function Field({ label, hint, className = '', children }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-atelier-dark">{label}</span>
      {hint ? (
        <span className="mt-0.5 mb-1.5 block text-xs leading-snug text-atelier-gray">{hint}</span>
      ) : (
        <span className="mb-1.5 block" />
      )}
      {children}
    </label>
  )
}

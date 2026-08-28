import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldWrapProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}

export function FieldWrap({ label, htmlFor, error, hint, children }: FieldWrapProps) {
  return (
    <label htmlFor={htmlFor} className="block space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && !error ? <span className="block text-xs text-ink-soft">{hint}</span> : null}
      {error ? (
        <span className="block text-xs font-medium text-brand" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}

const controlClass =
  'w-full min-h-12 rounded-2xl border border-cream-dark bg-paper px-4 text-base text-ink placeholder:text-ink-soft/70'

export function TextField({
  label,
  error,
  hint,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  return (
    <FieldWrap label={label} htmlFor={id ?? ''} error={error} hint={hint}>
      <input id={id} className={controlClass} {...props} />
    </FieldWrap>
  )
}

export function TextAreaField({
  label,
  error,
  hint,
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string }) {
  return (
    <FieldWrap label={label} htmlFor={id ?? ''} error={error} hint={hint}>
      <textarea id={id} className={`${controlClass} min-h-28 py-3`} {...props} />
    </FieldWrap>
  )
}

export function SelectField({
  label,
  error,
  hint,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <FieldWrap label={label} htmlFor={id ?? ''} error={error} hint={hint}>
      <select id={id} className={controlClass} {...props}>
        {children}
      </select>
    </FieldWrap>
  )
}

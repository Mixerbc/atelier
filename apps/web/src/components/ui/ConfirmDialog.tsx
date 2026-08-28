import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-3xl bg-paper p-6"
      >
        <h2 id="confirm-title" className="font-display text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-ink-soft">{description}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

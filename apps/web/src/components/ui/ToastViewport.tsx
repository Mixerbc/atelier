import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

const icons = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[70] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
      {toasts.map((item) => {
        const Icon = icons[item.type]
        return (
          <div
            key={item.id}
            role="status"
            className="toast-in pointer-events-auto flex items-start gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-cream shadow-lg"
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1">{item.message}</p>
            <button
              type="button"
              className="rounded-full p-1 text-cream/70 hover:text-cream"
              onClick={() => dismiss(item.id)}
              aria-label="Cerrar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

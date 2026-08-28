import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
}

interface ToastState {
  toasts: ToastMessage[]
  push: (type: ToastType, message: string) => void
  dismiss: (id: string) => void
}

let toastCount = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (type, message) => {
    toastCount += 1
    const id = `toast-${toastCount}`
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
    }, 3200)
  },
  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
  },
}))

export function toast(type: ToastType, message: string): void {
  useToastStore.getState().push(type, message)
}

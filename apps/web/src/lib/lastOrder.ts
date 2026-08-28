import type { Order } from '../types'

const STORAGE_KEY = 'atelier-last-order'

export function saveLastOrder(order: Order): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order))
}

export function readLastOrder(): Order | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Order
  } catch {
    return null
  }
}

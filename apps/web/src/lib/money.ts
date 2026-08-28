export const DEFAULT_CURRENCY = 'Bs'

export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

export function fromCents(cents: number): number {
  return cents / 100
}

export function addCents(...values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0)
}

export function multiplyCents(unitCents: number, quantity: number): number {
  if (quantity <= 0) return 0
  return Math.round(unitCents * quantity)
}

function isBolivar(currency: string): boolean {
  const code = currency.trim().toUpperCase()
  return code === 'BS' || code === 'VES' || code === 'VED' || code === 'VESF' || code === 'BOLIVAR'
}

export function formatMoney(cents: number, currency = DEFAULT_CURRENCY): string {
  const amount = fromCents(cents)
  const whole = Number.isInteger(amount)
  const number = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)

  if (isBolivar(currency || DEFAULT_CURRENCY)) {
    return `Bs ${number}`
  }

  try {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `Bs ${number}`
  }
}

export function parseMoneyInput(value: string): number | null {
  const normalized = value.replace(/[^\d.,]/g, '').replace(',', '.')
  if (!normalized) return null
  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount < 0) return null
  return toCents(amount)
}

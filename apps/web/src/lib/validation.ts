import type { Customer } from '../types'
import { isValidMapsUrl } from './maps'
import { toCents } from './money'

export type FieldErrors = Record<string, string>

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function validatePhone(phone: string): string | null {
  const digits = digitsOnly(phone)
  if (digits.length === 0) return 'El teléfono es obligatorio'
  if (digits.length !== 10) return 'El teléfono debe tener 10 dígitos'
  return null
}

export function validateFullName(name: string): string | null {
  const trimmed = name.trim()
  if (trimmed.length < 3) return 'Escribe tu nombre completo'
  if (trimmed.split(/\s+/).length < 2) return 'Incluye nombre y apellido'
  return null
}

export function validateAddress(address: string): string | null {
  const trimmed = address.trim()
  if (trimmed.length < 8) return 'Escribe la dirección completa'
  return null
}

export interface CustomerValidationOptions {
  totalCents: number
}

export function validateCustomer(
  customer: Customer,
  options: CustomerValidationOptions,
): FieldErrors {
  const errors: FieldErrors = {}

  const nameError = validateFullName(customer.fullName)
  if (nameError) errors.fullName = nameError

  const phoneError = validatePhone(customer.phone)
  if (phoneError) errors.phone = phoneError

  if (customer.deliveryType !== 'delivery' && customer.deliveryType !== 'pickup') {
    errors.deliveryType = 'Selecciona el tipo de entrega'
  }

  if (customer.deliveryType === 'delivery') {
    const addressError = validateAddress(customer.address)
    if (addressError) errors.address = addressError
    if (!customer.zone.trim()) errors.zone = 'Selecciona tu colonia o zona'

    const mapsValue = customer.mapsUrl.trim()
    if (mapsValue && !isValidMapsUrl(mapsValue)) {
      errors.mapsUrl = 'Pega un enlace válido de Google Maps'
    }
  }

  if (
    customer.paymentMethod !== 'cash' &&
    customer.paymentMethod !== 'mobile' &&
    customer.paymentMethod !== 'other'
  ) {
    errors.paymentMethod = 'Selecciona la forma de pago'
  }

  if (customer.paymentMethod === 'cash') {
    if (customer.cashAmountCents === null || customer.cashAmountCents <= 0) {
      errors.cashAmountCents = 'Indica con cuánto pagarás'
    } else if (customer.cashAmountCents < options.totalCents) {
      errors.cashAmountCents = 'El monto debe ser igual o mayor al total'
    }
  }

  if (customer.paymentMethod === 'other' && !customer.paymentNote.trim()) {
    errors.paymentNote = 'Describe cómo vas a pagar'
  }

  return errors
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}

export function emptyCustomer(): Customer {
  return {
    fullName: '',
    phone: '',
    deliveryType: '',
    address: '',
    zone: '',
    references: '',
    mapsUrl: '',
    paymentMethod: '',
    cashAmountCents: null,
    paymentNote: '',
    notes: '',
  }
}

export function parseCashAmount(value: string): number | null {
  const normalized = value.replace(/[^\d.,]/g, '').replace(',', '.')
  if (!normalized) return null
  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return toCents(amount)
}

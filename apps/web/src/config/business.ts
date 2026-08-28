import type { BusinessConfig, BusinessHours, BusinessSettings, SocialLink } from '../types'

function asHours(value: unknown): BusinessHours[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as { days?: unknown; hours?: unknown }
      if (typeof row.days !== 'string' || typeof row.hours !== 'string') return null
      return { days: row.days, hours: row.hours }
    })
    .filter((item): item is BusinessHours => Boolean(item))
}

function asZones(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function asSocial(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as { name?: unknown; url?: unknown }
      if (typeof row.name !== 'string' || typeof row.url !== 'string') return null
      return { name: row.name, url: row.url }
    })
    .filter((item): item is SocialLink => Boolean(item))
}

function asPaymentMethods(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

export function normalizeSettings(raw: BusinessSettings): BusinessSettings {
  return {
    ...raw,
    storeName: raw.storeName || 'Atelier',
    tagline: raw.tagline || '',
    logoUrl: raw.logoUrl ?? null,
    whatsappNumber: raw.whatsappNumber || '5214421234567',
    address: raw.address || '',
    phone: raw.phone || '',
    email: raw.email || '',
    currency: raw.currency || 'Bs',
    deliveryFeeCents: raw.deliveryFeeCents ?? 0,
    minimumOrderCents: raw.minimumOrderCents ?? 0,
    hoursJson: asHours(raw.hoursJson),
    deliveryZonesJson: asZones(raw.deliveryZonesJson),
    paymentMethodsJson: asPaymentMethods(raw.paymentMethodsJson),
    socialJson: asSocial(raw.socialJson),
    ticketFooter: raw.ticketFooter || '',
    cardPaymentAvailable: raw.cardPaymentAvailable ?? true,
  }
}

export const fallbackSettings: BusinessSettings = {
  storeName: 'Atelier',
  tagline: 'Ropa y estilo contemporáneo',
  logoUrl: '/logo.svg',
  whatsappNumber: '5214421234567',
  address: '',
  phone: '',
  email: '',
  currency: 'Bs',
  deliveryFeeCents: 8000,
  minimumOrderCents: 35000,
  hoursJson: [],
  deliveryZonesJson: [],
  paymentMethodsJson: [],
  socialJson: [],
  ticketFooter: '',
  cardPaymentAvailable: true,
}

/** Maps API settings into the legacy BusinessConfig shape used by some UI helpers. */
export function toBusinessConfig(settings: BusinessSettings): BusinessConfig {
  return {
    name: settings.storeName,
    tagline: settings.tagline,
    logo: settings.logoUrl || '/logo.svg',
    whatsappNumber: settings.whatsappNumber,
    currency: settings.currency,
    deliveryFee: settings.deliveryFeeCents / 100,
    minimumOrder: settings.minimumOrderCents / 100,
    deliveryZones: settings.deliveryZonesJson,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    hours: settings.hoursJson,
    social: settings.socialJson,
    cardPaymentAvailable: settings.cardPaymentAvailable,
  }
}

/** Static fallback until settings load from the API. */
export const businessConfig: BusinessConfig = toBusinessConfig(fallbackSettings)

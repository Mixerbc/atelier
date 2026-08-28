const MAPS_HOSTS = [
  'google.com',
  'maps.google.com',
  'maps.app.goo.gl',
  'goo.gl',
  'google.com.mx',
  'google.com.ve',
  'google.es',
]

export function mapsUrlFromCoords(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`
}

function hostAllowed(hostname: string): boolean {
  const host = hostname.replace(/^www\./, '').toLowerCase()
  return MAPS_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))
}

export function parseMapsUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!hostAllowed(url.hostname)) return null

    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    const looksLikeMaps =
      host.startsWith('maps.') ||
      host === 'goo.gl' ||
      host === 'maps.app.goo.gl' ||
      url.pathname.includes('/maps') ||
      url.searchParams.has('q') ||
      url.searchParams.has('ll')

    return looksLikeMaps ? url.toString() : null
  } catch {
    return null
  }
}

export function isValidMapsUrl(value: string): boolean {
  return parseMapsUrl(value) !== null
}

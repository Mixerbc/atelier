import { describe, expect, it } from 'vitest'
import { isValidMapsUrl, mapsUrlFromCoords, parseMapsUrl } from './maps'

describe('maps', () => {
  it('arma un enlace de Google Maps desde coordenadas', () => {
    expect(mapsUrlFromCoords(10.48, -66.9)).toBe('https://www.google.com/maps?q=10.48,-66.9')
  })

  it('acepta enlaces típicos de Google Maps', () => {
    expect(isValidMapsUrl('https://maps.app.goo.gl/abc')).toBe(true)
    expect(isValidMapsUrl('https://www.google.com/maps?q=10.48,-66.9')).toBe(true)
    expect(isValidMapsUrl('https://www.google.com/maps/place/Caracas')).toBe(true)
    expect(parseMapsUrl('https://evil.com/maps')).toBeNull()
    expect(parseMapsUrl('no es una url')).toBeNull()
  })
})

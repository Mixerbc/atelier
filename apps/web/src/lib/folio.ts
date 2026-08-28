const FOLIO_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomToken(length = 4): string {
  let token = ''
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * FOLIO_CHARS.length)
    token += FOLIO_CHARS[index]
  }
  return token
}

export function formatFolioDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

export function generateFolio(date: Date = new Date(), token = randomToken()): string {
  return `PED-${formatFolioDate(date)}-${token}`
}

export function normalizeWhatsAppNumber(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const number = normalizeWhatsAppNumber(phone)
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function buildGreetingMessage(businessName: string): string {
  return `Hola, me gustaría hacer una compra en ${businessName}.`
}

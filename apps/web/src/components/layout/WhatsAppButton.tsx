import { useLocation } from 'react-router-dom'
import { useSettings } from '../../hooks/useSettings'
import { buildGreetingMessage, buildWhatsAppUrl } from '../../lib/whatsapp'

function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.15 6.4 2.15 11.84c0 1.74.46 3.44 1.33 4.94L2 22l5.37-1.4a10.1 10.1 0 0 0 4.67 1.13h.01c5.46 0 9.89-4.4 9.89-9.85C21.94 6.4 17.5 2 12.04 2m0 18.01h-.01a8.4 8.4 0 0 1-4.28-1.17l-.31-.18-3.19.83.85-3.1-.2-.32a8.3 8.3 0 0 1-1.28-4.43c0-4.6 3.77-8.34 8.42-8.34 4.65 0 8.42 3.74 8.42 8.34 0 4.6-3.77 8.37-8.42 8.37m4.62-6.25c-.25-.13-1.5-.74-1.73-.82s-.4-.13-.57.12-.66.82-.8 1-.3.18-.55.06a6.86 6.86 0 0 1-2.02-1.24 7.55 7.55 0 0 1-1.4-1.74c-.15-.25 0-.38.11-.51.12-.12.25-.3.38-.45s.16-.25.25-.42.04-.31-.02-.43-.57-1.37-.78-1.88c-.2-.48-.41-.42-.57-.42h-.48c-.17 0-.43.06-.66.31s-.86.84-.86 2.05.88 2.38 1 2.54 1.73 2.64 4.19 3.7c.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.5-.61 1.71-1.2s.21-1.1.15-1.2c-.06-.11-.23-.18-.48-.3"
      />
    </svg>
  )
}

export function WhatsAppButton() {
  const location = useLocation()
  const { settings } = useSettings()
  const hidden =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/checkout' ||
    location.pathname === '/pedido-enviado'
  const href = buildWhatsAppUrl(
    settings.whatsappNumber,
    buildGreetingMessage(settings.storeName),
  )

  if (hidden) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="wa-fab"
      aria-label="Escribir por WhatsApp"
    >
      <span className="wa-fab-ping" aria-hidden />
      <WhatsAppIcon className="wa-fab-icon" />
      <span className="wa-fab-copy">
        <strong>WhatsApp</strong>
        <small>Escríbenos ahora</small>
      </span>
    </a>
  )
}

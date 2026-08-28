import { BrandLogo } from '../brand/BrandLogo'
import { FloralFlourish } from '../brand/FloralFlourish'
import { useSettings } from '../../hooks/useSettings'

export function Footer() {
  const { settings } = useSettings()

  return (
    <footer className="relative mt-auto border-t border-atelier-soft-gold/30 bg-atelier-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-7 text-center">
        <BrandLogo size="sm" variant="mark" glow />
        <FloralFlourish className="h-6 w-36 opacity-80" />
        {settings.phone ? <p className="text-sm text-atelier-gray">{settings.phone}</p> : null}
        <p className="text-xs text-atelier-gray/80">Pedidos por WhatsApp</p>
      </div>
    </footer>
  )
}

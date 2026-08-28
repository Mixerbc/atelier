import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useSettings } from '../hooks/useSettings'
import { readLastOrder } from '../lib/lastOrder'
import { generateTicket } from '../lib/ticket'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import { useCartStore } from '../store/cartStore'
import { toast } from '../store/toastStore'

export function OrderSentPage() {
  const order = readLastOrder()
  const clear = useCartStore((state) => state.clear)
  const { settings } = useSettings()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const reopen = () => {
    if (!order) return
    const ticket = generateTicket(
      order,
      settings.storeName,
      settings.currency,
      settings.ticketFooter,
    )
    window.open(
      buildWhatsAppUrl(settings.whatsappNumber, ticket),
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold text-atelier-dark">Pedido registrado</h1>
      <p className="mt-3 text-atelier-gray">
        Se abrió WhatsApp con el resumen de tu ticket y la confirmación. Solo envía ese mensaje;
        no hace falta que contestes después.
      </p>

      {order ? (
        <p className="mt-6 rounded-xl border border-atelier-blush bg-atelier-cream/40 px-4 py-3 font-semibold text-atelier-dark">
          Folio {order.folio}
        </p>
      ) : (
        <p className="mt-6 text-atelier-gray">No encontramos el último folio en esta sesión.</p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Button variant="whatsapp" onClick={reopen} disabled={!order}>
          Enviar por WhatsApp
        </Button>
        <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
          Vaciar carrito
        </Button>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-atelier-blush px-5 text-sm font-semibold text-atelier-dark"
        >
          Seguir comprando
        </Link>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Vaciar el carrito?"
        description="Hazlo cuando la tienda ya tenga tu pedido."
        confirmLabel="Vaciar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          clear()
          setConfirmOpen(false)
          toast('success', 'El carrito quedó vacío')
        }}
      />
    </div>
  )
}

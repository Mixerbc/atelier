import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import { CartSummary } from '../components/cart/CartSummary'
import { CustomerForm } from '../components/checkout/CustomerForm'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useSettings } from '../hooks/useSettings'
import { ApiError, canUseApi, ordersApi } from '../lib/api'
import { saveLastOrder } from '../lib/lastOrder'
import { formatMoney } from '../lib/money'
import { buildOrder, mapApiOrderToTicketOrder, toCreateOrderPayload } from '../lib/order'
import { generateTicket } from '../lib/ticket'
import { emptyCustomer, hasFieldErrors, validateCustomer } from '../lib/validation'
import type { FieldErrors } from '../lib/validation'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import { getCartTotals, useCartItems } from '../store/cartStore'
import { toast } from '../store/toastStore'
import type { Customer } from '../types'

export function CheckoutPage() {
  const items = useCartItems()
  const navigate = useNavigate()
  const { settings } = useSettings()
  const [customer, setCustomer] = useState<Customer>(emptyCustomer)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const totals = useMemo(
    () =>
      getCartTotals(
        items,
        customer.deliveryType || 'delivery',
        settings.deliveryFeeCents,
      ),
    [customer.deliveryType, items, settings.deliveryFeeCents],
  )

  const submit = async () => {
    if (items.length === 0) {
      toast('error', 'El carrito está vacío')
      return
    }

    if (totals.subtotalCents < settings.minimumOrderCents) {
      toast('error', 'Aún no alcanzas el pedido mínimo')
      return
    }

    const nextErrors = validateCustomer(customer, {
      totalCents: totals.totalCents,
    })
    setErrors(nextErrors)

    if (hasFieldErrors(nextErrors)) {
      toast('error', 'Revisa los datos del formulario')
      return
    }

    setSubmitting(true)
    try {
      const order = canUseApi()
        ? mapApiOrderToTicketOrder(await ordersApi.create(toCreateOrderPayload(customer, items)))
        : buildOrder({
            items,
            customer,
            deliveryFeeCents: settings.deliveryFeeCents,
          })
      const ticket = generateTicket(
        order,
        settings.storeName,
        settings.currency,
        settings.ticketFooter,
      )
      const url = buildWhatsAppUrl(settings.whatsappNumber, ticket)

      saveLastOrder(order)
      window.open(url, '_blank', 'noopener,noreferrer')
      toast('success', 'Pedido listo. En WhatsApp solo envía el ticket, no hace falta contestar.')
      navigate('/pedido-enviado')
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudo crear el pedido'
      toast('error', message)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <EmptyState
          title="No hay productos para enviar"
          description="Agrega algo del catálogo antes de completar tus datos."
          action={
            <Link
              to="/"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
            >
              Ir al catálogo
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-28 lg:pb-10">
      <p className="text-sm font-semibold tracking-wide text-brand uppercase">Último paso</p>
      <h1 className="font-display text-3xl sm:text-5xl">Tus datos</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Completa tus datos. Al enviar, se abre WhatsApp con el resumen del ticket y un mensaje de
        confirmación para que no tengas que contestar después.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-3xl bg-paper p-4 sm:p-5">
          <CustomerForm customer={customer} errors={errors} onChange={setCustomer} />
        </div>

        <div className="space-y-4">
          <CartSummary
            subtotalCents={totals.subtotalCents}
            shippingCents={totals.shippingCents}
            totalCents={totals.totalCents}
            deliveryType={customer.deliveryType}
            sticky
            action="checkout"
          />
          <div className="rounded-3xl bg-paper p-5 lg:sticky lg:top-[28rem]">
            <Button variant="whatsapp" fullWidth onClick={() => void submit()} disabled={submitting}>
              <Send className="h-4 w-4" />
              {submitting ? 'Enviando…' : 'Enviar pedido por WhatsApp'}
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-dark bg-paper/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-ink-soft">Total</p>
            <p className="truncate text-base font-semibold tabular-nums sm:text-lg">
              {formatMoney(totals.totalCents, settings.currency)}
            </p>
          </div>
          <Button
            variant="whatsapp"
            onClick={() => void submit()}
            className="min-w-0 shrink px-4"
            disabled={submitting}
          >
            Enviar pedido
          </Button>
        </div>
      </div>
    </div>
  )
}

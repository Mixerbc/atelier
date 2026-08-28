import { Link } from 'react-router-dom'
import { formatMoney } from '../../lib/money'
import { useSettings } from '../../hooks/useSettings'
import type { DeliveryType } from '../../types'

interface CartSummaryProps {
  subtotalCents: number
  shippingCents: number
  totalCents: number
  deliveryType?: DeliveryType | ''
  sticky?: boolean
  action?: 'cart' | 'checkout'
}

export function CartSummary({
  subtotalCents,
  shippingCents,
  totalCents,
  deliveryType = '',
  sticky = false,
  action = 'cart',
}: CartSummaryProps) {
  const { settings } = useSettings()
  const belowMinimum = subtotalCents < settings.minimumOrderCents

  return (
    <aside
      className={`rounded-[1.5rem] border border-atelier-blush/80 bg-atelier-cream p-5 shadow-atelier-sm ${
        sticky ? 'lg:sticky lg:top-24' : ''
      }`}
    >
      <h2 className="font-display text-3xl text-atelier-dark">Resumen</h2>
      <div className="gold-rule my-4" />
      <dl className="space-y-2 text-sm text-atelier-dark">
        <div className="flex justify-between">
          <dt className="text-atelier-gray">Subtotal</dt>
          <dd className="font-semibold">{formatMoney(subtotalCents, settings.currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-atelier-gray">
            {deliveryType === 'pickup' ? 'Envío (recolección)' : 'Envío'}
          </dt>
          <dd className="font-semibold">
            {deliveryType === 'pickup'
              ? formatMoney(0, settings.currency)
              : formatMoney(shippingCents, settings.currency)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-atelier-blush pt-3 text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="font-semibold text-atelier-gold">
            {formatMoney(totalCents, settings.currency)}
          </dd>
        </div>
      </dl>

      {belowMinimum ? (
        <p className="mt-4 text-sm text-atelier-danger" role="alert">
          El pedido mínimo es {formatMoney(settings.minimumOrderCents, settings.currency)}.
        </p>
      ) : null}

      {action === 'cart' ? (
        <Link
          to="/checkout"
          className={`btn-atelier mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold ${
            subtotalCents === 0 || belowMinimum
              ? 'pointer-events-none bg-atelier-blush text-atelier-gray'
              : 'bg-atelier-gold text-white hover:bg-atelier-gold/90'
          }`}
          aria-disabled={subtotalCents === 0 || belowMinimum}
        >
          Continuar con el pedido
        </Link>
      ) : null}
    </aside>
  )
}

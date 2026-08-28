import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CartLine } from '../components/cart/CartLine'
import { CartSummary } from '../components/cart/CartSummary'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { useSettings } from '../hooks/useSettings'
import { getCartTotals, useCartItems, useCartStore } from '../store/cartStore'

export function CartPage() {
  const items = useCartItems()
  const clear = useCartStore((state) => state.clear)
  const { settings } = useSettings()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const totals = getCartTotals(items, 'delivery', settings.deliveryFeeCents)

  return (
    <div className="mx-auto max-w-6xl px-3 py-5 sm:px-4 sm:py-10 pb-28 sm:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-brand uppercase">Tu pedido</p>
          <h1 className="font-display text-3xl sm:text-5xl">Carrito</h1>
        </div>
        {items.length > 0 ? (
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Vaciar carrito
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="El carrito está vacío"
            description="Agrega productos del catálogo para armar tu pedido."
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
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-3">
            {items.map((item) => (
              <CartLine key={item.id} item={item} />
            ))}
          </div>
          <CartSummary
            subtotalCents={totals.subtotalCents}
            shippingCents={totals.shippingCents}
            totalCents={totals.totalCents}
            deliveryType="delivery"
            sticky
            action="cart"
          />
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="¿Vaciar el carrito?"
        description="Se eliminarán todos los productos. Esta acción no se puede deshacer."
        confirmLabel="Vaciar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          clear()
          setConfirmOpen(false)
        }}
      />
    </div>
  )
}

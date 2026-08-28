import { useState } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { useSettings } from '../../hooks/useSettings'
import { mapsUrlFromCoords } from '../../lib/maps'
import { fromCents } from '../../lib/money'
import { parseCashAmount, type FieldErrors } from '../../lib/validation'
import type { Customer } from '../../types'
import { SelectField, TextAreaField, TextField } from '../ui/Field'

interface CustomerFormProps {
  customer: Customer
  errors: FieldErrors
  onChange: (next: Customer) => void
}

const paymentOptions = [
  { id: 'cash' as const, label: 'Efectivo' },
  { id: 'mobile' as const, label: 'Pago móvil' },
  { id: 'other' as const, label: 'Otro pago' },
]

export function CustomerForm({ customer, errors, onChange }: CustomerFormProps) {
  const { settings } = useSettings()
  const zones = settings.deliveryZonesJson ?? []
  const [geoStatus, setGeoStatus] = useState('')

  const update = <K extends keyof Customer>(key: K, value: Customer[K]) => {
    onChange({ ...customer, [key]: value })
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Tu navegador no permite compartir ubicación.')
      return
    }

    setGeoStatus('Buscando tu ubicación…')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const url = mapsUrlFromCoords(position.coords.latitude, position.coords.longitude)
        onChange({ ...customer, mapsUrl: url })
        setGeoStatus('Ubicación de Google Maps lista.')
      },
      () => {
        setGeoStatus('No se pudo leer la ubicación. Pega el enlace de Maps o escríbela.')
      },
      { enableHighAccuracy: true, timeout: 12000 },
    )
  }

  return (
    <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
      <TextField
        id="fullName"
        label="Nombre completo"
        value={customer.fullName}
        onChange={(event) => update('fullName', event.target.value)}
        autoComplete="name"
        error={errors.fullName}
      />
      <TextField
        id="phone"
        label="Número telefónico"
        value={customer.phone}
        onChange={(event) => update('phone', event.target.value)}
        inputMode="numeric"
        autoComplete="tel"
        placeholder="04241234567"
        error={errors.phone}
      />

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Tipo de entrega</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { id: 'delivery', label: 'Envío a domicilio' },
            { id: 'pickup', label: 'Recoger en tienda' },
          ].map((option) => (
            <label
              key={option.id}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 ${
                customer.deliveryType === option.id
                  ? 'border-atelier-gold bg-atelier-soft-pink'
                  : 'border-atelier-blush bg-atelier-white'
              }`}
            >
              <input
                type="radio"
                name="deliveryType"
                checked={customer.deliveryType === option.id}
                onChange={() => update('deliveryType', option.id as Customer['deliveryType'])}
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.deliveryType ? (
          <p className="text-xs font-medium text-atelier-danger" role="alert">
            {errors.deliveryType}
          </p>
        ) : null}
      </fieldset>

      {customer.deliveryType === 'delivery' ? (
        <fieldset className="space-y-4 rounded-3xl border border-atelier-blush bg-atelier-white/80 p-4">
          <legend className="px-1 text-sm font-semibold">Ubicación de entrega</legend>
          <p className="text-xs text-atelier-gray">
            La dirección escrita es suficiente. Google Maps es opcional, por si quieres mandar el pin.
          </p>

          <TextAreaField
            id="address"
            label="Dirección escrita"
            value={customer.address}
            onChange={(event) => update('address', event.target.value)}
            autoComplete="street-address"
            placeholder="Calle, número, edificio, apartamento…"
            error={errors.address}
          />

          <SelectField
            id="zone"
            label="Colonia o zona"
            value={customer.zone}
            onChange={(event) => update('zone', event.target.value)}
            error={errors.zone}
          >
            <option value="">Selecciona una zona</option>
            {zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </SelectField>

          <TextField
            id="mapsUrl"
            label="Google Maps (opcional)"
            value={customer.mapsUrl}
            onChange={(event) => {
              setGeoStatus('')
              update('mapsUrl', event.target.value)
            }}
            inputMode="url"
            placeholder="https://maps.app.goo.gl/…"
            error={errors.mapsUrl}
            hint="No es obligatorio. Si quieres, pega el enlace o usa tu ubicación."
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={useCurrentLocation}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-atelier-gold bg-atelier-soft-pink px-4 text-sm font-semibold text-atelier-dark"
            >
              <Navigation className="h-4 w-4" />
              Usar mi ubicación
            </button>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-atelier-blush px-4 text-sm font-semibold text-atelier-dark"
            >
              <MapPin className="h-4 w-4" />
              Abrir Google Maps
            </a>
          </div>
          {geoStatus ? <p className="text-xs font-medium text-atelier-gold">{geoStatus}</p> : null}

          <TextField
            id="references"
            label="Referencias de la dirección"
            value={customer.references}
            onChange={(event) => update('references', event.target.value)}
            placeholder="Portón negro, casa de dos pisos…"
          />
        </fieldset>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Forma de pago</legend>
        <div className="grid gap-2">
          {paymentOptions.map((option) => (
            <label
              key={option.id}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 ${
                customer.paymentMethod === option.id
                  ? 'border-atelier-gold bg-atelier-soft-pink'
                  : 'border-atelier-blush bg-atelier-white'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={customer.paymentMethod === option.id}
                onChange={() => {
                  onChange({
                    ...customer,
                    paymentMethod: option.id,
                    cashAmountCents: option.id === 'cash' ? customer.cashAmountCents : null,
                    paymentNote:
                      option.id === 'other' || option.id === 'mobile' ? customer.paymentNote : '',
                  })
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.paymentMethod ? (
          <p className="text-xs font-medium text-atelier-danger" role="alert">
            {errors.paymentMethod}
          </p>
        ) : null}
      </fieldset>

      {customer.paymentMethod === 'cash' ? (
        <TextField
          id="cashAmount"
          label="¿Con cuánto pagarás?"
          value={
            customer.cashAmountCents !== null ? String(fromCents(customer.cashAmountCents)) : ''
          }
          onChange={(event) => update('cashAmountCents', parseCashAmount(event.target.value))}
          inputMode="decimal"
          placeholder="500"
          error={errors.cashAmountCents}
        />
      ) : null}

      {customer.paymentMethod === 'mobile' ? (
        <TextAreaField
          id="paymentNoteMobile"
          label="Referencia de pago móvil (opcional)"
          value={customer.paymentNote}
          onChange={(event) => update('paymentNote', event.target.value)}
          placeholder="Número o referencia del pago móvil"
        />
      ) : null}

      {customer.paymentMethod === 'other' ? (
        <TextAreaField
          id="paymentNote"
          label="Describe el otro pago"
          value={customer.paymentNote}
          onChange={(event) => update('paymentNote', event.target.value)}
          placeholder="Ej. Zelle, Binance, transferencia…"
          error={errors.paymentNote}
        />
      ) : null}

      <TextAreaField
        id="notes"
        label="Observaciones generales del pedido"
        value={customer.notes}
        onChange={(event) => update('notes', event.target.value)}
        placeholder="Favor de llamar al llegar."
      />
    </form>
  )
}

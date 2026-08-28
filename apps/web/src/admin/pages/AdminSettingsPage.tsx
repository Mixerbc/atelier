import { useEffect, useState } from 'react'
import { adminApi, ApiError } from '../../lib/api'
import { fromCents, parseMoneyInput } from '../../lib/money'
import { toast } from '../../store/toastStore'
import type { BusinessSettings } from '../../types'
import { Field } from '../components/Field'

export function AdminSettingsPage() {
  const [form, setForm] = useState<BusinessSettings | null>(null)
  const [deliveryBs, setDeliveryBs] = useState('')
  const [minOrderBs, setMinOrderBs] = useState('')
  const [hoursText, setHoursText] = useState('[]')
  const [zonesText, setZonesText] = useState('[]')
  const [socialText, setSocialText] = useState('[]')
  const [paymentsText, setPaymentsText] = useState('[]')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminApi
      .getSettings()
      .then((data) => {
        setForm(data)
        setDeliveryBs(String(fromCents(data.deliveryFeeCents)))
        setMinOrderBs(String(fromCents(data.minimumOrderCents)))
        setHoursText(JSON.stringify(data.hoursJson ?? [], null, 2))
        setZonesText(JSON.stringify(data.deliveryZonesJson ?? [], null, 2))
        setSocialText(JSON.stringify(data.socialJson ?? [], null, 2))
        setPaymentsText(JSON.stringify(data.paymentMethodsJson ?? [], null, 2))
      })
      .catch(() => toast('error', 'No se pudo cargar la configuración'))
  }, [])

  if (!form) return <p className="text-sm text-slate-600">Cargando…</p>

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        hoursJson: JSON.parse(hoursText) as BusinessSettings['hoursJson'],
        deliveryZonesJson: JSON.parse(zonesText) as string[],
        socialJson: JSON.parse(socialText) as BusinessSettings['socialJson'],
        paymentMethodsJson: JSON.parse(paymentsText) as string[],
        deliveryFeeCents: parseMoneyInput(deliveryBs) ?? 0,
        minimumOrderCents: parseMoneyInput(minOrderBs) ?? 0,
      }
      const updated = await adminApi.updateSettings(payload)
      setForm(updated)
      setDeliveryBs(String(fromCents(updated.deliveryFeeCents)))
      setMinOrderBs(String(fromCents(updated.minimumOrderCents)))
      toast('success', 'Ajustes guardados')
    } catch (error) {
      toast(
        'error',
        error instanceof ApiError
          ? error.message
          : error instanceof SyntaxError
            ? 'Revisa horarios, zonas o redes: el formato no es válido'
            : 'No se pudo guardar',
      )
    } finally {
      setSaving(false)
    }
  }

  const setText = (key: keyof BusinessSettings, value: string) => {
    setForm({ ...form, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ajustes del negocio</h1>
        <p className="text-sm text-slate-600">Datos que se ven en la tienda y en el ticket de WhatsApp.</p>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
        <Field label="Nombre de la tienda" hint="El nombre que ve el cliente. Ejemplo: Atelier.">
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. Atelier"
            value={form.storeName}
            onChange={(e) => setText('storeName', e.target.value)}
          />
        </Field>
        <Field label="Frase" hint="Una línea corta bajo el nombre. Ejemplo: Ropa y estilo contemporáneo.">
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. Ropa y estilo contemporáneo"
            value={form.tagline}
            onChange={(e) => setText('tagline', e.target.value)}
          />
        </Field>
        <Field label="WhatsApp" hint="Número con código de país, sin espacios. Ejemplo: 584121234567">
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. 584121234567"
            value={form.whatsappNumber}
            onChange={(e) => setText('whatsappNumber', e.target.value)}
          />
        </Field>
        <Field label="Logo" hint="Opcional. Enlace de la imagen del logo.">
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. /images/logo.png"
            value={form.logoUrl ?? ''}
            onChange={(e) => setText('logoUrl', e.target.value)}
          />
        </Field>
        <Field label="Dirección" hint="Dirección escrita del local o punto de entrega.">
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. Av. Antea 1088, Juriquilla"
            value={form.address}
            onChange={(e) => setText('address', e.target.value)}
          />
        </Field>
        <Field label="Teléfono" hint="Teléfono de contacto. Ejemplo: 4421234567">
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. 4421234567"
            value={form.phone}
            onChange={(e) => setText('phone', e.target.value)}
          />
        </Field>
        <Field label="Correo" hint="Correo de la tienda. Ejemplo: hola@atelier.mx">
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. hola@atelier.mx"
            value={form.email}
            onChange={(e) => setText('email', e.target.value)}
          />
        </Field>
        <Field label="Moneda" hint="Se muestra como Bs. Déjalo en Bs.">
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Bs"
            value={form.currency}
            onChange={(e) => setText('currency', e.target.value)}
          />
        </Field>
        <Field label="Costo de envío (Bs)" hint="Cuánto cobras por llevar el pedido. Ejemplo: 80">
          <input
            inputMode="decimal"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. 80"
            value={deliveryBs}
            onChange={(e) => setDeliveryBs(e.target.value)}
          />
        </Field>
        <Field
          label="Pedido mínimo (Bs)"
          hint="Desde cuánto aceptas un pedido a domicilio. Ejemplo: 350"
        >
          <input
            inputMode="decimal"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            placeholder="Ej. 350"
            value={minOrderBs}
            onChange={(e) => setMinOrderBs(e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={form.cardPaymentAvailable}
            onChange={(e) => setForm({ ...form, cardPaymentAvailable: e.target.checked })}
          />
          Pago con tarjeta disponible
        </label>
        <Field
          className="md:col-span-2"
          label="Pie del ticket"
          hint="Texto al final del mensaje de WhatsApp. El cliente no tiene que responder."
        >
          <textarea
            className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ej. Gracias por tu compra. Este mensaje confirma el pedido."
            value={form.ticketFooter}
            onChange={(e) => setText('ticketFooter', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label="Horarios"
          hint="Días y horas de atención. Se muestra en la tienda."
        >
          <textarea
            className="min-h-40 w-full rounded-lg border border-slate-300 p-2 font-mono text-xs"
            value={hoursText}
            onChange={(e) => setHoursText(e.target.value)}
          />
        </Field>
        <Field label="Zonas de envío" hint="Colonias o zonas a las que llevas pedidos.">
          <textarea
            className="min-h-40 w-full rounded-lg border border-slate-300 p-2 font-mono text-xs"
            value={zonesText}
            onChange={(e) => setZonesText(e.target.value)}
          />
        </Field>
        <Field label="Redes" hint="Instagram, Facebook u otras páginas de la tienda.">
          <textarea
            className="min-h-40 w-full rounded-lg border border-slate-300 p-2 font-mono text-xs"
            value={socialText}
            onChange={(e) => setSocialText(e.target.value)}
          />
        </Field>
        <Field label="Formas de pago" hint="Cómo puede pagar el cliente. Ejemplo: Efectivo, Pago móvil.">
          <textarea
            className="min-h-40 w-full rounded-lg border border-slate-300 p-2 font-mono text-xs"
            value={paymentsText}
            onChange={(e) => setPaymentsText(e.target.value)}
          />
        </Field>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? 'Guardando…' : 'Guardar ajustes'}
      </button>
    </div>
  )
}

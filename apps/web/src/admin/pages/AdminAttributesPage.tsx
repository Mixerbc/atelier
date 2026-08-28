import { useEffect, useState } from 'react'
import { adminApi, ApiError } from '../../lib/api'
import { COLOR_PALETTE, SIZE_GROUPS, sizeLabelsForGroup } from '../../lib/catalogOptions'
import { toast } from '../../store/toastStore'
import { ColorPalettePicker } from '../components/ColorPalettePicker'
import type { Attribute } from '../../types'

export function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [paletteHex, setPaletteHex] = useState('#000000')
  const [colorName, setColorName] = useState('')
  const [customTone, setCustomTone] = useState(false)

  const colorAttr = attributes.find((item) => item.slug === 'color')
  const defaultNames = new Set(COLOR_PALETTE.map((color) => color.name.toLowerCase()))
  const customColors = (colorAttr?.values ?? []).filter(
    (value) => !defaultNames.has(value.name.toLowerCase()),
  )

  const load = async () => {
    setAttributes(await adminApi.getAttributes())
  }

  useEffect(() => {
    void load().catch(() => toast('error', 'No se pudieron cargar tallas y colores'))
  }, [])

  const saveColor = async (name: string, hex: string) => {
    if (!colorAttr) return
    const trimmed = name.trim()
    if (!trimmed) {
      toast('error', 'Escribe el nombre del tono')
      return
    }
    const existing = colorAttr.values.find(
      (value) =>
        value.name.toLowerCase() === trimmed.toLowerCase() ||
        (value.hexCode || '').toUpperCase() === hex.toUpperCase(),
    )
    if (existing) {
      toast('success', `${existing.name} ya está en la paleta`)
      setCustomTone(false)
      return
    }
    try {
      await adminApi.createAttributeValue(colorAttr.id, {
        name: trimmed,
        hexCode: hex.toUpperCase(),
        abbreviation: trimmed.slice(0, 3).toUpperCase(),
      })
      toast('success', `${trimmed} quedó en la paleta`)
      setColorName('')
      setCustomTone(false)
      await load()
    } catch (error) {
      toast('error', error instanceof ApiError ? error.message : 'Ese color ya existe o no se pudo guardar')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Tallas y colores</h1>
        <p className="text-sm text-atelier-gray">
          En cada producto eliges un grupo de tallas y los 5 colores base.
        </p>
      </div>

      <section className="rounded-2xl border border-atelier-blush bg-atelier-white p-4">
        <h2 className="font-semibold">Grupos de talla</h2>
        <p className="mt-1 text-sm text-atelier-gray">
          Ya están creados. En el producto solo escoges el grupo.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SIZE_GROUPS.map((group) => (
            <article key={group.id} className="rounded-2xl border border-atelier-blush bg-atelier-cream/50 p-4">
              <h3 className="font-display text-xl text-atelier-dark">{group.name}</h3>
              <p className="mt-1 text-xs text-atelier-gray">{group.hint}</p>
              <p className="mt-3 text-sm font-semibold tracking-wide text-atelier-gold">
                {sizeLabelsForGroup(group.id)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-atelier-blush bg-atelier-white p-4">
        <h2 className="font-semibold">Paleta de colores</h2>
        <p className="mt-1 text-sm text-atelier-gray">
          Cinco tonos normales. Si quieres otro, ármalo con Otro tono.
        </p>
        <div className="mt-4">
          <ColorPalettePicker
            selectedHexes={COLOR_PALETTE.map((color) => color.hex)}
            extraColors={customColors.map((value) => ({
              id: value.id,
              name: value.name,
              hex: value.hexCode || '#CCCCCC',
            }))}
            customHex={paletteHex}
            onPick={(color, source) => {
              setPaletteHex(color.hex)
              if (source === 'preset') return
              setCustomTone(true)
              setColorName('')
            }}
          />
        </div>
        {customTone ? (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              className="h-11 flex-1 rounded-xl border border-atelier-blush px-3 text-sm"
              placeholder="Nombre del tono"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
            />
            <button
              type="button"
              onClick={() => void saveColor(colorName, paletteHex)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-atelier-dark px-4 text-sm font-semibold text-white"
            >
              <span
                className="h-4 w-4 rounded-full border border-white/30"
                style={{ backgroundColor: paletteHex }}
              />
              Guardar tono
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}

import { COLOR_PALETTE } from '../../lib/catalogOptions'

interface PaletteSwatch {
  id?: string
  name: string
  hex: string
}

interface ColorPalettePickerProps {
  selectedHexes?: string[]
  extraColors?: PaletteSwatch[]
  onPick: (color: PaletteSwatch, source: 'preset' | 'custom') => void
  customHex: string
}

function isLight(hex: string) {
  const value = hex.replace('#', '')
  if (value.length < 6) return false
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 186
}

function SwatchButton({
  color,
  selected,
  onClick,
}: {
  color: PaletteSwatch
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={color.name}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 ${selected ? '' : 'opacity-90 hover:opacity-100'}`}
      aria-label={color.name}
      aria-pressed={selected}
    >
      <span
        className={`h-10 w-10 rounded-full border shadow-sm transition ${
          selected ? 'scale-110 ring-2 ring-atelier-gold ring-offset-2' : ''
        } ${isLight(color.hex) ? 'border-atelier-gray/35' : 'border-black/10'}`}
        style={{ backgroundColor: color.hex }}
      />
      <span className="text-[11px] font-semibold text-atelier-dark">{color.name}</span>
    </button>
  )
}

export function ColorPalettePicker({
  selectedHexes = [],
  extraColors = [],
  onPick,
  customHex,
}: ColorPalettePickerProps) {
  const selected = new Set(selectedHexes.map((hex) => hex.toLowerCase()))
  const defaultHexes = new Set(COLOR_PALETTE.map((color) => color.hex.toLowerCase()))
  const defaultNames = new Set(COLOR_PALETTE.map((color) => color.name.toLowerCase()))
  const extras = extraColors.filter(
    (color) =>
      !defaultHexes.has(color.hex.toLowerCase()) && !defaultNames.has(color.name.toLowerCase()),
  )

  return (
    <div className="space-y-4 rounded-2xl border border-atelier-blush bg-atelier-cream/40 p-3">
      <div className="flex flex-wrap gap-4">
        {COLOR_PALETTE.map((color) => (
          <SwatchButton
            key={color.name}
            color={color}
            selected={selected.has(color.hex.toLowerCase())}
            onClick={() => onPick(color, 'preset')}
          />
        ))}
      </div>

      {extras.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.14em] text-atelier-gray uppercase">
            Personalizados
          </p>
          <div className="flex flex-wrap gap-4">
            {extras.map((color) => (
              <SwatchButton
                key={color.id ?? `${color.name}-${color.hex}`}
                color={color}
                selected={selected.has(color.hex.toLowerCase())}
                onClick={() => onPick(color, 'preset')}
              />
            ))}
          </div>
        </div>
      ) : null}

      <label className="flex items-center gap-3 rounded-xl border border-dashed border-atelier-gold/70 bg-atelier-white px-3 py-2 text-sm">
        <input
          type="color"
          value={customHex}
          onChange={(event) =>
            onPick({ name: 'Personalizado', hex: event.target.value.toUpperCase() }, 'custom')
          }
          className="h-9 w-9 cursor-pointer rounded-full border-0 bg-transparent p-0"
        />
        <span className="text-atelier-dark">
          Otro tono
          <span className="block text-xs text-atelier-gray">Ármalo: elige el color y ponle nombre</span>
        </span>
      </label>
    </div>
  )
}

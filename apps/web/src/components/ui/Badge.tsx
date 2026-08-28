interface BadgeProps {
  label: string
  tone?: 'pink' | 'gold' | 'success' | 'danger' | 'muted' | 'soft'
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
  pink: 'bg-atelier-pink text-atelier-dark',
  gold: 'bg-atelier-soft-gold text-atelier-dark',
  success: 'bg-atelier-success text-white',
  danger: 'bg-atelier-danger text-white',
  muted: 'bg-atelier-gray text-white',
  soft: 'bg-atelier-soft-pink text-atelier-dark',
}

export function Badge({ label, tone = 'pink' }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase ${tones[tone]}`}
    >
      {label}
    </span>
  )
}

export function ProductBadges({
  tags,
  available,
  onSale = false,
}: {
  tags: Array<'nuevo' | 'popular'>
  available: boolean
  onSale?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {!available ? <Badge label="Agotado" tone="muted" /> : null}
      {available && onSale ? <Badge label="Oferta" tone="danger" /> : null}
      {available && tags.includes('nuevo') ? <Badge label="Nuevo" tone="success" /> : null}
      {available && tags.includes('popular') ? <Badge label="Destacado" tone="gold" /> : null}
    </div>
  )
}

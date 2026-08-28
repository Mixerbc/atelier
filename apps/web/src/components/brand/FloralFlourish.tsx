interface FloralFlourishProps {
  className?: string
}

export function FloralFlourish({ className = '' }: FloralFlourishProps) {
  return (
    <svg
      viewBox="0 0 220 28"
      className={`floral-flourish ${className}`}
      aria-hidden
    >
      <path
        d="M10 14h70c12 0 16-8 30-8s18 8 30 8 16-8 30-8 18 8 30 8h10"
        fill="none"
        stroke="#d7b77a"
        strokeWidth="1.2"
      />
      <circle cx="110" cy="14" r="3.2" fill="#e7a6c8" />
      <circle cx="110" cy="14" r="1.4" fill="#b88a4a" />
      <path d="M98 10c6 2 8 6 12 4-6 3-10 8-16 6 3-3 4-8 4-10z" fill="#f5cee2" />
      <path d="M122 10c-6 2-8 6-12 4 6 3 10 8 16 6-3-3-4-8-4-10z" fill="#f4cdbb" />
    </svg>
  )
}

export function RoseMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#fff8f2" />
      <path
        d="M24 12c6 4 8 9 8 13s-3 9-8 11c-5-2-8-7-8-11s2-9 8-13z"
        fill="#e7a6c8"
      />
      <path d="M24 16c4 3 5 6 5 9s-2 6-5 8c-3-2-5-5-5-8s1-6 5-9z" fill="#f5cee2" />
      <circle cx="24" cy="25" r="3" fill="#b88a4a" />
    </svg>
  )
}

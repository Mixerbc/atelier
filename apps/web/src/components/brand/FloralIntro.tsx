import { useEffect, useState } from 'react'
import { BrandLogo } from './BrandLogo'
import { FloralFlourish, RoseMark } from './FloralFlourish'

const PETALS = Array.from({ length: 18 }, (_, index) => index)

export function FloralIntro() {
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const leave = window.setTimeout(() => setLeaving(true), 3200)
    const hide = window.setTimeout(() => setVisible(false), 4000)
    return () => {
      window.clearTimeout(leave)
      window.clearTimeout(hide)
    }
  }, [])

  if (!visible) return null

  const dismiss = () => {
    setLeaving(true)
    window.setTimeout(() => setVisible(false), 700)
  }

  return (
    <div
      className={`floral-intro ${leaving ? 'is-leaving' : ''}`}
      role="dialog"
      aria-label="Bienvenida a Atelier"
      aria-modal="true"
    >
      <div className="floral-intro-wash" />
      {PETALS.map((petal) => (
        <span
          key={petal}
          className={`intro-petal intro-petal-${(petal % 6) + 1}`}
          style={{
            left: `${6 + ((petal * 17) % 88)}%`,
            animationDelay: `${0.05 + petal * 0.08}s`,
            animationDuration: `${2.4 + (petal % 4) * 0.25}s`,
          }}
        />
      ))}

      <div className="floral-intro-center">
        <RoseMark className="intro-rose h-16 w-16 sm:h-20 sm:w-20" />
        <BrandLogo to={null} size="lg" glow className="intro-logo" />
        <FloralFlourish className="intro-flourish mx-auto h-7 w-48" />
        <p className="intro-kicker">Colección de temporada</p>
        <button type="button" className="intro-skip" onClick={dismiss}>
          Entrar
        </button>
      </div>
    </div>
  )
}

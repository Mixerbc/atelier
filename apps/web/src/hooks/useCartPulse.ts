import { useEffect, useRef, useState } from 'react'
import { useCartCount } from '../store/cartStore'

export function useCartPulse(): boolean {
  const count = useCartCount()
  const previous = useRef(count)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (count > previous.current) {
      setPulse(true)
      const timer = window.setTimeout(() => setPulse(false), 300)
      previous.current = count
      return () => window.clearTimeout(timer)
    }
    previous.current = count
    return undefined
  }, [count])

  return pulse
}

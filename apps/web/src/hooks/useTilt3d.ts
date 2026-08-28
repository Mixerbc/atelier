import { useCallback, useRef, type MouseEvent, type TouchEvent } from 'react'

interface UseTilt3dOptions {
  maxTilt?: number
  scale?: number
  disabled?: boolean
}

export function useTilt3d({ maxTilt = 10, scale = 1.02, disabled = false }: UseTilt3dOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)

  const reset = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform =
      'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }, [])

  const applyTilt = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled) return
      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const x = (clientX - rect.left) / rect.width - 0.5
      const y = (clientY - rect.top) / rect.height - 0.5

      el.style.transform = `perspective(1000px) rotateX(${(-y * maxTilt).toFixed(2)}deg) rotateY(${(x * maxTilt).toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
    },
    [disabled, maxTilt, scale],
  )

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      applyTilt(event.clientX, event.clientY)
    },
    [applyTilt],
  )

  const onTouchMove = useCallback(
    (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      applyTilt(touch.clientX, touch.clientY)
    },
    [applyTilt],
  )

  return {
    ref,
    tiltHandlers: {
      onMouseMove,
      onMouseLeave: reset,
      onTouchMove,
      onTouchEnd: reset,
    },
  }
}

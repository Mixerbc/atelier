import { useEffect, useState } from 'react'

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => setIsMobile(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [breakpoint])

  return isMobile
}

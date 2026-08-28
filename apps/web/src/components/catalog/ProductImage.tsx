import { mediaUrl } from '../../lib/api'

interface ProductImageProps {
  src: string
  alt: string
  className?: string
}

export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const resolved = mediaUrl(src)

  return (
    <img
      src={resolved}
      alt={alt}
      className={`h-full w-full object-cover ${className}`}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.src = '/logo.svg'
      }}
    />
  )
}

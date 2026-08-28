export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-atelier-blush/70 ${className}`} />
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-[3/4] rounded-none shadow-[0_10px_28px_rgba(0,0,0,0.08)]" />
      <div className="mt-4 space-y-3 px-2">
        <Skeleton className="mx-auto h-4 w-[80%]" />
        <Skeleton className="mx-auto h-4 w-1/3" />
        <Skeleton className="h-11 w-full rounded-none" />
      </div>
    </div>
  )
}

type SkeletonProps = {
  width?: string
  height?: string
}

export const Skeleton = ({ width = "w-20", height = "h-5" }: SkeletonProps) => (
  <div className={`bg-skeleton animate-pulse rounded ${width} ${height}`} />
)

type SkeletonProps = {
  width?: string
  height?: string
}

export const Skeleton = ({ width = 'w-20', height = 'h-5' }: SkeletonProps) => (
  <div className={`rounded bg-gray-300 dark:bg-gray-700 animate-pulse ${width} ${height}`} />
)

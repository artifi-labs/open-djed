import { Skeleton } from './Skeleton'

type SkeletonWrapper = {
  isPending: boolean
  children: React.ReactNode
}

export const SkeletonWrapper = ({ isPending, children }: SkeletonWrapper) => (
  <div className={`flex flex-col items-end ${isPending ? 'gap-2' : ''}`}>
    {isPending ? (
      <>
        <Skeleton width="w-36" />
        <Skeleton width="w-24" height="h-4" />
      </>
    ) : (
      children
    )}
  </div>
)

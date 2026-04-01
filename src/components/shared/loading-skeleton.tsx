'use client'

import { Skeleton } from '@/components/ui/skeleton'

interface LoadingSkeletonProps {
  variant: 'card' | 'list' | 'chart' | 'form'
  count?: number
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-5 w-5 rounded" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-14 rounded-full" />
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border p-4 space-y-4">
      <Skeleton className="h-4 w-40" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
      <Skeleton className="h-9 w-24 rounded-md" />
    </div>
  )
}

const VARIANT_MAP = {
  card: CardSkeleton,
  list: ListSkeleton,
  chart: ChartSkeleton,
  form: FormSkeleton,
}

export function LoadingSkeleton({ variant, count = 1 }: LoadingSkeletonProps) {
  const Component = VARIANT_MAP[variant]

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  )
}

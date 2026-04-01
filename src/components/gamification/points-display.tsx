'use client'

import { StarIcon } from 'lucide-react'

interface PointsDisplayProps {
  points: number
}

function formatPoints(points: number): string {
  if (points >= 10000) return `${(points / 1000).toFixed(1)}k`
  return points.toLocaleString('pl-PL')
}

export function PointsDisplay({ points }: PointsDisplayProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
      <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
      <span>{formatPoints(points)}</span>
    </div>
  )
}

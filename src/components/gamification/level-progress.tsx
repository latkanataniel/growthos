'use client'

import { getProgressToNextLevel } from '@/lib/gamification/levels'

interface LevelProgressProps {
  points: number
}

export function LevelProgress({ points }: LevelProgressProps) {
  const { currentLevel, nextLevelThreshold, currentLevelThreshold, progress } =
    getProgressToNextLevel(points)

  const pointsToNext = nextLevelThreshold - points
  const isMaxLevel = progress >= 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          Poziom {currentLevel}
        </span>
        {!isMaxLevel && (
          <span className="text-xs text-muted-foreground">
            {pointsToNext} pkt do następnego poziomu
          </span>
        )}
        {isMaxLevel && (
          <span className="text-xs text-muted-foreground">Maksymalny poziom</span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {!isMaxLevel && (
        <p className="text-[11px] text-muted-foreground">
          {points - currentLevelThreshold} / {nextLevelThreshold - currentLevelThreshold} pkt
        </p>
      )}
    </div>
  )
}

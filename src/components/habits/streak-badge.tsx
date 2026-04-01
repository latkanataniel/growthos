'use client'

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface StreakBadgeProps {
  streak: number
  longestStreak: number
}

export function StreakBadge({ streak, longestStreak }: StreakBadgeProps) {
  if (streak <= 0) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Badge variant="secondary" className="tabular-nums">
              {'\uD83D\uDD25'} {streak} dni
            </Badge>
          }
        />
        <TooltipContent>
          Najdluzsza seria: {longestStreak} dni
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

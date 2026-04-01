'use client'

import type { Habit } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StreakBadge } from '@/components/habits/streak-badge'
import { cn } from '@/lib/utils'
import { CheckIcon } from 'lucide-react'

interface HabitCardProps {
  habit: Habit
  isCompletedToday: boolean
  onToggle: () => void
}

export function HabitCard({ habit, isCompletedToday, onToggle }: HabitCardProps) {
  return (
    <Card size="sm" className="relative transition-shadow hover:shadow-md">
      {habit.color && (
        <div
          className="absolute inset-y-0 left-0 w-1 rounded-l-xl"
          style={{ backgroundColor: habit.color }}
        />
      )}
      <CardContent className="flex items-center gap-3">
        <Button
          variant={isCompletedToday ? 'default' : 'outline'}
          size="icon-sm"
          className={cn(
            'shrink-0 rounded-full transition-all',
            isCompletedToday && 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600'
          )}
          onClick={onToggle}
        >
          {isCompletedToday && <CheckIcon className="size-3.5" />}
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          {habit.icon && (
            <span className="shrink-0 text-lg">{habit.icon}</span>
          )}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'truncate text-sm font-medium',
                isCompletedToday && 'text-muted-foreground line-through'
              )}
            >
              {habit.name}
            </p>
          </div>
        </div>

        <StreakBadge
          streak={habit.current_streak}
          longestStreak={habit.longest_streak}
        />
      </CardContent>
    </Card>
  )
}

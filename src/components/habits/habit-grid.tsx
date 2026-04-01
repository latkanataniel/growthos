'use client'

import type { Habit } from '@/types/database'
import { HabitCard } from '@/components/habits/habit-card'

interface HabitGridProps {
  habits: Habit[]
  completions: Record<string, boolean>
  onToggle: (habitId: string) => void
}

export function HabitGrid({ habits, completions, onToggle }: HabitGridProps) {
  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Brak nawykow. Dodaj swoj pierwszy nawyk, aby zaczac sledzic postepy.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          isCompletedToday={completions[habit.id] ?? false}
          onToggle={() => onToggle(habit.id)}
        />
      ))}
    </div>
  )
}

import { POINTS } from '@/lib/constants'
import type { TaskPriority } from '@/types/database'

export function getTaskPoints(priority: TaskPriority): number {
  switch (priority) {
    case 'low': return POINTS.TASK_COMPLETE_LOW
    case 'medium': return POINTS.TASK_COMPLETE_MEDIUM
    case 'high': return POINTS.TASK_COMPLETE_HIGH
    case 'urgent': return POINTS.TASK_COMPLETE_URGENT
  }
}

export function getStreakBonus(streak: number): number {
  if (streak >= 30) return POINTS.STREAK_BONUS_30
  if (streak >= 7) return POINTS.STREAK_BONUS_7
  return 0
}

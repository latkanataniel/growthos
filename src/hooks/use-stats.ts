'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type StatsPeriod = '7d' | '30d' | '90d' | '365d'

interface DailyDataPoint {
  date: string
  tasksCompleted: number
  habitsCompleted: number
  points: number
  mood: number | null
}

interface StatsData {
  taskCompletionRate: number
  habitCompletionRate: number
  moodAverage: number | null
  totalPoints: number
  pointsInPeriod: number
  tasksCompletedCount: number
  tasksCreatedCount: number
  habitsCompletedCount: number
  habitsTotalPossible: number
  journalEntriesCount: number
  dailyData: DailyDataPoint[]
}

interface UseStatsReturn {
  data: StatsData | null
  loading: boolean
  error: Error | null
}

function getPeriodStartDate(period: StatsPeriod): string {
  const now = new Date()
  const days = parseInt(period)
  const start = new Date(now)
  start.setDate(start.getDate() - days)
  return start.toISOString().split('T')[0]
}

function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}

export function useStats(period: StatsPeriod): UseStatsReturn {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const startDate = getPeriodStartDate(period)
      const endDate = new Date().toISOString().split('T')[0]
      const dates = getDatesInRange(startDate, endDate)

      // Fetch all data in parallel
      const [
        tasksResult,
        allTasksResult,
        habitsResult,
        completionsResult,
        journalResult,
        pointsResult,
        profileResult,
      ] = await Promise.all([
        // Tasks completed in period
        supabase
          .from('tasks')
          .select('id, completed_at, status')
          .gte('completed_at', `${startDate}T00:00:00`)
          .eq('status', 'done'),
        // All tasks created in period
        supabase
          .from('tasks')
          .select('id, created_at, status')
          .gte('created_at', `${startDate}T00:00:00`),
        // Active habits
        supabase
          .from('habits')
          .select('id, created_at')
          .eq('is_active', true),
        // Habit completions in period
        supabase
          .from('habit_completions')
          .select('id, habit_id, completed_date')
          .gte('completed_date', startDate)
          .lte('completed_date', endDate),
        // Journal entries in period
        supabase
          .from('journal_entries')
          .select('id, entry_date, mood')
          .gte('entry_date', startDate)
          .lte('entry_date', endDate),
        // Points earned in period
        supabase
          .from('point_events')
          .select('points, created_at')
          .gte('created_at', `${startDate}T00:00:00`),
        // Profile for total points
        supabase
          .from('profiles')
          .select('points')
          .single(),
      ])

      const tasksCompleted = tasksResult.data ?? []
      const allTasks = allTasksResult.data ?? []
      const habits = habitsResult.data ?? []
      const completions = completionsResult.data ?? []
      const journalEntries = journalResult.data ?? []
      const pointEvents = pointsResult.data ?? []
      const profile = profileResult.data

      // Task completion rate
      const tasksCreatedCount = allTasks.length
      const tasksCompletedCount = tasksCompleted.length
      const taskCompletionRate = tasksCreatedCount > 0
        ? Math.round((tasksCompletedCount / tasksCreatedCount) * 100)
        : 0

      // Habit completion rate
      const habitsTotalPossible = habits.length * dates.length
      const habitsCompletedCount = completions.length
      const habitCompletionRate = habitsTotalPossible > 0
        ? Math.round((habitsCompletedCount / habitsTotalPossible) * 100)
        : 0

      // Mood average
      const moodEntries = journalEntries.filter((e) => e.mood !== null)
      const moodAverage = moodEntries.length > 0
        ? Math.round(
            (moodEntries.reduce((sum, e) => sum + (e.mood ?? 0), 0) / moodEntries.length) * 10
          ) / 10
        : null

      // Points in period
      const pointsInPeriod = pointEvents.reduce((sum, e) => sum + e.points, 0)

      // Build daily data for Recharts
      const dailyData: DailyDataPoint[] = dates.map((date) => {
        const dayTasks = tasksCompleted.filter(
          (t) => t.completed_at && t.completed_at.startsWith(date)
        )
        const dayHabits = completions.filter((c) => c.completed_date === date)
        const dayPoints = pointEvents.filter(
          (p) => p.created_at.startsWith(date)
        )
        const dayMoods = journalEntries.filter(
          (e) => e.entry_date === date && e.mood !== null
        )
        const avgMood = dayMoods.length > 0
          ? Math.round(
              (dayMoods.reduce((sum, e) => sum + (e.mood ?? 0), 0) / dayMoods.length) * 10
            ) / 10
          : null

        return {
          date,
          tasksCompleted: dayTasks.length,
          habitsCompleted: dayHabits.length,
          points: dayPoints.reduce((sum, p) => sum + p.points, 0),
          mood: avgMood,
        }
      })

      setData({
        taskCompletionRate,
        habitCompletionRate,
        moodAverage,
        totalPoints: profile?.points ?? 0,
        pointsInPeriod,
        tasksCompletedCount,
        tasksCreatedCount,
        habitsCompletedCount,
        habitsTotalPossible,
        journalEntriesCount: journalEntries.length,
        dailyData,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'))
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { data, loading, error }
}

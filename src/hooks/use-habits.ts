'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { POINTS } from '@/lib/constants'
import type { Habit, HabitCompletion } from '@/types/database'

interface UseHabitsReturn {
  data: Habit[]
  loading: boolean
  error: Error | null
  createHabit: (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_streak' | 'longest_streak'>) => Promise<Habit | null>
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<Habit | null>
  deleteHabit: (id: string) => Promise<void>
  toggleCompletion: (habitId: string, date: string) => Promise<void>
  getCompletions: (habitId: string, startDate: string, endDate: string) => Promise<HabitCompletion[]>
}

export function useHabits(): UseHabitsReturn {
  const [data, setData] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: habits, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setData(habits ?? [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch habits'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHabits()

    const channel = supabase
      .channel('habits-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habits' },
        () => {
          fetchHabits()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_completions' },
        () => {
          fetchHabits()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchHabits])

  const createHabit = useCallback(
    async (
      habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_streak' | 'longest_streak'>
    ): Promise<Habit | null> => {
      try {
        setError(null)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: newHabit, error: insertError } = await supabase
          .from('habits')
          .insert({ ...habit, user_id: user.id })
          .select()
          .single()

        if (insertError) throw insertError
        return newHabit
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create habit'))
        return null
      }
    },
    []
  )

  const updateHabit = useCallback(
    async (id: string, updates: Partial<Habit>): Promise<Habit | null> => {
      try {
        setError(null)
        const { data: updated, error: updateError } = await supabase
          .from('habits')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()

        if (updateError) throw updateError
        return updated
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update habit'))
        return null
      }
    },
    []
  )

  const deleteHabit = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      const { error: deleteError } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete habit'))
    }
  }, [])

  const toggleCompletion = useCallback(
    async (habitId: string, date: string): Promise<void> => {
      try {
        setError(null)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: existing } = await supabase
          .from('habit_completions')
          .select('id')
          .eq('habit_id', habitId)
          .eq('completed_date', date)
          .maybeSingle()

        if (existing) {
          const { error: deleteError } = await supabase
            .from('habit_completions')
            .delete()
            .eq('id', existing.id)

          if (deleteError) throw deleteError
        } else {
          const { error: insertError } = await supabase
            .from('habit_completions')
            .insert({
              habit_id: habitId,
              user_id: user.id,
              completed_date: date,
            })

          if (insertError) throw insertError

          await supabase.rpc('award_points', {
            p_points: POINTS.HABIT_COMPLETE,
            p_reason: 'Habit completed',
            p_reference_id: habitId,
          })
        }

        await supabase.rpc('update_habit_streak', {
          p_habit_id: habitId,
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to toggle completion'))
      }
    },
    []
  )

  const getCompletions = useCallback(
    async (habitId: string, startDate: string, endDate: string): Promise<HabitCompletion[]> => {
      try {
        setError(null)
        const { data: completions, error: fetchError } = await supabase
          .from('habit_completions')
          .select('*')
          .eq('habit_id', habitId)
          .gte('completed_date', startDate)
          .lte('completed_date', endDate)
          .order('completed_date', { ascending: true })

        if (fetchError) throw fetchError
        return completions ?? []
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch completions'))
        return []
      }
    },
    []
  )

  return {
    data,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    getCompletions,
  }
}

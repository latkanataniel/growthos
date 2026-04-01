'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { POINTS } from '@/lib/constants'
import type { JournalEntry, TimeOfDay } from '@/types/database'

interface UseJournalReturn {
  data: JournalEntry[]
  loading: boolean
  error: Error | null
  upsertEntry: (entry: {
    entry_date: string
    time_of_day: TimeOfDay
    content?: string | null
    mood?: number | null
    prompts_responses?: Record<string, string> | null
    tags?: string[]
  }) => Promise<JournalEntry | null>
  deleteEntry: (id: string) => Promise<void>
  getHistory: (startDate: string, endDate: string) => Promise<JournalEntry[]>
}

export function useJournal(date?: string): UseJournalReturn {
  const [data, setData] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('journal_entries')
        .select('*')
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (date) {
        query = query.eq('entry_date', date)
      }

      const { data: entries, error: fetchError } = await query

      if (fetchError) throw fetchError
      setData(entries ?? [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch journal entries'))
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const upsertEntry = useCallback(
    async (entry: {
      entry_date: string
      time_of_day: TimeOfDay
      content?: string | null
      mood?: number | null
      prompts_responses?: Record<string, string> | null
      tags?: string[]
    }): Promise<JournalEntry | null> => {
      try {
        setError(null)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Check if entry already exists for this date + time_of_day
        const { data: existing } = await supabase
          .from('journal_entries')
          .select('id')
          .eq('entry_date', entry.entry_date)
          .eq('time_of_day', entry.time_of_day)
          .eq('user_id', user.id)
          .maybeSingle()

        const isNew = !existing

        let result: JournalEntry | null = null

        if (existing) {
          const { data: updated, error: updateError } = await supabase
            .from('journal_entries')
            .update({ ...entry, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single()

          if (updateError) throw updateError
          result = updated
        } else {
          const { data: created, error: insertError } = await supabase
            .from('journal_entries')
            .insert({ ...entry, user_id: user.id })
            .select()
            .single()

          if (insertError) throw insertError
          result = created
        }

        // Award points for new entries
        if (isNew && result) {
          // Check if all three time_of_day entries exist for this date
          const { count } = await supabase
            .from('journal_entries')
            .select('*', { count: 'exact', head: true })
            .eq('entry_date', entry.entry_date)
            .eq('user_id', user.id)

          const points = count === 3 ? POINTS.JOURNAL_FULL_DAY : POINTS.JOURNAL_ENTRY

          await supabase.rpc('award_points', {
            p_points: points,
            p_reason: count === 3 ? 'Full day journal completed' : 'Journal entry created',
            p_reference_id: result.id,
          })
        }

        await fetchEntries()
        return result
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to save journal entry'))
        return null
      }
    },
    [fetchEntries]
  )

  const deleteEntry = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null)
        const { error: deleteError } = await supabase
          .from('journal_entries')
          .delete()
          .eq('id', id)

        if (deleteError) throw deleteError
        await fetchEntries()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete journal entry'))
      }
    },
    [fetchEntries]
  )

  const getHistory = useCallback(
    async (startDate: string, endDate: string): Promise<JournalEntry[]> => {
      try {
        setError(null)
        const { data: entries, error: fetchError } = await supabase
          .from('journal_entries')
          .select('*')
          .gte('entry_date', startDate)
          .lte('entry_date', endDate)
          .order('entry_date', { ascending: false })
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        return entries ?? []
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch journal history'))
        return []
      }
    },
    []
  )

  return { data, loading, error, upsertEntry, deleteEntry, getHistory }
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

interface UseProfileReturn {
  data: Profile | null
  loading: boolean
  error: Error | null
  updateProfile: (updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'points' | 'level'>>) => Promise<Profile | null>
}

export function useProfile(): UseProfileReturn {
  const [data, setData] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) throw fetchError
      setData(profile)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = useCallback(
    async (
      updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'points' | 'level'>>
    ): Promise<Profile | null> => {
      try {
        setError(null)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: updated, error: updateError } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select()
          .single()

        if (updateError) throw updateError
        setData(updated)
        return updated
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update profile'))
        return null
      }
    },
    []
  )

  return { data, loading, error, updateProfile }
}

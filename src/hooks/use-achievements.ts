'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Achievement, UserAchievement } from '@/types/database'

interface UseAchievementsReturn {
  data: {
    all: Achievement[]
    unlocked: UserAchievement[]
    locked: Achievement[]
  }
  loading: boolean
  error: Error | null
  checkAchievements: () => Promise<UserAchievement[]>
}

export function useAchievements(): UseAchievementsReturn {
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([])
  const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [allResult, unlockedResult] = await Promise.all([
        supabase
          .from('achievements')
          .select('*')
          .order('type')
          .order('points', { ascending: true }),
        supabase
          .from('user_achievements')
          .select('*, achievement:achievements(*)')
          .order('unlocked_at', { ascending: false }),
      ])

      if (allResult.error) throw allResult.error
      if (unlockedResult.error) throw unlockedResult.error

      setAllAchievements(allResult.data ?? [])
      setUnlockedAchievements(unlockedResult.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch achievements'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  const checkAchievements = useCallback(async (): Promise<UserAchievement[]> => {
    try {
      setError(null)

      const { data: newlyUnlocked, error: rpcError } = await supabase.rpc('check_achievements')

      if (rpcError) throw rpcError

      // Refresh data after checking
      await fetchAchievements()

      return (newlyUnlocked as UserAchievement[]) ?? []
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check achievements'))
      return []
    }
  }, [fetchAchievements])

  const unlockedIds = new Set(unlockedAchievements.map((ua) => ua.achievement_id))
  const locked = allAchievements.filter((a) => !unlockedIds.has(a.id))

  return {
    data: {
      all: allAchievements,
      unlocked: unlockedAchievements,
      locked,
    },
    loading,
    error,
    checkAchievements,
  }
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitCompletion } from '@/types/database'
import { HabitGrid } from '@/components/habits/habit-grid'
import { HabitForm } from '@/components/habits/habit-form'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { toast } from 'sonner'

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const loadHabits = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [habitsRes, completionsRes] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at'),
      supabase.from('habit_completions').select('*').eq('user_id', user.id).eq('completed_date', today),
    ])

    if (habitsRes.data) setHabits(habitsRes.data)
    if (completionsRes.data) {
      const map: Record<string, boolean> = {}
      completionsRes.data.forEach((c: HabitCompletion) => { map[c.habit_id] = true })
      setCompletions(map)
    }
    setLoading(false)
  }, [today]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadHabits() }, [loadHabits])

  const handleSubmit = async (data: Partial<Habit>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('habits').insert({ ...data, user_id: user.id })
    if (error) { toast.error('Błąd tworzenia nawyku'); return }
    toast.success('Nawyk utworzony')
    setFormOpen(false)
    loadHabits()
  }

  const handleToggle = async (habitId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isCompleted = completions[habitId]
    if (isCompleted) {
      await supabase.from('habit_completions').delete().eq('habit_id', habitId).eq('completed_date', today)
      setCompletions(prev => { const n = { ...prev }; delete n[habitId]; return n })
    } else {
      await supabase.from('habit_completions').insert({
        habit_id: habitId,
        user_id: user.id,
        completed_date: today,
      })
      await supabase.rpc('update_habit_streak', { p_habit_id: habitId })
      await supabase.rpc('award_points', {
        p_user_id: user.id,
        p_amount: 5,
        p_reason: 'Nawyk ukończony',
        p_ref: habitId,
      })
      setCompletions(prev => ({ ...prev, [habitId]: true }))
      toast.success('+5 pkt za nawyk!')
    }
    loadHabits()
  }

  if (loading) return <LoadingSkeleton variant="card" count={6} />

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Nawyki</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nowy nawyk
        </Button>
      </div>

      <HabitGrid habits={habits} completions={completions} onToggle={handleToggle} />
      <HabitForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleSubmit} />
    </div>
  )
}

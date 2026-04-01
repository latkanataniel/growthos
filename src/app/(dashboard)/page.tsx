'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { CheckSquare, Flame, BookOpen, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Task, Habit, HabitCompletion, JournalEntry, Profile } from '@/types/database'
import { StatCard } from '@/components/stats/stat-card'
import { TaskList } from '@/components/tasks/task-list'
import { HabitGrid } from '@/components/habits/habit-grid'
import { LevelProgress } from '@/components/gamification/level-progress'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Record<string, boolean>>({})
  const [journalStatus, setJournalStatus] = useState<Record<string, boolean>>({
    morning: false,
    afternoon: false,
    evening: false,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, tasksRes, habitsRes, completionsRes, journalRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('tasks').select('*').eq('user_id', user.id).in('status', ['todo', 'in_progress']).order('priority', { ascending: false }).limit(10),
        supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('habit_completions').select('*').eq('user_id', user.id).eq('completed_date', today),
        supabase.from('journal_entries').select('time_of_day').eq('user_id', user.id).eq('entry_date', today),
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (tasksRes.data) setTodayTasks(tasksRes.data)
      if (habitsRes.data) setHabits(habitsRes.data)
      if (completionsRes.data) {
        const map: Record<string, boolean> = {}
        completionsRes.data.forEach((c: HabitCompletion) => { map[c.habit_id] = true })
        setCompletions(map)
      }
      if (journalRes.data) {
        const status = { morning: false, afternoon: false, evening: false }
        journalRes.data.forEach((e: { time_of_day: 'morning' | 'afternoon' | 'evening' }) => { status[e.time_of_day] = true })
        setJournalStatus(status)
      }
      setLoading(false)
    }
    loadDashboard()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompleteTask = async (taskId: string) => {
    const task = todayTasks.find(t => t.id === taskId)
    if (!task || !profile) return

    await supabase.from('tasks').update({
      status: 'done',
      completed_at: new Date().toISOString(),
    }).eq('id', taskId)

    const points = task.priority === 'urgent' ? 50 : task.priority === 'high' ? 30 : task.priority === 'medium' ? 20 : 10
    await supabase.rpc('award_points', {
      p_user_id: profile.id,
      p_amount: points,
      p_reason: `Ukończono zadanie: ${task.title}`,
      p_ref: taskId,
    })

    setTodayTasks(prev => prev.filter(t => t.id !== taskId))
    setProfile(prev => prev ? { ...prev, points: prev.points + points } : prev)
  }

  const handleToggleHabit = async (habitId: string) => {
    if (!profile) return
    const isCompleted = completions[habitId]

    if (isCompleted) {
      await supabase.from('habit_completions').delete().eq('habit_id', habitId).eq('completed_date', today)
      setCompletions(prev => {
        const next = { ...prev }
        delete next[habitId]
        return next
      })
    } else {
      await supabase.from('habit_completions').insert({
        habit_id: habitId,
        user_id: profile.id,
        completed_date: today,
      })
      await supabase.rpc('update_habit_streak', { p_habit_id: habitId })
      await supabase.rpc('award_points', {
        p_user_id: profile.id,
        p_amount: 5,
        p_reason: 'Nawyk ukończony',
        p_ref: habitId,
      })
      setCompletions(prev => ({ ...prev, [habitId]: true }))
      setProfile(prev => prev ? { ...prev, points: prev.points + 5 } : prev)
    }
  }

  if (loading) return <LoadingSkeleton variant="card" count={4} />

  const journalDone = Object.values(journalStatus).filter(Boolean).length
  const habitsCompleted = Object.keys(completions).length

  return (
    <div className="space-y-8 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dzień dobry{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: pl })}
        </p>
      </div>

      {profile && <LevelProgress points={profile.points} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckSquare className="h-4 w-4" />}
          label="Zadania"
          value={`${todayTasks.length} do zrobienia`}
        />
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Nawyki"
          value={`${habitsCompleted}/${habits.length}`}
        />
        <StatCard
          icon={<BookOpen className="h-4 w-4" />}
          label="Dziennik"
          value={`${journalDone}/3 sesje`}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Punkty"
          value={profile?.points ?? 0}
        />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Zadania na dziś</h2>
          <TaskList
            tasks={todayTasks}
            onComplete={handleCompleteTask}
            emptyMessage="Brak zadań na dziś. Dodaj nowe zadanie!"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Nawyki</h2>
          <HabitGrid
            habits={habits}
            completions={completions}
            onToggle={handleToggleHabit}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Dziennik</h2>
          <div className="grid grid-cols-3 gap-3">
            {(['morning', 'afternoon', 'evening'] as const).map(time => (
              <a
                key={time}
                href="/journal"
                className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                  journalStatus[time]
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
                    : 'bg-card border-border hover:border-primary/30'
                }`}
              >
                <div className="text-2xl mb-1">
                  {time === 'morning' ? '☀️' : time === 'afternoon' ? '🌤️' : '🌙'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {time === 'morning' ? 'Rano' : time === 'afternoon' ? 'Popołudnie' : 'Wieczór'}
                </div>
                {journalStatus[time] && (
                  <div className="text-xs text-green-600 mt-1">Gotowe</div>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

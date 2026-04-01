'use client'

import { useEffect, useState } from 'react'
import { format, subDays, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { Download, CheckSquare, Flame, BookOpen, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { StatCard } from '@/components/stats/stat-card'
import { ProductivityChart } from '@/components/stats/productivity-chart'
import { MoodChart } from '@/components/stats/mood-chart'
import { ActivityHeatmap } from '@/components/stats/activity-heatmap'
import { PeriodComparison } from '@/components/stats/period-comparison'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { toast } from 'sonner'

interface StatsData {
  tasksCompleted: number
  habitsCompleted: number
  journalEntries: number
  totalPoints: number
  productivityData: Array<{ date: string; completed: number }>
  moodData: Array<{ date: string; mood: number }>
  activityData: Array<{ date: string; count: number }>
  currentWeek: { tasks: number; habits: number; journal: number; points: number }
  previousWeek: { tasks: number; habits: number; journal: number; points: number }
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')
      const thisWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const thisWeekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const lastWeekStart = format(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const lastWeekEnd = format(endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 'yyyy-MM-dd')

      const [tasksRes, habitsRes, journalRes, pointsRes, tasksThisWeek, tasksLastWeek, habitsThisWeek, habitsLastWeek, journalThisWeek, journalLastWeek, pointsThisWeek, pointsLastWeek] = await Promise.all([
        supabase.from('tasks').select('completed_at').eq('user_id', user.id).eq('status', 'done').gte('completed_at', thirtyDaysAgo),
        supabase.from('habit_completions').select('completed_date').eq('user_id', user.id).gte('completed_date', thirtyDaysAgo),
        supabase.from('journal_entries').select('entry_date, mood').eq('user_id', user.id).gte('entry_date', thirtyDaysAgo),
        supabase.from('profiles').select('points').eq('id', user.id).single(),
        supabase.from('tasks').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'done').gte('completed_at', thisWeekStart).lte('completed_at', thisWeekEnd),
        supabase.from('tasks').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'done').gte('completed_at', lastWeekStart).lte('completed_at', lastWeekEnd),
        supabase.from('habit_completions').select('id', { count: 'exact' }).eq('user_id', user.id).gte('completed_date', thisWeekStart).lte('completed_date', thisWeekEnd),
        supabase.from('habit_completions').select('id', { count: 'exact' }).eq('user_id', user.id).gte('completed_date', lastWeekStart).lte('completed_date', lastWeekEnd),
        supabase.from('journal_entries').select('id', { count: 'exact' }).eq('user_id', user.id).gte('entry_date', thisWeekStart).lte('entry_date', thisWeekEnd),
        supabase.from('journal_entries').select('id', { count: 'exact' }).eq('user_id', user.id).gte('entry_date', lastWeekStart).lte('entry_date', lastWeekEnd),
        supabase.from('point_events').select('points').eq('user_id', user.id).gte('created_at', thisWeekStart).lte('created_at', thisWeekEnd),
        supabase.from('point_events').select('points').eq('user_id', user.id).gte('created_at', lastWeekStart).lte('created_at', lastWeekEnd),
      ])

      // Build productivity data
      const productivityMap: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) {
        productivityMap[format(subDays(new Date(), i), 'yyyy-MM-dd')] = 0
      }
      tasksRes.data?.forEach(t => {
        if (t.completed_at) {
          const d = format(new Date(t.completed_at), 'yyyy-MM-dd')
          if (productivityMap[d] !== undefined) productivityMap[d]++
        }
      })
      const productivityData = Object.entries(productivityMap).map(([date, completed]) => ({ date, completed }))

      // Build mood data
      const moodMap: Record<string, { total: number; count: number }> = {}
      journalRes.data?.forEach(e => {
        if (e.mood) {
          if (!moodMap[e.entry_date]) moodMap[e.entry_date] = { total: 0, count: 0 }
          moodMap[e.entry_date].total += e.mood
          moodMap[e.entry_date].count++
        }
      })
      const moodData = Object.entries(moodMap).map(([date, { total, count }]) => ({
        date,
        mood: Math.round((total / count) * 10) / 10,
      })).sort((a, b) => a.date.localeCompare(b.date))

      // Build activity heatmap
      const activityMap: Record<string, number> = {}
      tasksRes.data?.forEach(t => {
        if (t.completed_at) {
          const d = format(new Date(t.completed_at), 'yyyy-MM-dd')
          activityMap[d] = (activityMap[d] || 0) + 1
        }
      })
      habitsRes.data?.forEach(h => {
        activityMap[h.completed_date] = (activityMap[h.completed_date] || 0) + 1
      })
      const activityData = Object.entries(activityMap).map(([date, count]) => ({ date, count }))

      const pointsThisWeekTotal = pointsThisWeek.data?.reduce((acc, e) => acc + e.points, 0) || 0
      const pointsLastWeekTotal = pointsLastWeek.data?.reduce((acc, e) => acc + e.points, 0) || 0

      setStats({
        tasksCompleted: tasksRes.data?.length || 0,
        habitsCompleted: habitsRes.data?.length || 0,
        journalEntries: journalRes.data?.length || 0,
        totalPoints: pointsRes.data?.points || 0,
        productivityData,
        moodData,
        activityData,
        currentWeek: {
          tasks: tasksThisWeek.count || 0,
          habits: habitsThisWeek.count || 0,
          journal: journalThisWeek.count || 0,
          points: pointsThisWeekTotal,
        },
        previousWeek: {
          tasks: tasksLastWeek.count || 0,
          habits: habitsLastWeek.count || 0,
          journal: journalLastWeek.count || 0,
          points: pointsLastWeekTotal,
        },
      })
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = async (exportFormat: 'csv' | 'json') => {
    try {
      const res = await fetch(`/api/export?format=${exportFormat}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `growthos-export.${exportFormat}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Dane wyeksportowane')
    } catch {
      toast.error('Błąd eksportu')
    }
  }

  if (loading) return <LoadingSkeleton variant="chart" count={3} />

  if (!stats) return null

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Statystyki</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<CheckSquare className="h-4 w-4" />} label="Zadania (30d)" value={stats.tasksCompleted} />
        <StatCard icon={<Flame className="h-4 w-4" />} label="Nawyki (30d)" value={stats.habitsCompleted} />
        <StatCard icon={<BookOpen className="h-4 w-4" />} label="Dziennik (30d)" value={stats.journalEntries} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Punkty" value={stats.totalPoints} />
      </div>

      <Tabs defaultValue="productivity">
        <TabsList>
          <TabsTrigger value="productivity">Produktywność</TabsTrigger>
          <TabsTrigger value="mood">Nastrój</TabsTrigger>
          <TabsTrigger value="activity">Aktywność</TabsTrigger>
          <TabsTrigger value="comparison">Porównanie</TabsTrigger>
        </TabsList>

        <TabsContent value="productivity" className="mt-4">
          <ProductivityChart data={stats.productivityData} />
        </TabsContent>

        <TabsContent value="mood" className="mt-4">
          <MoodChart data={stats.moodData} />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <ActivityHeatmap data={stats.activityData} />
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <PeriodComparison current={stats.currentWeek} previous={stats.previousWeek} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskStatus, TaskCategory, TaskPriority } from '@/types/database'
import { TaskList } from '@/components/tasks/task-list'
import { TaskForm } from '@/components/tasks/task-form'
import { TaskFiltersBar as TaskFilters } from '@/components/tasks/task-filters'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { toast } from 'sonner'

interface Filters {
  status: TaskStatus | 'all'
  category: TaskCategory | 'all'
  priority: TaskPriority | 'all'
  search: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: '',
  })
  const supabase = createClient()

  const loadTasks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .is('parent_task_id', null)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    if (filters.status !== 'all') query = query.eq('status', filters.status)
    if (filters.category !== 'all') query = query.eq('category', filters.category)
    if (filters.priority !== 'all') query = query.eq('priority', filters.priority)
    if (filters.search) query = query.ilike('title', `%${filters.search}%`)

    const { data, error } = await query
    if (error) {
      toast.error('Błąd ładowania zadań')
      return
    }
    setTasks(data || [])
    setLoading(false)
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        loadTasks()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (data: Partial<Task>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingTask) {
      const { error } = await supabase.from('tasks').update(data).eq('id', editingTask.id)
      if (error) { toast.error('Błąd aktualizacji'); return }
      toast.success('Zadanie zaktualizowane')
    } else {
      const { error } = await supabase.from('tasks').insert({ ...data, user_id: user.id })
      if (error) { toast.error('Błąd tworzenia'); return }
      toast.success('Zadanie utworzone')
    }
    setFormOpen(false)
    setEditingTask(undefined)
    loadTasks()
  }

  const handleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('tasks').update({
      status: 'done',
      completed_at: new Date().toISOString(),
    }).eq('id', taskId)

    const points = task.priority === 'urgent' ? 50 : task.priority === 'high' ? 30 : task.priority === 'medium' ? 20 : 10
    await supabase.rpc('award_points', {
      p_user_id: user.id,
      p_amount: points,
      p_reason: `Ukończono zadanie: ${task.title}`,
      p_ref: taskId,
    })

    toast.success(`+${points} pkt za ukończenie zadania!`)
    loadTasks()
  }

  if (loading) return <LoadingSkeleton variant="list" count={5} />

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Zadania</h1>
        <Button onClick={() => { setEditingTask(undefined); setFormOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Nowe zadanie
        </Button>
      </div>

      <TaskFilters filters={filters} onFiltersChange={setFilters} />

      <TaskList
        tasks={tasks}
        onComplete={handleComplete}
        emptyMessage="Brak zadań pasujących do filtrów"
      />

      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { Task } from '@/types/database'
import { TaskForm } from '@/components/tasks/task-form'
import { SubtaskList } from '@/components/tasks/subtask-list'
import { DelegationCard } from '@/components/tasks/delegation-card'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [subtasks, setSubtasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [subtaskFormOpen, setSubtaskFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [delegationLoading, setDelegationLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', params.id)
        .single()

      if (taskData) {
        setTask(taskData)
        const { data: subs } = await supabase
          .from('tasks')
          .select('*')
          .eq('parent_task_id', params.id)
          .order('position')
        setSubtasks(subs || [])
      }
      setLoading(false)
    }
    load()
  }, [params.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdate = async (data: Partial<Task>) => {
    if (!task) return
    const { error } = await supabase.from('tasks').update(data).eq('id', task.id)
    if (error) { toast.error('Błąd aktualizacji'); return }
    setTask({ ...task, ...data } as Task)
    setEditOpen(false)
    toast.success('Zadanie zaktualizowane')
  }

  const handleDelete = async () => {
    if (!task) return
    await supabase.from('tasks').delete().eq('id', task.id)
    toast.success('Zadanie usunięte')
    router.push('/tasks')
  }

  const handleCreateSubtask = async (data: Partial<Task>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !task) return

    const { error } = await supabase.from('tasks').insert({
      ...data,
      user_id: user.id,
      parent_task_id: task.id,
    })
    if (error) { toast.error('Błąd'); return }
    toast.success('Podzadanie utworzone')
    setSubtaskFormOpen(false)

    const { data: subs } = await supabase.from('tasks').select('*').eq('parent_task_id', task.id).order('position')
    setSubtasks(subs || [])
  }

  const handleCompleteSubtask = async (subtaskId: string) => {
    const sub = subtasks.find(s => s.id === subtaskId)
    if (!sub) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('tasks').update({ status: 'done', completed_at: new Date().toISOString() }).eq('id', subtaskId)
    const points = sub.priority === 'urgent' ? 50 : sub.priority === 'high' ? 30 : sub.priority === 'medium' ? 20 : 10
    await supabase.rpc('award_points', { p_user_id: user.id, p_amount: points, p_reason: `Podzadanie: ${sub.title}`, p_ref: subtaskId })
    toast.success(`+${points} pkt`)

    const { data: subs } = await supabase.from('tasks').select('*').eq('parent_task_id', task!.id).order('position')
    setSubtasks(subs || [])
  }

  const handleAnalyzeDelegation = async () => {
    if (!task) return
    setDelegationLoading(true)
    try {
      const res = await fetch('/api/ai/delegate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id }),
      })
      const data = await res.json()
      if (data.error) { toast.error(data.error); return }

      await supabase.from('tasks').update({ delegation_suggestion: data }).eq('id', task.id)
      setTask({ ...task, delegation_suggestion: data })
      toast.success('Analiza zakończona')
    } catch {
      toast.error('Błąd analizy')
    } finally {
      setDelegationLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton variant="form" />
  if (!task) return <div className="py-12 text-center text-muted-foreground">Zadanie nie znalezione</div>

  return (
    <div className="space-y-6 py-6 max-w-3xl">
      <Button variant="ghost" onClick={() => router.push('/tasks')} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Powrót
      </Button>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
          <div className="flex gap-2 flex-wrap">
            <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
            <Badge variant="outline">{task.category === 'private' ? 'Prywatne' : 'Zawodowe'}</Badge>
            <Badge variant="outline">{task.status === 'todo' ? 'Do zrobienia' : task.status === 'in_progress' ? 'W trakcie' : task.status === 'done' ? 'Ukończone' : 'Anulowane'}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setDeleteOpen(true)} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {task.description && (
        <Card className="p-4">
          <p className="text-sm whitespace-pre-wrap">{task.description}</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        {task.due_date && (
          <div>
            <span className="text-muted-foreground">Termin: </span>
            {format(new Date(task.due_date), 'd MMMM yyyy', { locale: pl })}
          </div>
        )}
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {task.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Podzadania</h2>
          <Button variant="outline" size="sm" onClick={() => setSubtaskFormOpen(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Dodaj
          </Button>
        </div>
        <SubtaskList
          parentTaskId={task.id}
          subtasks={subtasks}
          onComplete={handleCompleteSubtask}
          onCreate={() => setSubtaskFormOpen(true)}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Delegowanie (AI)</h2>
        <DelegationCard
          suggestion={task.delegation_suggestion}
          loading={delegationLoading}
          onAnalyze={handleAnalyzeDelegation}
        />
      </div>

      <TaskForm open={editOpen} onOpenChange={setEditOpen} task={task} onSubmit={handleUpdate} />
      <TaskForm open={subtaskFormOpen} onOpenChange={setSubtaskFormOpen} parentTaskId={task.id} onSubmit={handleCreateSubtask} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Usuń zadanie"
        description="Czy na pewno chcesz usunąć to zadanie? Wszystkie podzadania również zostaną usunięte."
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}

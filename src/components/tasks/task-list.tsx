'use client'

import type { Task } from '@/types/database'
import { TaskCard } from '@/components/tasks/task-card'
import { InboxIcon } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onComplete: (id: string) => void
  emptyMessage?: string
}

export function TaskList({
  tasks,
  onComplete,
  emptyMessage = 'Brak zadań do wyświetlenia.',
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <InboxIcon className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onComplete={onComplete} />
      ))}
    </div>
  )
}

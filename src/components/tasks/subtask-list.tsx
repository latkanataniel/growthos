'use client'

import type { Task } from '@/types/database'
import { TaskCard } from '@/components/tasks/task-card'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

interface SubtaskListProps {
  parentTaskId: string
  subtasks: Task[]
  onComplete: (id: string) => void
  onCreate: () => void
}

export function SubtaskList({
  parentTaskId,
  subtasks,
  onComplete,
  onCreate,
}: SubtaskListProps) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Podzadania{' '}
          <span className="text-muted-foreground">({subtasks.length})</span>
        </h3>
        <Button variant="ghost" size="sm" onClick={onCreate}>
          <PlusIcon className="mr-1 h-3.5 w-3.5" />
          Dodaj podzadanie
        </Button>
      </div>

      {subtasks.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Brak podzadań. Kliknij przycisk, aby dodać.
        </p>
      ) : (
        <div className="grid gap-1.5">
          {subtasks.map((subtask) => (
            <TaskCard
              key={subtask.id}
              task={subtask}
              onComplete={onComplete}
              compact
            />
          ))}
        </div>
      )}
    </div>
  )
}

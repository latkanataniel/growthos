'use client'

import { useRouter } from 'next/navigation'
import type { Task, TaskPriority } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon } from 'lucide-react'

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: {
    label: 'Niski',
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
  medium: {
    label: 'Średni',
    className: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  },
  high: {
    label: 'Wysoki',
    className: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  },
  urgent: {
    label: 'Pilny',
    className: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
  },
}

const categoryLabels: Record<string, string> = {
  private: 'Prywatne',
  professional: 'Zawodowe',
}

interface TaskCardProps {
  task: Task
  onComplete: (id: string) => void
  compact?: boolean
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
  })
}

export function TaskCard({ task, onComplete, compact = false }: TaskCardProps) {
  const router = useRouter()
  const priority = priorityConfig[task.priority]
  const isDone = task.status === 'done'

  function handleClick() {
    router.push(`/tasks/${task.id}`)
  }

  function handleCheckbox(e: React.MouseEvent) {
    e.stopPropagation()
    onComplete(task.id)
  }

  return (
    <Card
      className={`cursor-pointer transition-shadow hover:shadow-md ${
        compact ? 'py-2' : ''
      } ${isDone ? 'opacity-60' : ''}`}
      onClick={handleClick}
    >
      <CardContent className={compact ? 'flex items-center gap-3' : ''}>
        <div className={`flex ${compact ? 'flex-1 items-center gap-3' : 'flex-col gap-3'}`}>
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={handleCheckbox}
              className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                isDone
                  ? 'border-slate-400 bg-slate-400'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              aria-label={isDone ? 'Oznacz jako nieukończone' : 'Oznacz jako ukończone'}
            >
              {isDone && (
                <svg
                  viewBox="0 0 12 12"
                  className="h-2.5 w-2.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.5 6l2.5 2.5 4.5-4.5" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium leading-snug ${
                  isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}
              >
                {task.title}
              </p>
            </div>
          </div>

          {!compact && (
            <div className="flex flex-wrap items-center gap-1.5 pl-7.5">
              <Badge className={priority.className}>{priority.label}</Badge>
              <Badge variant="outline">{categoryLabels[task.category]}</Badge>

              {task.due_date && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarIcon className="h-3 w-3" />
                  {formatDate(task.due_date)}
                </span>
              )}

              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {compact && (
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge className={priority.className}>{priority.label}</Badge>
              {task.due_date && (
                <span className="text-xs text-muted-foreground">
                  {formatDate(task.due_date)}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

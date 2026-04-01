'use client'

import { useState, useEffect } from 'react'
import { taskSchema } from '@/lib/validators'
import type { Task, TaskCategory, TaskPriority } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface TaskFormData {
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  due_date?: string | null
  tags?: string[]
  parent_task_id?: string | null
}

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  parentTaskId?: string
  onSubmit: (data: TaskFormData) => void
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  parentTaskId,
  onSubmit,
}: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TaskCategory>('private')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!task

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setCategory(task.category)
      setPriority(task.priority)
      setDueDate(task.due_date ?? '')
      setTagsInput(task.tags.join(', '))
    } else {
      setTitle('')
      setDescription('')
      setCategory('private')
      setPriority('medium')
      setDueDate('')
      setTagsInput('')
    }
    setErrors({})
  }, [task, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const data: TaskFormData = {
      title,
      description: description || undefined,
      category,
      priority,
      due_date: dueDate || null,
      tags,
      parent_task_id: parentTaskId ?? null,
    }

    const result = taskSchema.safeParse(data)

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    onSubmit(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edytuj zadanie' : 'Nowe zadanie'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Zaktualizuj szczegóły zadania.'
              : 'Wypełnij formularz, aby dodać nowe zadanie.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="task-title">Tytuł</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nazwa zadania"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="task-description">Opis</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcjonalny opis..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Kategoria</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Prywatne</SelectItem>
                  <SelectItem value="professional">Zawodowe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label>Priorytet</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niski</SelectItem>
                  <SelectItem value="medium">Średni</SelectItem>
                  <SelectItem value="high">Wysoki</SelectItem>
                  <SelectItem value="urgent">Pilny</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="task-due-date">Termin</Label>
            <Input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="task-tags">Tagi</Label>
            <Input
              id="task-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="np. praca, dom, pilne"
            />
            <p className="text-xs text-muted-foreground">
              Rozdziel przecinkami
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit">
              {isEditing ? 'Zapisz' : 'Utwórz'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { z } from 'zod'
import type { Habit } from '@/types/database'
import { habitSchema } from '@/lib/validators'
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
import { cn } from '@/lib/utils'

const COLOR_PALETTE = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
] as const

type HabitFormData = z.infer<typeof habitSchema>

interface HabitFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit?: Habit
  onSubmit: (data: HabitFormData) => void
}

export function HabitForm({ open, onOpenChange, habit, onSubmit }: HabitFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [name, setName] = useState(habit?.name ?? '')
  const [description, setDescription] = useState(habit?.description ?? '')
  const [frequency, setFrequency] = useState<string>(habit?.frequency ?? 'daily')
  const [category, setCategory] = useState(habit?.category ?? '')
  const [color, setColor] = useState(habit?.color ?? COLOR_PALETTE[0].value)
  const [icon, setIcon] = useState(habit?.icon ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const data: HabitFormData = {
      name,
      description: description || undefined,
      frequency: frequency as HabitFormData['frequency'],
      category: category || undefined,
      color,
      icon: icon || undefined,
    }

    const result = habitSchema.safeParse(data)

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string') {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    onSubmit(result.data)
  }

  const isEditing = Boolean(habit)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edytuj nawyk' : 'Nowy nawyk'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Zaktualizuj szczegoly nawyku.'
              : 'Dodaj nowy nawyk do sledzenia.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="habit-name">Nazwa</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Medytacja"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="habit-description">Opis</Label>
            <Textarea
              id="habit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcjonalny opis nawyku..."
              rows={2}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Czestotliwosc</Label>
              <Select value={frequency} onValueChange={(v) => v && setFrequency(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Codziennie</SelectItem>
                  <SelectItem value="weekly">Co tydzien</SelectItem>
                  <SelectItem value="custom">Niestandardowa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="habit-category">Kategoria</Label>
              <Input
                id="habit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="np. Zdrowie"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Kolor</Label>
            <div className="flex gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'size-8 rounded-full border-2 transition-transform hover:scale-110',
                    color === c.value
                      ? 'border-foreground scale-110'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="habit-icon">Ikona (emoji)</Label>
            <Input
              id="habit-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="np. \uD83E\uDDD8"
              className="w-20"
            />
          </div>

          <DialogFooter>
            <Button type="submit">
              {isEditing ? 'Zapisz zmiany' : 'Dodaj nawyk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

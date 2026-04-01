'use client'

import type { TaskStatus, TaskCategory, TaskPriority } from '@/types/database'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchIcon } from 'lucide-react'

export interface TaskFilters {
  status: TaskStatus | 'all'
  category: TaskCategory | 'all'
  priority: TaskPriority | 'all'
  search: string
}

interface TaskFiltersProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
}

export function TaskFiltersBar({ filters, onFiltersChange }: TaskFiltersProps) {
  function update(patch: Partial<TaskFilters>) {
    onFiltersChange({ ...filters, ...patch })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Szukaj..."
          className="h-8 w-48 pl-8"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(v) => update({ status: v as TaskFilters['status'] })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie statusy</SelectItem>
          <SelectItem value="todo">Do zrobienia</SelectItem>
          <SelectItem value="in_progress">W toku</SelectItem>
          <SelectItem value="done">Ukończone</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.category}
        onValueChange={(v) => update({ category: v as TaskFilters['category'] })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie kategorie</SelectItem>
          <SelectItem value="private">Prywatne</SelectItem>
          <SelectItem value="professional">Zawodowe</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(v) => update({ priority: v as TaskFilters['priority'] })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie priorytety</SelectItem>
          <SelectItem value="low">Niski</SelectItem>
          <SelectItem value="medium">Średni</SelectItem>
          <SelectItem value="high">Wysoki</SelectItem>
          <SelectItem value="urgent">Pilny</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

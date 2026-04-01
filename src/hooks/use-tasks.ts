'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getTaskPoints } from '@/lib/gamification/points'
import type { Task, TaskStatus, TaskCategory, TaskPriority } from '@/types/database'

export interface TaskFilters {
  status?: TaskStatus
  category?: TaskCategory
  priority?: TaskPriority
  parent_task_id?: string | null
}

interface UseTasksReturn {
  data: Task[]
  loading: boolean
  error: Error | null
  createTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at' | 'position'>) => Promise<Task | null>
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>
  deleteTask: (id: string) => Promise<void>
  completeTask: (id: string) => Promise<void>
}

export function useTasks(filters?: TaskFilters): UseTasksReturn {
  const [data, setData] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters?.parent_task_id !== undefined) {
        if (filters.parent_task_id === null) {
          query = query.is('parent_task_id', null)
        } else {
          query = query.eq('parent_task_id', filters.parent_task_id)
        }
      }

      const { data: tasks, error: fetchError } = await query

      if (fetchError) throw fetchError
      setData(tasks ?? [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'))
    } finally {
      setLoading(false)
    }
  }, [filters?.status, filters?.category, filters?.priority, filters?.parent_task_id])

  useEffect(() => {
    fetchTasks()

    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks])

  const createTask = useCallback(
    async (
      task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at' | 'position'>
    ): Promise<Task | null> => {
      try {
        setError(null)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: newTask, error: insertError } = await supabase
          .from('tasks')
          .insert({
            ...task,
            user_id: user.id,
            position: data.length,
          })
          .select()
          .single()

        if (insertError) throw insertError
        return newTask
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create task'))
        return null
      }
    },
    [data.length]
  )

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>): Promise<Task | null> => {
      try {
        setError(null)
        const { data: updated, error: updateError } = await supabase
          .from('tasks')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()

        if (updateError) throw updateError
        return updated
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update task'))
        return null
      }
    },
    []
  )

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete task'))
    }
  }, [])

  const completeTask = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      const task = data.find((t) => t.id === id)
      if (!task) throw new Error('Task not found')

      const now = new Date().toISOString()

      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: 'done' as TaskStatus,
          completed_at: now,
          updated_at: now,
        })
        .eq('id', id)

      if (updateError) throw updateError

      const points = getTaskPoints(task.priority)
      await supabase.rpc('award_points', {
        p_points: points,
        p_reason: `Task completed: ${task.title}`,
        p_reference_id: id,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to complete task'))
    }
  }, [data])

  return { data, loading, error, createTask, updateTask, deleteTask, completeTask }
}

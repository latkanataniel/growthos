import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(['private', 'professional']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional(),
  due_date: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  parent_task_id: z.string().uuid().optional().nullable(),
})

export const habitSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana').max(100),
  description: z.string().max(500).optional(),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  frequency_config: z.record(z.string(), z.unknown()).optional().nullable(),
  category: z.string().max(50).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
})

export const journalSchema = z.object({
  time_of_day: z.enum(['morning', 'afternoon', 'evening']),
  content: z.string().max(5000).optional(),
  mood: z.number().min(1).max(5).optional(),
  prompts_responses: z.record(z.string(), z.string()).optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export const profileSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  role: z.string().max(100).optional(),
  skills: z.array(z.string()).optional(),
  goals: z.string().max(1000).optional(),
  responsibilities: z.string().max(1000).optional(),
  timezone: z.string().optional(),
})

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Imię jest wymagane').max(100),
  role: z.string().max(100).optional(),
  skills: z.array(z.string()).optional(),
  email: z.string().email('Nieprawidłowy email').optional().or(z.literal('')),
  department: z.string().max(100).optional(),
  availability: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
})

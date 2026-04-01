export type TaskCategory = 'private' | 'professional'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type HabitFrequency = 'daily' | 'weekly' | 'custom'
export type TimeOfDay = 'morning' | 'afternoon' | 'evening'
export type AchievementType = 'tasks' | 'habits' | 'journal' | 'streaks' | 'general'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string | null
  skills: string[]
  goals: string | null
  responsibilities: string | null
  timezone: string | null
  points: number
  level: number
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  parent_task_id: string | null
  title: string
  description: string | null
  category: TaskCategory
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  tags: string[]
  position: number
  delegation_suggestion: DelegationSuggestion | null
  completed_at: string | null
  created_at: string
  updated_at: string
  subtasks?: Task[]
}

export interface DelegationSuggestion {
  should_delegate: boolean
  suggested_assignee: string | null
  reasoning: string
  confidence: number
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  frequency: HabitFrequency
  frequency_config: Record<string, unknown> | null
  category: string | null
  color: string | null
  icon: string | null
  is_active: boolean
  current_streak: number
  longest_streak: number
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
  note: string | null
}

export interface JournalEntry {
  id: string
  user_id: string
  entry_date: string
  time_of_day: TimeOfDay
  content: string | null
  mood: number | null
  prompts_responses: Record<string, string> | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  user_id: string
  name: string
  role: string | null
  skills: string[]
  email: string | null
  department: string | null
  availability: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  status: string | null
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  type: AchievementType
  points: number
  criteria: Record<string, unknown>
  tier: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  achievement?: Achievement
}

export interface PointEvent {
  id: string
  user_id: string
  points: number
  reason: string
  reference_id: string | null
  created_at: string
}

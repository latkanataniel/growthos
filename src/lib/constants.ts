export const POINTS = {
  TASK_COMPLETE_LOW: 10,
  TASK_COMPLETE_MEDIUM: 20,
  TASK_COMPLETE_HIGH: 30,
  TASK_COMPLETE_URGENT: 50,
  HABIT_COMPLETE: 5,
  JOURNAL_ENTRY: 5,
  JOURNAL_FULL_DAY: 10,
  STREAK_BONUS_7: 25,
  STREAK_BONUS_30: 100,
} as const

export const LEVELS = {
  MAX_LEVEL: 10,
  threshold: (level: number) => 50 * level * (level - 1),
} as const

export const AI_RATE_LIMIT = 20

export const JOURNAL_PROMPTS: Record<string, string[]> = {
  morning: [
    'Na czym chcesz się dziś skupić?',
    'Za co jesteś dziś wdzięczny/a?',
    'Jaki jest Twój główny cel na dziś?',
  ],
  afternoon: [
    'Jak minęło Ci do tej pory?',
    'Co udało Ci się osiągnąć?',
    'Czy potrzebujesz zmienić priorytety?',
  ],
  evening: [
    'Co było najlepszą częścią dnia?',
    'Czego się dziś nauczyłeś/aś?',
    'Co byś zrobił/a inaczej?',
  ],
}

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/tasks', label: 'Zadania', icon: 'CheckSquare' },
  { href: '/habits', label: 'Nawyki', icon: 'Flame' },
  { href: '/journal', label: 'Dziennik', icon: 'BookOpen' },
  { href: '/stats', label: 'Statystyki', icon: 'BarChart3' },
] as const

export const MOOD_EMOJIS = ['😞', '😕', '😐', '🙂', '😊'] as const

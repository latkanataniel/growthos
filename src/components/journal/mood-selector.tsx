'use client'

import { cn } from '@/lib/utils'
import { MOOD_EMOJIS } from '@/lib/constants'

const MOOD_LABELS = ['Źle', 'Słabo', 'OK', 'Dobrze', 'Świetnie'] as const

interface MoodSelectorProps {
  value?: number
  onChange: (mood: number) => void
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {MOOD_EMOJIS.map((emoji, index) => {
        const mood = index + 1
        const isSelected = value === mood

        return (
          <button
            key={mood}
            type="button"
            onClick={() => onChange(mood)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl p-2 transition-all duration-200',
              'hover:bg-muted/60',
              isSelected
                ? 'scale-110 bg-muted ring-2 ring-ring/40'
                : 'opacity-60 hover:opacity-100'
            )}
          >
            <span className="text-2xl leading-none">{emoji}</span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {MOOD_LABELS[index]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { JOURNAL_PROMPTS } from '@/lib/constants'
import { Textarea } from '@/components/ui/textarea'
import type { TimeOfDay } from '@/types/database'

interface JournalPromptsProps {
  timeOfDay: TimeOfDay
  responses?: Record<string, string>
  onChange: (responses: Record<string, string>) => void
}

export function JournalPrompts({
  timeOfDay,
  responses = {},
  onChange,
}: JournalPromptsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const prompts = JOURNAL_PROMPTS[timeOfDay] ?? []

  function handleResponseChange(prompt: string, value: string) {
    onChange({ ...responses, [prompt]: value })
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>Pytania do refleksji</span>
        <ChevronDown
          className={cn(
            'size-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="space-y-4 pt-1">
          {prompts.map((prompt) => (
            <div key={prompt} className="space-y-1.5">
              <label className="text-sm text-muted-foreground">{prompt}</label>
              <Textarea
                value={responses[prompt] ?? ''}
                onChange={(e) => handleResponseChange(prompt, e.target.value)}
                placeholder="Twoja odpowiedź..."
                className="min-h-12 resize-none text-sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

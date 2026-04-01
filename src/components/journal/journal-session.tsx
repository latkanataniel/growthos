'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { MoodSelector } from '@/components/journal/mood-selector'
import { JournalPrompts } from '@/components/journal/journal-prompts'
import type { TimeOfDay, JournalEntry } from '@/types/database'

const TIME_ICONS: Record<TimeOfDay, string> = {
  morning: '☀️',
  afternoon: '🌤️',
  evening: '🌙',
}

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: 'Rano',
  afternoon: 'Popołudnie',
  evening: 'Wieczór',
}

interface JournalSessionData {
  content: string
  mood: number | null
  prompts_responses: Record<string, string>
  tags: string[]
}

interface JournalSessionProps {
  timeOfDay: TimeOfDay
  entry?: JournalEntry
  onSave: (data: JournalSessionData) => void
}

export function JournalSession({ timeOfDay, entry, onSave }: JournalSessionProps) {
  const [content, setContent] = useState(entry?.content ?? '')
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null)
  const [promptsResponses, setPromptsResponses] = useState<Record<string, string>>(
    entry?.prompts_responses ?? {}
  )
  const [tags, setTags] = useState<string[]>(entry?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const autoSave = useCallback(
    (newContent: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onSave({
          content: newContent,
          mood,
          prompts_responses: promptsResponses,
          tags,
        })
      }, 1000)
    },
    [mood, promptsResponses, tags, onSave]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleContentChange(value: string) {
    setContent(value)
    autoSave(value)
  }

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = tagInput.trim()
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed])
      }
      setTagInput('')
    }
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  function handleSave() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    onSave({
      content,
      mood,
      prompts_responses: promptsResponses,
      tags,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">{TIME_ICONS[timeOfDay]}</span>
          <span>{TIME_LABELS[timeOfDay]}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Jak się czujesz?
          </label>
          <MoodSelector value={mood ?? undefined} onChange={setMood} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Co masz na myśli?
          </label>
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Zapisz swoje przemyślenia..."
            className="min-h-28 resize-none"
          />
        </div>

        <JournalPrompts
          timeOfDay={timeOfDay}
          responses={promptsResponses}
          onChange={setPromptsResponses}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Tagi</label>
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Dodaj tag..."
              className="h-7 w-28 min-w-0 border-none bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        <Button onClick={handleSave}>Zapisz</Button>
      </CardFooter>
    </Card>
  )
}

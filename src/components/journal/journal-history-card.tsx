'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MOOD_EMOJIS } from '@/lib/constants'
import type { JournalEntry, TimeOfDay } from '@/types/database'

const TIME_ICONS: Record<TimeOfDay, string> = {
  morning: '☀️',
  afternoon: '🌤️',
  evening: '🌙',
}

interface JournalHistoryCardProps {
  entry: JournalEntry
}

export function JournalHistoryCard({ entry }: JournalHistoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const content = entry.content ?? ''
  const isLong = content.length > 100
  const displayContent = isExpanded || !isLong ? content : `${content.slice(0, 100)}...`

  const formattedDate = new Date(entry.entry_date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const moodEmoji = entry.mood ? MOOD_EMOJIS[entry.mood - 1] : null

  return (
    <Card
      className={cn('cursor-pointer transition-shadow hover:ring-foreground/20')}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <span>{TIME_ICONS[entry.time_of_day]}</span>
          <span className="text-muted-foreground">{formattedDate}</span>
          {moodEmoji && <span className="ml-auto text-lg">{moodEmoji}</span>}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {displayContent && (
          <p className="whitespace-pre-wrap text-sm text-foreground/80">
            {displayContent}
          </p>
        )}

        {isExpanded && entry.prompts_responses && (
          <div className="space-y-2 border-t pt-3">
            {Object.entries(entry.prompts_responses).map(([prompt, response]) =>
              response ? (
                <div key={prompt} className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">{prompt}</p>
                  <p className="text-sm text-foreground/80">{response}</p>
                </div>
              ) : null
            )}
          </div>
        )}

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

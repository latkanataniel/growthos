'use client'

import type { DelegationSuggestion } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SparklesIcon, UserIcon } from 'lucide-react'

interface DelegationCardProps {
  suggestion: DelegationSuggestion | null
  loading?: boolean
  onAnalyze: () => void
}

export function DelegationCard({
  suggestion,
  loading = false,
  onAnalyze,
}: DelegationCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4" />
            Analiza delegowania
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-2 w-full rounded-full" />
        </CardContent>
      </Card>
    )
  }

  if (!suggestion) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <SparklesIcon className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            Sprawdź, czy to zadanie warto oddelegować.
          </p>
          <Button variant="outline" size="sm" onClick={onAnalyze}>
            <SparklesIcon className="mr-1.5 h-3.5 w-3.5" />
            Analizuj delegowanie
          </Button>
        </CardContent>
      </Card>
    )
  }

  const shouldDelegate = suggestion.should_delegate
  const confidencePercent = Math.round(suggestion.confidence * 100)

  return (
    <Card
      className={
        shouldDelegate
          ? 'ring-green-200 dark:ring-green-900'
          : ''
      }
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="h-4 w-4" />
          Analiza delegowania
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rekomendacja:</span>
          {shouldDelegate ? (
            <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400">
              Deleguj
            </Badge>
          ) : (
            <Badge variant="secondary">Wykonaj samodzielnie</Badge>
          )}
        </div>

        {suggestion.suggested_assignee && (
          <div className="flex items-center gap-2">
            <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm">
              {suggestion.suggested_assignee}
            </span>
          </div>
        )}

        <p className="text-sm leading-relaxed text-muted-foreground">
          {suggestion.reasoning}
        </p>

        <div className="grid gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Pewność analizy</span>
            <span>{confidencePercent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${
                shouldDelegate
                  ? 'bg-green-500'
                  : 'bg-slate-400'
              }`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

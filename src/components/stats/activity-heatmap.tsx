'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ActivityHeatmapProps {
  data: Array<{ date: string; count: number }>
}

function getIntensityClass(count: number, max: number): string {
  if (count === 0) return 'bg-slate-100'
  const ratio = count / max
  if (ratio <= 0.25) return 'bg-emerald-200'
  if (ratio <= 0.5) return 'bg-emerald-400'
  if (ratio <= 0.75) return 'bg-emerald-500'
  return 'bg-emerald-700'
}

const DAY_LABELS = ['Pn', '', 'Śr', '', 'Pt', '', 'Nd']

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const { grid, weeks, maxCount } = useMemo(() => {
    const countMap = new Map(data.map((d) => [d.date, d.count]))
    const maxCount = Math.max(1, ...data.map((d) => d.count))

    const today = new Date()
    const totalWeeks = 52
    const cells: Array<{ date: string; count: number; dayOfWeek: number }> = []

    // Find the most recent Sunday to anchor the grid
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - totalWeeks * 7 + 1)

    const current = new Date(startDate)
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0]
      const dayOfWeek = (current.getDay() + 6) % 7 // Monday = 0
      cells.push({
        date: dateStr,
        count: countMap.get(dateStr) ?? 0,
        dayOfWeek,
      })
      current.setDate(current.getDate() + 1)
    }

    // Group into weeks (columns)
    const weeks: Array<typeof cells> = []
    let currentWeek: typeof cells = []
    for (const cell of cells) {
      if (cell.dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }
      currentWeek.push(cell)
    }
    if (currentWeek.length > 0) weeks.push(currentWeek)

    return { grid: cells, weeks, maxCount }
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktywność</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="mr-1 flex flex-col gap-0.5">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="flex h-3 w-6 items-center text-[10px] text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {Array.from({ length: 7 }).map((_, di) => {
                  const cell = week.find((c) => c.dayOfWeek === di)
                  if (!cell) {
                    return <div key={di} className="h-3 w-3" />
                  }
                  return (
                    <div
                      key={di}
                      className={cn(
                        'h-3 w-3 rounded-sm transition-colors',
                        getIntensityClass(cell.count, maxCount)
                      )}
                      title={`${cell.date}: ${cell.count} aktywności`}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
            <span>Mniej</span>
            {['bg-slate-100', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-700'].map(
              (cls) => (
                <div key={cls} className={cn('h-3 w-3 rounded-sm', cls)} />
              )
            )}
            <span>Więcej</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

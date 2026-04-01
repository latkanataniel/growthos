'use client'

import { type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  trend?: { value: number; positive: boolean }
}

export function StatCard({ icon, label, value, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.positive ? 'text-emerald-600' : 'text-red-500'
                )}
              >
                {trend.positive ? '+' : ''}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

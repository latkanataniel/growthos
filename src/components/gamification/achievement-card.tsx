'use client'

import type { Achievement } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AchievementCardProps {
  achievement: Achievement
  unlocked: boolean
  unlockedAt?: string
}

const TIER_STYLES: Record<string, { label: string; className: string }> = {
  bronze: { label: 'Brąz', className: 'bg-orange-100 text-orange-700' },
  silver: { label: 'Srebro', className: 'bg-slate-100 text-slate-600' },
  gold: { label: 'Złoto', className: 'bg-amber-100 text-amber-700' },
  platinum: { label: 'Platyna', className: 'bg-violet-100 text-violet-700' },
}

export function AchievementCard({
  achievement,
  unlocked,
  unlockedAt,
}: AchievementCardProps) {
  const tier = TIER_STYLES[achievement.tier] ?? {
    label: achievement.tier,
    className: 'bg-slate-100 text-slate-600',
  }

  return (
    <Card
      className={cn(
        'transition-all',
        !unlocked && 'opacity-50 grayscale'
      )}
    >
      <CardContent className="flex items-start gap-3">
        <span className="text-2xl" role="img" aria-label={achievement.name}>
          {achievement.icon}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              {achievement.name}
            </p>
            <span
              className={cn(
                'inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                tier.className
              )}
            >
              {tier.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {achievement.description}
          </p>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-xs font-medium text-amber-600">
              +{achievement.points} pkt
            </span>
            {unlocked && unlockedAt && (
              <span className="text-[10px] text-muted-foreground">
                Odblokowano{' '}
                {new Date(unlockedAt).toLocaleDateString('pl-PL')}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

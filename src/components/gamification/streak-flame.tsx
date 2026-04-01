'use client'

import { cn } from '@/lib/utils'

interface StreakFlameProps {
  streak: number
}

export function StreakFlame({ streak }: StreakFlameProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          'text-xl transition-transform',
          streak > 0 && 'animate-pulse'
        )}
        style={
          streak > 0
            ? {
                animation: 'streak-pulse 1.5s ease-in-out infinite',
              }
            : undefined
        }
        role="img"
        aria-label="Streak"
      >
        🔥
      </span>
      <span
        className={cn(
          'text-sm font-semibold',
          streak > 0 ? 'text-orange-600' : 'text-muted-foreground'
        )}
      >
        {streak}
      </span>

      <style jsx>{`
        @keyframes streak-pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
      `}</style>
    </div>
  )
}

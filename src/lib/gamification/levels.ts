import { LEVELS } from '@/lib/constants'

export function getLevelFromPoints(points: number): number {
  for (let level = LEVELS.MAX_LEVEL; level >= 1; level--) {
    if (points >= LEVELS.threshold(level)) return level
  }
  return 1
}

export function getProgressToNextLevel(points: number): {
  currentLevel: number
  nextLevelThreshold: number
  currentLevelThreshold: number
  progress: number
} {
  const currentLevel = getLevelFromPoints(points)
  if (currentLevel >= LEVELS.MAX_LEVEL) {
    return {
      currentLevel,
      nextLevelThreshold: LEVELS.threshold(LEVELS.MAX_LEVEL),
      currentLevelThreshold: LEVELS.threshold(LEVELS.MAX_LEVEL),
      progress: 100,
    }
  }
  const currentLevelThreshold = LEVELS.threshold(currentLevel)
  const nextLevelThreshold = LEVELS.threshold(currentLevel + 1)
  const progress = ((points - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100
  return { currentLevel, nextLevelThreshold, currentLevelThreshold, progress }
}

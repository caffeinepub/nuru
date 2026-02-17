// XP model aligned with backend progression
// Level thresholds: exponential growth
export function calculateXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function calculateXpForNextLevel(currentLevel: number): number {
  return calculateXpForLevel(currentLevel + 1);
}

export function calculateProgress(currentXp: number, currentLevel: number): number {
  const xpForCurrentLevel = calculateXpForLevel(currentLevel);
  const xpForNextLevel = calculateXpForNextLevel(currentLevel);
  const xpInCurrentLevel = currentXp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  
  if (xpNeededForLevel <= 0) return 100;
  return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForLevel) * 100));
}

export function calculateLevelFromXp(xp: number): number {
  let level = 1;
  while (calculateXpForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

export function formatXp(xp: bigint | number): string {
  const num = typeof xp === 'bigint' ? Number(xp) : xp;
  return num.toLocaleString();
}

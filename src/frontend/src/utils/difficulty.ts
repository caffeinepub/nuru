// Difficulty scaling based on user level
export interface DifficultyParams {
  timeLimit: number; // seconds
  itemCount: number; // number of items/questions
  distractorCount: number; // number of wrong options
  promptLength: 'short' | 'medium' | 'long';
}

export function calculateDifficulty(userLevel: number, baseConfig: Partial<DifficultyParams> = {}): DifficultyParams {
  // Base difficulty with increased values
  const base: DifficultyParams = {
    timeLimit: 90, // Increased from 60
    itemCount: 8, // Increased from 5
    distractorCount: 2,
    promptLength: 'short',
    ...baseConfig,
  };

  // Scale based on level (1-10 beginner, 11-20 intermediate, 21+ advanced)
  if (userLevel <= 10) {
    return {
      timeLimit: Math.max(base.timeLimit, 90), // Increased minimum from 60
      itemCount: Math.max(5, base.itemCount - 2), // Increased from 3
      distractorCount: 2,
      promptLength: 'short',
    };
  } else if (userLevel <= 20) {
    return {
      timeLimit: Math.max(60, base.timeLimit - 15), // Increased minimum from 30
      itemCount: Math.max(base.itemCount, 8), // Increased from 5
      distractorCount: 3,
      promptLength: 'medium',
    };
  } else {
    return {
      timeLimit: Math.max(45, base.timeLimit - 30), // Increased minimum from 20
      itemCount: Math.min(base.itemCount + 5, 12), // Increased from 8
      distractorCount: 4,
      promptLength: 'long',
    };
  }
}

export function getDifficultyLabel(userLevel: number): string {
  if (userLevel <= 10) return 'Beginner';
  if (userLevel <= 20) return 'Intermediate';
  return 'Advanced';
}

export function getGameModeScaling(userLevel: number, gameMode: string): Partial<DifficultyParams> {
  const baseScaling: Record<string, Partial<DifficultyParams>> = {
    wordMatch: { timeLimit: 90, itemCount: 8 }, // Increased from 60/5
    sentenceBuilder: { timeLimit: 135, itemCount: 8 }, // Increased from 90/5
    vocabularyQuiz: { timeLimit: 180, itemCount: 10, distractorCount: 3 }, // Increased from 120/6
    listeningComprehension: { timeLimit: 90, itemCount: 8, distractorCount: 3 }, // Increased from 60/5
    repeatableChallenge: { timeLimit: 180, itemCount: 15, distractorCount: 3 }, // Increased from 120/10
  };

  return baseScaling[gameMode] || {};
}

// Difficulty scaling based on user level
export interface DifficultyParams {
  timeLimit: number; // seconds
  itemCount: number; // number of items/questions
  distractorCount: number; // number of wrong options
  promptLength: 'short' | 'medium' | 'long';
}

export function calculateDifficulty(userLevel: number, baseConfig: Partial<DifficultyParams> = {}): DifficultyParams {
  // Base difficulty
  const base: DifficultyParams = {
    timeLimit: 60,
    itemCount: 5,
    distractorCount: 2,
    promptLength: 'short',
    ...baseConfig,
  };

  // Scale based on level (1-10 beginner, 11-20 intermediate, 21+ advanced)
  if (userLevel <= 10) {
    return {
      timeLimit: base.timeLimit,
      itemCount: Math.max(3, base.itemCount - 2),
      distractorCount: 2,
      promptLength: 'short',
    };
  } else if (userLevel <= 20) {
    return {
      timeLimit: Math.max(30, base.timeLimit - 15),
      itemCount: base.itemCount,
      distractorCount: 3,
      promptLength: 'medium',
    };
  } else {
    return {
      timeLimit: Math.max(20, base.timeLimit - 30),
      itemCount: Math.min(base.itemCount + 3, 8),
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
    wordMatch: { timeLimit: 60, itemCount: 5 },
    sentenceBuilder: { timeLimit: 90, itemCount: 5 },
    vocabularyQuiz: { timeLimit: 120, itemCount: 6, distractorCount: 3 },
    listeningComprehension: { timeLimit: 60, itemCount: 5, distractorCount: 3 },
    repeatableChallenge: { timeLimit: 120, itemCount: 10, distractorCount: 3 },
  };

  return baseScaling[gameMode] || {};
}

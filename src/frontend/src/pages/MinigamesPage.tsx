import { useState } from 'react';
import { useGetMinigameConfigs, useGetUserProgress } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Zap, Target, BookOpen, Headphones } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import WordMatchGame from '../components/minigames/WordMatchGame';
import SentenceBuilderGame from '../components/minigames/SentenceBuilderGame';
import RepeatableChallenge from '../components/minigames/RepeatableChallenge';
import VocabularyQuizGame from '../components/minigames/VocabularyQuizGame';
import ListeningComprehensionGame from '../components/minigames/ListeningComprehensionGame';
import { getDifficultyLabel } from '../utils/difficulty';
import { GameMode } from '../backend';

export default function MinigamesPage() {
  const { data: progress } = useGetUserProgress();
  const selectedLanguageId = progress?.selectedLanguage || BigInt(1);
  const { data: configs, isLoading } = useGetMinigameConfigs(selectedLanguageId);
  const [activeGame, setActiveGame] = useState<{ mode: GameMode; config: any } | null>(null);

  const userLevel = Number(progress?.level || 1);
  const difficultyLabel = getDifficultyLabel(userLevel);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (activeGame) {
    if (activeGame.mode === GameMode.wordMatch) {
      return <WordMatchGame config={activeGame.config} onExit={() => setActiveGame(null)} userLevel={userLevel} />;
    }
    if (activeGame.mode === GameMode.sentenceBuilder) {
      return <SentenceBuilderGame config={activeGame.config} onExit={() => setActiveGame(null)} userLevel={userLevel} />;
    }
    if (activeGame.mode === GameMode.repeatableChallenge) {
      return <RepeatableChallenge onExit={() => setActiveGame(null)} userLevel={userLevel} />;
    }
    if (activeGame.mode === GameMode.vocabularyQuiz) {
      return <VocabularyQuizGame config={activeGame.config} onExit={() => setActiveGame(null)} userLevel={userLevel} />;
    }
    if (activeGame.mode === GameMode.listeningComprehension) {
      return <ListeningComprehensionGame config={activeGame.config} onExit={() => setActiveGame(null)} userLevel={userLevel} />;
    }
  }

  const getGameIcon = (mode: GameMode) => {
    switch (mode) {
      case GameMode.wordMatch:
        return Target;
      case GameMode.sentenceBuilder:
        return Zap;
      case GameMode.vocabularyQuiz:
        return BookOpen;
      case GameMode.listeningComprehension:
        return Headphones;
      default:
        return Gamepad2;
    }
  };

  const getGameTitle = (mode: GameMode) => {
    switch (mode) {
      case GameMode.wordMatch:
        return 'Word Match';
      case GameMode.sentenceBuilder:
        return 'Sentence Builder';
      case GameMode.vocabularyQuiz:
        return 'Vocabulary Quiz';
      case GameMode.listeningComprehension:
        return 'Listening Comprehension';
      case GameMode.repeatableChallenge:
        return 'Mixed Challenge';
      default:
        return 'Game';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 text-white">
            <Gamepad2 className="h-12 w-12" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">Minigames & Challenges</h1>
        <p className="text-xl text-muted-foreground">
          Fun challenges that scale with your level
        </p>
        <Badge variant="outline" className="text-base">
          Current Difficulty: {difficultyLabel} (Level {userLevel})
        </Badge>
      </div>

      {/* Games */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Games</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {configs?.map((config) => {
              const Icon = getGameIcon(config.gameMode);
              return (
                <Card key={Number(config.id)} className="group hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary">+{Number(config.xpReward)} XP</Badge>
                    </div>
                    <CardTitle className="mt-4">
                      {getGameTitle(config.gameMode)}
                    </CardTitle>
                    <CardDescription>{config.instructions}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {config.timeLimit && (
                        <p className="text-sm text-muted-foreground">
                          ⏱️ Time limit: {Number(config.timeLimit)}s
                        </p>
                      )}
                      <Button onClick={() => setActiveGame({ mode: config.gameMode, config })} className="w-full">
                        Play Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Repeatable Challenge */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Daily Challenge</h2>
          <Card className="border-amber-500/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <Badge>Repeatable</Badge>
              </div>
              <CardTitle className="mt-4">Mixed Challenge</CardTitle>
              <CardDescription>
                Test your skills with a timed challenge that adapts to your level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setActiveGame({ mode: GameMode.repeatableChallenge, config: null })}
                className="w-full"
                variant="default"
              >
                Start Challenge
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

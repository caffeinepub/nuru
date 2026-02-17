import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, ArrowLeft, RotateCcw } from 'lucide-react';
import { useCompleteMinigame } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { calculateDifficulty } from '../../utils/difficulty';
import { GameMode } from '../../backend';

interface SentenceBuilderGameProps {
  config: any;
  onExit: () => void;
  userLevel: number;
}

const sentences = {
  1: [ // Spanish
    { sentence: 'Hola, ¿cómo estás?', words: ['Hola', '¿cómo', 'estás?'] },
    { sentence: 'Me llamo Juan', words: ['Me', 'llamo', 'Juan'] },
    { sentence: 'Buenos días, señor', words: ['Buenos', 'días', 'señor'] },
    { sentence: '¿Dónde está el baño?', words: ['¿Dónde', 'está', 'el', 'baño?'] },
    { sentence: 'Gracias por todo', words: ['Gracias', 'por', 'todo'] },
  ],
  2: [ // French
    { sentence: 'Bonjour, comment allez-vous?', words: ['Bonjour', 'comment', 'allez-vous?'] },
    { sentence: 'Je m\'appelle Marie', words: ['Je', 'm\'appelle', 'Marie'] },
    { sentence: 'Bonne journée, monsieur', words: ['Bonne', 'journée', 'monsieur'] },
    { sentence: 'Où sont les toilettes?', words: ['Où', 'sont', 'les', 'toilettes?'] },
    { sentence: 'Merci beaucoup', words: ['Merci', 'beaucoup'] },
  ],
};

export default function SentenceBuilderGame({ config, onExit, userLevel }: SentenceBuilderGameProps) {
  const { identity } = useInternetIdentity();
  const completeMinigame = useCompleteMinigame();
  const [timeLeft, setTimeLeft] = useState(Number(config.timeLimit || 90));
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const difficulty = calculateDifficulty(userLevel, { timeLimit: Number(config.timeLimit || 90) });
  const languageId = Number(config.languageId);
  const allSentences = sentences[languageId as keyof typeof sentences] || sentences[1];
  const gameSentences = allSentences.slice(0, difficulty.itemCount);
  const currentSentence = gameSentences[currentIndex];
  const shuffledWords = currentSentence ? [...currentSentence.words].sort(() => Math.random() - 0.5) : [];

  useEffect(() => {
    if (gameOver || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, timeLeft]);

  const handleWordClick = (word: string) => {
    setSelectedWords([...selectedWords, word]);
  };

  const handleRemoveWord = (index: number) => {
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    const userSentence = selectedWords.join(' ');
    if (userSentence === currentSentence.sentence) {
      setScore(score + 20);
      toast.success('Correct!');
      if (currentIndex < gameSentences.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedWords([]);
      } else {
        setGameOver(true);
      }
    } else {
      toast.error('Try again!');
      setSelectedWords([]);
    }
  };

  const handleComplete = async () => {
    if (!identity) {
      toast.info('Please log in to save your score');
      onExit();
      return;
    }

    try {
      await completeMinigame.mutateAsync({
        gameMode: GameMode.sentenceBuilder,
        xpReward: config.xpReward,
        score: BigInt(score),
      });
      toast.success(`Game complete! +${Number(config.xpReward)} XP`);
      onExit();
    } catch (error) {
      toast.error('Failed to save score');
      onExit();
    }
  };

  const progressPercent = (timeLeft / Number(config.timeLimit || 90)) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onExit} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Badge variant="outline">Level {userLevel} - {difficulty.itemCount} sentences</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sentence Builder</CardTitle>
          <CardDescription>Build correct sentences from jumbled words</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">{score} pts</span>
              <Badge variant="secondary">{currentIndex + 1} / {gameSentences.length}</Badge>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{timeLeft}s</p>
              <Progress value={progressPercent} className="w-32 h-2" />
            </div>
          </div>

          {!gameOver && currentSentence ? (
            <div className="space-y-6 mt-6">
              <div className="min-h-[80px] p-4 border-2 border-dashed rounded-lg bg-muted/50">
                <div className="flex flex-wrap gap-2">
                  {selectedWords.map((word, index) => (
                    <Button
                      key={index}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRemoveWord(index)}
                    >
                      {word}
                    </Button>
                  ))}
                  {selectedWords.length === 0 && (
                    <p className="text-muted-foreground text-sm">Click words below to build the sentence</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {shuffledWords.map((word, index) => {
                  const isUsed = selectedWords.includes(word);
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleWordClick(word)}
                      disabled={isUsed}
                      className={isUsed ? 'opacity-50' : ''}
                    >
                      {word}
                    </Button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedWords([])} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button onClick={handleCheck} disabled={selectedWords.length === 0} className="flex-1">
                  Check Answer
                </Button>
              </div>
            </div>
          ) : gameOver ? (
            <div className="text-center space-y-6 py-8">
              <Trophy className="h-16 w-16 mx-auto text-amber-500" />
              <div>
                <h3 className="text-2xl font-bold">Game Over!</h3>
                <p className="text-muted-foreground mt-2">Final Score: {score} points</p>
                <p className="text-sm text-muted-foreground">Completed: {currentIndex} / {gameSentences.length}</p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={onExit}>
                  Exit
                </Button>
                <Button onClick={handleComplete} disabled={completeMinigame.isPending}>
                  {identity ? 'Save Score' : 'Close'}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

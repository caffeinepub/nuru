import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, X, ArrowLeft } from 'lucide-react';
import { useCompleteMinigame } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { calculateDifficulty } from '../../utils/difficulty';
import { GameMode } from '../../backend';

interface WordMatchGameProps {
  config: any;
  onExit: () => void;
  userLevel: number;
}

// Seed word pairs
const wordPairs = {
  1: [ // Spanish
    { word: 'Hola', translation: 'Hello' },
    { word: 'Gracias', translation: 'Thank you' },
    { word: 'Adiós', translation: 'Goodbye' },
    { word: 'Sí', translation: 'Yes' },
    { word: 'No', translation: 'No' },
    { word: 'Por favor', translation: 'Please' },
    { word: 'Agua', translation: 'Water' },
    { word: 'Comida', translation: 'Food' },
  ],
  2: [ // French
    { word: 'Bonjour', translation: 'Hello' },
    { word: 'Merci', translation: 'Thank you' },
    { word: 'Au revoir', translation: 'Goodbye' },
    { word: 'Oui', translation: 'Yes' },
    { word: 'Non', translation: 'No' },
    { word: "S'il vous plaît", translation: 'Please' },
    { word: 'Eau', translation: 'Water' },
    { word: 'Nourriture', translation: 'Food' },
  ],
};

export default function WordMatchGame({ config, onExit, userLevel }: WordMatchGameProps) {
  const { identity } = useInternetIdentity();
  const completeMinigame = useCompleteMinigame();
  const [timeLeft, setTimeLeft] = useState(Number(config.timeLimit || 60));
  const [score, setScore] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);

  const difficulty = calculateDifficulty(userLevel, { timeLimit: Number(config.timeLimit || 60) });
  const languageId = Number(config.languageId);
  const allPairs = wordPairs[languageId as keyof typeof wordPairs] || wordPairs[1];
  const pairs = allPairs.slice(0, difficulty.itemCount);

  const words = pairs.map((p) => p.word);
  const translations = [...pairs.map((p) => p.translation)].sort(() => Math.random() - 0.5);

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

  useEffect(() => {
    if (matchedPairs.size === pairs.length * 2) {
      setGameOver(true);
    }
  }, [matchedPairs, pairs.length]);

  const handleSelect = (item: string) => {
    if (matchedPairs.has(item)) return;

    if (!selectedWord) {
      setSelectedWord(item);
    } else {
      const pair = pairs.find((p) => p.word === selectedWord || p.translation === selectedWord);
      const isMatch =
        pair && ((pair.word === selectedWord && pair.translation === item) || (pair.translation === selectedWord && pair.word === item));

      if (isMatch) {
        setMatchedPairs(new Set([...matchedPairs, selectedWord, item]));
        setScore(score + 10);
      }
      setSelectedWord(null);
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
        gameMode: GameMode.wordMatch,
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

  const progressPercent = (timeLeft / Number(config.timeLimit || 60)) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onExit} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Badge variant="outline">Level {userLevel} - {difficulty.itemCount} pairs</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Word Match</CardTitle>
          <CardDescription>Match words with their translations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">{score} pts</span>
              <Badge variant="secondary">{matchedPairs.size / 2} / {pairs.length} matched</Badge>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{timeLeft}s</p>
              <Progress value={progressPercent} className="w-32 h-2" />
            </div>
          </div>

          {!gameOver ? (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Words</h3>
                {words.map((word) => (
                  <Button
                    key={word}
                    variant={matchedPairs.has(word) ? 'secondary' : selectedWord === word ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleSelect(word)}
                    disabled={matchedPairs.has(word)}
                  >
                    {matchedPairs.has(word) && <X className="h-4 w-4 mr-2" />}
                    {word}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Translations</h3>
                {translations.map((translation) => (
                  <Button
                    key={translation}
                    variant={matchedPairs.has(translation) ? 'secondary' : selectedWord === translation ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleSelect(translation)}
                    disabled={matchedPairs.has(translation)}
                  >
                    {matchedPairs.has(translation) && <X className="h-4 w-4 mr-2" />}
                    {translation}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 py-8">
              <Trophy className="h-16 w-16 mx-auto text-amber-500" />
              <div>
                <h3 className="text-2xl font-bold">Game Over!</h3>
                <p className="text-muted-foreground mt-2">Final Score: {score} points</p>
                <p className="text-sm text-muted-foreground">Matched: {matchedPairs.size / 2} / {pairs.length}</p>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, ArrowLeft, Zap } from 'lucide-react';
import { useCompleteMinigame } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { calculateDifficulty, getGameModeScaling } from '../../utils/difficulty';
import { GameMode } from '../../backend';

interface RepeatableChallengeProps {
  onExit: () => void;
  userLevel: number;
}

// Expanded question pool for longer gameplay
const questions = [
  { question: 'What is "Hello" in Spanish?', options: ['Hola', 'Adiós', 'Gracias', 'Por favor'], correct: 0 },
  { question: 'What is "Thank you" in French?', options: ['Bonjour', 'Merci', 'Au revoir', 'Oui'], correct: 1 },
  { question: 'What is "Goodbye" in Spanish?', options: ['Hola', 'Gracias', 'Adiós', 'Sí'], correct: 2 },
  { question: 'What is "Yes" in French?', options: ['Non', 'Merci', 'Bonjour', 'Oui'], correct: 3 },
  { question: 'What is "Please" in Spanish?', options: ['Gracias', 'Hola', 'Por favor', 'Adiós'], correct: 2 },
  { question: 'What is "Water" in Arabic?', options: ['ماء', 'طعام', 'بيت', 'كتاب'], correct: 0 },
  { question: 'What is "Food" in Swahili?', options: ['Maji', 'Chakula', 'Nyumba', 'Kitabu'], correct: 1 },
  { question: 'What is "House" in Arabic?', options: ['ماء', 'طعام', 'بيت', 'كتاب'], correct: 2 },
  { question: 'What is "Book" in Swahili?', options: ['Maji', 'Chakula', 'Nyumba', 'Kitabu'], correct: 3 },
  { question: 'What is "Friend" in Arabic?', options: ['صديق', 'عائلة', 'مدرسة', 'سوق'], correct: 0 },
  { question: 'What is "Family" in Swahili?', options: ['Rafiki', 'Familia', 'Shule', 'Soko'], correct: 1 },
  { question: 'What is "School" in Arabic?', options: ['صديق', 'عائلة', 'مدرسة', 'سوق'], correct: 2 },
  { question: 'What is "Market" in Swahili?', options: ['Rafiki', 'Familia', 'Shule', 'Soko'], correct: 3 },
  { question: 'What is "Good morning" in Yoruba?', options: ['E kaaro', 'E kaasan', 'E ku irole', 'O dabo'], correct: 0 },
  { question: 'What is "Good afternoon" in Yoruba?', options: ['E kaaro', 'E kaasan', 'E ku irole', 'O dabo'], correct: 1 },
];

export default function RepeatableChallenge({ onExit, userLevel }: RepeatableChallengeProps) {
  const { identity } = useInternetIdentity();
  const completeMinigame = useCompleteMinigame();
  
  const modeScaling = getGameModeScaling(userLevel, 'repeatableChallenge');
  const difficulty = calculateDifficulty(userLevel, modeScaling);
  
  const [timeLeft, setTimeLeft] = useState(difficulty.timeLimit);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const totalQuestions = Math.min(difficulty.itemCount, questions.length);
  const challengeQuestions = questions.slice(0, totalQuestions);

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

  const handleAnswer = (selectedIndex: number) => {
    const question = challengeQuestions[currentQuestion];
    if (selectedIndex === question.correct) {
      setScore(score + 15);
      toast.success('Correct!');
    } else {
      toast.error('Wrong answer!');
    }

    if (currentQuestion < challengeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setGameOver(true);
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
        gameMode: GameMode.repeatableChallenge,
        xpReward: BigInt(score),
        score: BigInt(score),
      });
      toast.success(`Challenge complete! +${score} XP`);
      onExit();
    } catch (error) {
      toast.error('Failed to save score');
      onExit();
    }
  };

  const progressPercent = (timeLeft / difficulty.timeLimit) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onExit} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Badge variant="outline" className="gap-1">
          <Zap className="h-3 w-3" />
          Level {userLevel} Challenge
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mixed Challenge</CardTitle>
          <CardDescription>Answer as many questions as you can before time runs out</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">{score} pts</span>
              <Badge variant="secondary">{currentQuestion + 1} / {challengeQuestions.length}</Badge>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{timeLeft}s</p>
              <Progress value={progressPercent} className="w-32 h-2" />
            </div>
          </div>

          {!gameOver && challengeQuestions[currentQuestion] ? (
            <div className="space-y-6 mt-6">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <p className="text-lg font-medium">{challengeQuestions[currentQuestion].question}</p>
                </CardContent>
              </Card>

              <div className="grid gap-3">
                {challengeQuestions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-4"
                    onClick={() => handleAnswer(index)}
                  >
                    <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          ) : gameOver ? (
            <div className="text-center space-y-6 py-8">
              <Trophy className="h-16 w-16 mx-auto text-amber-500" />
              <div>
                <h3 className="text-2xl font-bold">Challenge Complete!</h3>
                <p className="text-muted-foreground mt-2">Final Score: {score} points</p>
                <p className="text-sm text-muted-foreground">Answered: {currentQuestion} / {challengeQuestions.length}</p>
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

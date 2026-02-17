import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { useCompleteMinigame } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { calculateDifficulty } from '../../utils/difficulty';
import { GameMode } from '../../backend';

interface VocabularyQuizGameProps {
  config: any;
  onExit: () => void;
  userLevel: number;
}

const vocabularyQuestions = {
  1: [ // Yoruba
    { question: 'What does "Bawo" mean?', answer: 'Hello/How are you', options: ['Hello/How are you', 'Goodbye', 'Thank you', 'Please'] },
    { question: 'What does "Eso" mean?', answer: 'Fruit', options: ['Fruit', 'Water', 'Food', 'House'] },
    { question: 'What does "Ile-iwe" mean?', answer: 'School', options: ['School', 'Market', 'Home', 'Church'] },
    { question: 'What does "Ojo" mean?', answer: 'Day', options: ['Day', 'Night', 'Morning', 'Evening'] },
    { question: 'What does "Omi" mean?', answer: 'Water', options: ['Water', 'Fire', 'Air', 'Earth'] },
    { question: 'What does "Onje" mean?', answer: 'Food', options: ['Food', 'Drink', 'Plate', 'Spoon'] },
  ],
  2: [ // Swahili
    { question: 'What does "Habari" mean?', answer: 'News/How are you', options: ['News/How are you', 'Goodbye', 'Thank you', 'Please'] },
    { question: 'What does "Chakula" mean?', answer: 'Food', options: ['Food', 'Water', 'House', 'School'] },
    { question: 'What does "Maji" mean?', answer: 'Water', options: ['Water', 'Fire', 'Air', 'Earth'] },
    { question: 'What does "Shule" mean?', answer: 'School', options: ['School', 'Market', 'Home', 'Church'] },
    { question: 'What does "Nyumba" mean?', answer: 'House', options: ['House', 'Car', 'Tree', 'Road'] },
    { question: 'What does "Siku" mean?', answer: 'Day', options: ['Day', 'Night', 'Week', 'Month'] },
  ],
};

export default function VocabularyQuizGame({ config, onExit, userLevel }: VocabularyQuizGameProps) {
  const { identity } = useInternetIdentity();
  const completeMinigame = useCompleteMinigame();
  const [timeLeft, setTimeLeft] = useState(Number(config.timeLimit || 120));
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const difficulty = calculateDifficulty(userLevel, { timeLimit: Number(config.timeLimit || 120), itemCount: 6 });
  const languageId = Number(config.languageId);
  const allQuestions = vocabularyQuestions[languageId as keyof typeof vocabularyQuestions] || vocabularyQuestions[1];
  const questions = allQuestions.slice(0, difficulty.itemCount);
  const currentQuestion = questions[currentIndex];

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

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === currentQuestion.answer;
    if (isCorrect) {
      setScore(score + 10);
      toast.success('Correct!');
    } else {
      toast.error(`Wrong! The correct answer is: ${currentQuestion.answer}`);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const handleComplete = async () => {
    if (!identity) {
      toast.info('Please log in to save your score');
      onExit();
      return;
    }

    try {
      await completeMinigame.mutateAsync({
        gameMode: GameMode.vocabularyQuiz,
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

  const progressPercent = (timeLeft / Number(config.timeLimit || 120)) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onExit} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Badge variant="outline">Level {userLevel} - {difficulty.itemCount} questions</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vocabulary Quiz</CardTitle>
          <CardDescription>Test your vocabulary knowledge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">{score} pts</span>
              <Badge variant="secondary">{currentIndex + 1} / {questions.length}</Badge>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{timeLeft}s</p>
              <Progress value={progressPercent} className="w-32 h-2" />
            </div>
          </div>

          {!gameOver && currentQuestion ? (
            <div className="space-y-6 mt-6">
              <div className="p-6 bg-muted rounded-lg">
                <h3 className="text-xl font-semibold text-center">{currentQuestion.question}</h3>
              </div>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.answer;
                  const showCorrect = showResult && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;

                  return (
                    <Button
                      key={index}
                      variant={showCorrect ? 'default' : showWrong ? 'destructive' : isSelected ? 'secondary' : 'outline'}
                      className="w-full justify-start text-left h-auto py-4 px-6"
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showResult}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="flex-1">{option}</span>
                        {showCorrect && <CheckCircle2 className="h-5 w-5" />}
                        {showWrong && <XCircle className="h-5 w-5" />}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : gameOver ? (
            <div className="text-center space-y-6 py-8">
              <Trophy className="h-16 w-16 mx-auto text-amber-500" />
              <div>
                <h3 className="text-2xl font-bold">Quiz Complete!</h3>
                <p className="text-muted-foreground mt-2">Final Score: {score} points</p>
                <p className="text-sm text-muted-foreground">Answered: {currentIndex + 1} / {questions.length}</p>
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

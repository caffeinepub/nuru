import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { useCompleteMinigame } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { calculateDifficulty, getGameModeScaling } from '../../utils/difficulty';
import { GameMode } from '../../backend';

interface VocabularyQuizGameProps {
  config: any;
  onExit: () => void;
  userLevel: number;
}

// Expanded vocabulary questions for longer gameplay
const vocabularyQuestions = {
  1: [ // Arabic
    { question: 'What is "Hello" in Arabic?', answer: 'مرحبا', options: ['مرحبا', 'شكرا', 'وداعا', 'نعم'] },
    { question: 'What is "Thank you" in Arabic?', answer: 'شكرا', options: ['مرحبا', 'شكرا', 'وداعا', 'لا'] },
    { question: 'What is "Water" in Arabic?', answer: 'ماء', options: ['ماء', 'طعام', 'بيت', 'كتاب'] },
    { question: 'What is "Food" in Arabic?', answer: 'طعام', options: ['ماء', 'طعام', 'بيت', 'كتاب'] },
    { question: 'What is "House" in Arabic?', answer: 'بيت', options: ['ماء', 'طعام', 'بيت', 'كتاب'] },
    { question: 'What is "Book" in Arabic?', answer: 'كتاب', options: ['ماء', 'طعام', 'بيت', 'كتاب'] },
    { question: 'What is "Friend" in Arabic?', answer: 'صديق', options: ['صديق', 'عائلة', 'مدرسة', 'سوق'] },
    { question: 'What is "Family" in Arabic?', answer: 'عائلة', options: ['صديق', 'عائلة', 'مدرسة', 'سوق'] },
    { question: 'What is "Yes" in Arabic?', answer: 'نعم', options: ['نعم', 'لا', 'من فضلك', 'شكرا'] },
    { question: 'What is "No" in Arabic?', answer: 'لا', options: ['نعم', 'لا', 'من فضلك', 'شكرا'] },
  ],
  2: [ // Swahili
    { question: 'What is "Hello" in Swahili?', answer: 'Jambo', options: ['Jambo', 'Asante', 'Kwaheri', 'Ndiyo'] },
    { question: 'What is "Thank you" in Swahili?', answer: 'Asante', options: ['Jambo', 'Asante', 'Kwaheri', 'Hapana'] },
    { question: 'What is "Water" in Swahili?', answer: 'Maji', options: ['Maji', 'Chakula', 'Nyumba', 'Kitabu'] },
    { question: 'What is "Food" in Swahili?', answer: 'Chakula', options: ['Maji', 'Chakula', 'Nyumba', 'Kitabu'] },
    { question: 'What is "House" in Swahili?', answer: 'Nyumba', options: ['Maji', 'Chakula', 'Nyumba', 'Kitabu'] },
    { question: 'What is "Book" in Swahili?', answer: 'Kitabu', options: ['Maji', 'Chakula', 'Nyumba', 'Kitabu'] },
    { question: 'What is "Friend" in Swahili?', answer: 'Rafiki', options: ['Rafiki', 'Familia', 'Shule', 'Soko'] },
    { question: 'What is "Family" in Swahili?', answer: 'Familia', options: ['Rafiki', 'Familia', 'Shule', 'Soko'] },
    { question: 'What is "Yes" in Swahili?', answer: 'Ndiyo', options: ['Ndiyo', 'Hapana', 'Tafadhali', 'Asante'] },
    { question: 'What is "No" in Swahili?', answer: 'Hapana', options: ['Ndiyo', 'Hapana', 'Tafadhali', 'Asante'] },
  ],
};

export default function VocabularyQuizGame({ config, onExit, userLevel }: VocabularyQuizGameProps) {
  const { identity } = useInternetIdentity();
  const completeMinigame = useCompleteMinigame();
  
  const modeScaling = getGameModeScaling(userLevel, 'vocabularyQuiz');
  const difficulty = calculateDifficulty(userLevel, modeScaling);
  
  const [timeLeft, setTimeLeft] = useState(difficulty.timeLimit);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);

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

  const progressPercent = (timeLeft / difficulty.timeLimit) * 100;

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
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <p className="text-lg font-medium">{currentQuestion.question}</p>
                </CardContent>
              </Card>

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

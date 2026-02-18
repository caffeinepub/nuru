import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, ArrowLeft, Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { useCompleteMinigame } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { calculateDifficulty, getGameModeScaling } from '../../utils/difficulty';
import { GameMode } from '../../backend';

interface ListeningComprehensionGameProps {
  config: any;
  onExit: () => void;
  userLevel: number;
}

// Expanded listening questions for longer gameplay
const listeningQuestions = {
  1: [ // Yoruba
    { phrase: 'Bawo ni o se wa?', question: 'What does this phrase mean?', answer: 'How are you?', options: ['How are you?', 'Good morning', 'Thank you', 'Goodbye'] },
    { phrase: 'Mo fe ra eso', question: 'What does the speaker want?', answer: 'To buy fruit', options: ['To buy fruit', 'To eat food', 'To drink water', 'To go home'] },
    { phrase: 'Ile-iwe wa nibo?', question: 'What is being asked?', answer: 'Where is the school?', options: ['Where is the school?', 'Where is home?', 'Where is the market?', 'Where is the church?'] },
    { phrase: 'E kaaro', question: 'When would you say this?', answer: 'In the morning', options: ['In the morning', 'In the evening', 'At night', 'At noon'] },
    { phrase: 'Mo nife re', question: 'What emotion is expressed?', answer: 'Love', options: ['Love', 'Anger', 'Sadness', 'Fear'] },
    { phrase: 'Omo daadaa', question: 'What does this mean?', answer: 'Good child', options: ['Good child', 'Bad child', 'Smart child', 'Tall child'] },
    { phrase: 'Nje lo wa', question: 'Where is the person?', answer: 'Outside', options: ['Outside', 'Inside', 'Upstairs', 'Downstairs'] },
    { phrase: 'Mo wa ile', question: 'Where is the speaker going?', answer: 'Home', options: ['Home', 'School', 'Market', 'Church'] },
  ],
  2: [ // Swahili
    { phrase: 'Habari yako?', question: 'What does this phrase mean?', answer: 'How are you?', options: ['How are you?', 'Good morning', 'Thank you', 'Goodbye'] },
    { phrase: 'Ninatafuta chumba', question: 'What is the speaker looking for?', answer: 'A room', options: ['A room', 'Food', 'Water', 'A friend'] },
    { phrase: 'Shule iko wapi?', question: 'What is being asked?', answer: 'Where is the school?', options: ['Where is the school?', 'Where is home?', 'Where is the market?', 'Where is the church?'] },
    { phrase: 'Asante sana', question: 'What is the speaker expressing?', answer: 'Gratitude', options: ['Gratitude', 'Anger', 'Sadness', 'Confusion'] },
    { phrase: 'Nakupenda', question: 'What emotion is expressed?', answer: 'Love', options: ['Love', 'Anger', 'Sadness', 'Fear'] },
    { phrase: 'Mtoto mzuri', question: 'What does this mean?', answer: 'Good child', options: ['Good child', 'Bad child', 'Smart child', 'Tall child'] },
    { phrase: 'Nje ya nyumba', question: 'Where is this location?', answer: 'Outside the house', options: ['Outside the house', 'Inside the house', 'On the roof', 'In the garden'] },
    { phrase: 'Naenda nyumbani', question: 'Where is the speaker going?', answer: 'Home', options: ['Home', 'School', 'Market', 'Church'] },
  ],
};

export default function ListeningComprehensionGame({ config, onExit, userLevel }: ListeningComprehensionGameProps) {
  const { identity } = useInternetIdentity();
  const completeMinigame = useCompleteMinigame();
  
  const modeScaling = getGameModeScaling(userLevel, 'listeningComprehension');
  const difficulty = calculateDifficulty(userLevel, modeScaling);
  
  const [timeLeft, setTimeLeft] = useState(difficulty.timeLimit);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const languageId = Number(config.languageId);
  const allQuestions = listeningQuestions[languageId as keyof typeof listeningQuestions] || listeningQuestions[1];
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

  const handlePlayAudio = () => {
    if (!currentQuestion) return;
    
    const utterance = new SpeechSynthesisUtterance(currentQuestion.phrase);
    utterance.lang = languageId === 1 ? 'yo-NG' : 'sw-KE';
    utterance.rate = 0.8;
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

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
        gameMode: GameMode.listeningComprehension,
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
          <CardTitle>Listening Comprehension</CardTitle>
          <CardDescription>Listen to the phrase and answer the question</CardDescription>
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
              <div className="p-6 bg-muted rounded-lg text-center space-y-4">
                <Button
                  size="lg"
                  onClick={handlePlayAudio}
                  className="gap-2"
                  variant="secondary"
                >
                  <Volume2 className="h-5 w-5" />
                  Play Audio
                </Button>
                <p className="text-sm text-muted-foreground">Click to hear the phrase</p>
              </div>

              <div className="p-4 bg-background rounded-lg border">
                <h3 className="text-lg font-semibold text-center">{currentQuestion.question}</h3>
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
                <h3 className="text-2xl font-bold">Game Complete!</h3>
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

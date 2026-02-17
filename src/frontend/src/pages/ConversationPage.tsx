import { useState } from 'react';
import { useGetConversationScenarios, useGetUserProgress, useCompleteDialogue } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { getStepPrompt, getStepResponse } from '../utils/learningContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, Play, CheckCircle2, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import LevelUpToast from '../components/progression/LevelUpToast';

export default function ConversationPage() {
  const { identity } = useInternetIdentity();
  const { data: progress } = useGetUserProgress();
  const selectedLanguageId = progress?.selectedLanguage || BigInt(1);
  const { data: scenarios, isLoading } = useGetConversationScenarios(selectedLanguageId);
  const completeDialogue = useCompleteDialogue();

  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number>(0);

  const isAuthenticated = !!identity;
  const completedDialogues = progress?.completedDialogues || [];

  const handleStartScenario = (scenario: any) => {
    setSelectedScenario(scenario);
    setCurrentStep(0);
    setShowResult(false);
    setPreviousLevel(Number(progress?.level || 1));
  };

  const handleNextStep = () => {
    if (selectedScenario && currentStep < selectedScenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleComplete = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save your progress');
      setSelectedScenario(null);
      return;
    }

    if (!selectedScenario) return;

    try {
      await completeDialogue.mutateAsync({
        dialogueId: selectedScenario.id,
        xpReward: selectedScenario.xpReward,
      });
      toast.success(`Completed! +${Number(selectedScenario.xpReward)} XP`);
      setSelectedScenario(null);
    } catch (error: any) {
      if (error.message?.includes('already completed')) {
        toast.info('You have already completed this dialogue');
      } else {
        toast.error('Failed to save progress');
      }
      setSelectedScenario(null);
    }
  };

  const currentLevelAfterCompletion = Number(progress?.level || 1);
  const showLevelUp = showResult && currentLevelAfterCompletion > previousLevel;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <LevelUpToast newLevel={currentLevelAfterCompletion} show={showLevelUp} />

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <MessageCircle className="h-12 w-12" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">Conversation Practice</h1>
        <p className="text-xl text-muted-foreground">
          Practice real-world dialogues and conversations
        </p>
      </div>

      {/* Scenarios */}
      <div className="space-y-4">
        {scenarios?.map((scenario) => {
          const isCompleted = completedDialogues.some((id) => id === scenario.id);
          return (
            <Card key={Number(scenario.id)} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {scenario.title}
                      {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription className="mt-2">{scenario.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">+{Number(scenario.xpReward)} XP</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {scenario.steps.length} dialogue {scenario.steps.length === 1 ? 'step' : 'steps'}
                  </p>
                  <Button onClick={() => handleStartScenario(scenario)} className="gap-2">
                    <Play className="h-4 w-4" />
                    {isCompleted ? 'Practice Again' : 'Start'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialogue Dialog */}
      <Dialog open={!!selectedScenario} onOpenChange={() => setSelectedScenario(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedScenario && !showResult && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedScenario.title}</DialogTitle>
                <DialogDescription>
                  Step {currentStep + 1} of {selectedScenario.steps.length}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline">
                          {selectedScenario.steps[currentStep]?.speaker || 'Speaker'}
                        </Badge>
                      </div>
                      <p className="text-lg font-medium">
                        {getStepPrompt(selectedScenario.steps[currentStep] || {})}
                      </p>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Your response:</p>
                        <p className="text-lg">
                          {getStepResponse(selectedScenario.steps[currentStep] || {})}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button onClick={handleNextStep} className="w-full">
                  {currentStep < selectedScenario.steps.length - 1 ? 'Next Step' : 'Complete'}
                </Button>
              </div>
            </>
          )}
          {selectedScenario && showResult && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  Conversation Complete!
                </DialogTitle>
                <DialogDescription>Great job practicing this dialogue!</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      +{Number(selectedScenario.xpReward)} XP
                    </p>
                  </CardContent>
                </Card>
                <Button onClick={handleComplete} className="w-full" disabled={completeDialogue.isPending}>
                  {isAuthenticated ? 'Save Progress' : 'Close'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

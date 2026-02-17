import { useState, useEffect } from 'react';
import { type PathNode } from './learningPathModel';
import type { CultureContent, ConversationScenario, UserProgress } from '../../backend';
import { useCompleteCultureEntry, useCompleteDialogue } from '../../hooks/useQueries';
import { getCultureDisplayText, getCultureTranslation, getStepPrompt, getStepResponse } from '../../utils/learningContent';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, MessageCircle, CheckCircle2, Trophy, Sparkles, LogIn, Languages } from 'lucide-react';
import { toast } from 'sonner';
import LevelUpToast from '../progression/LevelUpToast';

interface LearningNodeModalProps {
  node: PathNode | null;
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  userProgress: UserProgress | null;
}

export default function LearningNodeModal({
  node,
  isOpen,
  onClose,
  isAuthenticated,
  userProgress,
}: LearningNodeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number>(0);

  const completeCultureEntry = useCompleteCultureEntry();
  const completeDialogue = useCompleteDialogue();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setShowResult(false);
      setPreviousLevel(Number(userProgress?.level || 1));
    }
  }, [isOpen, userProgress?.level]);

  if (!node) return null;

  const isCulture = node.type === 'culture';
  const Icon = isCulture ? Globe : MessageCircle;

  const handleCompleteCulture = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save your progress', {
        icon: <LogIn className="h-4 w-4" />,
      });
      onClose();
      return;
    }

    const cultureEntry = node.data as CultureContent;
    try {
      await completeCultureEntry.mutateAsync({
        entryId: BigInt(node.id.split('-')[1]),
        xpReward: BigInt(cultureEntry.xpReward),
      });
      toast.success(`Completed! +${node.xpReward} XP`, {
        icon: <Trophy className="h-4 w-4" />,
      });
      onClose();
    } catch (error: any) {
      if (error.message?.includes('already completed')) {
        toast.info('You have already completed this entry');
      } else {
        toast.error('Failed to save progress');
      }
      onClose();
    }
  };

  const handleNextStep = () => {
    const scenario = node.data as ConversationScenario;
    if (currentStep < scenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleCompleteConversation = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save your progress', {
        icon: <LogIn className="h-4 w-4" />,
      });
      onClose();
      return;
    }

    const scenario = node.data as ConversationScenario;
    try {
      await completeDialogue.mutateAsync({
        dialogueId: scenario.id,
        xpReward: scenario.xpReward,
      });
      toast.success(`Completed! +${node.xpReward} XP`, {
        icon: <Trophy className="h-4 w-4" />,
      });
      onClose();
    } catch (error: any) {
      if (error.message?.includes('already completed')) {
        toast.info('You have already completed this dialogue');
      } else {
        toast.error('Failed to save progress');
      }
      onClose();
    }
  };

  const currentLevelAfterCompletion = Number(userProgress?.level || 1);
  const showLevelUp = showResult && currentLevelAfterCompletion > previousLevel;

  return (
    <>
      <LevelUpToast newLevel={currentLevelAfterCompletion} show={showLevelUp} />
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          {isCulture ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    <Globe className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-2xl">{node.title}</DialogTitle>
                </div>
                <DialogDescription className="flex items-center gap-2">
                  {!node.isCompleted && (
                    <Badge variant="outline" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      {node.xpReward} XP
                    </Badge>
                  )}
                  <Badge variant="outline" className="gap-1">
                    <Languages className="h-3 w-3" />
                    Target Language
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[50vh] pr-4">
                <div className="space-y-6">
                  {/* Primary content in target language */}
                  <div className="space-y-3">
                    <div className="text-base leading-relaxed">
                      {getCultureDisplayText(node.data as CultureContent)
                        .split('\n')
                        .map((paragraph: string, index: number) => (
                          <p key={index} className="mb-3">
                            {paragraph}
                          </p>
                        ))}
                    </div>
                  </div>

                  {/* Optional translation/additional context */}
                  {getCultureTranslation(node.data as CultureContent) && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground mb-2 font-medium">Translation & Context:</p>
                        <p className="text-sm leading-relaxed">
                          {getCultureTranslation(node.data as CultureContent)}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {!node.isCompleted && (
                  <Button
                    onClick={handleCompleteCulture}
                    disabled={completeCultureEntry.isPending}
                    className="gap-2"
                  >
                    {completeCultureEntry.isPending ? (
                      'Completing...'
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              {!showResult ? (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <DialogTitle className="text-2xl">{node.title}</DialogTitle>
                    </div>
                    <DialogDescription>
                      Step {currentStep + 1} of {(node.data as ConversationScenario).steps.length}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Badge variant="outline">
                              {(node.data as ConversationScenario).steps[currentStep].speaker || 'Speaker'}
                            </Badge>
                          </div>
                          <p className="text-lg font-medium">
                            {getStepPrompt((node.data as ConversationScenario).steps[currentStep])}
                          </p>
                          <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-2">Your response:</p>
                            <p className="text-lg">
                              {getStepResponse((node.data as ConversationScenario).steps[currentStep])}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Button onClick={handleNextStep} className="w-full">
                      {currentStep < (node.data as ConversationScenario).steps.length - 1
                        ? 'Next Step'
                        : 'Complete'}
                    </Button>
                  </div>
                </>
              ) : (
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
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            +{node.xpReward} XP
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Button
                      onClick={handleCompleteConversation}
                      className="w-full"
                      disabled={completeDialogue.isPending}
                    >
                      {isAuthenticated
                        ? completeDialogue.isPending
                          ? 'Saving...'
                          : 'Save Progress'
                        : 'Close'}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

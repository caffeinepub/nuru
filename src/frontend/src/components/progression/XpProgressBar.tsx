import { useGetUserProgress, useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';
import { calculateXpForNextLevel, calculateProgress } from '../../utils/xpModel';

export default function XpProgressBar() {
  const { identity } = useInternetIdentity();
  const { data: progress } = useGetUserProgress();
  const { data: profile } = useGetCallerUserProfile();

  if (!identity || !progress) return null;

  const currentXp = Number(progress.xp);
  const currentLevel = Number(progress.level);
  const xpForNextLevel = calculateXpForNextLevel(currentLevel);
  const progressPercent = calculateProgress(currentXp, currentLevel);

  return (
    <div className="hidden md:flex items-center gap-3 min-w-[200px]">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-semibold">Level {currentLevel}</span>
      </div>
      <div className="flex-1 space-y-1">
        <Progress value={progressPercent} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {currentXp} / {xpForNextLevel} XP
        </p>
      </div>
    </div>
  );
}

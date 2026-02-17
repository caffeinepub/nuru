import { useEffect } from 'react';
import { toast } from 'sonner';
import { Trophy, Sparkles } from 'lucide-react';

interface LevelUpToastProps {
  newLevel: number;
  show: boolean;
}

export default function LevelUpToast({ newLevel, show }: LevelUpToastProps) {
  useEffect(() => {
    if (show && newLevel > 1) {
      toast.success(
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-500 text-white">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Level Up!</p>
            <p className="text-sm text-muted-foreground">You've reached Level {newLevel}</p>
          </div>
          <Sparkles className="h-5 w-5 text-amber-500" />
        </div>,
        {
          duration: 5000,
        }
      );
    }
  }, [show, newLevel]);

  return null;
}

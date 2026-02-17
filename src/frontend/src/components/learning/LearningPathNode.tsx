import { type PathNode } from './learningPathModel';
import { Badge } from '@/components/ui/badge';
import { Globe, MessageCircle, CheckCircle2, Lock, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningPathNodeProps {
  node: PathNode;
  onClick: () => void;
  position: 'left' | 'right';
}

export default function LearningPathNode({ node, onClick, position }: LearningPathNodeProps) {
  const Icon = node.type === 'culture' ? Globe : MessageCircle;
  
  const nodeColor = node.type === 'culture' 
    ? 'from-green-500 to-emerald-500' 
    : 'from-purple-500 to-pink-500';

  const nodeSize = node.isNextUp ? 'w-24 h-24' : 'w-20 h-20';
  
  return (
    <div className={cn(
      "flex items-center gap-6",
      position === 'left' ? 'flex-row' : 'flex-row-reverse'
    )}>
      {/* Content Card */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        position === 'left' ? 'text-right pr-4' : 'text-left pl-4'
      )}>
        <div className={cn(
          "inline-block max-w-xs",
          position === 'left' ? 'text-right' : 'text-left'
        )}>
          <h4 className="font-semibold text-sm mb-1">{node.title}</h4>
          <div className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            position === 'left' ? 'justify-end' : 'justify-start'
          )}>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {node.xpReward} XP
            </Badge>
            {node.isNextUp && (
              <Badge className="gap-1 bg-amber-500 hover:bg-amber-600">
                <Star className="h-3 w-3" />
                Next up
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Circular Node */}
      <button
        onClick={onClick}
        disabled={false}
        className={cn(
          nodeSize,
          "relative rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-lg",
          "hover:scale-110 active:scale-95",
          node.isCompleted && "bg-gradient-to-br from-green-400 to-green-600 ring-4 ring-green-200 dark:ring-green-900",
          !node.isCompleted && !node.isLocked && `bg-gradient-to-br ${nodeColor}`,
          node.isLocked && !node.isCompleted && "bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800",
          node.isNextUp && "ring-4 ring-amber-400 dark:ring-amber-600 animate-pulse"
        )}
      >
        {node.isCompleted ? (
          <CheckCircle2 className="h-10 w-10 text-white" />
        ) : node.isLocked ? (
          <Lock className="h-8 w-8 text-white opacity-70" />
        ) : (
          <Icon className="h-10 w-10 text-white" />
        )}
      </button>

      {/* Spacer for opposite side */}
      <div className="flex-1" />
    </div>
  );
}

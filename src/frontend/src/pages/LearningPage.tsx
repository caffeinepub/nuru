import { useState } from 'react';
import { useGetUserProgress, useGetCultureEntries, useGetConversationScenarios } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Info } from 'lucide-react';
import LearningPath from '../components/learning/LearningPath';
import LearningNodeModal from '../components/learning/LearningNodeModal';
import { buildLearningPath, type PathNode } from '../components/learning/learningPathModel';
import { LEARNING_PATH_NODE_LIMIT } from '../components/learning/learningPathLimit';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LearningPage() {
  const { identity } = useInternetIdentity();
  const { data: progress } = useGetUserProgress();
  const selectedLanguageId = progress?.selectedLanguage || BigInt(1);
  
  const { data: cultureEntries, isLoading: cultureLoading } = useGetCultureEntries(selectedLanguageId);
  const { data: scenarios, isLoading: scenariosLoading } = useGetConversationScenarios(selectedLanguageId);

  const [selectedNode, setSelectedNode] = useState<PathNode | null>(null);

  const isLoading = cultureLoading || scenariosLoading;
  const isAuthenticated = !!identity;

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-32 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pathNodes = buildLearningPath(
    cultureEntries || [],
    scenarios || [],
    progress ?? null
  );

  // Apply node limit
  const totalNodes = pathNodes.length;
  const displayedNodes = pathNodes.slice(0, LEARNING_PATH_NODE_LIMIT);
  const isLimited = totalNodes > LEARNING_PATH_NODE_LIMIT;

  const handleNodeClick = (node: PathNode) => {
    // Only open modal for unlocked nodes
    if (!node.isLocked) {
      setSelectedNode(node);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white mb-4">
          <BookOpen className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-bold">Learning Path</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Follow your personalized journey through language and culture
        </p>
      </div>

      {/* Limited Path Notice */}
      {isLimited && (
        <Alert className="max-w-2xl mx-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>
            The learning path is currently limited to {LEARNING_PATH_NODE_LIMIT} lessons. 
            Showing {displayedNodes.length} of {totalNodes} available lessons.
          </AlertDescription>
        </Alert>
      )}

      {/* Learning Path */}
      {displayedNodes.length > 0 ? (
        <LearningPath nodes={displayedNodes} onNodeClick={handleNodeClick} />
      ) : (
        <div className="text-center py-12 space-y-4">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
          <p className="text-lg text-muted-foreground">
            No learning content available for this language yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Check back soon for new lessons!
          </p>
        </div>
      )}

      {/* Node Modal */}
      <LearningNodeModal
        node={selectedNode}
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        isAuthenticated={isAuthenticated}
        userProgress={progress ?? null}
      />
    </div>
  );
}

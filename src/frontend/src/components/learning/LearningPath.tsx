import { type PathNode } from './learningPathModel';
import LearningPathNode from './LearningPathNode';

interface LearningPathProps {
  nodes: PathNode[];
  onNodeClick: (node: PathNode) => void;
}

export default function LearningPath({ nodes, onNodeClick }: LearningPathProps) {
  let currentUnit = -1;

  const handleNodeClick = (node: PathNode) => {
    // Only trigger click for accessible (unlocked) nodes
    if (!node.isLocked) {
      onNodeClick(node);
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto px-4">
      {/* Vertical path line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-200 via-violet-200 to-purple-200 dark:from-indigo-900 dark:via-violet-900 dark:to-purple-900 -translate-x-1/2 rounded-full" />

      <div className="relative space-y-8">
        {nodes.map((node, index) => {
          const showUnitHeader = node.unitIndex !== currentUnit;
          if (showUnitHeader) {
            currentUnit = node.unitIndex;
          }

          return (
            <div key={node.id}>
              {showUnitHeader && (
                <div className="flex justify-center mb-8">
                  <div className="bg-background border-2 border-primary px-6 py-3 rounded-full shadow-lg z-10 relative">
                    <h3 className="text-lg font-bold text-primary">{node.unitTitle}</h3>
                  </div>
                </div>
              )}
              <LearningPathNode
                node={node}
                onClick={() => handleNodeClick(node)}
                position={index % 2 === 0 ? 'left' : 'right'}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
